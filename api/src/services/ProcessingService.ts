import { createReadStream } from 'fs';
import { promises as fs } from 'fs';
import { Repository } from 'typeorm';
import { parse } from 'csv-parse';

import { LogRecord } from '../entities/LogRecord';
import { getLogger } from '../utils/logger';
import { QueueService, QueueItem } from './QueueService';
import { RowParser } from './RowParser';


const logger = getLogger('ProcessingService');

export class ProcessingService {
    private unsubscribe: () => void = () => {};
    private rowParser: RowParser;

    constructor(
        private logRepository: Repository<LogRecord>,
        private queueService: QueueService,
    ) {
        this.rowParser = new RowParser();
    }

    start(): void {
        // Subscribe to queue events
        this.unsubscribe = this.queueService.subscribe(async (item: QueueItem) => {
            try {
                await this.processFile(item.filePath, item.uploadId);
            } catch (error) {
                logger.error(`Error processing file ${item.uploadId}: ${error}`);
            } finally {
                // Clean up the temporary file
                await fs.unlink(item.filePath);
                logger.info(`Temporary file removed: ${item.filePath}`);
            }
        });

        logger.info('Processing service started listening for queue events');
    }

    public stop(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            logger.info('Processing service stopped listening for queue events');
        }
    }

    private async processFile(filePath: string, uploadId: string): Promise<void> {
        logger.info('Starting file processing', { uploadId, filePath });
        let records: LogRecord[] = [];
        let processedCount = 0;

        const parser = createReadStream(filePath).pipe(
            parse({
                delimiter: ',',
                skip_empty_lines: true,
                trim: true,
            }),
        );

        for await (const row of parser) {
            try {
                const logRecord = this.rowParser.parse(row);
                if (logRecord) {
                    records.push(logRecord);
                    processedCount++;
                }

                // Batch insert every 1000 records
                if (records.length >= 1000) {
                    await this.saveRecords(records, uploadId);
                    records = [];
                }
            } catch (error) {
                logger.error(`Unexpected error processing row ${row}: ${error}`);
            }
        }

        // Save any remaining records
        if (records.length > 0) {
            await this.saveRecords(records, uploadId);
        }

        logger.info('File processing completed', { uploadId, totalProcessed: processedCount });
    }

    private async saveRecords(records: LogRecord[], uploadId: string): Promise<void> {
        try {
            await this.logRepository.save(records);
            logger.info(`Batch of ${records.length} saved to database: ${uploadId}`);
        } catch (error) {
            logger.error(`Error saving batch to database: ${uploadId}: ${error}`);
            throw error;
        }
    }
}
