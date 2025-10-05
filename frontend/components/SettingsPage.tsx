import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';
import ExportButton from './ExportButton';
import { DropletIcon, WeightScaleIcon, XIcon, PillIcon } from './Icons';
import { GlucoseReading, Meal, Medication, WeightReading, BloodPressureReading } from '../types';

interface SettingsPageProps {
  glucoseUnit: 'mg/dL' | 'mmol/L';
  onGlucoseUnitChange: (unit: 'mg/dL' | 'mmol/L') => void;
  weightUnit: 'kg' | 'lbs';
  onWeightUnitChange: (unit: 'kg' | 'lbs') => void;
  onOpenMyMedications?: () => void;
  glucoseReadings: GlucoseReading[];
  meals: Meal[];
  medications: Medication[];
  weightReadings: WeightReading[];
  bloodPressureReadings: BloodPressureReading[];
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  glucoseUnit,
  onGlucoseUnitChange,
  weightUnit,
  onWeightUnitChange,
  onOpenMyMedications,
  glucoseReadings,
  meals,
  medications,
  weightReadings,
  bloodPressureReadings
}) => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-lg sm:text-2xl font-bold text-text-primary dark:text-slate-100 mb-2 sm:mb-4 mt-2 sm:mt-0">Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 pb-2">
          {/* Preferences Section */}
          <section className="bg-card dark:bg-slate-800 rounded-xl shadow-card p-2.5 sm:p-4 border border-border dark:border-slate-700">
            <h2 className="text-sm sm:text-lg font-semibold text-text-primary dark:text-slate-100 mb-2">Preferences</h2>

            {/* Dark Mode */}
            <div className="flex items-center justify-between py-1.5 border-b border-border dark:border-slate-700">
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-text-primary dark:text-slate-100">Dark Mode</h3>
              </div>
              <DarkModeToggle />
            </div>

            {/* Glucose Unit */}
            <div className="flex items-center justify-between py-1.5 border-b border-border dark:border-slate-700">
              <div className="flex items-center">
                <DropletIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-info dark:text-primary mr-1.5" />
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-text-primary dark:text-slate-100">Glucose Unit</h3>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onGlucoseUnitChange('mg/dL')}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs rounded-lg font-medium transition-all duration-300 ${
                    glucoseUnit === 'mg/dL'
                      ? 'bg-primary dark:bg-primary text-white'
                      : 'bg-card dark:bg-slate-700 text-text-secondary dark:text-slate-400 border border-border dark:border-slate-600 hover:border-primary dark:hover:border-primary'
                  }`}
                >
                  mg/dL
                </button>
                <button
                  type="button"
                  onClick={() => onGlucoseUnitChange('mmol/L')}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs rounded-lg font-medium transition-all duration-300 ${
                    glucoseUnit === 'mmol/L'
                      ? 'bg-primary dark:bg-primary text-white'
                      : 'bg-card dark:bg-slate-700 text-text-secondary dark:text-slate-400 border border-border dark:border-slate-600 hover:border-primary dark:hover:border-primary'
                  }`}
                >
                  mmol/L
                </button>
              </div>
            </div>

            {/* Weight Unit */}
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center">
                <WeightScaleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-warning dark:text-primary mr-1.5" />
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-text-primary dark:text-slate-100">Weight Unit</h3>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onWeightUnitChange('kg')}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs rounded-lg font-medium transition-all duration-300 ${
                    weightUnit === 'kg'
                      ? 'bg-primary dark:bg-primary text-white'
                      : 'bg-card dark:bg-slate-700 text-text-secondary dark:text-slate-400 border border-border dark:border-slate-600 hover:border-primary dark:hover:border-primary'
                  }`}
                >
                  kg
                </button>
                <button
                  type="button"
                  onClick={() => onWeightUnitChange('lbs')}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs rounded-lg font-medium transition-all duration-300 ${
                    weightUnit === 'lbs'
                      ? 'bg-primary dark:bg-primary text-white'
                      : 'bg-card dark:bg-slate-700 text-text-secondary dark:text-slate-400 border border-border dark:border-slate-600 hover:border-primary dark:hover:border-primary'
                  }`}
                >
                  lbs
                </button>
              </div>
            </div>
          </section>

          {/* Health Data Section */}
          {onOpenMyMedications && (
            <section className="bg-card dark:bg-slate-800 rounded-xl shadow-card p-2.5 sm:p-4 border border-border dark:border-slate-700">
              <h2 className="text-sm sm:text-lg font-semibold text-text-primary dark:text-slate-100 mb-2">Health Data</h2>

              {/* Export Data */}
              <div className="mb-2">
                <ExportButton
                  glucoseReadings={glucoseReadings}
                  meals={meals}
                  medications={medications}
                  weightReadings={weightReadings}
                  bloodPressureReadings={bloodPressureReadings}
                />
              </div>

              {/* My Medications */}
              <button
                type="button"
                onClick={onOpenMyMedications}
                className="w-full flex items-center justify-between p-2 sm:p-3 bg-card dark:bg-slate-700 border border-border dark:border-slate-600 rounded-lg hover:border-primary dark:hover:border-primary transition-all duration-300"
              >
                <div className="flex items-center">
                  <PillIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-purple dark:text-primary mr-1.5" />
                  <div className="text-left">
                    <h3 className="text-xs sm:text-sm font-medium text-text-primary dark:text-slate-100">My Medications</h3>
                  </div>
                </div>
                <span className="text-text-secondary dark:text-slate-500 text-sm">→</span>
              </button>
            </section>
          )}

          {/* Account Section */}
          <section className="bg-card dark:bg-slate-800 rounded-xl shadow-card p-2.5 sm:p-4 border border-border dark:border-slate-700">
            <h2 className="text-sm sm:text-lg font-semibold text-text-primary dark:text-slate-100 mb-2">Account</h2>

            {/* Logout */}
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md text-xs sm:text-sm"
            >
              Logout
            </button>
          </section>
        </div>

        {/* App Info */}
        <div className="mt-1 sm:mt-3 mb-1 text-center text-text-secondary dark:text-slate-500 text-xs">
          <p>Type2Lyfe v1.0.0</p>
          <div className="mt-2 flex justify-center gap-3">
            <a href="/privacy.html" target="_blank" className="text-primary dark:text-primary hover:underline">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="/terms.html" target="_blank" className="text-primary dark:text-primary hover:underline">
              Terms of Service
            </a>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-card dark:bg-slate-800 rounded-3xl shadow-modal w-full max-w-md p-6 relative animate-fade-in-up">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-4 right-4 text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-all duration-300"
              aria-label="Close"
            >
              <XIcon className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-text-primary dark:text-slate-100 mb-4">Confirm Logout</h2>
            <p className="text-text-secondary dark:text-slate-400 mb-6">
              Are you sure you want to logout? You'll need to login again to access your data.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-card dark:bg-slate-700 border-2 border-border dark:border-slate-600 text-text-primary dark:text-slate-100 font-semibold py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;

