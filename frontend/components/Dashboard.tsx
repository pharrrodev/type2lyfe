import React, { useState } from 'react';
import { GlucoseReading, WeightReading, BloodPressureReading } from '../types';
import GlucoseChart from './GlucoseChart';
import WeightChart from './WeightChart';
import BloodPressureChart from './BloodPressureChart';
import StatsGrid from './StatsGrid';
import DateRangeFilter from './DateRangeFilter';
import TabNavigation from './TabNavigation';
import { PlusIcon, DropletIcon, WeightScaleIcon, BloodPressureIcon } from './Icons';
import EmptyState from './EmptyState';

interface DashboardProps {
  glucoseReadings: GlucoseReading[];
  weightReadings: WeightReading[];
  bloodPressureReadings: BloodPressureReading[];
  unit: 'mg/dL' | 'mmol/L';
  weightUnit: 'kg' | 'lbs';
  onOpenActionSheet?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ glucoseReadings, weightReadings, bloodPressureReadings, unit, weightUnit, onOpenActionSheet }) => {
  const hasAnyData = glucoseReadings.length > 0 || weightReadings.length > 0 || bloodPressureReadings.length > 0;

  // Active tab state
  const [activeTab, setActiveTab] = useState<'glucose' | 'weight' | 'bp'>('glucose');

  // Date range filters for each chart
  const [glucoseDateRange, setGlucoseDateRange] = useState<number | null>(7);
  const [weightDateRange, setWeightDateRange] = useState<number | null>(30);
  const [bpDateRange, setBpDateRange] = useState<number | null>(30);

  // Tab configuration
  const tabs = [
    {
      id: 'glucose',
      label: 'Glucose',
      icon: <DropletIcon className="w-5 h-5" />
    },
    {
      id: 'weight',
      label: 'Weight',
      icon: <WeightScaleIcon className="w-5 h-5" />
    },
    {
      id: 'bp',
      label: 'BP',
      icon: <BloodPressureIcon className="w-5 h-5" />
    }
  ];

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
    <div className="h-full flex flex-col space-y-4">
      {/* Stats Grid - Always Visible */}
      <StatsGrid
        readings={glucoseReadings}
        weightReadings={weightReadings}
        bloodPressureReadings={bloodPressureReadings}
        unit={unit}
      />

      {/* Tab Navigation */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as 'glucose' | 'weight' | 'bp')}
      />

      {/* Active Chart Section */}
      <section className="bg-card dark:bg-slate-800 p-6 rounded-2xl shadow-card flex flex-col border border-border dark:border-slate-700 flex-grow">
        {/* Glucose Chart */}
        {activeTab === 'glucose' && (
          <>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-xl font-semibold text-text-primary dark:text-slate-100">Glucose Trends</h2>
              <DateRangeFilter selectedRange={glucoseDateRange} onRangeChange={setGlucoseDateRange} />
            </div>
            <div className="flex-grow h-full w-full min-h-[300px]">
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
          </>
        )}

        {/* Weight Chart */}
        {activeTab === 'weight' && (
          <>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-xl font-semibold text-text-primary dark:text-slate-100">Weight Trends</h2>
              <DateRangeFilter selectedRange={weightDateRange} onRangeChange={setWeightDateRange} />
            </div>
            <div className="flex-grow h-full w-full min-h-[300px]">
              {weightReadings.length > 0 ? (
                <WeightChart data={weightReadings} unit={weightUnit} dateRange={weightDateRange || undefined} />
              ) : (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <WeightScaleIcon className="w-12 h-12 text-text-secondary dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-text-secondary dark:text-slate-400">No weight readings yet.</p>
                    <p className="text-text-secondary dark:text-slate-500 text-sm mt-1">Log your first weight to see trends.</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Blood Pressure Chart */}
        {activeTab === 'bp' && (
          <>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-xl font-semibold text-text-primary dark:text-slate-100">Blood Pressure Trends</h2>
              <DateRangeFilter selectedRange={bpDateRange} onRangeChange={setBpDateRange} />
            </div>
            <div className="flex-grow h-full w-full min-h-[300px]">
              {bloodPressureReadings.length > 0 ? (
                <BloodPressureChart data={bloodPressureReadings} dateRange={bpDateRange || undefined} />
              ) : (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <BloodPressureIcon className="w-12 h-12 text-text-secondary dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-text-secondary dark:text-slate-400">No blood pressure readings yet.</p>
                    <p className="text-text-secondary dark:text-slate-500 text-sm mt-1">Log your first reading to see trends.</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Dashboard;