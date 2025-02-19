import React, { useState } from 'react';
import { uploadLogs } from '../api/api';

export const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStatus('uploading');
    try {
      const response = await uploadLogs(file);
      console.log(response);
      setStatus('success');
      setFile(null);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Upload a new log file</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <input
            id="file-upload"
            title = "Upload a new log file"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full"
            accept=".csv,.tsv,.log"
          />
        </div>
        <button
          type="submit"
          disabled={!file || status === 'uploading'}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded disabled:bg-gray-300"
        >
          {status === 'uploading' ? 'Uploading...' : 'Upload'}
        </button>
        {status === 'success' && (
          <div className="text-green-600">File uploaded successfully!</div>
        )}
        {status === 'error' && (
          <div className="text-red-600">Error uploading file</div>
        )}
      </form>
    </div>
  );
};
