import React, { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  children
}) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      {/* Icon */}
      <div className="bg-primary/10 dark:bg-primary/10 rounded-full p-6 mb-6 animate-pulse-slow">
        {icon}
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-text-primary dark:text-slate-100 mb-3">
        {title}
      </h2>

      {/* Description */}
      <p className="text-text-secondary dark:text-slate-400 mb-6 max-w-md">
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {action && (
            <button
              onClick={action.onClick}
              className="px-6 py-3 bg-gradient-to-br from-primary to-primary-dark text-white font-semibold rounded-lg hover:shadow-fab transition-all duration-300 transform hover:scale-105"
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-6 py-3 bg-card dark:bg-slate-800 text-text-primary dark:text-slate-100 font-semibold rounded-lg border-2 border-border dark:border-slate-700 hover:border-primary dark:hover:border-primary transition-all duration-300"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}

      {/* Additional content */}
      {children}
    </div>
  );
};

export default EmptyState;

