import React, { useState } from 'react';
import { LogEntry as LogEntryType } from '../types';
import LogEntry from './LogEntry';
import { PlusIcon, ActivityIcon } from './Icons';
import EmptyState from './EmptyState';

interface ActivityPageProps {
  logs: LogEntryType[];
  onOpenActionSheet?: () => void;
  onEdit?: (log: LogEntryType) => void;
  onDelete?: (log: LogEntryType) => void;
}

const ActivityPage: React.FC<ActivityPageProps> = ({ logs, onOpenActionSheet, onEdit, onDelete }) => {
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
      <div className="flex-grow flex flex-col space-y-2 sm:space-y-3">
        {currentLogs.length > 0 ? (
          currentLogs.map(log => (
            <LogEntry
              key={`${log.type}-${log.id}`}
              log={log}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="h-full">
            <EmptyState
              icon={<ActivityIcon className="w-12 h-12 text-primary dark:text-primary" />}
              title="No Activity Yet"
              description="Your recent health logs will appear here. Start tracking to see your progress over time."
              action={
                onOpenActionSheet
                  ? {
                      label: 'Log an Entry',
                      onClick: onOpenActionSheet
                    }
                  : undefined
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;