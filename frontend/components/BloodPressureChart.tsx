import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { BloodPressureReading } from '../types';

interface BloodPressureChartProps {
  data: BloodPressureReading[];
  dateRange?: number; // Number of days to show (default: all)
}

const BloodPressureChart: React.FC<BloodPressureChartProps> = ({ data, dateRange }) => {
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
      const category = getBPCategory(dataPoint.systolic, dataPoint.diastolic);
      
      return (
        <div className="bg-card dark:bg-slate-800 p-4 rounded-2xl shadow-card-hover border-2 border-primary/30 dark:border-primary/40">
          <p className="font-semibold text-text-primary dark:text-slate-100 text-base">
            {`${dataPoint.systolic}/${dataPoint.diastolic} mmHg`}
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
          <p className={`text-xs font-semibold mt-1 ${category.color}`}>
            {category.label}
          </p>
          {dataPoint.pulse && (
            <p className="text-xs text-text-secondary dark:text-slate-500 mt-1">
              Pulse: {dataPoint.pulse} bpm
            </p>
          )}
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

  // Blood pressure categories
  const getBPCategory = (systolic: number, diastolic: number) => {
    if (systolic >= 180 || diastolic >= 120) {
      return { label: 'Hypertensive Crisis', color: 'text-danger' };
    } else if (systolic >= 140 || diastolic >= 90) {
      return { label: 'High Blood Pressure', color: 'text-danger' };
    } else if (systolic >= 130 || diastolic >= 80) {
      return { label: 'Elevated', color: 'text-warning' };
    } else if (systolic >= 120 && diastolic < 80) {
      return { label: 'Elevated', color: 'text-warning' };
    } else {
      return { label: 'Normal', color: 'text-success' };
    }
  };

  // Calculate average BP
  const averageBP = useMemo(() => {
    if (chartData.length === 0) return null;
    const avgSystolic = chartData.reduce((sum, r) => sum + r.systolic, 0) / chartData.length;
    const avgDiastolic = chartData.reduce((sum, r) => sum + r.diastolic, 0) / chartData.length;
    return {
      systolic: Math.round(avgSystolic),
      diastolic: Math.round(avgDiastolic)
    };
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-secondary dark:text-slate-400 text-sm">
          No blood pressure data available for the selected period
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Average Summary */}
      {averageBP && (
        <div className="mb-3 px-2">
          <p className="text-xs text-text-secondary dark:text-slate-400">
            Average: 
            <span className="ml-1 font-semibold text-text-primary dark:text-slate-100">
              {averageBP.systolic}/{averageBP.diastolic} mmHg
            </span>
            <span className={`ml-2 text-xs font-semibold ${
              getBPCategory(averageBP.systolic, averageBP.diastolic).color
            }`}>
              {getBPCategory(averageBP.systolic, averageBP.diastolic).label}
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
              domain={[60, 200]}
              label={{ 
                value: 'mmHg', 
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
            
            {/* Reference lines for normal ranges */}
            <ReferenceLine 
              y={120} 
              stroke="#FFB84D" 
              strokeDasharray="3 3" 
              opacity={0.5}
              label={{ value: 'Elevated', position: 'right', fontSize: 10, fill: '#FFB84D' }}
            />
            <ReferenceLine 
              y={140} 
              stroke="#FF9B9B" 
              strokeDasharray="3 3" 
              opacity={0.5}
              label={{ value: 'High', position: 'right', fontSize: 10, fill: '#FF9B9B' }}
            />
            
            <Line
              type="monotone"
              dataKey="systolic"
              stroke="#FF6B6B"
              strokeWidth={3}
              dot={{ fill: '#FF6B6B', r: 4 }}
              activeDot={{ r: 6, fill: '#FF6B6B' }}
              name="Systolic"
            />
            <Line
              type="monotone"
              dataKey="diastolic"
              stroke="#66BBCC"
              strokeWidth={3}
              dot={{ fill: '#66BBCC', r: 4 }}
              activeDot={{ r: 6, fill: '#66BBCC' }}
              name="Diastolic"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BloodPressureChart;

