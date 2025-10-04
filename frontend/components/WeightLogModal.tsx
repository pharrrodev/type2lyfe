import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WeightReading } from '../types';
import { analyzeWeightFromText, analyzeWeightFromImage } from '../src/services/api';
import { MicIcon, XIcon, PencilIcon, CameraIcon, UploadIcon, WeightScaleIcon, SquareIcon } from './Icons';
import Spinner from './Spinner';
import { GoogleGenAI, Modality, Blob } from '@google/genai';

interface WeightLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReading: (reading: Omit<WeightReading, 'id'>) => void;
  customTimestamp?: Date; // Optional: for late entries
}

// --- Audio Helper Functions ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const WeightLogModal: React.FC<WeightLogModalProps> = ({ isOpen, onClose, onAddReading, customTimestamp }) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'manual' | 'photo'>('voice');
  const [parsedData, setParsedData] = useState<{ value: number; unit: 'kg' | 'lbs' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Voice state
  const [voiceStep, setVoiceStep] = useState<'say_reading' | 'confirm'>('say_reading');
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const sessionRef = useRef<any | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);

  // Manual state
  const [manualValue, setManualValue] = useState('');
  const [manualUnit, setManualUnit] = useState<'kg' | 'lbs'>('kg');
  
  // Photo state
  const [photoStep, setPhotoStep] = useState<'select_photo' | 'confirm'>('select_photo');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleParseText = useCallback(async (textToParse: string) => {
    if (!textToParse) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await analyzeWeightFromText(textToParse);
      const result = response.data;
      if (result) {
        setParsedData(result);
        setVoiceStep('confirm');
      } else {
        setError("Couldn't understand the weight. Please try again.");
      }
    } catch (e) {
      setError('An error occurred during parsing.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopListening = useCallback(async () => {
    setIsListening(false);
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        await inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    if (sessionRef.current) {
        sessionRef.current.close();
        sessionRef.current = null;
    }
  }, []);

  const startListening = useCallback(async () => {
    if (isListening) return;
    resetVoiceState();
    setIsListening(true);
    setError('');
    if (!aiRef.current) {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            setError('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to .env.local');
            setIsListening(false);
            return;
        }
        aiRef.current = new GoogleGenAI({ apiKey });
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const sessionPromise = aiRef.current.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                    const source = inputAudioContextRef.current.createMediaStreamSource(stream);
                    const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;
                    scriptProcessor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        sessionPromise.then((session) => session.sendRealtimeInput({ media: createBlob(inputData) }));
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContextRef.current.destination);
                },
                onmessage: async (message) => {
                    if (message.serverContent?.inputTranscription) {
                        setTranscript(prev => prev + message.serverContent.inputTranscription.text);
                    }
                },
                onerror: (e) => { console.error(e); setError('A connection error occurred.'); stopListening(); },
                onclose: () => {},
            },
            config: { responseModalities: [Modality.AUDIO], inputAudioTranscription: {} },
        });
        sessionRef.current = await sessionPromise;
    } catch (err) {
        console.error(err);
        setError('Could not access microphone.');
        setIsListening(false);
    }
  }, [isListening, stopListening]);

  useEffect(() => { return () => { stopListening(); }; }, [stopListening]);

  useEffect(() => {
    if (!isListening && transcript) handleParseText(transcript);
  }, [isListening, transcript, handleParseText]);

  const resetVoiceState = useCallback(() => {
    setVoiceStep('say_reading');
    setTranscript('');
    setParsedData(null);
    setError('');
    setIsLoading(false);
    stopListening();
  }, [stopListening]);

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
      resetVoiceState();
      resetManualState();
      resetPhotoState();
      setActiveTab('voice');
    }
  }, [isOpen, resetVoiceState, resetManualState, resetPhotoState]);

  const handleVoiceSubmit = () => {
    if (parsedData) {
      onAddReading({ ...parsedData, timestamp: (customTimestamp || new Date()).toISOString(), source: 'voice', transcript });
      onClose();
    }
  };

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

  const renderVoiceContent = () => (
    <div className="min-h-[220px]">
      {voiceStep === 'say_reading' && (
        <div className="text-center py-4 flex flex-col items-center">
          <p className="text-text-secondary dark:text-slate-400 mb-4 font-medium">{isListening ? 'Tap icon to stop recording.' : 'Tap icon and say your weight, like "85 kilograms".'}</p>
          <button onClick={() => isListening ? stopListening() : startListening()} disabled={isLoading} className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-danger dark:bg-danger text-white shadow-lg' : 'bg-gradient-to-br from-primary to-primary-dark text-white hover:shadow-fab'} disabled:bg-slate-300 dark:disabled:bg-slate-600`}>
            {isLoading ? <Spinner /> : (isListening ? <SquareIcon className="w-7 h-7" /> : <MicIcon className="w-8 h-8" />)}
          </button>
          <p className="text-text-primary dark:text-slate-100 mt-4 min-h-[48px] px-2">{transcript || (isListening ? <span className="text-text-secondary dark:text-slate-400">Listening...</span> : '')}</p>
        </div>
      )}
      {voiceStep === 'confirm' && parsedData && (
        <div className="mt-4 p-5 bg-primary/5 dark:bg-primary/10 rounded-2xl border-2 border-primary/30 dark:border-primary/40">
          <div className="text-center">
            <p className="text-text-secondary dark:text-slate-400 font-medium">Is this correct?</p>
            <p className="text-2xl font-bold text-warning dark:text-warning my-2">{parsedData.value} <span className="text-sm font-normal text-text-secondary dark:text-slate-400">{parsedData.unit}</span></p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button onClick={resetVoiceState} className="w-full bg-card dark:bg-slate-700 border-2 border-primary/20 dark:border-primary/30 text-text-primary dark:text-slate-100 font-semibold py-3 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary dark:hover:border-primary transition-all duration-300 shadow-card">Start Over</button>
            <button onClick={handleVoiceSubmit} className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-lg hover:shadow-fab transition-all duration-300">Confirm & Save</button>
          </div>
        </div>
      )}
      {error && <p className="text-danger dark:text-danger text-center mt-4 font-medium">{error}</p>}
    </div>
  );

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
          <button onClick={() => { setActiveTab('voice'); resetManualState(); resetPhotoState(); }} className={`px-4 py-2 text-sm font-semibold flex items-center space-x-2 transition-all duration-300 ${activeTab === 'voice' ? 'border-b-2 border-primary text-primary dark:text-primary' : 'text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary'}`}><MicIcon className="w-4 h-4" /><span>Voice</span></button>
          <button onClick={() => { setActiveTab('manual'); resetVoiceState(); resetPhotoState(); }} className={`px-4 py-2 text-sm font-semibold flex items-center space-x-2 transition-all duration-300 ${activeTab === 'manual' ? 'border-b-2 border-primary text-primary dark:text-primary' : 'text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary'}`}><PencilIcon className="w-4 h-4" /><span>Manual</span></button>
          <button onClick={() => { setActiveTab('photo'); resetVoiceState(); resetManualState(); }} className={`px-4 py-2 text-sm font-semibold flex items-center space-x-2 transition-all duration-300 ${activeTab === 'photo' ? 'border-b-2 border-primary text-primary dark:text-primary' : 'text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary'}`}><CameraIcon className="w-4 h-4" /><span>Photo</span></button>
        </div>
        {activeTab === 'voice' && renderVoiceContent()}
        {activeTab === 'manual' && renderManualContent()}
        {activeTab === 'photo' && renderPhotoContent()}
      </div>
    </div>
  );
};

export default WeightLogModal;