import React from 'react';
import { XIcon, DropletIcon, ForkSpoonIcon, PillIcon, WeightScaleIcon, BloodPressureIcon } from './Icons';

export type LogType = 'glucose' | 'meal' | 'medication' | 'weight' | 'blood_pressure';

interface LogTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: LogType) => void;
  title?: string;
}

const LogTypeSelector: React.FC<LogTypeSelectorProps> = ({ 
  isOpen, 
  onClose, 
  onSelect,
  title = "What do you want to log?"
}) => {
  if (!isOpen) return null;

  const logTypes = [
    {
      type: 'glucose' as LogType,
      icon: DropletIcon,
      label: 'Glucose Reading',
      color: 'text-accent-blue dark:text-primary-light',
      bgColor: 'bg-accent-blue/10 dark:bg-primary-light/10',
      borderColor: 'border-accent-blue/30 dark:border-primary-light/30',
      hoverBg: 'hover:bg-accent-blue/20 dark:hover:bg-primary-light/20',
    },
    {
      type: 'meal' as LogType,
      icon: ForkSpoonIcon,
      label: 'Meal',
      color: 'text-accent-green dark:text-primary-light',
      bgColor: 'bg-accent-green/10 dark:bg-primary-light/10',
      borderColor: 'border-accent-green/30 dark:border-primary-light/30',
      hoverBg: 'hover:bg-accent-green/20 dark:hover:bg-primary-light/20',
    },
    {
      type: 'medication' as LogType,
      icon: PillIcon,
      label: 'Medication',
      color: 'text-accent-purple dark:text-primary-light',
      bgColor: 'bg-accent-purple/10 dark:bg-primary-light/10',
      borderColor: 'border-accent-purple/30 dark:border-primary-light/30',
      hoverBg: 'hover:bg-accent-purple/20 dark:hover:bg-primary-light/20',
    },
    {
      type: 'weight' as LogType,
      icon: WeightScaleIcon,
      label: 'Weight',
      color: 'text-accent-orange dark:text-primary-light',
      bgColor: 'bg-accent-orange/10 dark:bg-primary-light/10',
      borderColor: 'border-accent-orange/30 dark:border-primary-light/30',
      hoverBg: 'hover:bg-accent-orange/20 dark:hover:bg-primary-light/20',
    },
    {
      type: 'blood_pressure' as LogType,
      icon: BloodPressureIcon,
      label: 'Blood Pressure',
      color: 'text-accent-red dark:text-primary-light',
      bgColor: 'bg-accent-red/10 dark:bg-primary-light/10',
      borderColor: 'border-accent-red/30 dark:border-primary-light/30',
      hoverBg: 'hover:bg-accent-red/20 dark:hover:bg-primary-light/20',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-modal shadow-modal w-full max-w-md p-6 relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-light dark:text-slate-400 hover:text-primary dark:hover:text-primary-light transition-all duration-300"
        >
          <XIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-text-primary dark:text-slate-100 mb-6">
          {title}
        </h2>

        <div className="space-y-3">
          {logTypes.map(({ type, icon: Icon, label, color, bgColor, borderColor, hoverBg }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={`w-full flex items-center p-4 ${bgColor} border ${borderColor} rounded-card ${hoverBg} transition-all duration-300 group`}
            >
              <div className={`${bgColor} rounded-full p-3 mr-4`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <span className="text-lg font-semibold text-text-primary dark:text-slate-100 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogTypeSelector;

