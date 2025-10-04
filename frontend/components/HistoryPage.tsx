import React, { useState } from 'react';
import { GlucoseReading, Meal, Medication, UserMedication, WeightReading, BloodPressureReading } from '../types';
import DateTimePickerModal from './DateTimePickerModal';
import LogTypeSelector, { LogType } from './LogTypeSelector';
import GlucoseLogModal from './GlucoseLogModal';
import MealLogModal from './MealLogModal';
import MedicationLogModal from './MedicationLogModal';
import WeightLogModal from './WeightLogModal';
import BloodPressureLogModal from './BloodPressureLogModal';
import { PlusIcon } from './Icons';

interface HistoryPageProps {
    onAddGlucose: (reading: Omit<GlucoseReading, 'id'>) => void;
    onAddMeal: (meal: Omit<Meal, 'id'>) => void;
    onAddMedication: (medication: Omit<Medication, 'id'>) => void;
    onAddWeight: (reading: Omit<WeightReading, 'id'>) => void;
    onAddBloodPressure: (reading: Omit<BloodPressureReading, 'id'>) => void;
    userMedications: UserMedication[];
    unit: 'mg/dL' | 'mmol/L';
}

const HistoryPage: React.FC<HistoryPageProps> = ({
    onAddGlucose,
    onAddMeal,
    onAddMedication,
    onAddWeight,
    onAddBloodPressure,
    userMedications,
    unit
}) => {
    const [isDateTimeModalOpen, setIsDateTimeModalOpen] = useState(false);
    const [isLogTypeSelectorOpen, setIsLogTypeSelectorOpen] = useState(false);
    const [selectedTimestamp, setSelectedTimestamp] = useState<Date | undefined>(undefined);
    const [selectedLogType, setSelectedLogType] = useState<LogType | null>(null);

    const handleDateTimeSelected = (timestamp: Date) => {
        setSelectedTimestamp(timestamp);
        setIsDateTimeModalOpen(false);
        setIsLogTypeSelectorOpen(true);
    };

    const handleLogTypeSelected = (type: LogType) => {
        setSelectedLogType(type);
        setIsLogTypeSelectorOpen(false);
    };

    const handleModalClose = () => {
        setSelectedLogType(null);
        setSelectedTimestamp(undefined);
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-6">
            <div className="text-center max-w-md">
                <h2 className="text-2xl font-bold text-text-primary dark:text-slate-100 mb-4">
                    Add Late Entry
                </h2>
                <p className="text-text-secondary dark:text-slate-400 mb-8">
                    Log health data for a past date and time. Perfect for catching up on missed entries.
                </p>
                <button
                    onClick={() => setIsDateTimeModalOpen(true)}
                    className="bg-gradient-to-br from-primary to-primary-dark dark:from-primary dark:to-primary text-white font-semibold py-4 px-8 rounded-lg hover:shadow-fab transition-all duration-300 flex items-center justify-center mx-auto"
                >
                    <PlusIcon className="w-6 h-6 mr-2" />
                    Add Late Entry
                </button>
            </div>

            {/* Step 1: Date/Time Picker */}
            <DateTimePickerModal
                isOpen={isDateTimeModalOpen}
                onClose={() => setIsDateTimeModalOpen(false)}
                onContinue={handleDateTimeSelected}
            />

            {/* Step 2: Log Type Selector */}
            <LogTypeSelector
                isOpen={isLogTypeSelectorOpen}
                onClose={() => {
                    setIsLogTypeSelectorOpen(false);
                    setSelectedTimestamp(undefined);
                }}
                onSelect={handleLogTypeSelected}
            />

            {/* Step 3: Specific Modals */}
            {selectedLogType === 'glucose' && (
                <GlucoseLogModal
                    isOpen={true}
                    onClose={handleModalClose}
                    onAddReading={onAddGlucose}
                    unit={unit}
                    customTimestamp={selectedTimestamp}
                />
            )}

            {selectedLogType === 'meal' && (
                <MealLogModal
                    isOpen={true}
                    onClose={handleModalClose}
                    onAddMeal={onAddMeal}
                    onAddReading={onAddGlucose}
                    unit={unit}
                    customTimestamp={selectedTimestamp}
                />
            )}

            {selectedLogType === 'medication' && (
                <MedicationLogModal
                    isOpen={true}
                    onClose={handleModalClose}
                    onAddMedication={onAddMedication}
                    userMedications={userMedications}
                    customTimestamp={selectedTimestamp}
                />
            )}

            {selectedLogType === 'weight' && (
                <WeightLogModal
                    isOpen={true}
                    onClose={handleModalClose}
                    onAddReading={onAddWeight}
                    customTimestamp={selectedTimestamp}
                />
            )}

            {selectedLogType === 'blood_pressure' && (
                <BloodPressureLogModal
                    isOpen={true}
                    onClose={handleModalClose}
                    onAddReading={onAddBloodPressure}
                    customTimestamp={selectedTimestamp}
                />
            )}
        </div>
    );
};

export default HistoryPage;