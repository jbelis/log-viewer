import { LogSeverity } from '../entities/LogRecord';
import { SelectQueryBuilder } from 'typeorm';
import { LogRecord } from '../entities/LogRecord';
import { getLogger } from '../utils/logger';
import { Dialect } from '../database/dialect';
const logger = getLogger('LogFilter');

export interface LogFilter {
    startDate?: Date;
    endDate?: Date;
    severity?: LogSeverity[];
    service?: string;
    messageContains?: string;
}

export function addFilterToQueryBuilder(
    queryBuilder: SelectQueryBuilder<LogRecord>,
    filter: LogFilter,
    dialect: Dialect,
) {
    // exclude logs in the future
    queryBuilder.andWhere('log.logDate < :endDate', {
        endDate: filter.endDate || new Date(),
    });

    if (filter.startDate) {
        logger.info('startDate', { startDate: filter.startDate });
        queryBuilder.andWhere('log.logDate >= :startDate', {
            startDate: filter.startDate,
        });
    }

    if (filter.severity) {
        logger.info('severity filter:', { severity: filter.severity });
        queryBuilder.andWhere('log.severity IN (:...severity)', {
            severity: filter.severity,
        });
    }

    if (filter.service) {
        queryBuilder.andWhere('log.service = :service', {
            service: filter.service,
        });
    }

    if (filter.messageContains) {
        queryBuilder.andWhere(dialect.getCaseInsentitiveLikeExpression('log.message', ':message'), {
            message: `%${filter.messageContains}%`,
        });
    }
}
