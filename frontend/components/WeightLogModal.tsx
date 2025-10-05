import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WeightReading } from '../types';
import { analyzeWeightFromText, analyzeWeightFromImage } from '../src/services/api';
import { XIcon, PencilIcon, CameraIcon, UploadIcon, WeightScaleIcon } from './Icons';
import Spinner from './Spinner';

interface WeightLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReading: (reading: Omit<WeightReading, 'id'>) => void;
  customTimestamp?: Date; // Optional: for late entries
}

const WeightLogModal: React.FC<WeightLogModalProps> = ({ isOpen, onClose, onAddReading, customTimestamp }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'photo'>('photo');
  const [parsedData, setParsedData] = useState<{ value: number; unit: 'kg' | 'lbs' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Manual state
  const [manualValue, setManualValue] = useState('');
  const [manualUnit, setManualUnit] = useState<'kg' | 'lbs'>('kg');
  
  // Photo state
  const [photoStep, setPhotoStep] = useState<'select_photo' | 'confirm'>('select_photo');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetManualState = useCallback(() => {
    setManualValue('');
    setManualUnit('kg');
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

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valueNum = parseFloat(manualValue);
    if (isNaN(valueNum) || valueNum <= 0) {
      setError('Please enter a valid weight.');
      return;
    }
    onAddReading({ value: valueNum, unit: manualUnit, timestamp: (customTimestamp || new Date()).toISOString(), source: 'manual' });
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handlePhotoAnalyze = async () => {
    if (!imageFile) return;
    setIsLoading(true);
    setError('');
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = async () => {
      try {
        const base64String = (reader.result as string).split(',')[1];
        const response = await analyzeWeightFromImage(base64String, imageFile.type);
        const result = response.data;
        if (result) {
          setParsedData(result);
          setPhotoStep('confirm');
        } else {
          setError("Couldn't read the value from the image.");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred during analysis.');
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => { setError('Failed to read file.'); setIsLoading(false); };
  };

  const handlePhotoSubmit = () => {
    if (parsedData) {
      onAddReading({ ...parsedData, timestamp: (customTimestamp || new Date()).toISOString(), source: 'photo_analysis' });
      onClose();
    }
  };

  if (!isOpen) return null;

  const renderManualContent = () => (
    <form onSubmit={handleManualSubmit} className="space-y-4 pt-4 min-h-[220px]">
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
      <button type="submit" className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-lg hover:shadow-fab transition-all duration-300">Save Log</button>
    </form>
  );

  const renderPhotoContent = () => (
    <div className="min-h-[220px] pt-4">
      {photoStep === 'select_photo' && (
        <div>
          {!previewUrl ? (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => { fileInputRef.current?.setAttribute('capture', 'environment'); fileInputRef.current?.click(); }} className="border-2 border-dashed border-primary/30 dark:border-primary/40 rounded-2xl p-8 text-center text-text-secondary dark:text-slate-400 hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary dark:hover:border-primary transition-all duration-300 flex flex-col items-center justify-center"><CameraIcon className="w-10 h-10 text-primary dark:text-primary mb-2" /><span>Take Picture</span></button>
              <button onClick={() => { fileInputRef.current?.removeAttribute('capture'); fileInputRef.current?.click(); }} className="border-2 border-dashed border-primary/30 dark:border-primary/40 rounded-2xl p-8 text-center text-text-secondary dark:text-slate-400 hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary dark:hover:border-primary transition-all duration-300 flex flex-col items-center justify-center"><UploadIcon className="w-10 h-10 text-primary dark:text-primary mb-2" /><span>Upload Photo</span></button>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </div>
          ) : (
            <div className="space-y-4">
              <img src={previewUrl} alt="Weight scale preview" className="rounded-2xl w-full max-h-48 object-contain shadow-card" />
              <button onClick={handlePhotoAnalyze} disabled={isLoading} className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-lg hover:shadow-fab transition-all duration-300 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-600 dark:disabled:to-slate-600 flex items-center justify-center">{isLoading ? <Spinner /> : 'Analyze Weight'}</button>
            </div>
          )}
        </div>
      )}
      {photoStep === 'confirm' && parsedData && (
        <div className="mt-4 p-5 bg-primary/5 dark:bg-primary/10 rounded-2xl border-2 border-primary/30 dark:border-primary/40">
          <div className="text-center">
            <p className="text-text-secondary dark:text-slate-400 font-medium">Is this correct?</p>
            <p className="text-2xl font-bold text-warning dark:text-warning my-2">{parsedData.value} <span className="text-sm font-normal text-text-secondary dark:text-slate-400">{parsedData.unit}</span></p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button onClick={resetPhotoState} className="w-full bg-card dark:bg-slate-700 border-2 border-primary/20 dark:border-primary/30 text-text-primary dark:text-slate-100 font-semibold py-3 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary dark:hover:border-primary transition-all duration-300 shadow-card">Start Over</button>
            <button onClick={handlePhotoSubmit} className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-lg hover:shadow-fab transition-all duration-300">Confirm & Save</button>
          </div>
        </div>
      )}
      {error && <p className="text-danger dark:text-danger text-center mt-4 font-medium">{error}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-card dark:bg-slate-800 rounded-3xl shadow-modal w-full max-w-md p-6 relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-all duration-300"><XIcon className="w-6 h-6" /></button>
        <div className="flex items-center space-x-3 mb-5">
          <WeightScaleIcon className="w-7 h-7 text-warning dark:text-warning" />
          <h2 className="text-2xl font-bold text-text-primary dark:text-slate-100">Log Weight</h2>
        </div>
        <div className="flex border-b border-border dark:border-slate-700 mb-2">
          <button onClick={() => { setActiveTab('photo'); resetManualState(); }} className={`px-4 py-2 text-sm font-semibold flex items-center space-x-2 transition-all duration-300 ${activeTab === 'photo' ? 'border-b-2 border-primary text-primary dark:text-primary' : 'text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary'}`}><CameraIcon className="w-4 h-4" /><span>Photo</span></button>
          <button onClick={() => { setActiveTab('manual'); resetPhotoState(); }} className={`px-4 py-2 text-sm font-semibold flex items-center space-x-2 transition-all duration-300 ${activeTab === 'manual' ? 'border-b-2 border-primary text-primary dark:text-primary' : 'text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary'}`}><PencilIcon className="w-4 h-4" /><span>Manual</span></button>
        </div>
        {activeTab === 'photo' && renderPhotoContent()}
        {activeTab === 'manual' && renderManualContent()}
      </div>
    </div>
  );
};

export default WeightLogModal;