import React, { useState, useEffect } from 'react';
import { GlucoseReading } from '../types';
import { XIcon, DropletIcon } from './Icons';

interface GlucoseLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReading: (reading: Omit<GlucoseReading, 'id'>) => void;
  unit: 'mg/dL' | 'mmol/L';
  customTimestamp?: Date; // Optional: for late entries
  editingLog?: GlucoseReading | null; // Optional: for editing existing entries
}

const GlucoseLogModal: React.FC<GlucoseLogModalProps> = ({ isOpen, onClose, onAddReading, unit, customTimestamp }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Manual state
  const [manualValue, setManualValue] = useState('');
  const [manualContext, setManualContext] = useState<GlucoseReading['context']>('random');


  useEffect(() => {
    if (!isOpen) {
      setManualValue('');
      setManualContext('random');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const valueNum = parseFloat(manualValue);
      if (isNaN(valueNum) || manualValue.trim() === '') {
          setError('Please enter a valid number for the glucose value.');
          setIsLoading(false);
          return;
      }

      const isValid = unit === 'mmol/L'
        ? valueNum >= 1 && valueNum <= 33
        : valueNum >= 20 && valueNum <= 600;

      if (!isValid) {
          setError(`Invalid value. Must be between ${unit === 'mmol/L' ? '1 and 33' : '20 and 600'}.`);
          setIsLoading(false);
          return;
      }

      console.log('🔍 GlucoseModal: Submitting manual reading...');
      await onAddReading({
          value: valueNum,
          displayUnit: unit,
          context: manualContext,
          timestamp: (customTimestamp || new Date()).toISOString(),
          source: 'manual',
      });
      console.log('🔍 GlucoseModal: Reading submitted successfully, closing modal');
      onClose();
    } catch (error) {
      console.error('🔍 GlucoseModal: Error submitting reading:', error);
      setError('Failed to save glucose reading. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-card dark:bg-slate-800 rounded-3xl shadow-modal w-full max-w-md p-6 relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-all duration-300">
          <XIcon className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-3 mb-5">
            <DropletIcon className="w-7 h-7 text-info dark:text-info" />
            <h2 className="text-2xl font-bold text-text-primary dark:text-slate-100">Log Glucose</h2>
        </div>

        <form onSubmit={handleManualSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="glucose-value" className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">Value ({unit})</label>
                    <input
                        type="number"
                        id="glucose-value"
                        value={manualValue}
                        onChange={e => setManualValue(e.target.value)}
                        step={unit === 'mmol/L' ? '0.1' : '1'}
                        required
                        className="block w-full bg-card dark:bg-slate-700 text-text-primary dark:text-slate-100 placeholder:text-text-secondary dark:placeholder:text-slate-500 rounded-lg border-2 border-border dark:border-slate-600 shadow-sm focus:border-primary dark:focus:border-primary focus:bg-card dark:focus:bg-slate-700 focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 p-3"
                    />
                </div>
                <div>
                    <label htmlFor="glucose-context" className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">Context</label>
                    <select
                        id="glucose-context"
                        value={manualContext}
                        onChange={e => setManualContext(e.target.value as GlucoseReading['context'])}
                        className="block w-full bg-card dark:bg-slate-700 text-text-primary dark:text-slate-100 border-2 border-border dark:border-slate-600 rounded-lg focus:outline-none focus:border-primary dark:focus:border-primary focus:bg-card dark:focus:bg-slate-700 focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 px-3 py-3"
                    >
                        <option value="random">Random</option>
                        <option value="fasting">Fasting</option>
                        <option value="before_meal">Before Meal</option>
                        <option value="after_meal">After Meal</option>
                        <option value="bedtime">Bedtime</option>
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

export default GlucoseLogModal;