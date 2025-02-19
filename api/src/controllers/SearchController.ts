import { Request, Response } from 'express';
import { SearchService } from '../services/SearchService';
import { LogFilter } from '../services/LogFilter';
import { parseFilter } from './FilterQuery';
import { getLogger } from '../utils/logger';

const logger = getLogger('SearchController');

export class SearchController {
    constructor(private logService: SearchService) {}

    async getLogs(req: Request, res: Response): Promise<void> {
        try {
            const filter: LogFilter = parseFilter(req);
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 10;

            const [logs, total] = await this.logService.getLogs(page, pageSize, filter);

            res.json({
                data: logs,
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages: Math.ceil(total / pageSize),
                },
            });
        } catch (error) {
            logger.error('Error getting logs', { error });
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
