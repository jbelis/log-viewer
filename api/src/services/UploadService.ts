import { createWriteStream } from 'fs';
import { promises as fs } from 'fs';
import * as path from 'path';

import { getLogger } from '../utils/logger';
import { QueueService } from './QueueService';


const logger = getLogger('UploadService');
const UPLOAD_DIR = 'uploads';

export class UploadService {
    constructor(private queueService: QueueService) {
        fs.mkdir(UPLOAD_DIR, { recursive: true }).catch((err) => {
            logger.error('Failed to create upload directory', { error: err });
        });
    }

    async streamToFile(readableStream: NodeJS.ReadableStream): Promise<string> {
        const uploadId = crypto.randomUUID();
        const fileName = `${uploadId}.csv`;
        const filePath = path.join(UPLOAD_DIR, fileName);

        return new Promise((resolve, reject) => {
            const writeStream = createWriteStream(filePath);

            readableStream.pipe(writeStream).on('error', (error) => {
                logger.error('Error streaming file', { uploadId, error });
                reject(error);
            });

            writeStream.on('finish', async () => {
                logger.info('File upload completed', { uploadId, filePath });
                await this.queueService.publish(filePath, uploadId);
                resolve(uploadId);
            });
        });
    }
}
