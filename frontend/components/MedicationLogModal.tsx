import React, { useState, useEffect } from 'react';
import { Medication, UserMedication } from '../types';
import { XIcon, PillIcon } from './Icons';

interface MedicationLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMedication: (medication: Omit<Medication, 'id'>) => void;
  userMedications: UserMedication[];
}

const MedicationLogModal: React.FC<MedicationLogModalProps> = ({ isOpen, onClose, onAddMedication, userMedications }) => {
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
        timestamp: new Date().toISOString(),
        source: 'manual',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-modal shadow-modal w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <PillIcon className="w-7 h-7 text-accent-purple" />
            <h2 className="text-2xl font-bold text-text-primary">Log Medication</h2>
          </div>
          <button onClick={onClose} className="text-text-light hover:text-primary transition-all duration-300">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={(e) => { e.preventDefault(); handleManualSubmit(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Medication
              </label>
              <select
                value={selectedMedId}
                onChange={(e) => setSelectedMedId(e.target.value)}
                className="w-full bg-white text-text-primary rounded-button border-2 border-primary/20 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 px-3 py-3"
              >
                {userMedications.map((med) => (
                  <option key={med.id} value={med.id}>
                    {med.name} {med.dosage && `- ${med.dosage}${med.unit || ''}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
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
                className="w-full bg-white text-text-primary rounded-button border-2 border-primary/20 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 px-3 py-3"
              />
            </div>

            {error && (
              <p className="text-accent-pink text-sm text-center font-medium">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-button hover:shadow-fab transition-all duration-300"
            >
              Save Medication
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MedicationLogModal;

