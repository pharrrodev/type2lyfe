import React, { useState } from 'react';
import { LogEntry as LogEntryType } from '../types';
import LogEntry from './LogEntry';
import { PlusIcon } from './Icons';

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
              type="button"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-card dark:bg-slate-800 border border-primary dark:border-primary rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-white dark:hover:bg-primary transition-all duration-300 text-text-primary dark:text-slate-100"
            >
              Prev
            </button>
            <span className="text-text-primary dark:text-slate-100 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-card dark:bg-slate-800 border border-primary dark:border-primary rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-white dark:hover:bg-primary transition-all duration-300 text-text-primary dark:text-slate-100"
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
          <div className="text-center py-10 bg-card dark:bg-slate-800 rounded-2xl shadow-card h-full flex flex-col justify-center items-center border border-transparent dark:border-slate-700">
            <div className="bg-primary/10 dark:bg-primary/10 rounded-full p-4 mb-4">
              <PlusIcon className="w-8 h-8 text-primary dark:text-primary" />
            </div>
            <p className="text-lg font-semibold text-text-primary dark:text-slate-100 mb-2">No recent activity</p>
            <p className="text-text-secondary dark:text-slate-400 text-sm">Tap the <PlusIcon className="w-3 h-3 inline mx-1" /> button below to log your first entry.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;