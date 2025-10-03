import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';
import { DropletIcon, WeightScaleIcon, XIcon, PillIcon } from './Icons';

interface SettingsPageProps {
  glucoseUnit: 'mg/dL' | 'mmol/L';
  onGlucoseUnitChange: (unit: 'mg/dL' | 'mmol/L') => void;
  onOpenMyMedications?: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ glucoseUnit, onGlucoseUnitChange, onOpenMyMedications }) => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary dark:text-slate-100 mb-8">Settings</h1>

        {/* Preferences Section */}
        <section className="bg-white dark:bg-slate-800 rounded-card shadow-card p-6 mb-6 border border-border-light dark:border-slate-700">
          <h2 className="text-xl font-semibold text-text-primary dark:text-slate-100 mb-6">Preferences</h2>

          {/* Dark Mode */}
          <div className="flex items-center justify-between py-4 border-b border-border-light dark:border-slate-700">
            <div>
              <h3 className="font-medium text-text-primary dark:text-slate-100">Dark Mode</h3>
              <p className="text-sm text-text-secondary dark:text-slate-400">Toggle between light and dark theme</p>
            </div>
            <DarkModeToggle />
          </div>

          {/* Glucose Unit */}
          <div className="flex items-center justify-between py-4 border-b border-border-light dark:border-slate-700">
            <div className="flex items-center">
              <DropletIcon className="w-5 h-5 text-accent-blue dark:text-primary-light mr-3" />
              <div>
                <h3 className="font-medium text-text-primary dark:text-slate-100">Glucose Unit</h3>
                <p className="text-sm text-text-secondary dark:text-slate-400">Choose your preferred unit</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onGlucoseUnitChange('mg/dL')}
                className={`px-4 py-2 rounded-button font-medium transition-all duration-300 ${
                  glucoseUnit === 'mg/dL'
                    ? 'bg-primary dark:bg-primary-light text-white'
                    : 'bg-white dark:bg-slate-700 text-text-secondary dark:text-slate-400 border border-border-light dark:border-slate-600 hover:border-primary dark:hover:border-primary-light'
                }`}
              >
                mg/dL
              </button>
              <button
                type="button"
                onClick={() => onGlucoseUnitChange('mmol/L')}
                className={`px-4 py-2 rounded-button font-medium transition-all duration-300 ${
                  glucoseUnit === 'mmol/L'
                    ? 'bg-primary dark:bg-primary-light text-white'
                    : 'bg-white dark:bg-slate-700 text-text-secondary dark:text-slate-400 border border-border-light dark:border-slate-600 hover:border-primary dark:hover:border-primary-light'
                }`}
              >
                mmol/L
              </button>
            </div>
          </div>

          {/* Weight Unit - Future feature */}
          <div className="flex items-center justify-between py-4 opacity-50">
            <div className="flex items-center">
              <WeightScaleIcon className="w-5 h-5 text-accent-orange dark:text-primary-light mr-3" />
              <div>
                <h3 className="font-medium text-text-primary dark:text-slate-100">Weight Unit</h3>
                <p className="text-sm text-text-secondary dark:text-slate-400">Coming soon</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled
                className="px-4 py-2 rounded-button font-medium bg-white dark:bg-slate-700 text-text-secondary dark:text-slate-400 border border-border-light dark:border-slate-600 cursor-not-allowed"
              >
                kg
              </button>
              <button
                type="button"
                disabled
                className="px-4 py-2 rounded-button font-medium bg-white dark:bg-slate-700 text-text-secondary dark:text-slate-400 border border-border-light dark:border-slate-600 cursor-not-allowed"
              >
                lbs
              </button>
            </div>
          </div>
        </section>

        {/* Health Data Section */}
        {onOpenMyMedications && (
          <section className="bg-white dark:bg-slate-800 rounded-card shadow-card p-6 mb-6 border border-border-light dark:border-slate-700">
            <h2 className="text-xl font-semibold text-text-primary dark:text-slate-100 mb-6">Health Data</h2>

            {/* My Medications */}
            <div className="py-4">
              <button
                type="button"
                onClick={onOpenMyMedications}
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-700 border border-border-light dark:border-slate-600 rounded-button hover:border-primary dark:hover:border-primary-light transition-all duration-300"
              >
                <div className="flex items-center">
                  <PillIcon className="w-5 h-5 text-accent-purple dark:text-primary-light mr-3" />
                  <div className="text-left">
                    <h3 className="font-medium text-text-primary dark:text-slate-100">My Medications</h3>
                    <p className="text-sm text-text-secondary dark:text-slate-400">Manage your medication list</p>
                  </div>
                </div>
                <span className="text-text-light dark:text-slate-500">→</span>
              </button>
            </div>
          </section>
        )}

        {/* Account Section */}
        <section className="bg-white dark:bg-slate-800 rounded-card shadow-card p-6 border border-border-light dark:border-slate-700">
          <h2 className="text-xl font-semibold text-text-primary dark:text-slate-100 mb-6">Account</h2>

          {/* Logout */}
          <div className="py-4">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-button transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Logout
            </button>
          </div>
        </section>

        {/* App Info */}
        <div className="mt-8 text-center text-text-light dark:text-slate-500 text-sm">
          <p>Type2Lifestyles v1.0.0</p>
          <p className="mt-1">Health tracking made simple</p>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-modal shadow-modal w-full max-w-md p-6 relative animate-fade-in-up">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-4 right-4 text-text-light dark:text-slate-400 hover:text-primary dark:hover:text-primary-light transition-all duration-300"
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
                className="flex-1 bg-white dark:bg-slate-700 border-2 border-border-light dark:border-slate-600 text-text-primary dark:text-slate-100 font-semibold py-3 rounded-button hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-button transition-all duration-300"
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

