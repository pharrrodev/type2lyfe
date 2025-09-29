import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Medication, UserMedication } from '../types';
import { parseMedicationFromText } from '../src/services/api';
import { MicIcon, XIcon, PillIcon, SquareIcon } from './Icons';
import Spinner from './Spinner';
// FIX: The 'LiveSession' type is not exported from '@google/genai'. It has been removed.
import { GoogleGenAI, Modality, Blob } from '@google/genai';


interface MedicationLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMedication: (medication: Omit<Medication, 'id'>) => void;
  userMedications: UserMedication[];
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

type VoiceStep = 'say_medication' | 'confirm';

const MedicationLogModal: React.FC<MedicationLogModalProps> = ({ isOpen, onClose, onAddMedication, userMedications }) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'manual'>('voice');
  
  // Voice state
  const [voiceStep, setVoiceStep] = useState<VoiceStep>('say_medication');
  const [medData, setMedData] = useState<{ med: UserMedication | null, quantity: number, transcript: string }>({ med: null, quantity: 0, transcript: '' });
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  // Real-time audio state
  // FIX: Use 'any' for the session ref type as a workaround for the removed 'LiveSession' export from the SDK.
  const sessionRef = useRef<any | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);


  // Manual state
  const [selectedMedId, setSelectedMedId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (userMedications.length > 0 && !selectedMedId) {
        console.log('🔍 Setting initial medication:', userMedications[0]);
        setSelectedMedId(userMedications[0].id.toString());
    }
  }, [userMedications, selectedMedId]);

  const handleParseMedication = useCallback(async (text: string) => {
    setIsLoading(true);
    setError('');
    try {
        const result = await parseMedicationFromText(text, userMedications);
        if (result) {
            setMedData({ med: result.matchedMed, quantity: result.quantity, transcript: text });
            setVoiceStep('confirm');
        } else {
            setError(`Couldn't understand. Please try saying "Metformin, 1 pill".`);
        }
    } catch (e) {
      setError('An error occurred. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [userMedications]);

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

    setIsListening(true);
    setError('');
    setCurrentTranscript('');

    if (!aiRef.current) {
        aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY! });
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
                        setCurrentTranscript(prev => prev + text);
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
  }, [isListening, stopListening]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  useEffect(() => {
      if (!isListening && currentTranscript) {
          handleParseMedication(currentTranscript);
      }
  }, [isListening, currentTranscript, handleParseMedication]);
  

  const resetVoiceState = useCallback(() => {
    setVoiceStep('say_medication');
    setMedData({ med: null, quantity: 0, transcript: '' });
    setCurrentTranscript('');
    setError('');
    setIsLoading(false);
    stopListening();
  }, [stopListening]);

  const resetManualState = useCallback(() => {
    if (userMedications.length > 0) {
        setSelectedMedId(userMedications[0].id.toString());
    }
    setQuantity(1);
    setError('');
  }, [userMedications]);

  useEffect(() => {
    if (!isOpen) {
      resetVoiceState();
      resetManualState();
    }
  }, [isOpen, resetVoiceState, resetManualState]);

    const handleToggleListen = () => {
      if (isListening) {
          stopListening();
      } else {
          startListening();
      }
    };

  const handleVoiceSubmit = () => {
    if (medData.med && medData.quantity > 0) {
        onAddMedication({
            name: medData.med.name,
            dosage: medData.med.dosage,
            unit: medData.med.unit,
            quantity: medData.quantity,
            timestamp: new Date().toISOString(),
            transcript: medData.transcript,
            source: 'voice',
        });
        onClose();
    }
  };

  const handleManualSubmit = async () => {
    console.log('🔍 MedicationModal: handleManualSubmit called');
    console.log('🔍 selectedMedId:', selectedMedId);
    console.log('🔍 quantity:', quantity);
    console.log('🔍 userMedications:', userMedications);

    const selectedMed = userMedications.find(m => m.id === selectedMedId || m.id.toString() === selectedMedId);
    console.log('🔍 selectedMed:', selectedMed);
    console.log('🔍 userMedications IDs:', userMedications.map(m => ({ id: m.id, type: typeof m.id })));

    if (selectedMed && quantity > 0) {
        console.log('✅ Validation passed, submitting medication');
        setError('');
        setIsLoading(true);

        try {
            await onAddMedication({
                name: selectedMed.name,
                dosage: selectedMed.dosage,
                unit: selectedMed.unit,
                quantity: quantity,
                timestamp: new Date().toISOString(),
                source: 'manual',
            });
            console.log('🔍 MedicationModal: Medication submitted successfully, closing modal');
            onClose();
        } catch (error) {
            console.error('🔍 MedicationModal: Error submitting medication:', error);
            setError('Failed to save medication log. Please try again.');
        } finally {
            setIsLoading(false);
        }
    } else {
        console.log('❌ Validation failed');
        if (!selectedMed) {
            console.log('❌ No medication selected');
            setError("Please select a medication.");
        } else if (quantity <= 0) {
            console.log('❌ Invalid quantity');
            setError("Please enter a valid quantity (1 or more).");
        } else {
            setError("Please select a valid medication and quantity.");
        }
    }
  };

  if (!isOpen) return null;

  if (userMedications.length === 0) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-700">
                    <XIcon className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-3 mb-4">
                    <PillIcon className="w-7 h-7 text-purple-600" />
                    <h2 className="text-2xl font-bold text-slate-800">Log Medication</h2>
                </div>
                <div className="text-center py-4">
                    <p className="text-slate-600">To log medication, you first need to add your medications to the app.</p>
                    <p className="text-sm text-slate-500 mt-2">Click the settings icon in the header to manage your medications.</p>
                </div>
                <button onClick={onClose} className="mt-4 w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition-colors">
                    Got it
                </button>
            </div>
        </div>
    );
  }

  const renderVoiceContent = () => (
    <div className="min-h-[260px]">
        {voiceStep === 'say_medication' && (
            <div className="text-center">
                <p className="text-slate-600 mb-4">{isListening ? 'Tap icon to stop.' : 'Tap icon and say the medication and quantity.'}</p>
                <button 
                    onClick={handleToggleListen}
                    disabled={isLoading}
                    className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-red-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'} disabled:bg-slate-400`}
                >
                    {isLoading ? <Spinner /> : (isListening ? <SquareIcon className="w-7 h-7" /> : <MicIcon className="w-8 h-8" />)}
                </button>
                 <p className="text-slate-700 mt-4 min-h-[48px] px-2">{currentTranscript || (isListening ? <span className="text-slate-500">Listening...</span> : <span className="text-slate-400">e.g., "Metformin, 1 pill"</span>)}</p>
            </div>
        )}
        {voiceStep === 'confirm' && medData.med && (
            <div className="p-4 bg-slate-100 rounded-lg">
                <div className="text-center">
                    <p className="text-slate-600">Is this correct?</p>
                    <p className="text-xl font-bold text-slate-800 my-2">{medData.med.name}</p>
                    <p className="text-2xl font-bold text-blue-600">{medData.quantity} <span className="text-lg font-normal">x {medData.med.dosage}{medData.med.unit}</span></p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                    <button onClick={resetVoiceState} className="w-full bg-slate-200 text-slate-700 font-semibold py-3 rounded-md hover:bg-slate-300 transition-colors">
                        Start Over
                    </button>
                    <button onClick={handleVoiceSubmit} className="w-full bg-green-600 text-white font-semibold py-3 rounded-md hover:bg-green-700 transition-colors">
                        Confirm & Save
                    </button>
                </div>
            </div>
        )}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
  );

  const renderManualContent = () => (
    <div className="space-y-4 min-h-[260px]">
        <div>
            <label htmlFor="medication-select" className="block text-sm font-medium text-slate-700">Medication</label>
            <select
                id="medication-select"
                value={selectedMedId}
                onChange={(e) => {
                    setSelectedMedId(e.target.value);
                    setError(''); // Clear error when user changes selection
                }}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white"
            >
                {userMedications.map(med => (
                    <option key={med.id} value={med.id}>
                        {med.name} ({med.dosage}{med.unit})
                    </option>
                ))}
            </select>
        </div>
        <div>
            <label htmlFor="medication-quantity" className="block text-sm font-medium text-slate-700">Quantity</label>
            <input
                type="number"
                id="medication-quantity"
                value={quantity}
                onChange={(e) => {
                    const value = e.target.value;
                    setError(''); // Clear error when user changes quantity
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
                min="1"
                className="mt-1 block w-full bg-white text-slate-900 placeholder:text-slate-400 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            />
        </div>
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <button
            onClick={handleManualSubmit}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
            {isLoading ? 'Saving...' : 'Save Log'}
        </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-700">
          <XIcon className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-3 mb-4">
            <PillIcon className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-slate-800">Log Medication</h2>
        </div>
        
        <div className="flex border-b border-slate-200 mb-4">
            <button onClick={() => { setActiveTab('voice'); resetManualState(); }} className={`px-4 py-2 text-sm font-medium ${activeTab === 'voice' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                Voice Log
            </button>
            <button onClick={() => { setActiveTab('manual'); resetVoiceState(); }} className={`px-4 py-2 text-sm font-medium ${activeTab === 'manual' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                Manual Log
            </button>
        </div>

        {activeTab === 'voice' ? renderVoiceContent() : renderManualContent()}
      </div>
    </div>
  );
};

export default MedicationLogModal;