import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GlucoseReading } from '../types';
import { analyzeGlucoseFromText, analyzeGlucoseFromImage } from '../src/services/api';
import { MicIcon, XIcon, DropletIcon, PencilIcon, CameraIcon, UploadIcon, SquareIcon } from './Icons';
import Spinner from './Spinner';
// FIX: The 'LiveSession' type is not exported from '@google/genai'. It has been removed.
import { GoogleGenAI, Modality, Blob } from '@google/genai';

interface GlucoseLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReading: (reading: Omit<GlucoseReading, 'id'>) => void;
  unit: 'mg/dL' | 'mmol/L';
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

const GlucoseLogModal: React.FC<GlucoseLogModalProps> = ({ isOpen, onClose, onAddReading, unit, customTimestamp }) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'manual' | 'photo'>('voice');

  // Shared state
  const [parsedData, setParsedData] = useState<{ value: number; context: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Voice state
  const [voiceStep, setVoiceStep] = useState<'say_reading' | 'confirm'>('say_reading');
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  // Real-time audio state
  // FIX: Use 'any' for the session ref type as a workaround for the removed 'LiveSession' export from the SDK.
  const sessionRef = useRef<any | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);

  // Manual state
  const [manualValue, setManualValue] = useState('');
  const [manualContext, setManualContext] = useState<GlucoseReading['context']>('random');
  
  // Photo state
  const [photoStep, setPhotoStep] = useState<'select_photo' | 'confirm'>('select_photo');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleParseText = useCallback(async (textToParse: string) => {
    if (!textToParse) return;

    setIsLoading(true);
    setError('');
    setParsedData(null);
    try {
      const response = await analyzeGlucoseFromText(textToParse);
      const result = response.data;
      if (result) {
        const isValid = unit === 'mmol/L' 
          ? result.value >= 1 && result.value <= 33
          : result.value >= 20 && result.value <= 600;

        if (isValid) {
           setParsedData({ value: result.value, context: result.context });
           setVoiceStep('confirm');
        } else {
           setError(`Invalid glucose value: ${result.value}. Must be between ${unit === 'mmol/L' ? '1 and 33' : '20 and 600'}.`);
        }
      } else {
        setError("Couldn't understand the reading. Please try saying it again.");
      }
    } catch (e) {
      setError('An error occurred during parsing.');
    } finally {
      setIsLoading(false);
    }
  }, [unit]);

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
    setTranscript('');

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

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        sessionPromise.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContextRef.current.destination);
                },
                onmessage: async (message) => {
                    if (message.serverContent?.inputTranscription) {
                        const text = message.serverContent.inputTranscription.text;
                        setTranscript(prev => prev + text);
                    }
                },
                onerror: (e) => {
                    console.error('Live session error:', e);
                    setError('A real-time connection error occurred.');
                    stopListening();
                },
                onclose: () => {
                   // Connection closed
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                inputAudioTranscription: {},
            },
        });
        sessionRef.current = await sessionPromise;
    } catch (err) {
        console.error('Error starting audio session:', err);
        setError('Could not access the microphone.');
        setIsListening(false);
    }
  }, [isListening]);


  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);


  // When listening stops, if we have a transcript, parse it.
  useEffect(() => {
      if (!isListening && transcript) {
          handleParseText(transcript);
      }
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
      resetVoiceState();
      resetManualState();
      resetPhotoState();
      setActiveTab('voice');
    }
  }, [isOpen, resetVoiceState, resetManualState, resetPhotoState]);

  const handleToggleListen = () => {
      if (isListening) {
          stopListening();
      } else {
          startListening();
      }
  };

  const handleVoiceSubmit = () => {
    if (parsedData) {
      onAddReading({
        value: parsedData.value,
        displayUnit: unit,
        context: (parsedData.context.toLowerCase().replace(' ', '_')) as GlucoseReading['context'],
        timestamp: (customTimestamp || new Date()).toISOString(),
        transcript: transcript,
        source: 'voice',
      });
      onClose();
    }
  };

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

  const renderVoiceContent = () => (
    <div className="min-h-[220px]">
        {voiceStep === 'say_reading' && (
            <div className="text-center py-4 flex flex-col items-center">
                <p className="text-text-secondary mb-4">
                    {isListening
                        ? 'Tap the icon below to stop recording.'
                        : 'Tap the mic and say your reading, like "7.8 after dinner".'}
                </p>
                <button
                    onClick={handleToggleListen}
                    disabled={isLoading}
                    className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-accent-pink text-white shadow-lg' : 'bg-gradient-to-br from-primary to-primary-dark text-white hover:shadow-fab'} disabled:bg-slate-300`}
                >
                    {isLoading ? <Spinner /> : (isListening ? <SquareIcon className="w-7 h-7" /> : <MicIcon className="w-8 h-8" />)}
                </button>
                <p className="text-text-primary mt-4 min-h-[48px] px-2">{transcript || (isListening ? <span className="text-text-secondary">Listening...</span> : '')}</p>
            </div>
        )}
        {voiceStep === 'confirm' && parsedData && (
            <div className="mt-4 p-5 bg-primary/5 rounded-2xl border-2 border-primary/30">
                <div className="text-center">
                    <p className="text-text-secondary font-medium">Is this correct?</p>
                    <p className="text-2xl font-bold text-primary my-2">{parsedData.value} <span className="text-sm font-normal text-text-secondary">{unit}</span></p>
                    <p className="text-text-secondary capitalize font-medium">{parsedData.context.replace('_', ' ')}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-6">
                    <button onClick={resetVoiceState} className="w-full bg-card border-2 border-primary/20 text-text-primary font-semibold py-3 rounded-lg hover:bg-primary/5 hover:border-primary transition-all duration-300 shadow-card">
                        Start Over
                    </button>
                    <button onClick={handleVoiceSubmit} className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-lg hover:shadow-fab transition-all duration-300">
                        Confirm & Save
                    </button>
                </div>
            </div>
        )}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
  );

  const renderManualContent = () => (
    <form onSubmit={handleManualSubmit} className="space-y-4 pt-4 min-h-[220px]">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="glucose-value" className="block text-sm font-semibold text-text-primary mb-2">Value ({unit})</label>
                <input
                    type="number"
                    id="glucose-value"
                    value={manualValue}
                    onChange={e => setManualValue(e.target.value)}
                    step={unit === 'mmol/L' ? '0.1' : '1'}
                    required
                    className="block w-full bg-card text-text-primary placeholder:text-text-secondary rounded-lg border-2 border-border shadow-sm focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 p-3"
                />
            </div>
            <div>
                <label htmlFor="glucose-context" className="block text-sm font-semibold text-text-primary mb-2">Context</label>
                <select
                    id="glucose-context"
                    value={manualContext}
                    onChange={e => setManualContext(e.target.value as GlucoseReading['context'])}
                    className="block w-full bg-card text-text-primary border-2 border-border rounded-lg focus:outline-none focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 px-3 py-3"
                >
                    <option value="random">Random</option>
                    <option value="fasting">Fasting</option>
                    <option value="before_meal">Before Meal</option>
                    <option value="after_meal">After Meal</option>
                    <option value="bedtime">Bedtime</option>
                </select>
            </div>
        </div>
        {error && <p className="text-danger text-sm text-center font-medium">{error}</p>}
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
                        <button onClick={() => { fileInputRef.current?.setAttribute('capture', 'environment'); fileInputRef.current?.click(); }} className="border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center text-text-secondary hover:bg-primary/5 hover:border-primary transition-all duration-300 flex flex-col items-center justify-center">
                            <CameraIcon className="w-10 h-10 mx-auto text-primary mb-2" />
                            <span className="font-medium">Take Picture</span>
                        </button>
                        <button onClick={() => { fileInputRef.current?.removeAttribute('capture'); fileInputRef.current?.click(); }} className="border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center text-text-secondary hover:bg-primary/5 hover:border-primary transition-all duration-300 flex flex-col items-center justify-center">
                            <UploadIcon className="w-10 h-10 mx-auto text-primary mb-2" />
                            <span className="font-medium">Upload Photo</span>
                        </button>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <img src={previewUrl} alt="Glucose meter preview" className="rounded-2xl w-full max-h-48 object-contain shadow-card" />
                        <button onClick={handlePhotoAnalyze} disabled={isLoading} className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-lg hover:shadow-fab disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 transition-all duration-300 flex items-center justify-center">
                            {isLoading ? <Spinner /> : 'Analyze Reading'}
                        </button>
                    </div>
                )}
            </div>
        )}
        {photoStep === 'confirm' && parsedData && (
             <div className="mt-4 p-5 bg-primary/5 rounded-2xl border-2 border-primary/30">
                <div className="text-center">
                    <p className="text-text-secondary font-medium">Is this correct?</p>
                    <p className="text-2xl font-bold text-primary my-2">{parsedData.value} <span className="text-sm font-normal text-text-secondary">{unit}</span></p>
                    <p className="text-text-secondary capitalize font-medium">{parsedData.context.replace('_', ' ')}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-6">
                    <button onClick={resetPhotoState} className="w-full bg-card border-2 border-primary/20 text-text-primary font-semibold py-3 rounded-lg hover:bg-primary/5 hover:border-primary transition-all duration-300 shadow-card">
                        Start Over
                    </button>
                    <button onClick={handlePhotoSubmit} className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-lg hover:shadow-fab transition-all duration-300">
                        Confirm & Save
                    </button>
                </div>
            </div>
        )}
        {error && <p className="text-danger text-center mt-4 font-medium">{error}</p>}
    </div>
  );


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-card rounded-3xl shadow-modal w-full max-w-md p-6 relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-primary transition-all duration-300">
          <XIcon className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-3 mb-5">
            <DropletIcon className="w-7 h-7 text-info" />
            <h2 className="text-2xl font-bold text-text-primary">Log Glucose</h2>
        </div>

        <div className="flex border-b border-border mb-2">
            <button onClick={() => { setActiveTab('voice'); resetManualState(); resetPhotoState(); }} className={`px-4 py-2 text-sm font-semibold flex items-center space-x-2 transition-all duration-300 ${activeTab === 'voice' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-primary'}`}>
                <MicIcon className="w-4 h-4" />
                <span>Voice</span>
            </button>
            <button onClick={() => { setActiveTab('manual'); resetVoiceState(); resetPhotoState(); }} className={`px-4 py-2 text-sm font-semibold flex items-center space-x-2 transition-all duration-300 ${activeTab === 'manual' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-primary'}`}>
                <PencilIcon className="w-4 h-4" />
                <span>Manual</span>
            </button>
            <button onClick={() => { setActiveTab('photo'); resetVoiceState(); resetManualState(); }} className={`px-4 py-2 text-sm font-semibold flex items-center space-x-2 transition-all duration-300 ${activeTab === 'photo' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-primary'}`}>
                <CameraIcon className="w-4 h-4" />
                <span>Photo</span>
            </button>
        </div>

        {activeTab === 'voice' && renderVoiceContent()}
        {activeTab === 'manual' && renderManualContent()}
        {activeTab === 'photo' && renderPhotoContent()}
      </div>
    </div>
  );
};

export default GlucoseLogModal;