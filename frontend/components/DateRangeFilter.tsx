import React from 'react';

interface DateRangeFilterProps {
  selectedRange: number | null;
  onRangeChange: (days: number | null) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ selectedRange, onRangeChange }) => {
  const ranges = [
    { label: '7 Days', days: 7 },
    { label: '30 Days', days: 30 },
    { label: '90 Days', days: 90 },
    { label: 'All Time', days: null },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {ranges.map((range) => (
        <button
          key={range.label}
          onClick={() => onRangeChange(range.days)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            selectedRange === range.days
              ? 'bg-primary text-white shadow-md'
              : 'bg-card dark:bg-slate-800 text-text-secondary dark:text-slate-400 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary border border-border dark:border-slate-700'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
};

export default DateRangeFilter;

