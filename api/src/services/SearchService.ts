import { Repository } from 'typeorm';
import { LogRecord } from '../entities/LogRecord';
import { getLogger } from '../utils/logger';
import { LogFilter, addFilterToQueryBuilder } from './LogFilter';
import { getDialect, Dialect } from '../database/dialect';

const logger = getLogger('SearchService');

export class SearchService {
    private sqlDialect: Dialect;

    constructor(private logRepository: Repository<LogRecord>) {
        this.sqlDialect = getDialect();
    }

    async getLogs(
        page: number = 1,
        pageSize: number = 10,
        filter?: LogFilter,
    ): Promise<[LogRecord[], number]> {
        logger.info('Fetching logs', { page, pageSize });
        const skip = (page - 1) * pageSize;

        try {
            const queryBuilder = this.logRepository.createQueryBuilder('log');
            if (filter) {
                addFilterToQueryBuilder(queryBuilder, filter, this.sqlDialect);
            }
            queryBuilder.orderBy('log.logDate', 'DESC');
            queryBuilder.skip(skip);
            queryBuilder.take(pageSize);
            const result = await queryBuilder.getManyAndCount();

            logger.info('Successfully fetched logs', {
                count: result[0].length,
                total: result[1],
            });

            return result;
        } catch (error) {
            logger.error('Error fetching logs', { error });
            throw error;
        }
    }
}
