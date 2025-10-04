import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  iconBgColor?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon,
  trend,
  trendValue,
  iconBgColor = 'bg-primary/10',
  className = '',
}) => {
  // Trend colors
  const trendColors = {
    up: 'text-success',
    down: 'text-danger',
    neutral: 'text-text-secondary',
  };

  return (
    <div className={`bg-card rounded-2xl shadow-card p-4 border border-border ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs text-text-secondary mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-text-primary">{value}</p>
            {unit && <p className="text-sm text-text-secondary">{unit}</p>}
          </div>
          {trend && trendValue && (
            <p className={`text-xs mt-1 ${trendColors[trend]}`}>
              {trend === 'up' && '↑ '}
              {trend === 'down' && '↓ '}
              {trendValue}
            </p>
          )}
        </div>
        {icon && (
          <div className={`w-12 h-12 ${iconBgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;

