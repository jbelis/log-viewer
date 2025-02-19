import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import { Readable } from 'stream';

import { UploadService } from '../services/UploadService';
import { getLogger } from '../utils/logger';
import { QueueMaxSizeError } from '../services/QueueService';

const logger = getLogger('upload');

export class UploadController {
    constructor(private uploadService: UploadService) {}

    async uploadLogs(req: Request, res: Response): Promise<void> {
        if (!req.is('multipart/form-data')) {
            res.status(400).json({ error: 'Content-Type must be multipart/form-data' });
            return;
        }

        try {
            if (!req.files?.file) {
                res.status(400).json({ error: 'No file uploaded' });
                return;
            }

            const file = req.files.file as UploadedFile;
            const stream = Readable.from(file.data);
            const uploadId = await this.uploadService.streamToFile(stream);
            res.json({
                message: 'File upload accepted for processing',
                uploadId,
            });
        } catch (error) {
            if (error instanceof QueueMaxSizeError) {
                res.status(503).json({ error: 'System is busy, please try again later' });
                return;
            }
            logger.error('Error handling file upload', { error });
            res.status(500).json({ error: 'Error processing upload' });
        }
    }
}
