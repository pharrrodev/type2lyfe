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
      color: 'text-info dark:text-primary',
      bgColor: 'bg-info/10 dark:bg-primary/10',
      borderColor: 'border-info/30 dark:border-primary/30',
      hoverBg: 'hover:bg-info/20 dark:hover:bg-primary/20',
    },
    {
      type: 'meal' as LogType,
      icon: ForkSpoonIcon,
      label: 'Meal',
      color: 'text-success dark:text-primary',
      bgColor: 'bg-success/10 dark:bg-primary/10',
      borderColor: 'border-success/30 dark:border-primary/30',
      hoverBg: 'hover:bg-success/20 dark:hover:bg-primary/20',
    },
    {
      type: 'medication' as LogType,
      icon: PillIcon,
      label: 'Medication',
      color: 'text-accent-purple dark:text-primary',
      bgColor: 'bg-accent-purple/10 dark:bg-primary/10',
      borderColor: 'border-accent-purple/30 dark:border-primary/30',
      hoverBg: 'hover:bg-accent-purple/20 dark:hover:bg-primary/20',
    },
    {
      type: 'weight' as LogType,
      icon: WeightScaleIcon,
      label: 'Weight',
      color: 'text-warning dark:text-primary',
      bgColor: 'bg-warning/10 dark:bg-primary/10',
      borderColor: 'border-warning/30 dark:border-primary/30',
      hoverBg: 'hover:bg-warning/20 dark:hover:bg-primary/20',
    },
    {
      type: 'blood_pressure' as LogType,
      icon: BloodPressureIcon,
      label: 'Blood Pressure',
      color: 'text-danger dark:text-primary',
      bgColor: 'bg-danger/10 dark:bg-primary/10',
      borderColor: 'border-danger/30 dark:border-primary/30',
      hoverBg: 'hover:bg-danger/20 dark:hover:bg-primary/20',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-card dark:bg-slate-800 rounded-3xl shadow-modal w-full max-w-md p-6 relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-all duration-300"
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
              className={`w-full flex items-center p-4 ${bgColor} border ${borderColor} rounded-2xl ${hoverBg} transition-all duration-300 group`}
            >
              <div className={`${bgColor} rounded-full p-3 mr-4`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <span className="text-lg font-semibold text-text-primary dark:text-slate-100 group-hover:text-primary dark:group-hover:text-primary transition-colors">
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

