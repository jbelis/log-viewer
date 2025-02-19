import express from 'express';
import { DataSource, Repository } from 'typeorm';

import { requireAuth } from './auth';
import { SearchController } from '../controllers/SearchController';
import { UploadController } from '../controllers/UploadController';
import { AggregationController } from '../controllers/AggregationController';
import { LogRecord } from '../entities/LogRecord';
import { ProcessingService } from '../services/ProcessingService';
import { SearchService } from '../services/SearchService';
import { QueueService } from '../services/QueueService';
import { UploadService } from '../services/UploadService';
import { AggregationService } from '../services/AggregationService';

const router = express.Router();

export class LogsMiddleware {
    private router: express.Router;
    private processingService: ProcessingService;
    private queueService: QueueService;
    private logRepository: Repository<LogRecord>;

    constructor(connection: DataSource) {
        this.logRepository = connection.getRepository(LogRecord);
        this.queueService = new QueueService();

        // start processing log files
        this.processingService = new ProcessingService(this.logRepository, this.queueService);
        this.router = this.initRouter();
    }

    private initRouter() {

        const searchService = new SearchService(this.logRepository);
        const uploadService = new UploadService(this.queueService);
        const aggregationService = new AggregationService(this.logRepository);

        const aggregationController = new AggregationController(aggregationService);

        const searchController = new SearchController(searchService);
        const uploadController = new UploadController(uploadService);

        this.router = express.Router();

        router.get('/api/logs', requireAuth, (req, res) => searchController.getLogs(req, res));
        router.post('/api/logs/upload', requireAuth, (req, res) =>
            uploadController.uploadLogs(req, res),
        );
        router.get('/api/logs/aggregate', requireAuth, (req, res) =>
            aggregationController.getAggregation(req, res),
        );

        return router;
    }

    public getRouter() {
        return this.router;
    }

    public startProcessing() {
        this.processingService.start();
    }
}
