import React from 'react';
import { GlucoseReading, Meal, Medication, LogEntry as LogEntryType, WeightReading, BloodPressureReading } from '../types';
import { DropletIcon, ForkSpoonIcon, MicIcon, PencilIcon, PillIcon, CameraIcon, WeightScaleIcon, BloodPressureIcon } from './Icons';

interface LogEntryProps {
  log: LogEntryType;
}

const GlucoseEntry: React.FC<{ log: GlucoseReading }> = ({ log }) => {
  const getGlucoseStatus = (value: number) => {
    const high = log.displayUnit === 'mmol/L' ? 10 : 180;
    const low = log.displayUnit === 'mmol/L' ? 4 : 70;
    if (value > high) return { status: 'HIGH', color: 'bg-red-500' };
    if (value < low) return { status: 'LOW', color: 'bg-orange-500' };
    return null;
  };

  const status = getGlucoseStatus(log.value);

  return (
    <div className="flex items-center space-x-3">
      <div className="bg-accent-blue bg-opacity-10 dark:bg-opacity-20 rounded-full p-2">
        <DropletIcon className="w-5 h-5 text-accent-blue dark:text-accent-blue-light" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-text-primary dark:text-slate-100 text-sm">Glucose Reading</p>
        <p className="text-xs text-text-secondary dark:text-slate-400 capitalize">{log.context.replace('_', ' ')}</p>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex items-baseline space-x-1">
          <p className="text-xl font-bold text-accent-blue dark:text-accent-blue-light">{log.value}</p>
          <p className="text-xs text-text-light dark:text-slate-500">{log.displayUnit}</p>
        </div>
        {status && (
          <span className={`${status.color} text-white text-xs font-semibold px-2 py-0.5 rounded-full`}>
            {status.status}
          </span>
        )}
      </div>
      {log.source === 'voice' && <MicIcon className="w-4 h-4 text-accent-blue dark:text-accent-blue-light" />}
      {log.source === 'manual' && <PencilIcon className="w-4 h-4 text-accent-blue dark:text-accent-blue-light" />}
      {log.source === 'photo_analysis' && <CameraIcon className="w-4 h-4 text-accent-blue dark:text-accent-blue-light" />}
    </div>
  );
};

const MealEntry: React.FC<{ log: Meal }> = ({ log }) => {
  return (
    <div className="flex items-start space-x-3">
      <div className="bg-accent-green bg-opacity-10 dark:bg-opacity-20 rounded-full p-2">
        <ForkSpoonIcon className="w-5 h-5 text-accent-green dark:text-primary-light" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-text-primary dark:text-slate-100 capitalize text-sm">{log.mealType}</p>
        <p className="text-xs text-text-secondary dark:text-slate-400">
          {log.foodItems.map(item => item.name).join(', ')}
        </p>
        <p className="text-xs text-text-secondary dark:text-slate-400 mt-1">
          <span className="font-medium">{log.totalNutrition.carbs}g</span> carbs
        </p>
      </div>
      {/* FIX: Wrap icon in a span with a title to fix prop type error. */}
      {log.source === 'voice' && <span title="Logged by voice"><MicIcon className="w-4 h-4 text-primary dark:text-primary-light self-center" /></span>}
      {/* FIX: Wrap icon in a span with a title to fix prop type error. */}
      {log.source === 'manual' && <span title="Logged manually"><PencilIcon className="w-4 h-4 text-primary dark:text-primary-light self-center" /></span>}
      {log.photoUrl && (
        <img src={log.photoUrl} alt={log.mealType} className="w-16 h-16 rounded-card object-cover shadow-card" />
      )}
    </div>
  );
};

const MedicationEntry: React.FC<{ log: Medication }> = ({ log }) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="bg-accent-purple bg-opacity-10 dark:bg-opacity-20 rounded-full p-2">
        <PillIcon className="w-5 h-5 text-accent-purple dark:text-purple-400" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-text-primary dark:text-slate-100 text-sm">{log.name}</p>
        <p className="text-xs text-text-secondary dark:text-slate-400">{`${log.quantity} x ${log.dosage}${log.unit}`}</p>
      </div>
       {log.source === 'voice' && <MicIcon className="w-4 h-4 text-accent-purple dark:text-purple-400" />}
      {log.source === 'manual' && <PencilIcon className="w-4 h-4 text-accent-purple dark:text-purple-400" />}
    </div>
  );
};

const WeightEntry: React.FC<{ log: WeightReading }> = ({ log }) => {
    return (
      <div className="flex items-center space-x-3">
        <div className="bg-accent-orange bg-opacity-10 dark:bg-opacity-20 rounded-full p-2">
          <WeightScaleIcon className="w-5 h-5 text-accent-orange" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-text-primary dark:text-slate-100 text-sm">Weight Reading</p>
          <p className="text-xs text-text-secondary dark:text-slate-400">Logged {log.source === 'voice' ? 'by voice' : (log.source === 'photo_analysis' ? 'by photo' : 'manually')}</p>
        </div>
        <div className="flex items-baseline space-x-1">
          <p className="text-xl font-bold text-accent-orange">{log.value}</p>
          <p className="text-xs text-text-light dark:text-slate-500">{log.unit}</p>
        </div>
        {log.source === 'voice' && <MicIcon className="w-4 h-4 text-accent-orange" />}
        {log.source === 'manual' && <PencilIcon className="w-4 h-4 text-accent-orange" />}
        {log.source === 'photo_analysis' && <CameraIcon className="w-4 h-4 text-accent-orange" />}
      </div>
    );
};
  
const BloodPressureEntry: React.FC<{ log: BloodPressureReading }> = ({ log }) => {
    const getBPStatus = (systolic: number, diastolic: number) => {
        // High BP: Systolic >= 140 or Diastolic >= 90
        if (systolic >= 140 || diastolic >= 90) {
            return { status: 'HIGH', color: 'bg-red-500' };
        }
        // Elevated: Systolic 120-139 or Diastolic 80-89
        if (systolic >= 120 || diastolic >= 80) {
            return { status: 'ELEVATED', color: 'bg-orange-500' };
        }
        return null;
    };

    const status = getBPStatus(log.systolic, log.diastolic);

    return (
        <div className="flex items-center space-x-3">
        <div className="bg-accent-pink bg-opacity-10 dark:bg-opacity-20 rounded-full p-2">
            <BloodPressureIcon className="w-5 h-5 text-accent-pink" />
        </div>
        <div className="flex-1">
            <p className="font-semibold text-text-primary dark:text-slate-100 text-sm">Blood Pressure</p>
            <p className="text-xs text-text-secondary dark:text-slate-400">Pulse: {log.pulse} bpm</p>
        </div>
        <div className="flex items-center space-x-2">
            <div className="text-right">
                <p className="text-xl font-bold text-accent-pink">{log.systolic} / {log.diastolic}</p>
                <p className="text-xs text-text-light dark:text-slate-500">mmHg</p>
            </div>
            {status && (
                <span className={`${status.color} text-white text-xs font-semibold px-2 py-0.5 rounded-full`}>
                    {status.status}
                </span>
            )}
        </div>
        <div className="flex flex-col items-center justify-center pl-2 space-y-1">
            {log.source === 'voice' && <MicIcon className="w-4 h-4 text-accent-pink" />}
            {log.source === 'manual' && <PencilIcon className="w-4 h-4 text-accent-pink" />}
            {log.source === 'photo_analysis' && <CameraIcon className="w-4 h-4 text-accent-pink" />}
        </div>
        </div>
    );
};


const LogEntry: React.FC<LogEntryProps> = ({ log }) => {
  const date = new Date(log.timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // Get hours in 12-hour format (1-12)
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const timeString = `${formattedHours}:${formattedMinutes}`;
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const dateString = `${day}/${month}`;

  const renderContent = () => {
    switch (log.type) {
      case 'glucose':
        return <GlucoseEntry log={log} />;
      case 'meal':
        return <MealEntry log={log} />;
      case 'medication':
        return <MedicationEntry log={log} />;
      case 'weight':
        return <WeightEntry log={log} />;
      case 'blood_pressure':
        return <BloodPressureEntry log={log as BloodPressureReading} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-2 sm:p-4 rounded-card shadow-card hover:shadow-card-hover transition-all duration-300 flex items-start space-x-2 sm:space-x-3 border border-transparent dark:border-slate-700">
      <div className="text-center w-12 sm:w-16">
        <p className="text-sm sm:text-base font-semibold text-text-primary dark:text-slate-100">{timeString}</p>
        <p className="text-xs text-text-secondary dark:text-slate-400">{ampm}</p>
        <p className="text-xs text-text-light dark:text-slate-500 mt-0.5">{dateString}</p>
      </div>
      <div className="border-l border-slate-200 dark:border-slate-700 pl-2 sm:pl-3 flex-1">
        {renderContent()}
      </div>
    </div>
  );
};

export default LogEntry;