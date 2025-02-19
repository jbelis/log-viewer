import { TimeRange } from '../services/AggregationService';

export interface Dialect {
    getDateTruncExpression(timeRange: TimeRange, columnName: string): string;
    getCaseInsentitiveLikeExpression(column: string, expression: string): string;
}

export function getDialect(): Dialect {
    if (process.env.NODE_ENV === 'test') {
        return new SQLiteDialect();
    }
    return new PostgreSQLDialect();
}

export class SQLiteDialect implements Dialect {
    getDateTruncExpression(timeRange: TimeRange, columnName: string): string {
        switch (timeRange) {
            case TimeRange.HOUR:
                return `strftime('%Y-%m-%d %H:00:00', ${columnName})`;
            case TimeRange.DAY:
                return `strftime('%Y-%m-%d 00:00:00', ${columnName})`;
            case TimeRange.MONTH:
                return `strftime('%Y-%m-01 00:00:00', ${columnName})`;
            case TimeRange.YEAR:
                return `strftime('%Y-01-01 00:00:00', ${columnName})`;
            default:
                throw new Error(`Invalid time range: ${timeRange}`);
        }
    }

    getCaseInsentitiveLikeExpression(column: string, expression: string): string {
        return `UPPER(${column}) LIKE ${expression}`;
    }
}

export class PostgreSQLDialect implements Dialect {
    getDateTruncExpression(timeRange: TimeRange, columnName: string): string {
        return `date_trunc('${timeRange}', ${columnName})`;
    }
    getCaseInsentitiveLikeExpression(column: string, expression: string): string {
        return `${column} ILIKE ${expression}`;
    }
}
