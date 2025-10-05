import React, { useState, useEffect } from 'react';
import { BloodPressureReading } from '../types';
import { analyzeBpFromImage } from '../src/services/api';
import { XIcon, PencilIcon, CameraIcon, UploadIcon, BloodPressureIcon } from './Icons';
import Spinner from './Spinner';

interface BloodPressureLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReading: (reading: Omit<BloodPressureReading, 'id'>) => void;
  customTimestamp?: Date; // Optional: for late entries
}

const BloodPressureLogModal: React.FC<BloodPressureLogModalProps> = ({ isOpen, onClose, onAddReading, customTimestamp }) => {
  // Voice removed - saying three separate numbers (systolic, diastolic, pulse) is cumbersome
  const [activeTab, setActiveTab] = useState<'manual' | 'photo'>('photo');
  
  // Manual state
  const [manualSystolic, setManualSystolic] = useState('');
  const [manualDiastolic, setManualDiastolic] = useState('');
  const [manualPulse, setManualPulse] = useState('');
  
  // Photo state
  const [photoStep, setPhotoStep] = useState<'select_photo' | 'confirm'>('select_photo');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<{ systolic: number; diastolic: number; pulse?: number } | null>(null);
  
  // Shared state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('photo');
      setManualSystolic('');
      setManualDiastolic('');
      setManualPulse('');
      setPhotoStep('select_photo');
      setImageFile(null);
      setPreviewUrl(null);
      setParsedData(null);
      setError('');
    }
  }, [isOpen]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const systolic = parseInt(manualSystolic, 10);
    const diastolic = parseInt(manualDiastolic, 10);
    const pulse = manualPulse ? parseInt(manualPulse, 10) : undefined;

    if (isNaN(systolic) || systolic < 70 || systolic > 200) {
      setError('Systolic must be between 70 and 200.');
      return;
    }
    if (isNaN(diastolic) || diastolic < 40 || diastolic > 130) {
      setError('Diastolic must be between 40 and 130.');
      return;
    }
    if (pulse !== undefined && (isNaN(pulse) || pulse < 40 || pulse > 200)) {
      setError('Pulse must be between 40 and 200.');
      return;
    }

    onAddReading({ systolic, diastolic, pulse, timestamp: (customTimestamp || new Date()).toISOString(), source: 'manual' });
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setImageFile(f);
      setPreviewUrl(URL.createObjectURL(f));
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
        const base64 = (reader.result as string).split(',')[1];
        const response = await analyzeBpFromImage(base64, imageFile.type);
        const result = response.data;
        if (result) {
          setParsedData(result);
          setPhotoStep('confirm');
        } else {
          setError("Couldn't read the value from the image.");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file.');
      setIsLoading(false);
    };
  };

  const handlePhotoSubmit = () => {
    if (parsedData) {
      onAddReading({ ...parsedData, timestamp: (customTimestamp || new Date()).toISOString(), source: 'photo_analysis' });
      onClose();
    }
  };

  if (!isOpen) return null;

  const renderManualContent = () => (
    <form onSubmit={handleManualSubmit} className="space-y-4 pt-4">
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
      <button type="submit" className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-lg hover:shadow-fab transition-all duration-300">
        Save Reading
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
                <CameraIcon className="w-10 h-10 text-primary dark:text-primary mb-2" />
                <span>Take Picture</span>
              </button>
              <button onClick={() => { fileInputRef.current?.removeAttribute('capture'); fileInputRef.current?.click(); }} className="border-2 border-dashed border-primary/30 dark:border-primary/40 rounded-2xl p-8 text-center text-text-secondary dark:text-slate-400 hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary dark:hover:border-primary transition-all duration-300 flex flex-col items-center justify-center">
                <UploadIcon className="w-10 h-10 text-primary dark:text-primary mb-2" />
                <span>Upload Photo</span>
              </button>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </div>
          ) : (
            <div className="space-y-4">
              <img src={previewUrl} alt="BP monitor preview" className="rounded-2xl w-full max-h-48 object-contain shadow-card" />
              <button onClick={handlePhotoAnalyze} disabled={isLoading} className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-lg hover:shadow-fab transition-all duration-300 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-600 dark:disabled:to-slate-600 flex items-center justify-center">
                {isLoading ? <Spinner /> : 'Analyze Photo'}
              </button>
            </div>
          )}
          {error && <p className="text-danger dark:text-danger text-sm text-center mt-2 font-medium">{error}</p>}
        </div>
      )}
      {photoStep === 'confirm' && parsedData && (
        <div className="space-y-4">
          <div className="bg-primary/5 dark:bg-primary/10 p-5 rounded-2xl border-2 border-primary/30 dark:border-primary/40">
            <p className="text-center text-2xl font-bold text-danger dark:text-danger">{parsedData.systolic}/{parsedData.diastolic}</p>
            {parsedData.pulse && <p className="text-center text-text-secondary dark:text-slate-400 font-medium mt-2">Pulse: {parsedData.pulse} bpm</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { setPhotoStep('select_photo'); setParsedData(null); setPreviewUrl(null); setImageFile(null); }} className="bg-card dark:bg-slate-700 border-2 border-primary/20 dark:border-primary/30 text-text-primary dark:text-slate-100 font-semibold py-3 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary dark:hover:border-primary transition-all duration-300 shadow-card">
              Retake
            </button>
            <button onClick={handlePhotoSubmit} className="bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-lg hover:shadow-fab transition-all duration-300">
              Confirm & Save
            </button>
          </div>
        </div>
      )}
    </div>
  );

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

        <div className="flex border-b border-border dark:border-slate-700">
          <button onClick={() => setActiveTab('photo')} className={`flex-1 py-3 text-center font-semibold transition-all duration-300 ${activeTab === 'photo' ? 'text-primary dark:text-primary border-b-2 border-primary' : 'text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary'}`}>
            <CameraIcon className="w-5 h-5 inline mr-1" />
            Photo
          </button>
          <button onClick={() => setActiveTab('manual')} className={`flex-1 py-3 text-center font-semibold transition-all duration-300 ${activeTab === 'manual' ? 'text-primary dark:text-primary border-b-2 border-primary' : 'text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary'}`}>
            <PencilIcon className="w-5 h-5 inline mr-1" />
            Manual
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'manual' && renderManualContent()}
          {activeTab === 'photo' && renderPhotoContent()}
        </div>
      </div>
    </div>
  );
};

export default BloodPressureLogModal;

