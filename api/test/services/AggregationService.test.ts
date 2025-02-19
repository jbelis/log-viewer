import { DataSource, Repository } from 'typeorm';
import { AggregationService, AggregationDimension, TimeRange } from '../../src/services/AggregationService';
import { LogRecord, LogSeverity } from '../../src/entities/LogRecord';
import { LogFilter } from '../../src/services/LogFilter';


describe('AggregationService', () => {
    let dataSource: DataSource;
    let aggregationService: AggregationService;
    let logRepository: Repository<LogRecord>;

    beforeAll(async () => {
        // Create an in-memory database connection
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            entities: [LogRecord],
            synchronize: true,
            logging: false
        });

        await dataSource.initialize();
        logRepository = dataSource.getRepository(LogRecord);
        aggregationService = new AggregationService(logRepository);
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    beforeEach(async () => {
        // Clear the database before each test
        await logRepository.clear();

        // Insert test data
        const testLogs = [
            // Different severities
            createLogRecord('2024-03-01 10:00:00Z', 'service-1', LogSeverity.ERROR, 'Error message 1'),
            createLogRecord('2024-03-01 10:30:00Z', 'service-1', LogSeverity.INFO, 'Info message 1'),
            createLogRecord('2024-03-01 11:00:00Z', 'service-2', LogSeverity.ERROR, 'Error message 2'),
            
            // Different hours
            createLogRecord('2024-03-01 12:00:00Z', 'service-2', LogSeverity.INFO, 'Info message 2'),
            createLogRecord('2024-03-01 12:30:00Z', 'service-1', LogSeverity.ERROR, 'Error message 3'),
            
            // Different days
            createLogRecord('2024-03-02 10:00:00Z', 'service-2', LogSeverity.INFO, 'Info message 3'),
            createLogRecord('2024-03-02 11:00:00Z', 'service-1', LogSeverity.ERROR, 'Error message 4'),
        ];

        await logRepository.save(testLogs);
    });

    function createLogRecord(
        dateStr: string,
        service: string,
        severity: LogSeverity,
        message: string
    ): LogRecord {
        const log = new LogRecord();
        log.logDate = new Date(dateStr);
        log.service = service;
        log.severity = severity;
        log.message = message;
        return log;
    }

    describe('aggregate', () => {
        it('should filter by date range', async () => {
            const filter: LogFilter = {
                startDate: new Date('2024-03-01 10:00:00Z'),
                endDate: new Date('2024-03-01 11:59:59Z'),
            };

            const result = await aggregationService.aggregate(filter, AggregationDimension.SEVERITY);

            expect(result).toEqual([
                { dimension: LogSeverity.ERROR, count: 2 },
                { dimension: LogSeverity.INFO, count: 1 },
            ]);
        });

        it('should filter by severity', async () => {
            const filter: LogFilter = {
                severity: [LogSeverity.ERROR],
            };

            const result = await aggregationService.aggregate(filter, AggregationDimension.SERVICE);

            expect(result).toEqual([
                { dimension: 'service-1', count: 3 },
                { dimension: 'service-2', count: 1 },
            ]);
        });

        it('should filter by service', async () => {
            const filter: LogFilter = {
                service: 'service-1',
            };

            const result = await aggregationService.aggregate(filter, AggregationDimension.SEVERITY);

            expect(result).toEqual([
                { dimension: LogSeverity.ERROR, count: 3 },
                { dimension: LogSeverity.INFO, count: 1 },
            ]);
        });

        it('should filter by message content', async () => {
            const filter: LogFilter = {
                messageContains: 'Error',
            };

            const result = await aggregationService.aggregate(filter, AggregationDimension.SERVICE);

            expect(result).toEqual([
                { dimension: 'service-1', count: 3 },
                { dimension: 'service-2', count: 1 },
            ]);
        });

        it('should aggregate by severity', async () => {
            const result = await aggregationService.aggregate({}, AggregationDimension.SEVERITY);

            expect(result).toEqual([
                { dimension: LogSeverity.ERROR, count: 4 },
                { dimension: LogSeverity.INFO, count: 3 },
            ]);
        });

        it('should aggregate by service', async () => {
            const result = await aggregationService.aggregate({}, AggregationDimension.SERVICE);

            expect(result).toEqual([
                { dimension: 'service-1', count: 4 },
                { dimension: 'service-2', count: 3 },
            ]);
        });

        it('should aggregate by hour', async () => {
            const filter: LogFilter = {
                startDate: new Date('2024-03-01'),
                endDate: new Date('2024-03-01 23:59:59'),
            };

            const result = await aggregationService.aggregate(
                filter,
                AggregationDimension.TIME,
                TimeRange.HOUR
            );

            expect(result).toEqual([
                { dimension: '2024-03-01 10:00:00', count: 2 },
                { dimension: '2024-03-01 11:00:00', count: 1 },
                { dimension: '2024-03-01 12:00:00', count: 2 },
            ]);
        });

        it('should aggregate by day', async () => {
            const result = await aggregationService.aggregate(
                {},
                AggregationDimension.TIME,
                TimeRange.DAY
            );

            expect(result).toEqual([
                { dimension: '2024-03-01 00:00:00', count: 5 },
                { dimension: '2024-03-02 00:00:00', count: 2 },
            ]);
        });

        it('should throw error when time range is missing for time dimension', async () => {
            await expect(
                aggregationService.aggregate({}, AggregationDimension.TIME)
            ).rejects.toThrow('TimeRange must be specified when aggregating by time');
        });

        it('should throw error for unsupported dimension', async () => {
            await expect(
                aggregationService.aggregate({}, 'invalid' as AggregationDimension)
            ).rejects.toThrow('Unsupported aggregation dimension: invalid');
        });

        it('should handle empty results', async () => {
            await logRepository.clear(); // Remove all test data

            const result = await aggregationService.aggregate({}, AggregationDimension.SEVERITY);

            expect(result).toEqual([]);
        });
    });
}); 