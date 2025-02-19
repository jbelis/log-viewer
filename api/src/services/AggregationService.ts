import { Repository } from 'typeorm';
import { LogRecord } from '../entities/LogRecord';
import { getLogger } from '../utils/logger';
import { LogFilter } from './LogFilter';
import { addFilterToQueryBuilder } from './LogFilter';
import { SelectQueryBuilder } from 'typeorm';
import { getDialect, Dialect } from '../database/dialect';

const logger = getLogger('AggregationService');

export enum TimeRange {
    HOUR = 'hour',
    DAY = 'day',
    MONTH = 'month',
    YEAR = 'year',
}

export enum AggregationDimension {
    TIME = 'time',
    SEVERITY = 'severity',
    SERVICE = 'service',
    MESSAGE = 'message',
}

export interface AggregationResult {
    dimension: string;
    count: number;
}

export class AggregationService {
    private sqlDialect: Dialect;

    constructor(private logRepository: Repository<LogRecord>) {
        this.sqlDialect = getDialect();
    }

    private updateQueryBuilderWithDimension(
        queryBuilder: SelectQueryBuilder<LogRecord>,
        dimension: AggregationDimension,
        timeRange?: TimeRange,
    ) {
        switch (dimension) {
            case AggregationDimension.TIME:
                if (!timeRange) {
                    throw new Error('TimeRange must be specified when aggregating by time');
                }
                const dateTruncExpr = this.sqlDialect.getDateTruncExpression(
                    timeRange,
                    'log.logDate',
                );
                queryBuilder
                    .select(`${dateTruncExpr} as dimension, COUNT(*) as count`)
                    .groupBy('dimension')
                    .orderBy('dimension', 'ASC');
                break;

            case AggregationDimension.SEVERITY:
                queryBuilder
                    .select('log.severity as dimension, COUNT(*) as count')
                    .groupBy('log.severity');
                break;

            case AggregationDimension.SERVICE:
                queryBuilder
                    .select('log.service as dimension, COUNT(*) as count')
                    .groupBy('log.service');
                break;

            case AggregationDimension.MESSAGE:
                queryBuilder
                    .select('log.message as dimension, COUNT(*) as count')
                    .groupBy('log.message');
                break;

            default:
                throw new Error(`Unsupported aggregation dimension: ${dimension}`);
        }
    }

    async aggregate(
        filter: LogFilter,
        dimension: AggregationDimension,
        timeRange?: TimeRange,
    ): Promise<AggregationResult[]> {
        try {
            const queryBuilder = this.logRepository.createQueryBuilder('log');

            addFilterToQueryBuilder(queryBuilder, filter, this.sqlDialect);

            this.updateQueryBuilderWithDimension(queryBuilder, dimension, timeRange);

            const results = await queryBuilder.getRawMany();

            logger.info('Aggregation completed', {
                dimension,
                resultCount: results.length,
                filter,
            });

            return results.map((result) => ({
                dimension: result.dimension,
                count: parseInt(result.count, 10),
            }));
        } catch (error) {
            logger.error('Aggregation failed', { error, filter, dimension });
            throw error;
        }
    }
}
