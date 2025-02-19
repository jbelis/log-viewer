import { SearchService } from '../../src/services/SearchService';
import { LogRecord, LogSeverity } from '../../src/entities/LogRecord';

describe('SearchService', () => {
  let service: SearchService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findAndCount: jest.fn(),
    };
    service = new SearchService(mockRepository);
  });

  describe('getLogs', () => {
    it('should return paginated logs ordered by date desc', async () => {
      const mockLogs: LogRecord[] = [
        {
          id: 1,
          logDate: new Date(),
          severity: LogSeverity.ERROR,
          service: 'test-service',
          message: 'test message',
        },
      ];

      mockRepository.createQueryBuilder = jest.fn().mockReturnValue({
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockLogs, 1])
      });

      const [logs, total] = await service.getLogs(1, 10);

      expect(mockRepository.createQueryBuilder().getManyAndCount).toHaveBeenCalled();
      expect(logs).toEqual(mockLogs);
      expect(total).toBe(1);
    });
  });
}); 