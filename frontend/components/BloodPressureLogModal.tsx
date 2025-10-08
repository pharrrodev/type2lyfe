import React, { useState, useEffect } from 'react';
import { BloodPressureReading } from '../types';
import { XIcon, BloodPressureIcon } from './Icons';

interface BloodPressureLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReading: (reading: Omit<BloodPressureReading, 'id'>) => void;
  customTimestamp?: Date; // Optional: for late entries
}

const BloodPressureLogModal: React.FC<BloodPressureLogModalProps> = ({ isOpen, onClose, onAddReading, customTimestamp }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Manual state
  const [manualSystolic, setManualSystolic] = useState('');
  const [manualDiastolic, setManualDiastolic] = useState('');
  const [manualPulse, setManualPulse] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setManualSystolic('');
      setManualDiastolic('');
      setManualPulse('');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const systolic = parseInt(manualSystolic, 10);
      const diastolic = parseInt(manualDiastolic, 10);
      const pulse = manualPulse ? parseInt(manualPulse, 10) : undefined;

      if (isNaN(systolic) || systolic < 70 || systolic > 200) {
        setError('Systolic must be between 70 and 200.');
        setIsLoading(false);
        return;
      }
      if (isNaN(diastolic) || diastolic < 40 || diastolic > 130) {
        setError('Diastolic must be between 40 and 130.');
        setIsLoading(false);
        return;
      }
      if (pulse !== undefined && (isNaN(pulse) || pulse < 40 || pulse > 200)) {
        setError('Pulse must be between 40 and 200.');
        setIsLoading(false);
        return;
      }

      onAddReading({ systolic, diastolic, pulse, timestamp: (customTimestamp || new Date()).toISOString(), source: 'manual' });
      onClose();
    } catch (error) {
      setError('Failed to save blood pressure reading. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-card dark:bg-slate-800 rounded-3xl shadow-modal w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border dark:border-slate-700">
          <div className="flex items-center gap-2">
            <BloodPressureIcon className="w-7 h-7 text-danger dark:text-danger" />
            <h2 className="text-2xl font-bold text-text-primary dark:text-slate-100">Log Blood Pressure</h2>
          </div>
          <button onClick={onClose} className="text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-all duration-300">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">Systolic</label>
                <input
                  type="number"
                  value={manualSystolic}
                  onChange={(e) => setManualSystolic(e.target.value)}
                  placeholder="120"
                  className="w-full bg-card dark:bg-slate-700 text-text-primary dark:text-slate-100 placeholder:text-text-secondary dark:placeholder:text-slate-500 rounded-lg border-2 border-border dark:border-slate-600 focus:border-primary dark:focus:border-primary focus:bg-card dark:focus:bg-slate-700 focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 px-3 py-3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">Diastolic</label>
                <input
                  type="number"
                  value={manualDiastolic}
                  onChange={(e) => setManualDiastolic(e.target.value)}
                  placeholder="80"
                  className="w-full bg-card dark:bg-slate-700 text-text-primary dark:text-slate-100 placeholder:text-text-secondary dark:placeholder:text-slate-500 rounded-lg border-2 border-border dark:border-slate-600 focus:border-primary dark:focus:border-primary focus:bg-card dark:focus:bg-slate-700 focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 px-3 py-3"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">Pulse (optional)</label>
              <input
                type="number"
                value={manualPulse}
                onChange={(e) => setManualPulse(e.target.value)}
                placeholder="72"
                className="w-full bg-card dark:bg-slate-700 text-text-primary dark:text-slate-100 placeholder:text-text-secondary dark:placeholder:text-slate-500 rounded-lg border-2 border-border dark:border-slate-600 focus:border-primary dark:focus:border-primary focus:bg-card dark:focus:bg-slate-700 focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 px-3 py-3"
              />
            </div>
            {error && <p className="text-danger dark:text-danger text-sm text-center font-medium">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-lg hover:shadow-fab transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Saving...' : 'Save Reading'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BloodPressureLogModal;

