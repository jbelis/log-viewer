import { LogRecord, LogSeverity } from '../entities/LogRecord';
import { getLogger } from '../utils/logger';

const logger = getLogger('RowParser');

// Truncate service and message to max field lengths to avoid database errors
const MAX_SERVICE_LENGTH = 255;
const MAX_MESSAGE_LENGTH = 255;

export class RowParser {
    constructor() {}

    private truncateString(field: string, value: string, maxLength: number): string {
        if (value.length > maxLength) {
            logger.warn(`Service name truncated from ${value.length} characters to ${maxLength}`);
            return value.substring(0, maxLength);
        }
        return value;
    }

    parse(row: string[]): LogRecord | null {
        try {
            if (row.length !== 4) {
                logger.warn(`Invalid row format: ${row}`);
                return null;
            }

            const [dateStr, service, severity, message] = row;

            // Validate date format
            let logDate: Date;
            try {
                logDate = new Date(dateStr);
                if (isNaN(logDate.getTime())) {
                    logger.warn(`Invalid date format: ${dateStr}`);
                    return null;
                }
            } catch (error) {
                logger.warn(`Invalid date format: ${dateStr}`, { error });
                return null;
            }

            // Check severity is a valid enum value
            if (!Object.values(LogSeverity).includes(severity as LogSeverity)) {
                logger.warn(`Invalid severity ${severity}`);
                return null;
            }

            const logRecord = new LogRecord();
            logRecord.logDate = new Date(dateStr);
            logRecord.service = this.truncateString('service', service, MAX_SERVICE_LENGTH);
            logRecord.severity = severity as LogSeverity;
            logRecord.message = this.truncateString('message', message, MAX_MESSAGE_LENGTH);

            return logRecord;
        } catch (error) {
            logger.error(`Error processing row ${row}: ${error}`);
            return null;
        }
    }
}
