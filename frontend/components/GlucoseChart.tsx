import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area } from 'recharts';
import { GlucoseReading } from '../types';

interface GlucoseChartProps {
  data: GlucoseReading[];
  unit: 'mg/dL' | 'mmol/L';
}

const GlucoseChart: React.FC<GlucoseChartProps> = ({ data, unit }) => {
  const sortedData = [...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-card p-4 rounded-2xl shadow-card-hover border border-primary/30">
          <p className="font-semibold text-text-primary text-base">{`${dataPoint.value} ${unit}`}</p>
          <p className="text-sm text-text-secondary mt-1">{new Date(label).toLocaleString()}</p>
          <p className="text-sm text-text-secondary capitalize">{dataPoint.context.replace('_', ' ')}</p>
        </div>
      );
    }
    return null;
  };

  const getDotColor = (value: number) => {
    if (unit === 'mmol/L') {
      if (value > 10) return '#FF9B9B'; // High for mmol/L (soft-pink)
      if (value < 4) return '#FFB84D';  // Low for mmol/L (soft-orange)
    } else {
      if (value > 180) return '#FF9B9B'; // High for mg/dL (soft-pink)
      if (value < 70) return '#FFB84D';  // Low for mg/dL (soft-orange)
    }
    return '#66BBCC'; // In range (Accent Blue)
  };

  const highReference = unit === 'mmol/L' ? 10 : 180;
  const lowReference = unit === 'mmol/L' ? 4 : 70;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={sortedData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 5,
        }}
      >
        {/* Define gradient for area fill */}
        <defs>
          <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5D9C59" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#5D9C59" stopOpacity={0.05} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="timestamp"
          tickFormatter={formatXAxis}
          stroke="#64748B"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: '#E2E8F0' }}
        />
        <YAxis
          stroke="#64748B"
          fontSize={12}
          domain={['dataMin - 2', 'dataMax + 2']}
          allowDecimals={unit === 'mmol/L'}
          tickLine={false}
          axisLine={{ stroke: '#E2E8F0' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={highReference}
          label={{ value: 'High', position: 'insideTopRight', fill: '#FF9B9B', fontSize: 11, fontWeight: 500 }}
          stroke="#FF9B9B"
          strokeDasharray="5 5"
          strokeWidth={1.5}
        />
        <ReferenceLine
          y={lowReference}
          label={{ value: 'Low', position: 'insideBottomRight', fill: '#FFB84D', fontSize: 11, fontWeight: 500 }}
          stroke="#FFB84D"
          strokeDasharray="5 5"
          strokeWidth={1.5}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#5D9C59"
          strokeWidth={3}
          fill="url(#glucoseGradient)"
          dot={(props) => {
            const { cx, cy, payload, index } = props;
            return <circle
              key={`dot-${index}-${payload.id || payload.timestamp}`}
              cx={cx}
              cy={cy}
              r={5}
              fill={getDotColor(payload.value)}
              stroke="#fff"
              strokeWidth={2}
            />;
          }}
          activeDot={{ r: 7, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default GlucoseChart;