import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { aggregateLogs } from '../api/api';
import { AggregateParams, LogFilter } from '../api/model';
import LogFilterComponent from '../components/LogFilter';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Chart() {
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter state
  const [filter, setFilter] = useState<LogFilter>({
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000 * 365).toISOString(), // last year
    severity: ['ERROR', 'CRITICAL', 'WARNING']
  });
  
  // Aggregation parameters
  const [aggregateParams, setAggregateParams] = useState<AggregateParams>({
    dimension: 'service',
    timeRange: 'hour'
  });

  useEffect(() => {
    fetchData();
  }, [filter, aggregateParams]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await aggregateLogs(aggregateParams.dimension, filter);
      setChartData({
        labels: response.map(item => item.dimension),
        datasets: [{
          label: `Log Count by ${aggregateParams.dimension}`,
          data: response.map(item => item.count),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgb(53, 162, 235)',
          borderWidth: 1
        }]
      });
    } catch (error) {
      console.error('Error fetching aggregate data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDimensionChange = (dimension: AggregateParams['dimension']) => {
    setAggregateParams(prev => ({ ...prev, dimension }));
  };

  const handleFilterChange = (newFilter: Partial<LogFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  return (
    <div className="p-6">

      {/* Controls */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        {/* Dimension Selection */}
        <div className="space-y-2">
          <label className="block text-lg font-bold text-white mb-2 text-left">Choose a distribution</label>
          <select
            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-600 px-3 py-2 h-[42px] shadow-sm hover:border-gray-500 focus:border-indigo-500"
            value={aggregateParams.dimension}
            onChange={(e) => handleDimensionChange(e.target.value as AggregateParams['dimension'])}
          >
            <option value="service">By service</option>
            <option value="severity">By severity level</option>
            <option value="time">Over time</option>
            <option value="message">By log message</option>
          </select>
        </div>

        <LogFilterComponent 
          filter={filter}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600">Loading...</div>
          </div>
        ) : chartData ? (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                title: {
                  display: true,
                  text: `Log Distribution by ${aggregateParams.dimension}`,
                }
              },
            }}
            height={500}
          />
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600">No data available</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chart; 