import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Search from './Search';
import { searchLogs } from '../api/api';
import { LogRecord } from '../api/model';

// Mock the api module
vi.mock('../api/api', () => ({
  searchLogs: vi.fn()
}));

// Sample log data for testing
const mockLogs: LogRecord[] = [
  {
    id: 1,
    logDate: '2024-01-01T10:00:00Z',
    service: 'test-service',
    severity: 'ERROR',
    message: 'Test error message'
  },
  {
    id: 2,
    logDate: '2024-01-01T11:00:00Z',
    service: 'test-service',
    severity: 'INFO',
    message: 'Test info message'
  }
];

describe('Search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock response
    vi.mocked(searchLogs).mockResolvedValue({
      data: mockLogs,
      pagination: {
        page: 1,
        pageSize: 16,
        total: 20,
        totalPages: 2
      }
    });
  });

  it('renders the search component with table headers', async () => {
    render(<Search />);
    
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Service')).toBeInTheDocument();
    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('Message')).toBeInTheDocument();
  });

  it('loads and displays logs on initial render', async () => {
    render(<Search />);

    // Wait for the logs to be loaded and displayed
    await waitFor(() => {
      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(screen.getByText('Test info message')).toBeInTheDocument();
    });

    // Verify the API was called with correct parameters
    expect(searchLogs).toHaveBeenCalledWith(1, 16, {});
  });

  it('shows loading state when fetching logs', async () => {
    // Delay the API response
    vi.mocked(searchLogs).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<Search />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    vi.mocked(searchLogs).mockRejectedValueOnce(new Error('API Error'));
    
    render(<Search />);

    // Wait for the error to be handled
    await waitFor(() => {
      expect(screen.getByText('No more logs to load.')).toBeInTheDocument();
    });
  });

  it('applies correct text color based on severity', async () => {
    render(<Search />);

    await waitFor(() => {
      const errorRow = screen.getByText('Test error message').closest('tr');
      const infoRow = screen.getByText('Test info message').closest('tr');
      
      expect(errorRow).toHaveClass('text-red-800');
      expect(infoRow).toHaveClass('text-gray-800');
    });
  });
/*
  it('loads more logs when scrolling near bottom', async () => {
    render(<Search />);

    // Simulate reaching the scroll threshold
    const scrollableDiv = screen.getByTestId('scrollableDiv');
    fireEvent.scroll(scrollableDiv, {
      target: {
        scrollTop: scrollableDiv.clientHeight,
        scrollHeight: scrollableDiv.scrollHeight,
        clientHeight: scrollableDiv.clientHeight
      }
    });

    // Verify that a second page of logs was requested
    await waitFor(() => {
      expect(searchLogs).toHaveBeenCalledWith(2, 16, {});
    });
  });
*/
}); 