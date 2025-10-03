import React from 'react';
import { GlucoseReading, WeightReading, BloodPressureReading } from '../types';
import GlucoseChart from './GlucoseChart';
import StatsGrid from './StatsGrid';

interface DashboardProps {
  glucoseReadings: GlucoseReading[];
  weightReadings: WeightReading[];
  bloodPressureReadings: BloodPressureReading[];
  unit: 'mg/dL' | 'mmol/L';
}

const Dashboard: React.FC<DashboardProps> = ({ glucoseReadings, weightReadings, bloodPressureReadings, unit }) => {
  return (
    <div className="h-full flex flex-col space-y-6">
      <StatsGrid
        readings={glucoseReadings}
        weightReadings={weightReadings}
        bloodPressureReadings={bloodPressureReadings}
        unit={unit}
      />
      <section className="bg-white dark:bg-slate-800 p-6 rounded-card shadow-card flex-grow flex flex-col border border-border-light dark:border-slate-700">
        <h2 className="text-xl font-semibold text-text-primary dark:text-slate-100 mb-6 flex-shrink-0">Glucose Trends</h2>
        <div className="flex-grow h-full w-full">
          <GlucoseChart data={glucoseReadings} unit={unit} />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;