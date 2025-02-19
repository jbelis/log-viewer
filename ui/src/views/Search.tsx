import { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { searchLogs } from '../api/api';
import { LogRecord, LogFilter } from '../api/model';
import LogFilterComponent from '../components/LogFilter';

function Search() {
    const [logs, setLogs] = useState<LogRecord[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const limit = 16; // items per fetch
    const [filter, setFilter] = useState<LogFilter>({
    });

    const fetchLogs = async (pageToFetch: number, isReset: boolean = false) => {
        if (isLoading) return; // Prevent multiple simultaneous requests
        
        try {
            setIsLoading(true);
            const response = await searchLogs(pageToFetch, limit, filter);
            
            setLogs(prevLogs => isReset 
                ? response.data 
                : [...prevLogs, ...response.data]
            );
            
            setHasMore(pageToFetch < response.pagination.totalPages);
            setPage(pageToFetch + 1);
        } catch (error) {
            console.error('Error fetching logs:', error);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setLogs([]);
        setPage(1);
        setHasMore(true);
        fetchLogs(1, true);
    }, [filter]);

    const handleFilterChange = (newFilter: Partial<LogFilter>) => {
        setFilter(prev => ({ ...prev, ...newFilter }));
    };

    const loadMore = () => {
        console.log('loadMore called', { isLoading, hasMore, page });
        if (!isLoading && hasMore) {
            fetchLogs(page, false);
        }
    };

    const getTextColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL':
                return 'text-purple-800';
            case 'ERROR':
                return 'text-red-800';
            case 'WARNING':
                return 'text-yellow-800';
            case 'DEBUG':
                return 'text-gray-500';
            default:
                return 'text-gray-800';
        }
    }

    return (
        <div className="p-6">
            <LogFilterComponent 
                filter={filter}
                onFilterChange={handleFilterChange}
            />

            <div 
                id="scrollableDiv" 
                style={{ 
                    height: '600px', 
                    overflow: 'auto',
                    scrollbarWidth: 'thin', // For Firefox
                    scrollbarColor: '#4B5563 transparent', // For Firefox
                }}
                className="border border-gray-200 rounded-lg [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
            >
                <InfiniteScroll
                    dataLength={logs.length}
                    next={loadMore}
                    hasMore={hasMore}
                    loader={
                        <div className="flex justify-center items-center h-16">
                            <div className="text-gray-600">Loading more...</div>
                        </div>
                    }
                    endMessage={
                        <div className="text-center text-gray-600 py-4">
                            No more logs to load.
                        </div>
                    }
                    scrollableTarget="scrollableDiv"
                    scrollThreshold={0.9}
                >
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Time
                                </th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Service
                                </th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Level
                                </th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Message
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {logs.map((log) => {
                                console.log(log.logDate);
                                const date = new Date(log.logDate);
                                return (
                            <tr key={`${log.id}`} className={`hover:bg-gray-50 ${getTextColor(log.severity)}`}>
                                <td className="px-6 py-2 whitespace-nowrap text-sm">
                                    {date.toLocaleDateString()}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm">
                                    {date.toLocaleTimeString([], { hour12: false })}
                                </td>
                                <td className="px-6 py-2 text-sm">
                                    {log.service}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-4 font-semibold rounded-full`}>
                                        {log.severity}
                                    </span>
                                </td>
                                <td className="px-6 py-2 text-sm">
                                    {log.message}
                                </td>
                            </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </InfiniteScroll>
            </div>

            {isLoading && logs.length === 0 && (
                <div className="flex justify-center items-center h-32">
                    <div className="text-gray-600">Loading...</div>
                </div>
            )}
        </div>
    );
}

export default Search; 