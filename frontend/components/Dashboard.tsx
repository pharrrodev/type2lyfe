import React from 'react';
import { GlucoseReading, WeightReading, BloodPressureReading } from '../types';
import GlucoseChart from './GlucoseChart';
import StatsGrid from './StatsGrid';
import { PlusIcon, DropletIcon } from './Icons';
import EmptyState from './EmptyState';

interface DashboardProps {
  glucoseReadings: GlucoseReading[];
  weightReadings: WeightReading[];
  bloodPressureReadings: BloodPressureReading[];
  unit: 'mg/dL' | 'mmol/L';
  onOpenActionSheet?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ glucoseReadings, weightReadings, bloodPressureReadings, unit, onOpenActionSheet }) => {
  const hasAnyData = glucoseReadings.length > 0 || weightReadings.length > 0 || bloodPressureReadings.length > 0;

  if (!hasAnyData) {
    return (
      <EmptyState
        icon={<DropletIcon className="w-16 h-16 text-primary dark:text-primary" />}
        title="Welcome to Type2Lyfe!"
        description="Start your health journey by logging your first entry. Track glucose, meals, medications, weight, and blood pressure all in one place."
        action={
          onOpenActionSheet
            ? {
                label: 'Log Your First Entry',
                onClick: onOpenActionSheet
              }
            : undefined
        }
      >
        <div className="bg-card dark:bg-slate-800 p-6 rounded-2xl shadow-card border-2 border-border dark:border-slate-700 max-w-md mt-4">
          <h3 className="font-semibold text-text-primary dark:text-slate-100 mb-4 text-lg">What you can track:</h3>
          <div className="grid grid-cols-1 gap-3 text-left">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🩸</span>
              <div>
                <p className="font-medium text-text-primary dark:text-slate-100">Glucose Readings</p>
                <p className="text-sm text-text-secondary dark:text-slate-400">Voice, manual, or photo input</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🍽️</span>
              <div>
                <p className="font-medium text-text-primary dark:text-slate-100">Meals</p>
                <p className="text-sm text-text-secondary dark:text-slate-400">AI-powered photo analysis</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💊</span>
              <div>
                <p className="font-medium text-text-primary dark:text-slate-100">Medications</p>
                <p className="text-sm text-text-secondary dark:text-slate-400">Track your daily doses</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">⚖️</span>
              <div>
                <p className="font-medium text-text-primary dark:text-slate-100">Weight</p>
                <p className="text-sm text-text-secondary dark:text-slate-400">Monitor your progress</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🫀</span>
              <div>
                <p className="font-medium text-text-primary dark:text-slate-100">Blood Pressure</p>
                <p className="text-sm text-text-secondary dark:text-slate-400">Keep tabs on your vitals</p>
              </div>
            </div>
          </div>
        </div>
      </EmptyState>
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