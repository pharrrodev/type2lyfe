import React, { useState } from 'react';
import { LogEntry as LogEntryType } from '../types';
import LogEntry from './LogEntry';

interface ActivityPageProps {
  logs: LogEntryType[];
}

const ActivityPage: React.FC<ActivityPageProps> = ({ logs }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLogs = logs.slice(startIndex, startIndex + itemsPerPage);

  const goToNextPage = () => setCurrentPage((page) => Math.min(page + 1, totalPages));
  const goToPrevPage = () => setCurrentPage((page) => Math.max(page - 1, 1));

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-1.5 sm:mb-4 flex-shrink-0">
        <h2 className="text-lg sm:text-xl font-semibold text-text-primary dark:text-slate-100">Recent Activity</h2>
        {logs.length > itemsPerPage && (
          <div className="flex items-center space-x-2 text-sm">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white dark:bg-slate-800 border border-primary dark:border-primary-light rounded-button shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-white dark:hover:bg-primary-light transition-all duration-300 text-text-primary dark:text-slate-100"
            >
              Prev
            </button>
            <span className="text-text-primary dark:text-slate-100 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white dark:bg-slate-800 border border-primary dark:border-primary-light rounded-button shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-white dark:hover:bg-primary-light transition-all duration-300 text-text-primary dark:text-slate-100"
            >
              Next
            </button>
          </div>
        )}
      </div>
      <div className="flex-grow flex flex-col gap-0.5 sm:gap-1 overflow-hidden">
        {currentLogs.length > 0 ? (
          currentLogs.map(log => (
            <LogEntry key={`${log.type}-${log.id}`} log={log} />
          ))
        ) : (
          <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-card shadow-card h-full flex flex-col justify-center items-center border border-transparent dark:border-slate-700">
            <p className="text-text-secondary dark:text-slate-400">No recent activity.</p>
            <p className="text-text-light dark:text-slate-500 text-sm mt-1">Use the '+' button to log your first entry.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;