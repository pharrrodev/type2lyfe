import React, { useState, useRef, useEffect } from 'react';
import { Meal, GlucoseReading, FoodItem } from '../types';
import { analyzeMealFromImage } from '../src/services/api';
import { CameraIcon, UploadIcon, XIcon } from './Icons';
import Spinner from './Spinner';
import NutritionDisplay from './NutritionDisplay';

interface MealLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (meal: Omit<Meal, 'id'>) => Meal;
  onAddReading: (reading: Omit<GlucoseReading, 'id'>) => void;
  unit: 'mg/dL' | 'mmol/L';
  customTimestamp?: Date; // Optional: for late entries
}

const MealLogModal: React.FC<MealLogModalProps> = ({ isOpen, onClose, onAddMeal, onAddReading, unit, customTimestamp }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{ items: FoodItem[], total: { calories: number; protein: number; carbs: number; fat: number; sugar: number } } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [logPostMealGlucose, setLogPostMealGlucose] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setImageFile(null);
      setPreviewUrl(null);
      setAnalysisResult(null);
      setIsLoading(false);
      setError('');
      setLogPostMealGlucose(false);
    }
  }, [isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;

    setIsLoading(true);
    setError('');
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = async () => {
      try {
        const base64String = (reader.result as string).split(',')[1];
        const response = await analyzeMealFromImage(base64String, imageFile.type);
        const result = response.data;
        if (result) {
          setAnalysisResult(result);
        } else {
          setError("Couldn't analyze the meal photo. Please try another image.");
        }
      } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError('An error occurred during analysis.');
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

  const handleSubmit = () => {
    if (!analysisResult) return;

    const mealTimestamp = customTimestamp || new Date();

    // Photo is used only for analysis, not stored in database
    const newMeal = onAddMeal({
      timestamp: mealTimestamp.toISOString(),
      foodItems: analysisResult?.items || [],
      totalNutrition: analysisResult?.total || { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 },
      mealType: getMealType(mealTimestamp),
      source: 'photo_analysis',
    });

    if (logPostMealGlucose) {
      // Create a placeholder reading 2 hours later
      const postMealTime = new Date(mealTimestamp.getTime() + 2 * 60 * 60 * 1000);
      onAddReading({
        value: 0, // Placeholder value
        displayUnit: unit,
        context: 'after_meal',
        timestamp: postMealTime.toISOString(),
        source: 'meal_correlation',
        relatedMealId: newMeal.id,
        notes: 'Enter post-meal reading'
      });
    }

    onClose();
  };

  const getMealType = (date: Date): Meal['mealType'] => {
    const hour = date.getHours();
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch';
    if (hour >= 16 && hour < 21) return 'dinner';
    return 'snack';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-modal shadow-modal w-full max-w-lg p-6 relative animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-light hover:text-primary transition-all duration-300">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-text-primary mb-5">Log Meal</h2>

        {!previewUrl ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => {
                fileInputRef.current?.setAttribute('capture', 'environment');
                fileInputRef.current?.click();
            }} className="border-2 border-dashed border-primary/30 rounded-card p-8 text-center text-text-secondary hover:bg-primary/5 hover:border-primary transition-all duration-300 flex flex-col items-center justify-center">
                <CameraIcon className="w-10 h-10 mx-auto text-primary mb-2" />
                <span>Take Picture</span>
            </button>
            <button onClick={() => {
                fileInputRef.current?.removeAttribute('capture');
                fileInputRef.current?.click();
            }} className="border-2 border-dashed border-primary/30 rounded-card p-8 text-center text-text-secondary hover:bg-primary/5 hover:border-primary transition-all duration-300 flex flex-col items-center justify-center">
                <UploadIcon className="w-10 h-10 mx-auto text-primary mb-2" />
                <span>Upload Photo</span>
            </button>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        </div>
        ) : (
          <div className="mb-4">
            <img src={previewUrl} alt="Meal preview" className="rounded-lg w-full max-h-64 object-contain" />
          </div>
        )}

        {previewUrl && !analysisResult && (
          <button onClick={handleAnalyze} disabled={isLoading} className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-button hover:shadow-fab disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 transition-all duration-300 flex items-center justify-center">
            {isLoading ? <Spinner /> : 'Analyze Meal'}
          </button>
        )}

        {error && <p className="text-accent-pink mt-4 text-center">{error}</p>}

        {analysisResult && (
          <div className="mt-4 space-y-4">
            <NutritionDisplay
              items={analysisResult.items}
              total={analysisResult.total}
            />

            <div className="flex items-center">
              <input type="checkbox" id="log-glucose" checked={logPostMealGlucose} onChange={(e) => setLogPostMealGlucose(e.target.checked)} className="h-4 w-4 text-primary border-primary/30 rounded focus:ring-primary" />
              <label htmlFor="log-glucose" className="ml-2 block text-sm text-text-secondary">Remind me to log post-meal glucose in 2 hours</label>
            </div>

            <button onClick={handleSubmit} className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-button hover:shadow-fab transition-all duration-300">
              Confirm and Save Meal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealLogModal;
