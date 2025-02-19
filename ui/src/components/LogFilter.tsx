import { useState } from 'react';
import { LogFilter } from '../api/model';

interface LogFilterProps {
  filter: LogFilter;
  onFilterChange: (filter: Partial<LogFilter>) => void;
}

function LogFilterComponent({ filter, onFilterChange }: LogFilterProps) {
  const [isSeverityOpen, setIsSeverityOpen] = useState(false);
  const [serviceInput, setServiceInput] = useState(filter.service || '');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Severity Filter */}
      <div className="space-y-2">
        <label className="block text-lg font-bold text-white mb-2 text-left">Filter by severity</label>
        <div className="relative">
          <button
            type="button"
            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-600 px-3 py-2 shadow-sm hover:border-gray-500 focus:border-indigo-500"
            onClick={() => setIsSeverityOpen(!isSeverityOpen)}
          >
            {filter.severity?.length 
              ? `${filter.severity.length} selected` 
              : "Select severities"}
          </button>

          {isSeverityOpen && (
            <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
              <div className="relative">
                <button
                  onClick={() => setIsSeverityOpen(false)}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 bg-white border-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="p-2 space-y-1">
                  {["ERROR", "WARNING", "INFO", "DEBUG", "CRITICAL"].map((severity) => (
                    <div key={severity} className="flex items-center">
                      <input
                        type="checkbox"
                        id={severity}
                        checked={filter.severity?.includes(severity)}
                        onChange={(e) => {
                          const newSeverities = e.target.checked
                            ? [...(filter.severity || []), severity]
                            : (filter.severity || []).filter(s => s !== severity);
                            
                          onFilterChange({
                            severity: newSeverities.length > 0 ? newSeverities : []
                          });
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor={severity} className="ml-2 text-sm text-gray-700">
                        {severity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Service Filter */}
      <div className="space-y-2">
        <label className="block text-lg font-bold text-white mb-2 text-left">Filter by service</label>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-600 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="type a service name..."
          value={serviceInput || ''}
          onChange={(e) => setServiceInput(e.target.value)}
          onBlur={(e) => onFilterChange({ service: e.target.value || undefined })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onFilterChange({ service: (e.target as HTMLInputElement).value || undefined });
            }
          }}
        />
      </div>

      {/* Message Filter */}
      <div className="space-y-2">
        <label className="block text-lg font-bold text-white mb-2 text-left">Filter by message</label>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-600 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="start typing a message..."
          value={filter.messageContains || ''}
          onChange={(e) => onFilterChange({ messageContains: e.target.value || undefined })}
        />
      </div>
    </div>
  );
}

export default LogFilterComponent; 