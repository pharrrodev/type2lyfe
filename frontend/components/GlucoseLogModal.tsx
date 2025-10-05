import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GlucoseReading } from '../types';
import { analyzeGlucoseFromText, analyzeGlucoseFromImage } from '../src/services/api';
import { XIcon, DropletIcon, PencilIcon, CameraIcon, UploadIcon } from './Icons';
import Spinner from './Spinner';

interface GlucoseLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReading: (reading: Omit<GlucoseReading, 'id'>) => void;
  unit: 'mg/dL' | 'mmol/L';
  customTimestamp?: Date; // Optional: for late entries
  editingLog?: GlucoseReading | null; // Optional: for editing existing entries
}

const GlucoseLogModal: React.FC<GlucoseLogModalProps> = ({ isOpen, onClose, onAddReading, unit, customTimestamp }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'photo'>('photo');

  // Shared state
  const [parsedData, setParsedData] = useState<{ value: number; context: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Manual state
  const [manualValue, setManualValue] = useState('');
  const [manualContext, setManualContext] = useState<GlucoseReading['context']>('random');
  
  // Photo state
  const [photoStep, setPhotoStep] = useState<'select_photo' | 'confirm'>('select_photo');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);



  const resetManualState = useCallback(() => {
    setManualValue('');
    setManualContext('random');
    setError('');
  }, []);

  const resetPhotoState = useCallback(() => {
    setPhotoStep('select_photo');
    setImageFile(null);
    setPreviewUrl(null);
    setParsedData(null);
    setError('');
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetManualState();
      resetPhotoState();
      setActiveTab('photo');
    }
  }, [isOpen, resetManualState, resetPhotoState]);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setParsedData(null);
      setError('');
    }
  };

  const handlePhotoAnalyze = async () => {
    if (!imageFile) return;

    setIsLoading(true);
    setError('');
    setParsedData(null);

    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = async () => {
      try {
        const base64String = (reader.result as string).split(',')[1];
        const response = await analyzeGlucoseFromImage(base64String, imageFile.type);
        const result = response.data;
        if (result) {
            const isValid = unit === 'mmol/L'
              ? result.value >= 1 && result.value <= 33
              : result.value >= 20 && result.value <= 600;

            if (isValid) {
               setParsedData({ value: result.value, context: result.context });
               setPhotoStep('confirm');
            } else {
               setError(`Invalid glucose value from image: ${result.value}.`);
            }
        } else {
          setError("Couldn't read the value from the image. Please try another photo.");
        }
      } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError('An error occurred during image analysis.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the image file.');
      setIsLoading(false);
    };
  };

  const handlePhotoSubmit = () => {
    if (parsedData) {
      onAddReading({
        value: parsedData.value,
        displayUnit: unit,
        context: (parsedData.context.toLowerCase().replace(' ', '_')) as GlucoseReading['context'],
        timestamp: (customTimestamp || new Date()).toISOString(),
        source: 'photo_analysis',
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  const renderManualContent = () => (
    <form onSubmit={handleManualSubmit} className="space-y-4 pt-4 min-h-[220px]">
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
        <button type="submit" className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-lg hover:shadow-fab transition-all duration-300">
            Save Log
        </button>
    </form>
  );

  const renderPhotoContent = () => (
    <div className="min-h-[220px] pt-4">
        {photoStep === 'select_photo' && (
            <div>
                {!previewUrl ? (
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={() => { fileInputRef.current?.setAttribute('capture', 'environment'); fileInputRef.current?.click(); }} className="border-2 border-dashed border-primary/30 dark:border-primary/40 rounded-2xl p-8 text-center text-text-secondary dark:text-slate-400 hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary dark:hover:border-primary transition-all duration-300 flex flex-col items-center justify-center">
                            <CameraIcon className="w-10 h-10 mx-auto text-primary dark:text-primary mb-2" />
                            <span className="font-medium">Take Picture</span>
                        </button>
                        <button onClick={() => { fileInputRef.current?.removeAttribute('capture'); fileInputRef.current?.click(); }} className="border-2 border-dashed border-primary/30 dark:border-primary/40 rounded-2xl p-8 text-center text-text-secondary dark:text-slate-400 hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary dark:hover:border-primary transition-all duration-300 flex flex-col items-center justify-center">
                            <UploadIcon className="w-10 h-10 mx-auto text-primary dark:text-primary mb-2" />
                            <span className="font-medium">Upload Photo</span>
                        </button>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <img src={previewUrl} alt="Glucose meter preview" className="rounded-2xl w-full max-h-48 object-contain shadow-card" />
                        <button onClick={handlePhotoAnalyze} disabled={isLoading} className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-lg hover:shadow-fab disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-600 dark:disabled:to-slate-600 transition-all duration-300 flex items-center justify-center">
                            {isLoading ? <Spinner /> : 'Analyze Reading'}
                        </button>
                    </div>
                )}
            </div>
        )}
        {photoStep === 'confirm' && parsedData && (
             <div className="mt-4 p-5 bg-primary/5 dark:bg-primary/10 rounded-2xl border-2 border-primary/30 dark:border-primary/40">
                <div className="text-center">
                    <p className="text-text-secondary dark:text-slate-400 font-medium">Is this correct?</p>
                    <p className="text-2xl font-bold text-primary dark:text-primary my-2">{parsedData.value} <span className="text-sm font-normal text-text-secondary dark:text-slate-400">{unit}</span></p>
                    <p className="text-text-secondary dark:text-slate-400 capitalize font-medium">{parsedData.context.replace('_', ' ')}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-6">
                    <button onClick={resetPhotoState} className="w-full bg-card dark:bg-slate-700 border-2 border-primary/20 dark:border-primary/30 text-text-primary dark:text-slate-100 font-semibold py-3 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary dark:hover:border-primary transition-all duration-300 shadow-card">
                        Start Over
                    </button>
                    <button onClick={handlePhotoSubmit} className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-lg hover:shadow-fab transition-all duration-300">
                        Confirm & Save
                    </button>
                </div>
            </div>
        )}
        {error && <p className="text-danger dark:text-danger text-center mt-4 font-medium">{error}</p>}
    </div>
  );


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

        <div className="flex border-b border-border dark:border-slate-700 mb-2">
            <button onClick={() => { setActiveTab('photo'); resetManualState(); }} className={`px-4 py-2 text-sm font-semibold flex items-center space-x-2 transition-all duration-300 ${activeTab === 'photo' ? 'border-b-2 border-primary text-primary dark:text-primary' : 'text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary'}`}>
                <CameraIcon className="w-4 h-4" />
                <span>Photo</span>
            </button>
            <button onClick={() => { setActiveTab('manual'); resetPhotoState(); }} className={`px-4 py-2 text-sm font-semibold flex items-center space-x-2 transition-all duration-300 ${activeTab === 'manual' ? 'border-b-2 border-primary text-primary dark:text-primary' : 'text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary'}`}>
                <PencilIcon className="w-4 h-4" />
                <span>Manual</span>
            </button>
        </div>

        {activeTab === 'manual' && renderManualContent()}
        {activeTab === 'photo' && renderPhotoContent()}
      </div>
    </div>
  );
};

export default GlucoseLogModal;