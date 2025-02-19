import { RowParser } from '../../src/services/RowParser';
import { LogRecord, LogSeverity } from '../../src/entities/LogRecord';
import { getLogger } from '../../src/utils/logger';

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
    getLogger: jest.fn().mockReturnValue({
        warn: jest.fn(),
        error: jest.fn(),
    }),
}));

describe('RowParser', () => {
    let parser: RowParser;
    
    beforeEach(() => {
        parser = new RowParser();
        jest.clearAllMocks();
    });

    it('should parse valid log record', () => {
        const row = ['2024-01-01T12:00:00Z', 'test-service', 'INFO', 'test message'];
        const result = parser.parse(row);

        expect(result).toBeInstanceOf(LogRecord);
        expect(result?.logDate).toEqual(new Date('2024-01-01T12:00:00Z'));
        expect(result?.service).toBe('test-service');
        expect(result?.severity).toBe(LogSeverity.INFO);
        expect(result?.message).toBe('test message');
    });

    it('should return null for invalid row length', () => {
        const row = ['2024-01-01T12:00:00Z', 'test-service', 'INFO'];
        const result = parser.parse(row);

        expect(result).toBeNull();
        expect(getLogger('RowParser').warn).toHaveBeenCalledWith(
            expect.stringContaining('Invalid row format')
        );
    });

    it('should return null for invalid date', () => {
        const row = ['invalid-date', 'test-service', 'INFO', 'test message'];
        const result = parser.parse(row);

        expect(result).toBeNull();
        expect(getLogger('RowParser').warn).toHaveBeenCalledWith(
            expect.stringContaining('Invalid date format')
        );
    });

    it('should return null for invalid severity', () => {
        const row = ['2024-01-01T12:00:00Z', 'test-service', 'INVALID', 'test message'];
        const result = parser.parse(row);

        expect(result).toBeNull();
        expect(getLogger('RowParser').warn).toHaveBeenCalledWith(
            expect.stringContaining('Invalid severity')
        );
    });

    it('should truncate service name if too long', () => {
        const longService = 'a'.repeat(300);
        const row = ['2024-01-01T12:00:00Z', longService, 'INFO', 'test message'];
        const result = parser.parse(row);

        expect(result?.service.length).toBe(255);
        expect(getLogger('RowParser').warn).toHaveBeenCalledWith(
            expect.stringContaining('Service name truncated')
        );
    });

    it('should truncate message if too long', () => {
        const longMessage = 'a'.repeat(300);
        const row = ['2024-01-01T12:00:00Z', 'test-service', 'INFO', longMessage];
        const result = parser.parse(row);

        expect(result?.message.length).toBe(255);
        expect(getLogger('RowParser').warn).toHaveBeenCalledWith(
            expect.stringContaining('Service name truncated')
        );
    });

    it('should handle all severity levels', () => {
        const severities = Object.values(LogSeverity);
        severities.forEach(severity => {
            const row = ['2024-01-01T12:00:00Z', 'test-service', severity, 'test message'];
            const result = parser.parse(row);

            expect(result?.severity).toBe(severity);
        });
    });

    it('should handle error during parsing', () => {
        // Simulate an error by passing invalid input
        const result = parser.parse(null as unknown as string[]);

        expect(result).toBeNull();
        expect(getLogger('RowParser').error).toHaveBeenCalled();
    });
}); 