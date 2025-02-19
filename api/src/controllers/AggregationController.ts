import { Request, Response } from 'express';
import {
    AggregationService,
    AggregationDimension,
    TimeRange,
} from '../services/AggregationService';
import { getLogger } from '../utils/logger';
import { parseFilter } from './FilterQuery';
import { LogFilter } from '../services/LogFilter';

const logger = getLogger('AggregationController');

export class AggregationController {
    constructor(private aggregationService: AggregationService) {}

    async getAggregation(req: Request, res: Response): Promise<void> {
        try {
            const filter: LogFilter = parseFilter(req);

            const dimension =
                (req.query.dimension as AggregationDimension) || AggregationDimension.TIME;
            const timeRange = (req.query.timeRange as TimeRange) || TimeRange.HOUR;

            const results = await this.aggregationService.aggregate(filter, dimension, timeRange);
            res.json(results);
        } catch (error) {
            console.error('Error processing aggregation request', error);
            logger.error('Error processing aggregation request', { error });
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
