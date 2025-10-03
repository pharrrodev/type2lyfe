import React from 'react';
import { DropletIcon, WeightScaleIcon, BloodPressureIcon, ForkSpoonIcon, PillIcon, XIcon } from './Icons';

interface ActionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onLogGlucose: () => void;
  onLogWeight: () => void;
  onLogBloodPressure: () => void;
  onLogMeal: () => void;
  onLogMedication: () => void;
}

const ActionBottomSheet: React.FC<ActionBottomSheetProps> = ({
  isOpen,
  onClose,
  onLogGlucose,
  onLogWeight,
  onLogBloodPressure,
  onLogMeal,
  onLogMedication,
}) => {
  const handleAction = (action: () => void) => {
    console.log('🔍 ActionBottomSheet: handleAction called');
    action();
    console.log('🔍 ActionBottomSheet: action executed');
    // Note: onClose() is now handled by the action itself
  };

  return (
    <div 
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-modal="true" 
        role="dialog"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      {/* Sheet */}
      <div className={`bg-white dark:bg-slate-800 rounded-t-modal shadow-modal w-full max-w-lg p-6 pt-4 transition-transform duration-300 ease-in-out transform absolute bottom-0 left-1/2 -translate-x-1/2 border-t border-border-light dark:border-slate-700 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-text-primary dark:text-slate-100">What would you like to log?</h3>
          <button onClick={onClose} className="p-2 text-text-secondary dark:text-slate-400 hover:bg-bg-light dark:hover:bg-slate-700 rounded-full transition-all duration-300">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <ActionButton
            icon={<DropletIcon className="w-8 h-8 text-accent-blue" />}
            label="Glucose"
            onClick={() => handleAction(onLogGlucose)}
          />
          <ActionButton
            icon={<WeightScaleIcon className="w-8 h-8 text-accent-orange" />}
            label="Weight"
            onClick={() => handleAction(onLogWeight)}
          />
          <ActionButton
            icon={<BloodPressureIcon className="w-8 h-8 text-accent-pink" />}
            label="Blood Pressure"
            onClick={() => handleAction(onLogBloodPressure)}
          />
          <ActionButton
            icon={<ForkSpoonIcon className="w-8 h-8 text-primary" />}
            label="Meal"
            onClick={() => handleAction(onLogMeal)}
          />
          <ActionButton
            icon={<PillIcon className="w-8 h-8 text-accent-purple" />}
            label="Medication"
            onClick={() => handleAction(onLogMedication)}
          />
        </div>
      </div>
    </div>
  );
};

const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 bg-bg-light dark:bg-slate-700 border border-border-light dark:border-slate-600 rounded-card hover:shadow-card hover:bg-white dark:hover:bg-slate-600 hover:border-primary/40 dark:hover:border-primary-light/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
  >
    {icon}
    <span className="mt-2 text-xs font-medium text-text-primary dark:text-slate-100 text-center">{label}</span>
  </button>
);

export default ActionBottomSheet;
