import React, { useState, useEffect } from 'react';
import { Medication, UserMedication } from '../types';
import { XIcon, PillIcon } from './Icons';

interface MedicationLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMedication: (medication: Omit<Medication, 'id'>) => void;
  userMedications: UserMedication[];
  customTimestamp?: Date; // Optional: for late entries
}

const MedicationLogModal: React.FC<MedicationLogModalProps> = ({ isOpen, onClose, onAddMedication, userMedications, customTimestamp }) => {
  // Manual mode only - voice removed because medication names are too long to say accurately
  const [selectedMedId, setSelectedMedId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userMedications.length > 0 && !selectedMedId) {
        setSelectedMedId(userMedications[0].id.toString());
    }
  }, [userMedications, selectedMedId]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      if (userMedications.length > 0) {
          setSelectedMedId(userMedications[0].id.toString());
      }
      setQuantity(1);
      setError('');
    }
  }, [isOpen, userMedications]);

  const handleManualSubmit = async () => {
    const selectedMed = userMedications.find(m => m.id === selectedMedId || m.id.toString() === selectedMedId);

    if (!selectedMed) {
        setError('Please select a medication.');
        return;
    }

    if (quantity <= 0) {
        setError('Quantity must be at least 1.');
        return;
    }

    onAddMedication({
        name: selectedMed.name,
        dosage: selectedMed.dosage,
        unit: selectedMed.unit,
        quantity,
        timestamp: (customTimestamp || new Date()).toISOString(),
        source: 'manual',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-card dark:bg-slate-800 rounded-3xl shadow-modal w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border dark:border-slate-700">
          <div className="flex items-center gap-2">
            <PillIcon className="w-7 h-7 text-accent-purple dark:text-accent-purple" />
            <h2 className="text-2xl font-bold text-text-primary dark:text-slate-100">
              {customTimestamp ? 'Log Past Medication' : 'Log Medication'}
            </h2>
          </div>
          <button onClick={onClose} className="text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-all duration-300">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {customTimestamp && (
            <div className="mb-4 p-3 bg-primary bg-opacity-5 rounded-lg border border-primary border-opacity-20">
              <p className="text-sm text-text-secondary">Recording for:</p>
              <p className="text-base font-medium text-text-primary">
                {customTimestamp.toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}

          {userMedications.length === 0 ? (
            <div className="text-center py-8">
              <PillIcon className="w-16 h-16 mx-auto text-text-light dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-text-primary dark:text-slate-100 mb-2">No Medications Set Up</h3>
              <p className="text-text-secondary dark:text-slate-400 mb-6 text-sm">
                You need to add your medications first before you can log them.
              </p>
              <a
                href="/settings"
                onClick={onClose}
                className="inline-block bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 px-6 rounded-lg hover:shadow-fab transition-all duration-300"
              >
                Go to Settings → My Medications
              </a>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleManualSubmit(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">
                  Medication
                </label>
                <select
                  value={selectedMedId}
                  onChange={(e) => setSelectedMedId(e.target.value)}
                  className="w-full bg-card dark:bg-slate-700 text-text-primary dark:text-slate-100 rounded-lg border-2 border-border dark:border-slate-600 focus:border-primary dark:focus:border-primary focus:bg-card dark:focus:bg-slate-700 focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 px-3 py-3"
                >
                  {userMedications.map((med) => (
                    <option key={med.id} value={med.id}>
                      {med.name} {med.dosage && `- ${med.dosage}${med.unit || ''}`}
                    </option>
                  ))}
                </select>
              </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || value === '0') {
                    setQuantity(1);
                  } else {
                    const numValue = parseInt(value, 10);
                    if (!isNaN(numValue) && numValue >= 1) {
                      setQuantity(numValue);
                    }
                  }
                }}
                onFocus={(e) => e.target.select()}
                className="w-full bg-card dark:bg-slate-700 text-text-primary dark:text-slate-100 rounded-lg border-2 border-border dark:border-slate-600 focus:border-primary dark:focus:border-primary focus:bg-card dark:focus:bg-slate-700 focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 px-3 py-3"
              />
            </div>

            {error && (
              <p className="text-danger dark:text-danger text-sm text-center font-medium">{error}</p>
            )}

              <button
                type="submit"
                className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-lg hover:shadow-fab transition-all duration-300"
              >
                Save Medication
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicationLogModal;

