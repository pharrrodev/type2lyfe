import React from 'react';
import { GlucoseReading, Meal, Medication, LogEntry as LogEntryType, WeightReading, BloodPressureReading } from '../types';
import { DropletIcon, ForkSpoonIcon, MicIcon, PencilIcon, PillIcon, CameraIcon, WeightScaleIcon, BloodPressureIcon, TrashIcon, KeyboardIcon } from './Icons';

interface LogEntryProps {
  log: LogEntryType;
  onEdit?: (log: LogEntryType) => void;
  onDelete?: (log: LogEntryType) => void;
}

const GlucoseEntry: React.FC<{ log: GlucoseReading }> = ({ log }) => {
  const getGlucoseStatus = (value: number) => {
    const high = log.displayUnit === 'mmol/L' ? 10 : 180;
    const low = log.displayUnit === 'mmol/L' ? 4 : 70;
    if (value > high) return { status: 'HIGH', color: 'bg-danger' };
    if (value < low) return { status: 'LOW', color: 'bg-warning' };
    return null;
  };

  const status = getGlucoseStatus(log.value);

  return (
    <div className="flex items-center space-x-3">
      <div className="bg-info bg-opacity-10 dark:bg-opacity-20 rounded-full p-2">
        <DropletIcon className="w-5 h-5 text-info dark:text-info" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-text-primary dark:text-slate-100 text-sm">Glucose Reading</p>
        <p className="text-xs text-text-secondary dark:text-slate-400 capitalize">{log.context ? log.context.replace('_', ' ') : 'Random'}</p>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex items-baseline space-x-1">
          <p className="text-xl font-bold text-info dark:text-info">{log.value}</p>
          <p className="text-xs text-text-secondary dark:text-slate-500">{log.displayUnit}</p>
        </div>
        {status && (
          <span className={`${status.color} text-white text-xs font-semibold px-2 py-0.5 rounded-full`}>
            {status.status}
          </span>
        )}
        {log.source === 'voice' && <MicIcon className="w-4 h-4 text-info dark:text-info" />}
        {log.source === 'manual' && <KeyboardIcon className="w-4 h-4 text-info dark:text-info" />}
        {log.source === 'photo_analysis' && <CameraIcon className="w-4 h-4 text-info dark:text-info" />}
      </div>
    </div>
  );
};

const MealEntry: React.FC<{ log: Meal }> = ({ log }) => {
  return (
    <div className="flex items-start space-x-3">
      <div className="bg-success bg-opacity-10 dark:bg-opacity-20 rounded-full p-2">
        <ForkSpoonIcon className="w-5 h-5 text-success dark:text-primary" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-text-primary dark:text-slate-100 capitalize text-sm">{log.mealType}</p>
          {/* Source indicators */}
          {log.source === 'voice' && <span title="Logged by voice"><MicIcon className="w-4 h-4 text-success dark:text-success" /></span>}
          {log.source === 'manual' && <span title="Logged manually"><KeyboardIcon className="w-4 h-4 text-success dark:text-success" /></span>}
          {log.source === 'photo_analysis' && <span title="Analyzed from photo"><CameraIcon className="w-4 h-4 text-success dark:text-success" /></span>}
        </div>
        <p className="text-xs text-text-secondary dark:text-slate-400">
          {log.foodItems && log.foodItems.length > 0
            ? log.foodItems.map(item => item.name).join(', ')
            : 'Meal logged'}
        </p>
        <p className="text-xs text-text-secondary dark:text-slate-400 mt-1">
          <span className="font-medium">{log.totalNutrition?.carbs || 0}g</span> carbs •
          <span className="font-medium ml-1">{log.totalNutrition?.calories || 0}</span> cal
        </p>
      </div>
    </div>
  );
};

const MedicationEntry: React.FC<{ log: Medication }> = ({ log }) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="bg-accent-purple bg-opacity-10 dark:bg-opacity-20 rounded-full p-2">
        <PillIcon className="w-5 h-5 text-accent-purple dark:text-accent-purple" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-text-primary dark:text-slate-100 text-sm">{log.name}</p>
          {log.source === 'voice' && <MicIcon className="w-4 h-4 text-accent-purple dark:text-accent-purple" />}
          {log.source === 'manual' && <KeyboardIcon className="w-4 h-4 text-accent-purple dark:text-accent-purple" />}
        </div>
        <p className="text-xs text-text-secondary dark:text-slate-400">{`${log.quantity} x ${log.dosage}${log.unit}`}</p>
      </div>
    </div>
  );
};

const WeightEntry: React.FC<{ log: WeightReading }> = ({ log }) => {
    return (
      <div className="flex items-center space-x-3">
        <div className="bg-warning bg-opacity-10 dark:bg-opacity-20 rounded-full p-2">
          <WeightScaleIcon className="w-5 h-5 text-warning" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-text-primary dark:text-slate-100 text-sm">Weight Reading</p>
            {log.source === 'voice' && <MicIcon className="w-4 h-4 text-warning" />}
            {log.source === 'manual' && <KeyboardIcon className="w-4 h-4 text-warning" />}
            {log.source === 'photo_analysis' && <CameraIcon className="w-4 h-4 text-warning" />}
          </div>
          <p className="text-xs text-text-secondary dark:text-slate-400">Logged {log.source === 'voice' ? 'by voice' : (log.source === 'photo_analysis' ? 'by photo' : 'manually')}</p>
        </div>
        <div className="flex items-baseline space-x-1">
          <p className="text-xl font-bold text-warning">{log.value}</p>
          <p className="text-xs text-text-secondary dark:text-slate-500">{log.unit}</p>
        </div>
      </div>
    );
};
  
const BloodPressureEntry: React.FC<{ log: BloodPressureReading }> = ({ log }) => {
    const getBPStatus = (systolic: number, diastolic: number) => {
        // High BP: Systolic >= 140 or Diastolic >= 90
        if (systolic >= 140 || diastolic >= 90) {
            return { status: 'HIGH', color: 'bg-danger' };
        }
        // Elevated: Systolic 120-139 or Diastolic 80-89
        if (systolic >= 120 || diastolic >= 80) {
            return { status: 'ELEVATED', color: 'bg-warning' };
        }
        return null;
    };

    const status = getBPStatus(log.systolic, log.diastolic);

    return (
        <div className="flex items-center space-x-3">
        <div className="bg-danger bg-opacity-10 dark:bg-opacity-20 rounded-full p-2">
            <BloodPressureIcon className="w-5 h-5 text-danger" />
        </div>
        <div className="flex-1">
            <div className="flex items-center gap-2">
                <p className="font-semibold text-text-primary dark:text-slate-100 text-sm">Blood Pressure</p>
                {log.source === 'voice' && <MicIcon className="w-4 h-4 text-danger" />}
                {log.source === 'manual' && <KeyboardIcon className="w-4 h-4 text-danger" />}
                {log.source === 'photo_analysis' && <CameraIcon className="w-4 h-4 text-danger" />}
            </div>
            <p className="text-xs text-text-secondary dark:text-slate-400">Pulse: {log.pulse} bpm</p>
        </div>
        <div className="flex items-center space-x-2">
            <div className="text-right">
                <p className="text-xl font-bold text-danger">{log.systolic} / {log.diastolic}</p>
                <p className="text-xs text-text-secondary dark:text-slate-500">mmHg</p>
            </div>
            {status && (
                <span className={`${status.color} text-white text-xs font-semibold px-2 py-0.5 rounded-full`}>
                    {status.status}
                </span>
            )}
        </div>
        </div>
    );
};


const LogEntry: React.FC<LogEntryProps> = ({ log, onEdit, onDelete }) => {
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
    <div className="w-full bg-card dark:bg-slate-800 p-2 sm:p-4 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 flex items-start space-x-2 sm:space-x-3 border-2 border-border dark:border-slate-700 group">
      <div className="text-center w-12 sm:w-16 flex-shrink-0">
        <p className="text-sm sm:text-base font-semibold text-text-primary dark:text-slate-100">{timeString}</p>
        <p className="text-xs text-text-secondary dark:text-slate-400">{ampm}</p>
        <p className="text-xs text-text-secondary dark:text-slate-500 mt-0.5">{dateString}</p>
      </div>
      <div className="border-l-2 border-border dark:border-slate-700 pl-2 sm:pl-3 flex-1 min-w-0">
        {renderContent()}
      </div>

      {/* Edit/Delete Actions */}
      {(onEdit || onDelete) && (
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onEdit && (
            <button
              onClick={() => onEdit(log)}
              className="p-1.5 text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/10 rounded-lg transition-all duration-200"
              aria-label="Edit entry"
              title="Edit"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(log)}
              className="p-1.5 text-text-secondary dark:text-slate-400 hover:text-danger dark:hover:text-danger hover:bg-danger/10 dark:hover:bg-danger/10 rounded-lg transition-all duration-200"
              aria-label="Delete entry"
              title="Delete"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LogEntry;