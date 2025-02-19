/*
    This is a naive publish/subscribe queue for demo purpose.
    In real life, we would use a more robust queue system, such as Redis or kafka.
 */
import fs from 'fs/promises';
import path from 'path';

import { getLogger } from '../utils/logger';

const logger = getLogger('QueueService');

export interface QueueItem {
    uploadId: string;
    filePath: string;
}

export type QueueSubscriber = (item: QueueItem) => Promise<void>;

export class QueueMaxSizeError extends Error {
    constructor() {
        super('Queue has reached maximum capacity');
        this.name = 'QueueMaxSizeError';
    }
}

export class QueueService {
    private processingQueue: Map<string, string>;
    private subscribers: Set<QueueSubscriber>;
    private isProcessing: boolean;
    private readonly maxSize: number;

    constructor(maxSize: number = 100) {
        this.processingQueue = new Map();
        this.subscribers = new Set();
        this.isProcessing = false;
        this.maxSize = maxSize;

        // Load any existing files in upload folder into queue
        this.loadExistingFiles().catch((err) => {
            logger.error('Failed to load existing files into queue', { error: err });
        });
    }

    private async loadExistingFiles(): Promise<void> {
        try {
            const uploadDir = path.join(__dirname, '../../uploads');

            // Create uploads directory if it doesn't exist
            await fs.mkdir(uploadDir, { recursive: true });

            const files = await fs.readdir(uploadDir);

            for (const file of files) {
                const filePath = path.join(uploadDir, file);
                const uploadId = path.parse(file).name; // Use filename without extension as uploadId

                try {
                    await this.publish(filePath, uploadId, true);
                    logger.info('Loaded existing file into queue', { uploadId, filePath });
                } catch (error) {
                    logger.error('Error loading file into queue', { uploadId, error });
                }
            }
        } catch (error) {
            logger.error('Error scanning upload directory', { error });
            throw error;
        }
    }

    subscribe(callback: QueueSubscriber): () => void {
        this.subscribers.add(callback);
        logger.info('New subscriber registered');

        // If there are items in the queue, trigger processing
        if (this.processingQueue.size > 0 && !this.isProcessing) {
            this.processNextItem();
        }

        // Return unsubscribe function
        return () => {
            this.subscribers.delete(callback);
            logger.info('Subscriber unregistered');
        };
    }

    async publish(
        filePath: string,
        uploadId: string,
        ignoreMaxSize: boolean = false,
    ): Promise<void> {
        if (!ignoreMaxSize && this.processingQueue.size >= this.maxSize) {
            throw new QueueMaxSizeError();
        }
        this.processingQueue.set(uploadId, filePath);
        logger.info('Item published to queue', { uploadId, filePath });

        if (!this.isProcessing) {
            this.processNextItem();
        }
    }

    private async processNextItem(): Promise<void> {
        if (this.processingQueue.size === 0 || this.isProcessing) {
            this.wakeupLater();
            return;
        }

        this.isProcessing = true;
        const [uploadId, filePath] = Array.from(this.processingQueue.entries())[0];
        this.processingQueue.delete(uploadId);

        const item: QueueItem = { uploadId, filePath };

        // Notify all subscribers
        const subscriberPromises = Array.from(this.subscribers).map(async (subscriber) => {
            try {
                await subscriber(item);
            } catch (error) {
                logger.error('Subscriber error', { uploadId, error });
            }
        });

        await Promise.all(subscriberPromises);
        this.isProcessing = false;

        // Process next item if queue is not empty
        if (this.processingQueue.size > 0) {
            this.processNextItem();
        } else {
            logger.info('Queue is empty');
            this.wakeupLater();
        }
    }

    private async wakeupLater(): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (this.processingQueue.size > 0) {
                    this.processNextItem();
                }
                resolve();
            }, 1000); // 1 second delay
        });
    }

    getQueueSize(): number {
        return this.processingQueue.size;
    }
}
