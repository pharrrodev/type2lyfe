import React, { useState, useEffect, useRef } from 'react';
import { GlucoseReading, Meal, Medication, UserMedication, FoodItem, WeightReading, BloodPressureReading } from '../types';
import {
    analyzeMealFromImage,
    analyzeMealFromText
} from '../src/services/api';
import { CalendarClockIcon, DropletIcon, ForkSpoonIcon, PillIcon, PencilIcon, CameraIcon, UploadIcon, WeightScaleIcon, BloodPressureIcon } from './Icons';
import Spinner from './Spinner';
import NutritionDisplay from './NutritionDisplay';


interface LateEntryFormProps {
    onAddGlucose: (reading: Omit<GlucoseReading, 'id'>) => void;
    onAddMeal: (meal: Omit<Meal, 'id'>) => void;
    onAddMedication: (medication: Omit<Medication, 'id'>) => void;
    onAddWeight: (reading: Omit<WeightReading, 'id'>) => void;
    onAddBloodPressure: (reading: Omit<BloodPressureReading, 'id'>) => void;
    userMedications: UserMedication[];
    unit: 'mg/dL' | 'mmol/L';
}

const formatToLocalDateTimeString = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

type LogType = 'glucose' | 'meal' | 'medication' | 'weight' | 'blood_pressure';

const LateEntryForm: React.FC<LateEntryFormProps> = ({ onAddGlucose, onAddMeal, onAddMedication, onAddWeight, onAddBloodPressure, userMedications, unit }) => {
    const [activeLogType, setActiveLogType] = useState<LogType>('glucose');
    const [timestamp, setTimestamp] = useState(new Date());
    const [showSuccess, setShowSuccess] = useState<string | null>(null);
    const [isDateTimeConfirmed, setIsDateTimeConfirmed] = useState(false);

    // --- General State ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const mealFileInputRef = useRef<HTMLInputElement>(null);

    // --- Glucose states ---
    const [manualGlucoseValue, setManualGlucoseValue] = useState('');
    const [manualGlucoseContext, setManualGlucoseContext] = useState<GlucoseReading['context']>('random');
    
    // --- Meal states ---
    const [mealLogMode, setMealLogMode] = useState<'manual' | 'photo'>('manual');
    const [mealDescription, setMealDescription] = useState('');
    const [mealCarbs, setMealCarbs] = useState('');
    const [mealImageFile, setMealImageFile] = useState<File | null>(null);
    const [mealPreviewUrl, setMealPreviewUrl] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<{ items: FoodItem[], total: { calories: number; protein: number; carbs: number; fat: number; sugar: number } } | null>(null);
    
    // --- Medication states ---
    const [selectedMedId, setSelectedMedId] = useState<string>('');
    const [medQuantity, setMedQuantity] = useState(1);

    // Initialize selectedMedId when userMedications are available
    useEffect(() => {
        if (userMedications.length > 0 && !selectedMedId) {
            console.log('🔍 LateEntryForm: Setting initial medication:', userMedications[0]);
            setSelectedMedId(userMedications[0].id.toString());
        }
    }, [userMedications, selectedMedId]);

    // --- Weight states ---
    const [manualWeightValue, setManualWeightValue] = useState('');
    const [manualWeightUnit, setManualWeightUnit] = useState<'kg' | 'lbs'>('kg');

    // --- Blood Pressure states ---
    const [manualSystolic, setManualSystolic] = useState('');
    const [manualDiastolic, setManualDiastolic] = useState('');
    const [manualPulse, setManualPulse] = useState('');


    // --- General Functions ---

    useEffect(() => {
        if (userMedications.length > 0 && !selectedMedId) {
            setSelectedMedId(userMedications[0].id);
        }
    }, [userMedications, selectedMedId]);
    
    const handleSuccess = (message: string) => {
        setShowSuccess(message);
        setTimeout(() => setShowSuccess(null), 3000);
    };

    // --- Glucose Logic ---
    const resetGlucoseState = () => {
        setError('');
        setIsLoading(false);
        setManualGlucoseValue('');
        setManualGlucoseContext('random');
    };

    const handleManualGlucoseSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const value = parseFloat(manualGlucoseValue);
        if (isNaN(value) || manualGlucoseValue.trim() === '') {
            setError('Please enter a valid glucose value.');
            return;
        }
        const isValid = unit === 'mmol/L' ? value >= 1 && value <= 33 : value >= 20 && value <= 600;
        if (!isValid) {
            setError(`Invalid glucose value. Must be between ${unit === 'mmol/L' ? '1 and 33' : '20 and 600'}.`);
            return;
        }
        onAddGlucose({
            value: value,
            displayUnit: unit,
            context: manualGlucoseContext,
            timestamp: timestamp.toISOString(),
            source: 'manual',
        });
        resetGlucoseState();
        handleSuccess('Glucose reading saved!');
    };
    


    // --- Meal Logic ---
    const resetMealState = () => {
        setMealDescription('');
        setMealCarbs('');
        setMealImageFile(null);
        setMealPreviewUrl(null);
        setAnalysisResult(null);
        setIsLoading(false);
        setError('');
    };

    useEffect(() => { resetMealState(); }, [mealLogMode]);
    
    const getMealType = (date: Date): Meal['mealType'] => {
        const hour = date.getHours();
        if (hour >= 5 && hour < 11) return 'breakfast';
        if (hour >= 11 && hour < 16) return 'lunch';
        if (hour >= 16 && hour < 21) return 'dinner';
        return 'snack';
    };

    const handleMealFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setMealImageFile(file);
            setMealPreviewUrl(URL.createObjectURL(file));
            setAnalysisResult(null);
            setError('');
        }
    };

    const handleMealAnalyze = async () => {
        if (mealLogMode === 'photo' && mealImageFile) {
            setIsLoading(true);
            setError('');
            const reader = new FileReader();
            reader.readAsDataURL(mealImageFile);
            reader.onload = async () => {
                try {
                    const base64String = (reader.result as string).split(',')[1];
                    const response = await analyzeMealFromImage(base64String, mealImageFile.type);
                    const result = response.data;
                    if (result) setAnalysisResult(result);
                    else setError("Couldn't analyze the meal photo.");
                } catch (e) {
                    if (e instanceof Error) {
                        setError(e.message);
                    } else {
                        setError('An error occurred during analysis.');
                    }
                } 
                finally { setIsLoading(false); }
            };
            reader.onerror = () => { setError('Failed to read image file.'); setIsLoading(false); };
        }
    };
    
    const handleMealSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let mealData: Omit<Meal, 'id' | 'timestamp' | 'mealType'> | null = null;
        switch(mealLogMode) {
            case 'manual':
                const carbsNum = parseInt(mealCarbs, 10) || 0;
                if (!mealDescription.trim()) return;
                mealData = {
                    foodItems: [{ name: mealDescription, calories: 0, protein: 0, carbs: carbsNum, fat: 0, sugar: 0 }],
                    totalNutrition: { calories: 0, protein: 0, carbs: carbsNum, fat: 0, sugar: 0 },
                    notes: mealDescription,
                    source: 'manual',
                };
                break;
            case 'photo':
                if (!analysisResult) return;
                // Photo is used only for analysis, not stored in database
                mealData = {
                    foodItems: analysisResult.items,
                    totalNutrition: analysisResult.total,
                    source: 'photo_analysis'
                };
                break;
        }
        if (mealData) {
            onAddMeal({ ...mealData, timestamp: timestamp.toISOString(), mealType: getMealType(timestamp) });
            resetMealState();
            handleSuccess('Meal saved!');
        }
    };

    // --- Medication Logic ---
    const resetMedicationState = () => {
        listeningForRef.current = null;
        setMedLogMode('voice');
        setMedVoiceStep('say_medication');
        setMedData({ med: null, quantity: 0, transcript: '' });
        setError('');
        setIsLoading(false);
        setCurrentTranscript('');
        stopListening();
    };

    const handleMedToggleListen = () => {
        if (isListening) {
            stopListening();
        } else {
            setError('');
            setCurrentTranscript('');
            startListening('medication');
        }
    };
    
    const handleVoiceMedSubmit = () => {
        if (medData.med && medData.quantity > 0) {
            onAddMedication({
                name: medData.med.name,
                dosage: medData.med.dosage,
                unit: medData.med.unit,
                quantity: medData.quantity,
                timestamp: timestamp.toISOString(),
                transcript: medData.transcript,
                source: 'voice',
            });
            resetMedicationState();
            handleSuccess('Medication saved!');
        }
    };

    const handleManualMedSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('🔍 LateEntryForm: handleManualMedSubmit called');
        console.log('🔍 selectedMedId:', selectedMedId);
        console.log('🔍 medQuantity:', medQuantity);
        console.log('🔍 userMedications:', userMedications);

        const selectedMed = userMedications.find(m => m.id === selectedMedId || m.id.toString() === selectedMedId);
        console.log('🔍 selectedMed:', selectedMed);
        console.log('🔍 userMedications IDs:', userMedications.map(m => ({ id: m.id, type: typeof m.id })));

        if (selectedMed && medQuantity > 0) {
            console.log('✅ LateEntryForm: Validation passed, submitting medication');
            onAddMedication({
                name: selectedMed.name,
                dosage: selectedMed.dosage,
                unit: selectedMed.unit,
                quantity: medQuantity,
                timestamp: timestamp.toISOString(),
                source: 'manual',
            });
            setMedQuantity(1);
            handleSuccess('Medication saved!');
        } else {
            console.log('❌ LateEntryForm: Validation failed');
            if (!selectedMed) {
                console.log('❌ No medication selected');
                setError("Please select a medication.");
            } else if (medQuantity <= 0) {
                console.log('❌ Invalid quantity');
                setError("Please enter a valid quantity (1 or more).");
            } else {
                setError("Please select a valid medication and quantity.");
            }
        }
    };

    // --- Weight Logic ---
    const resetWeightState = () => {
        setError('');
        setIsLoading(false);
        setManualWeightValue('');
        setManualWeightUnit('kg');
    };

    const handleManualWeightSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const value = parseFloat(manualWeightValue);
        if (isNaN(value) || value <= 0) {
            setError('Please enter a valid weight.');
            return;
        }
        onAddWeight({
            value,
            unit: manualWeightUnit,
            timestamp: timestamp.toISOString(),
            source: 'manual',
        });
        resetWeightState();
        handleSuccess('Weight reading saved!');
    };



    // --- Blood Pressure Logic ---
    const resetBpState = () => {
        setError('');
        setIsLoading(false);
        setManualSystolic('');
        setManualDiastolic('');
        setManualPulse('');
    };

    const handleManualBpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const systolic = parseInt(manualSystolic, 10);
        const diastolic = parseInt(manualDiastolic, 10);
        const pulse = parseInt(manualPulse, 10);
        if (isNaN(systolic) || isNaN(diastolic) || isNaN(pulse) || systolic <= 0 || diastolic <= 0 || pulse <= 0) {
            setError('Please enter valid numbers for all fields.');
            return;
        }
        onAddBloodPressure({
            systolic,
            diastolic,
            pulse,
            timestamp: timestamp.toISOString(),
            source: 'manual',
        });
        resetBpState();
        handleSuccess('Blood pressure reading saved!');
    };




    const renderGlucoseContent = () => {
        return (
            <div>
                {error && !isLoading && <p className="text-accent-pink text-center mt-4 text-sm mb-2 font-medium">{error}</p>}
                <form onSubmit={handleManualGlucoseSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="glucose-value" className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">Value ({unit})</label>
                            <input type="number" id="glucose-value" value={manualGlucoseValue} onChange={e => setManualGlucoseValue(e.target.value)} step={unit === 'mmol/L' ? '0.1' : '1'} required className="block w-full bg-white dark:bg-slate-700 text-text-primary dark:text-slate-100 placeholder:text-text-light dark:placeholder:text-slate-400 rounded-button border-2 border-primary/20 dark:border-slate-600 shadow-sm focus:border-primary dark:focus:border-primary-light focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 p-3" />
                        </div>
                        <div>
                            <label htmlFor="glucose-context" className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">Context</label>
                            <select id="glucose-context" value={manualGlucoseContext} onChange={e => setManualGlucoseContext(e.target.value as GlucoseReading['context'])} className="block w-full bg-white dark:bg-slate-700 text-text-primary dark:text-slate-100 rounded-button border-2 border-primary/20 dark:border-slate-600 focus:border-primary dark:focus:border-primary-light focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 px-3 py-3">
                                <option value="random">Random</option>
                                <option value="fasting">Fasting</option>
                                <option value="before_meal">Before Meal</option>
                                <option value="after_meal">After Meal</option>
                                <option value="bedtime">Bedtime</option>
                            </select>
                        </div>
                    </div>
                    {error && <p className="text-accent-pink text-sm text-center font-medium">{error}</p>}
                    <button type="submit" className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-button hover:shadow-fab transition-all duration-300">Save Glucose</button>
                </form>
            </div>
        );
    };

    const renderMealContent = () => (
        <form onSubmit={handleMealSubmit}>
            <div className="flex justify-center items-center rounded-card bg-primary/5 dark:bg-slate-700 p-1 mb-4 border-2 border-primary/20 dark:border-slate-600">
                <button type="button" onClick={() => setMealLogMode('manual')} className={`px-3 py-1.5 text-sm font-semibold rounded-button flex items-center space-x-2 transition-all duration-300 ${mealLogMode === 'manual' ? 'bg-white dark:bg-slate-600 text-primary dark:text-primary-light shadow-card' : 'text-text-light dark:text-slate-400 hover:bg-white dark:hover:bg-slate-600 hover:bg-opacity-50'}`}><PencilIcon className="w-4 h-4"/><span>Manual</span></button>
                <button type="button" onClick={() => setMealLogMode('photo')} className={`px-3 py-1.5 text-sm font-semibold rounded-button flex items-center space-x-2 transition-all duration-300 ${mealLogMode === 'photo' ? 'bg-white dark:bg-slate-600 text-primary dark:text-primary-light shadow-card' : 'text-text-light dark:text-slate-400 hover:bg-white dark:hover:bg-slate-600 hover:bg-opacity-50'}`}><CameraIcon className="w-4 h-4"/><span>Photo</span></button>
            </div>
            {mealLogMode === 'manual' && (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="meal-description" className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">Description</label>
                        <input type="text" id="meal-description" value={mealDescription} onChange={e => setMealDescription(e.target.value)} placeholder="e.g., Chicken salad sandwich" required className="block w-full bg-white dark:bg-slate-700 text-text-primary dark:text-slate-100 placeholder:text-text-light dark:placeholder:text-slate-400 rounded-button border-2 border-primary/20 dark:border-slate-600 shadow-sm focus:border-primary dark:focus:border-primary-light focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 p-3" />
                    </div>
                    <div>
                        <label htmlFor="meal-carbs" className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">Total Carbs (grams)</label>
                        <input type="number" id="meal-carbs" value={mealCarbs} onChange={e => setMealCarbs(e.target.value)} placeholder="e.g., 45" className="block w-full bg-white dark:bg-slate-700 text-text-primary dark:text-slate-100 placeholder:text-text-light dark:placeholder:text-slate-400 rounded-button border-2 border-primary/20 dark:border-slate-600 shadow-sm focus:border-primary dark:focus:border-primary-light focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 p-3" />
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-button hover:shadow-fab transition-all duration-300">Save Meal</button>
                </div>
            )}
            {mealLogMode === 'photo' && (
                <div className="space-y-4">
                    {!mealPreviewUrl ? (
                        <div className="grid grid-cols-2 gap-4">
                            <button type="button" onClick={() => { mealFileInputRef.current?.setAttribute('capture', 'environment'); mealFileInputRef.current?.click(); }} className="border-2 border-dashed border-primary/30 dark:border-primary/40 rounded-card p-6 text-center text-text-secondary dark:text-slate-400 hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary dark:hover:border-primary-light transition-all duration-300 flex flex-col items-center justify-center"><CameraIcon className="w-8 h-8 text-primary dark:text-primary-light mb-2" /><span>Take Picture</span></button>
                            <button type="button" onClick={() => { mealFileInputRef.current?.removeAttribute('capture'); mealFileInputRef.current?.click(); }} className="border-2 border-dashed border-primary/30 dark:border-primary/40 rounded-card p-6 text-center text-text-secondary dark:text-slate-400 hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary dark:hover:border-primary-light transition-all duration-300 flex flex-col items-center justify-center"><UploadIcon className="w-8 h-8 text-primary dark:text-primary-light mb-2" /><span>Upload</span></button>
                            <input type="file" accept="image/*" ref={mealFileInputRef} onChange={handleMealFileChange} className="hidden" />
                        </div>
                    ) : <img src={mealPreviewUrl} alt="Meal preview" className="rounded-card w-full max-h-48 object-contain shadow-card" />}
                    {mealPreviewUrl && !analysisResult && <button type="button" onClick={handleMealAnalyze} disabled={isLoading} className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-button hover:shadow-fab transition-all duration-300 disabled:from-slate-300 disabled:to-slate-300 flex items-center justify-center">{isLoading ? <Spinner /> : 'Analyze Meal'}</button>}
                </div>
            )}
            {error && <p className="text-accent-pink text-center text-sm mt-2 font-medium">{error}</p>}
            {analysisResult && (
                <div className="mt-4 space-y-3">
                    <NutritionDisplay
                        items={analysisResult.items}
                        total={analysisResult.total}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={resetMealState} className="w-full bg-white dark:bg-slate-700 border-2 border-primary/20 dark:border-slate-600 text-text-primary dark:text-slate-100 font-semibold py-3 rounded-button hover:bg-primary/5 dark:hover:bg-slate-600 hover:border-primary dark:hover:border-primary-light transition-all duration-300 shadow-card">Start Over</button>
                        <button type="submit" className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-button hover:shadow-fab transition-all duration-300">Confirm & Save</button>
                    </div>
                </div>
            )}
        </form>
    );

    const renderMedicationContent = () => {
        const renderVoiceContent = () => (
            <div>
                {medVoiceStep === 'say_medication' && (
                    <div className="text-center py-4">
                        <p className="text-text-secondary mb-4 font-medium">{isListening && listeningForRef.current === 'medication' ? 'Tap icon to stop.' : 'Tap icon and say medication and quantity.'}</p>
                        <button type="button" onClick={handleMedToggleListen} disabled={isLoading} className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isListening && listeningForRef.current === 'medication' ? 'bg-accent-pink text-white shadow-lg' : 'bg-gradient-to-br from-primary to-primary-dark text-white hover:shadow-fab'} disabled:bg-slate-300`}>{isLoading ? <Spinner /> : (isListening && listeningForRef.current === 'medication' ? <SquareIcon className="w-7 h-7" /> : <MicIcon className="w-8 h-8" />)}</button>
                        <p className="text-text-primary mt-4 min-h-[24px] px-2">{listeningForRef.current === 'medication' ? currentTranscript || (isListening ? <span className="text-text-secondary">Listening...</span> : <span className="text-text-light">e.g., "1 pill of Metformin"</span>) : ''}</p>
                    </div>
                )}
                {medVoiceStep === 'confirm' && medData.med && (
                    <div className="p-5 bg-primary/5 rounded-card border-2 border-primary/30">
                        <div className="text-center">
                            <p className="text-text-secondary font-medium">Is this correct?</p>
                            <p className="text-xl font-bold text-text-primary my-2">{medData.med.name}</p>
                            <p className="text-3xl font-bold text-accent-purple">{medData.quantity} <span className="text-lg font-normal text-text-light">x {medData.med.dosage}{medData.med.unit}</span></p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-6">
                            <button type="button" onClick={resetMedicationState} className="w-full bg-white border-2 border-primary/20 text-text-primary font-semibold py-3 rounded-button hover:bg-primary/5 hover:border-primary transition-all duration-300 shadow-card">Start Over</button>
                            <button type="button" onClick={handleVoiceMedSubmit} className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-button hover:shadow-fab transition-all duration-300">Confirm & Save</button>
                        </div>
                    </div>
                )}
                {error && <p className="text-accent-pink text-center mt-4 font-medium">{error}</p>}
            </div>
        );

        const renderManualContent = () => (
             <form onSubmit={handleManualMedSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="med-select" className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">Medication</label>
                        <select
                            id="med-select"
                            value={selectedMedId}
                            onChange={(e) => {
                                setSelectedMedId(e.target.value);
                                setError(''); // Clear error when user changes selection
                            }}
                            className="block w-full bg-white dark:bg-slate-700 text-text-primary dark:text-slate-100 rounded-button border-2 border-primary/20 dark:border-slate-600 focus:border-primary dark:focus:border-primary-light focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 px-3 py-3"
                        >
                            {userMedications.map(med => <option key={med.id} value={med.id}>{med.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="med-quantity" className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">Quantity</label>
                        <input
                            type="number"
                            id="med-quantity"
                            value={medQuantity}
                            onChange={(e) => {
                                const value = e.target.value;
                                setError(''); // Clear error when user changes quantity
                                if (value === '' || value === '0') {
                                    setMedQuantity(1);
                                } else {
                                    const numValue = parseInt(value, 10);
                                    if (!isNaN(numValue) && numValue >= 1) {
                                        setMedQuantity(numValue);
                                    }
                                }
                            }}
                            onFocus={(e) => e.target.select()}
                            min="1"
                            className="block w-full bg-white dark:bg-slate-700 text-text-primary dark:text-slate-100 placeholder:text-text-light dark:placeholder:text-slate-400 rounded-button border-2 border-primary/20 dark:border-slate-600 shadow-sm focus:border-primary dark:focus:border-primary-light focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 p-3"
                        />
                    </div>
                </div>
                 {error && <p className="text-accent-pink text-sm text-center font-medium">{error}</p>}
                <button type="submit" className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-button hover:shadow-fab transition-all duration-300">Save Medication</button>
            </form>
        );

        return (
            <div>
                {/* Voice removed - medication names are too long to say accurately */}
                {userMedications.length > 0 ? renderManualContent() : <p className="text-center text-slate-500 dark:text-slate-400 font-medium">Please add medications in settings first.</p>}
            </div>
        );
    }
    
    const renderWeightContent = () => {
        return (
            <div>
                {error && !isLoading && <p className="text-accent-pink text-center mt-4 text-sm mb-2 font-medium">{error}</p>}
                <form onSubmit={handleManualWeightSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="weight-value" className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">Weight</label>
                            <input type="number" id="weight-value" value={manualWeightValue} onChange={e => setManualWeightValue(e.target.value)} step="0.1" required className="block w-full bg-white dark:bg-slate-700 text-text-primary dark:text-slate-100 rounded-button border-2 border-primary/20 dark:border-slate-600 p-3 focus:border-primary dark:focus:border-primary-light focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300" />
                        </div>
                        <div>
                            <label htmlFor="weight-unit" className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">Unit</label>
                            <select id="weight-unit" value={manualWeightUnit} onChange={e => setManualWeightUnit(e.target.value as 'kg' | 'lbs')} className="block w-full bg-white dark:bg-slate-700 text-text-primary dark:text-slate-100 rounded-button border-2 border-primary/20 dark:border-slate-600 p-3 focus:border-primary dark:focus:border-primary-light focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300">
                                <option value="kg">kg</option>
                                <option value="lbs">lbs</option>
                            </select>
                        </div>
                    </div>
                    {error && <p className="text-accent-pink text-sm text-center font-medium">{error}</p>}
                    <button type="submit" className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-button hover:shadow-fab transition-all duration-300">Save Weight</button>
                </form>
            </div>
        );
    };

    const renderBloodPressureContent = () => {
        return (
            <div>
                {error && !isLoading && <p className="text-accent-pink text-center mt-4 text-sm mb-2 font-medium">{error}</p>}
                <form onSubmit={handleManualBpSubmit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label htmlFor="bp-sys" className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">Systolic</label>
                            <input type="number" id="bp-sys" value={manualSystolic} onChange={e => setManualSystolic(e.target.value)} required className="block w-full p-3 bg-white dark:bg-slate-700 text-text-primary dark:text-slate-100 border-2 border-primary/20 dark:border-slate-600 rounded-button focus:border-primary dark:focus:border-primary-light focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300" />
                        </div>
                        <div>
                            <label htmlFor="bp-dia" className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">Diastolic</label>
                            <input type="number" id="bp-dia" value={manualDiastolic} onChange={e => setManualDiastolic(e.target.value)} required className="block w-full p-3 bg-white dark:bg-slate-700 text-text-primary dark:text-slate-100 border-2 border-primary/20 dark:border-slate-600 rounded-button focus:border-primary dark:focus:border-primary-light focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300" />
                        </div>
                        <div>
                            <label htmlFor="bp-pulse" className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">Pulse</label>
                            <input type="number" id="bp-pulse" value={manualPulse} onChange={e => setManualPulse(e.target.value)} required className="block w-full p-3 bg-white dark:bg-slate-700 text-text-primary dark:text-slate-100 border-2 border-primary/20 dark:border-slate-600 rounded-button focus:border-primary dark:focus:border-primary-light focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300" />
                        </div>
                    </div>
                    {error && <p className="text-accent-pink text-sm text-center font-medium">{error}</p>}
                    <button type="submit" className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-button hover:shadow-fab transition-all duration-300">Save Blood Pressure</button>
                </form>
            </div>
        );
    };

    const logTypesConfig: { type: LogType; icon: React.FC<React.SVGProps<SVGSVGElement>>; label: string; colorClass: string; }[] = [
        { type: 'glucose', icon: DropletIcon, label: 'Glucose', colorClass: 'text-accent-blue' },
        { type: 'weight', icon: WeightScaleIcon, label: 'Weight', colorClass: 'text-accent-orange' },
        { type: 'blood_pressure', icon: BloodPressureIcon, label: 'BP', colorClass: 'text-accent-pink' },
        { type: 'meal', icon: ForkSpoonIcon, label: 'Meal', colorClass: 'text-primary' },
        { type: 'medication', icon: PillIcon, label: 'Meds', colorClass: 'text-accent-purple' },
    ];


    return (
        <section className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-card shadow-card border border-transparent dark:border-slate-700">
            <h2 className="text-xl font-semibold text-text-primary dark:text-slate-100 mb-4">Add a Past Entry</h2>

            {!isDateTimeConfirmed ? (
                <>
                    <div className="mb-4">
                        <label htmlFor="late-entry-datetime" className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">Step 1: Select Date and Time</label>
                        <input
                            type="datetime-local"
                            id="late-entry-datetime"
                            value={formatToLocalDateTimeString(timestamp)}
                            onChange={(e) => {
                                const newDate = new Date(e.target.value);
                                if (!isNaN(newDate.getTime())) setTimestamp(newDate);
                            }}
                            className="w-full bg-white dark:bg-slate-700 text-text-primary dark:text-slate-100 placeholder:text-text-light dark:placeholder:text-slate-400 rounded-button border-2 border-primary/20 dark:border-slate-600 shadow-sm focus:border-primary dark:focus:border-primary-light focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 p-3"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsDateTimeConfirmed(true)}
                        className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-button hover:shadow-fab transition-all duration-300 mt-4"
                    >
                        Confirm Date & Time
                    </button>
                </>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-4 bg-primary/5 dark:bg-primary/10 p-4 rounded-card border-2 border-primary/30 dark:border-primary/40">
                        <div>
                            <p className="text-sm font-medium text-text-secondary dark:text-slate-400">Logging for:</p>
                            <p className="font-semibold text-primary dark:text-primary-light">
                                {timestamp.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}, {timestamp.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsDateTimeConfirmed(false)}
                            className="px-3 py-1.5 text-sm font-medium text-text-primary dark:text-slate-100 bg-white dark:bg-slate-700 border-2 border-primary/20 dark:border-slate-600 rounded-button hover:bg-primary/5 dark:hover:bg-slate-600 hover:border-primary dark:hover:border-primary-light transition-all duration-300 shadow-card"
                        >
                            Change
                        </button>
                    </div>

                    <p className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">Step 2: Choose and add your entry</p>

                    {/* Segmented Control */}
                    <div className="grid grid-cols-5 gap-1 rounded-card bg-primary/5 dark:bg-slate-700 p-1 mb-4 border-2 border-primary/20 dark:border-slate-600">
                        {logTypesConfig.map(({ type, icon: Icon, label, colorClass }) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setActiveLogType(type)}
                                className={`w-full flex flex-col items-center justify-center py-2 rounded-button text-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                                    activeLogType === type
                                        ? 'bg-white dark:bg-slate-600 shadow-card'
                                        : 'bg-transparent hover:bg-white dark:hover:bg-slate-600 hover:bg-opacity-50'
                                }`}
                            >
                                <Icon className={`w-6 h-6 mb-1 transition-colors ${
                                    activeLogType === type ? colorClass : 'text-text-light dark:text-slate-400'
                                }`} />
                                <span className={`text-xs font-semibold transition-colors ${
                                    activeLogType === type ? 'text-text-primary dark:text-slate-100' : 'text-text-secondary dark:text-slate-400'
                                }`}>
                                    {label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="mt-4 min-h-[350px]">
                        {activeLogType === 'glucose' && renderGlucoseContent()}
                        {activeLogType === 'weight' && renderWeightContent()}
                        {activeLogType === 'blood_pressure' && renderBloodPressureContent()}
                        {activeLogType === 'meal' && renderMealContent()}
                        {activeLogType === 'medication' && renderMedicationContent()}
                    </div>


                    {showSuccess && (
                        <div className="mt-4 p-4 bg-primary/5 dark:bg-primary/10 border-2 border-primary dark:border-primary-light text-primary dark:text-primary-light font-semibold rounded-card text-center animate-fade-in-up">
                            {showSuccess}
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default LateEntryForm;