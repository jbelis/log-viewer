import axios from 'axios';
import { SearchResponse, LoginCredentials, AggregateResult } from './model';
import { setAuthenticated } from './AuthContext';
import { LogFilter } from './model';

const api = axios.create({
  baseURL: 'http://localhost:3000', // process.env.REACT_APP_API_URL,
  withCredentials: true
});

let isRedirecting = false; // avoid multiple redirects

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      console.log('401 intercepted, redirect to login');
      setAuthenticated(false);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = async (credentials: LoginCredentials) => {
  await api.post('/api/auth/login', credentials);
  setAuthenticated(true);
};

export const logout = async () => {
  await api.post('/api/auth/logout');
  setAuthenticated(false);
};

export const uploadLogs = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/logs/upload', formData);
};

export const searchLogs = async (page: number, pageSize: number, filter?: LogFilter) => {
  const response = await api.get<SearchResponse>('/api/logs', {
    params: {
      page, pageSize,
      since: filter?.startDate,
      until: filter?.endDate,
      service: filter?.service,
      severity: filter?.severity,
      messageContains: filter?.messageContains
    },
  });
  return response.data;
};

export const aggregateLogs = async (dimension?: string, filter?: LogFilter) => {
  const response = await api.get<AggregateResult[]>('/api/logs/aggregate', {
    params: {
      dimension,
      since: filter?.startDate,
      until: filter?.endDate,
      service: filter?.service,
      severity: filter?.severity,
      messageContains: filter?.messageContains
    }
  });
  return response.data;
};

