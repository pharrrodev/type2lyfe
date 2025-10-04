import React from 'react';

// Base skeleton component
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`}></div>
);

// Skeleton for activity log entries
export const ActivityLogSkeleton: React.FC = () => (
  <div className="bg-card dark:bg-slate-800 p-4 rounded-2xl shadow-card border-2 border-border dark:border-slate-700 mb-3">
    <div className="flex items-start space-x-3">
      {/* Icon skeleton */}
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      
      <div className="flex-1 space-y-2">
        {/* Title skeleton */}
        <Skeleton className="h-5 w-32" />
        
        {/* Content skeleton */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        
        {/* Timestamp skeleton */}
        <Skeleton className="h-3 w-24 mt-2" />
      </div>
    </div>
  </div>
);

// Skeleton for stat cards
export const StatCardSkeleton: React.FC = () => (
  <div className="bg-card dark:bg-slate-800 rounded-2xl p-4 shadow-card border-2 border-border dark:border-slate-700">
    <div className="space-y-3">
      {/* Icon and title */}
      <div className="flex items-center space-x-2">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      
      {/* Value */}
      <Skeleton className="h-8 w-20" />
      
      {/* Subtitle */}
      <Skeleton className="h-3 w-32" />
    </div>
  </div>
);

// Skeleton for chart
export const ChartSkeleton: React.FC = () => (
  <div className="bg-card dark:bg-slate-800 rounded-2xl p-6 shadow-card border-2 border-border dark:border-slate-700">
    <div className="space-y-4">
      {/* Title */}
      <Skeleton className="h-6 w-48" />
      
      {/* Chart area */}
      <div className="h-64 flex items-end justify-between space-x-2">
        {[...Array(7)].map((_, i) => (
          <Skeleton 
            key={i} 
            className="w-full" 
            style={{ height: `${Math.random() * 60 + 40}%` }}
          />
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex justify-center space-x-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  </div>
);

// Skeleton for meal card
export const MealCardSkeleton: React.FC = () => (
  <div className="bg-card dark:bg-slate-800 rounded-2xl p-4 shadow-card border-2 border-border dark:border-slate-700">
    <div className="space-y-3">
      {/* Meal name */}
      <Skeleton className="h-5 w-40" />
      
      {/* Food items */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      
      {/* Nutrition info */}
      <div className="flex justify-between pt-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  </div>
);

// Skeleton for settings section
export const SettingsSkeleton: React.FC = () => (
  <div className="bg-card dark:bg-slate-800 rounded-2xl p-4 shadow-card border-2 border-border dark:border-slate-700">
    <div className="space-y-4">
      {/* Section title */}
      <Skeleton className="h-5 w-32" />
      
      {/* Settings items */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

// Generic list skeleton
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-3">
    {[...Array(count)].map((_, i) => (
      <ActivityLogSkeleton key={i} />
    ))}
  </div>
);

// Grid skeleton for stats
export const StatsGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {[...Array(4)].map((_, i) => (
      <StatCardSkeleton key={i} />
    ))}
  </div>
);

