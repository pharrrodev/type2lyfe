import React, { useState, useEffect } from 'react';
import { WeightReading } from '../types';
import { XIcon, WeightScaleIcon } from './Icons';

interface WeightLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReading: (reading: Omit<WeightReading, 'id'>) => void;
  customTimestamp?: Date; // Optional: for late entries
}

const WeightLogModal: React.FC<WeightLogModalProps> = ({ isOpen, onClose, onAddReading, customTimestamp }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Manual state
  const [manualValue, setManualValue] = useState('');
  const [manualUnit, setManualUnit] = useState<'kg' | 'lbs'>('kg');

  useEffect(() => {
    if (!isOpen) {
      setManualValue('');
      setManualUnit('kg');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const valueNum = parseFloat(manualValue);
      if (isNaN(valueNum) || valueNum <= 0) {
        setError('Please enter a valid weight.');
        setIsLoading(false);
        return;
      }
      onAddReading({ value: valueNum, unit: manualUnit, timestamp: (customTimestamp || new Date()).toISOString(), source: 'manual' });
      onClose();
    } catch (error) {
      setError('Failed to save weight reading. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-card dark:bg-slate-800 rounded-3xl shadow-modal w-full max-w-md p-6 relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-all duration-300"><XIcon className="w-6 h-6" /></button>
        <div className="flex items-center space-x-3 mb-5">
          <WeightScaleIcon className="w-7 h-7 text-warning dark:text-warning" />
          <h2 className="text-2xl font-bold text-text-primary dark:text-slate-100">Log Weight</h2>
        </div>

        <form onSubmit={handleManualSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="weight-value" className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">Weight</label>
              <input type="number" id="weight-value" value={manualValue} onChange={e => setManualValue(e.target.value)} step="0.1" required className="block w-full bg-card dark:bg-slate-700 text-text-primary dark:text-slate-100 rounded-lg border-2 border-border dark:border-slate-600 shadow-sm focus:border-primary dark:focus:border-primary focus:bg-card dark:focus:bg-slate-700 focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 p-3" />
            </div>
            <div>
              <label htmlFor="weight-unit" className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">Unit</label>
              <select id="weight-unit" value={manualUnit} onChange={e => setManualUnit(e.target.value as 'kg' | 'lbs')} className="block w-full bg-card dark:bg-slate-700 text-text-primary dark:text-slate-100 rounded-lg border-2 border-border dark:border-slate-600 shadow-sm focus:border-primary dark:focus:border-primary focus:bg-card dark:focus:bg-slate-700 focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 px-3 py-3">
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
          </div>
          {error && <p className="text-danger dark:text-danger text-sm text-center font-medium">{error}</p>}
          <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-lg hover:shadow-fab transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Saving...' : 'Save Log'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WeightLogModal;