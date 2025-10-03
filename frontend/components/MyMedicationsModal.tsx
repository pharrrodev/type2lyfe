import React, { useState, useEffect, useRef } from 'react';
import { UserMedication } from '../types';
import { XIcon, PillIcon, TrashIcon, PencilIcon } from './Icons';
import { ukMedications, MedicationInfo } from '../data/medications';

interface MyMedicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userMedications: UserMedication[];
  onSave: (med: Omit<UserMedication, 'id'> & { id?: string }) => void;
  onDelete: (id: string) => void;
}

const MedForm: React.FC<{
    // FIX: Changed type to allow partial object for new medications.
    medication: Partial<UserMedication> | null;
    onSave: (med: Omit<UserMedication, 'id'> & { id?: string }) => void;
    onCancel: () => void;
}> = ({ medication, onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [unit, setUnit] = useState('mg');
    const [error, setError] = useState('');
    const [suggestions, setSuggestions] = useState<MedicationInfo[]>([]);
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
    const autocompleteRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (medication) {
            setName(medication.name || '');
            setDosage(medication.dosage?.toString() || '');
            setUnit(medication.unit || 'mg');
        } else {
            setName('');
            setDosage('');
            setUnit('mg');
        }
        setError('');
    }, [medication]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
                setIsSuggestionsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setName(value);

        if (value.length > 1) {
            const filtered = ukMedications.filter(med => 
                med.name.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered);
            setIsSuggestionsOpen(true);
        } else {
            setSuggestions([]);
            setIsSuggestionsOpen(false);
        }
    };

    const handleSuggestionClick = (med: MedicationInfo) => {
        setName(med.name);
        setDosage(med.defaultDosage.toString());
        setUnit(med.defaultUnit);
        setSuggestions([]);
        setIsSuggestionsOpen(false);
    };

    const handleSubmit = () => {
        const dosageNum = parseFloat(dosage);
        if (!name.trim() || !dosage.trim() || isNaN(dosageNum) || dosageNum <= 0) {
            setError('Please enter a valid name and dosage.');
            return;
        }
        onSave({ id: medication?.id, name, dosage: dosageNum, unit });
    };

    return (
        <div className="bg-primary/5 p-5 rounded-card mt-4 space-y-3 border-2 border-primary/30">
            <h3 className="font-semibold text-text-primary">{medication?.id ? 'Edit Medication' : 'Add New Medication'}</h3>
             <div className="relative" ref={autocompleteRef}>
                <label htmlFor="med-form-name" className="block text-sm font-semibold text-text-primary mb-2">Name</label>
                <input
                    type="text"
                    id="med-form-name"
                    value={name}
                    onChange={handleNameChange}
                    onFocus={handleNameChange}
                    autoComplete="off"
                    placeholder="Start typing medication name..."
                    className="block w-full bg-white text-text-primary placeholder:text-text-light rounded-button border-2 border-primary/20 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 p-3"
                />
                 {isSuggestionsOpen && suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border-2 border-primary/30 rounded-button mt-1 max-h-40 overflow-y-auto shadow-card">
                        {suggestions.map((med, index) => (
                            <li
                                key={index}
                                onClick={() => handleSuggestionClick(med)}
                                className="px-3 py-2 cursor-pointer hover:bg-primary/5 transition-all duration-300"
                            >
                                {med.name}
                            </li>
                        ))}
                    </ul>
                )}
             </div>
             <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label htmlFor="med-form-dosage" className="block text-sm font-semibold text-text-primary mb-2">Dosage</label>
                    <input type="number" id="med-form-dosage" value={dosage} onChange={e => setDosage(e.target.value)} placeholder="e.g., 500" className="block w-full bg-white text-text-primary placeholder:text-text-light rounded-button border-2 border-primary/20 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 p-3" />
                 </div>
                 <div>
                    <label htmlFor="med-form-unit" className="block text-sm font-semibold text-text-primary mb-2">Unit</label>
                    <input type="text" id="med-form-unit" value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g., mg" className="block w-full bg-white text-text-primary placeholder:text-text-light rounded-button border-2 border-primary/20 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 p-3" />
                 </div>
             </div>
             {error && <p className="text-accent-pink text-sm font-medium">{error}</p>}
             <div className="flex justify-end space-x-2">
                <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-text-primary bg-white border-2 border-primary/20 rounded-button hover:bg-primary/5 hover:border-primary transition-all duration-300 shadow-card">Cancel</button>
                <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-primary to-primary-dark rounded-button hover:shadow-fab transition-all duration-300">Save</button>
             </div>
        </div>
    );
};


const MyMedicationsModal: React.FC<MyMedicationsModalProps> = ({ isOpen, onClose, userMedications, onSave, onDelete }) => {
    // FIX: Changed type to allow partial object for new medications.
    const [editingMed, setEditingMed] = useState<Partial<UserMedication> | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setEditingMed(null);
        }
    }, [isOpen]);

    const handleSave = (med: Omit<UserMedication, 'id'> & { id?: string }) => {
        onSave(med);
        setEditingMed(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-modal shadow-modal w-full max-w-lg p-6 relative animate-fade-in-up max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-text-light hover:text-primary transition-all duration-300">
                    <XIcon className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-3 mb-5">
                    <PillIcon className="w-7 h-7 text-accent-purple" />
                    <h2 className="text-2xl font-bold text-text-primary">My Medications</h2>
                </div>
                <p className="text-sm text-text-secondary mb-4">Manage your list of medications here. This will make voice logging faster and more accurate.</p>

                <div className="space-y-3">
                    {userMedications.length > 0 ? (
                        userMedications.map(med => (
                            <div key={med.id} className="flex justify-between items-center p-4 bg-white border-2 border-primary/10 rounded-card shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-300">
                                <div>
                                    <p className="font-semibold text-text-primary">{med.name}</p>
                                    <p className="text-sm text-text-secondary">{med.dosage}{med.unit}</p>
                                </div>
                                <div className="space-x-2">
                                    <button onClick={() => setEditingMed(med)} className="p-2 text-text-light hover:text-primary transition-all duration-300"><PencilIcon className="w-5 h-5"/></button>
                                    <button onClick={() => onDelete(med.id)} className="p-2 text-text-light hover:text-accent-pink transition-all duration-300"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        ))
                    ) : (
                        !editingMed && <p className="text-center text-text-secondary py-4">No medications added yet.</p>
                    )}
                </div>

                {editingMed ? (
                    <MedForm medication={editingMed} onSave={handleSave} onCancel={() => setEditingMed(null)} />
                ) : (
                    <div className="mt-4">
                        <button onClick={() => setEditingMed({})} className="w-full text-center py-3 bg-primary/5 text-primary font-semibold rounded-button hover:bg-primary hover:text-white transition-all duration-300 shadow-card border-2 border-primary/20 hover:border-primary">
                            + Add New Medication
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyMedicationsModal;
