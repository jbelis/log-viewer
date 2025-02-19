export interface LogRecord {
  id: number,
  logDate: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG' | 'CRITICAL';
  service: string;
  message: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AggregateParams {
  dimension: ('service' | 'severity' | 'date' | 'message');
  timeRange: 'day' | 'hour';
}

export interface LogFilter {
  startDate?: string;
  endDate?: string;
  service?: string;
  severity?: string[];
  messageContains?: string;
}

export interface AggregateResult {
  dimension: string | number | Date;
  count: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SearchResponse {
  data: LogRecord[];
  pagination: Pagination;
}
