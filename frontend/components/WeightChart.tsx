import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { WeightReading } from '../types';

interface WeightChartProps {
  data: WeightReading[];
  unit: 'kg' | 'lbs';
  dateRange?: number; // Number of days to show (default: all)
}

const WeightChart: React.FC<WeightChartProps> = ({ data, unit, dateRange }) => {
  // Filter and sort data based on date range
  const chartData = useMemo(() => {
    let filteredData = [...data];
    
    if (dateRange) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - dateRange);
      filteredData = filteredData.filter(reading => 
        new Date(reading.timestamp) >= cutoffDate
      );
    }
    
    return filteredData.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [data, dateRange]);

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (dateRange && dateRange <= 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-card dark:bg-slate-800 p-4 rounded-2xl shadow-card-hover border-2 border-primary/30 dark:border-primary/40">
          <p className="font-semibold text-text-primary dark:text-slate-100 text-base">
            {`${dataPoint.value} ${unit}`}
          </p>
          <p className="text-sm text-text-secondary dark:text-slate-400 mt-1">
            {new Date(label).toLocaleDateString([], { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          {dataPoint.notes && (
            <p className="text-xs text-text-secondary dark:text-slate-500 mt-1 italic">
              {dataPoint.notes}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Calculate trend (weight change)
  const weightTrend = useMemo(() => {
    if (chartData.length < 2) return null;
    const firstWeight = chartData[0].value;
    const lastWeight = chartData[chartData.length - 1].value;
    const change = lastWeight - firstWeight;
    return {
      change: Math.abs(change).toFixed(1),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-secondary dark:text-slate-400 text-sm">
          No weight data available for the selected period
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Trend Summary */}
      {weightTrend && weightTrend.direction !== 'stable' && (
        <div className="mb-3 px-2">
          <p className="text-xs text-text-secondary dark:text-slate-400">
            {weightTrend.direction === 'down' ? '📉' : '📈'} 
            <span className={`ml-1 font-semibold ${
              weightTrend.direction === 'down' ? 'text-success' : 'text-warning'
            }`}>
              {weightTrend.change} {unit}
            </span>
            <span className="ml-1">
              {weightTrend.direction === 'down' ? 'lost' : 'gained'} over this period
            </span>
          </p>
        </div>
      )}

      {/* Chart */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 10,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="currentColor" 
              className="text-border dark:text-slate-700" 
              opacity={0.3}
            />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              stroke="currentColor"
              className="text-text-secondary dark:text-slate-400"
              style={{ fontSize: '12px' }}
              tickLine={false}
            />
            <YAxis
              stroke="currentColor"
              className="text-text-secondary dark:text-slate-400"
              style={{ fontSize: '12px' }}
              tickLine={false}
              domain={['dataMin - 2', 'dataMax + 2']}
              label={{ 
                value: unit, 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: '12px' },
                className: "text-text-secondary dark:text-slate-400"
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#66BBCC"
              strokeWidth={3}
              dot={{ fill: '#66BBCC', r: 4 }}
              activeDot={{ r: 6, fill: '#66BBCC' }}
              name={`Weight (${unit})`}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeightChart;

