import React from 'react';
import { GlucoseReading, WeightReading, BloodPressureReading } from '../types';
import GlucoseChart from './GlucoseChart';
import StatsGrid from './StatsGrid';
import { PlusIcon, DropletIcon } from './Icons';

interface DashboardProps {
  glucoseReadings: GlucoseReading[];
  weightReadings: WeightReading[];
  bloodPressureReadings: BloodPressureReading[];
  unit: 'mg/dL' | 'mmol/L';
}

const Dashboard: React.FC<DashboardProps> = ({ glucoseReadings, weightReadings, bloodPressureReadings, unit }) => {
  const hasAnyData = glucoseReadings.length > 0 || weightReadings.length > 0 || bloodPressureReadings.length > 0;

  if (!hasAnyData) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-primary/10 dark:bg-primary/10 rounded-full p-6 mb-6">
          <DropletIcon className="w-16 h-16 text-primary dark:text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary dark:text-slate-100 mb-3">
          Welcome to Type2Lifestyles!
        </h2>
        <p className="text-text-secondary dark:text-slate-400 mb-6 max-w-md">
          Start tracking your health journey by logging your first entry. Tap the <PlusIcon className="w-4 h-4 inline mx-1" /> button below to get started.
        </p>
        <div className="bg-card dark:bg-slate-800 p-6 rounded-2xl shadow-card border border-border dark:border-slate-700 max-w-md">
          <h3 className="font-semibold text-text-primary dark:text-slate-100 mb-3">You can track:</h3>
          <ul className="text-left text-text-secondary dark:text-slate-400 space-y-2">
            <li>🩸 Glucose readings (voice, manual, or photo)</li>
            <li>🍽️ Meals with AI photo analysis</li>
            <li>💊 Medications</li>
            <li>⚖️ Weight</li>
            <li>🫀 Blood pressure</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <StatsGrid
        readings={glucoseReadings}
        weightReadings={weightReadings}
        bloodPressureReadings={bloodPressureReadings}
        unit={unit}
      />
      <section className="bg-card dark:bg-slate-800 p-6 rounded-2xl shadow-card flex-grow flex flex-col border border-border dark:border-slate-700">
        <h2 className="text-xl font-semibold text-text-primary dark:text-slate-100 mb-6 flex-shrink-0">Glucose Trends</h2>
        <div className="flex-grow h-full w-full">
          {glucoseReadings.length > 0 ? (
            <GlucoseChart data={glucoseReadings} unit={unit} />
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <DropletIcon className="w-12 h-12 text-text-secondary dark:text-slate-600 mx-auto mb-3" />
                <p className="text-text-secondary dark:text-slate-400">No glucose readings yet.</p>
                <p className="text-text-secondary dark:text-slate-500 text-sm mt-1">Log your first reading to see trends.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;