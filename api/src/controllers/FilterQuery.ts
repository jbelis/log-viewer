import { Request } from 'express';
import { LogFilter } from '../services/LogFilter';
import { getLogger } from '../utils/logger';
import { LogSeverity } from '../entities/LogRecord';

const logger = getLogger('FilterQuery');

export function parseFilter(req: Request): LogFilter {
    const filter: LogFilter = {};

    if (req.query.since) {
        filter.startDate = new Date(req.query.since as string);
        logger.info('Start date:', { date: filter.startDate });
    }
    if (req.query.until) {
        filter.endDate = new Date(req.query.until as string);
        logger.info('End date:', { date: filter.endDate });
    }

    if (req.query.severity) {
        logger.info('severity filter in query:', { severity: req.query.severity });
        filter.severity = req.query.severity as LogSeverity[];
    }
    if (req.query.service) {
        filter.service = req.query.service as string;
        console.log(filter.service);
    }
    if (req.query.messageContains) {
        filter.messageContains = req.query.messageContains as string;
        logger.info('Message filter:', { message: filter.messageContains });
    }

    return filter;
}
