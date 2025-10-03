import React, { useState } from 'react';
import { XIcon, CalendarIcon, ClockIcon } from './Icons';

interface DateTimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (timestamp: Date) => void;
}

const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({ isOpen, onClose, onContinue }) => {
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(now.toISOString().split('T')[0]); // YYYY-MM-DD
  const [selectedTime, setSelectedTime] = useState(
    `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  ); // HH:MM

  const handleContinue = () => {
    // Combine date and time into a single Date object
    const timestamp = new Date(`${selectedDate}T${selectedTime}`);
    onContinue(timestamp);
  };

  const handleQuickSelect = (hoursAgo: number) => {
    const timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    setSelectedDate(timestamp.toISOString().split('T')[0]);
    setSelectedTime(
      `${String(timestamp.getHours()).padStart(2, '0')}:${String(timestamp.getMinutes()).padStart(2, '0')}`
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-modal shadow-modal w-full max-w-md p-6 relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-light dark:text-slate-400 hover:text-primary dark:hover:text-primary-light transition-all duration-300"
        >
          <XIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-text-primary dark:text-slate-100 mb-6">
          When did this happen?
        </h2>

        {/* Quick Select Buttons */}
        <div className="mb-6">
          <p className="text-sm text-text-secondary dark:text-slate-400 mb-3">Quick select:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickSelect(1)}
              className="px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-primary/30 dark:border-primary-light/30 rounded-button hover:bg-primary/10 dark:hover:bg-primary-light/10 transition-all duration-300 text-text-primary dark:text-slate-100"
            >
              1 hour ago
            </button>
            <button
              onClick={() => handleQuickSelect(2)}
              className="px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-primary/30 dark:border-primary-light/30 rounded-button hover:bg-primary/10 dark:hover:bg-primary-light/10 transition-all duration-300 text-text-primary dark:text-slate-100"
            >
              2 hours ago
            </button>
            <button
              onClick={() => handleQuickSelect(3)}
              className="px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-primary/30 dark:border-primary-light/30 rounded-button hover:bg-primary/10 dark:hover:bg-primary-light/10 transition-all duration-300 text-text-primary dark:text-slate-100"
            >
              3 hours ago
            </button>
          </div>
        </div>

        {/* Date Picker */}
        <div className="mb-4">
          <label className="flex items-center text-sm font-medium text-text-primary dark:text-slate-100 mb-2">
            <CalendarIcon className="w-5 h-5 mr-2 text-primary dark:text-primary-light" />
            Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={now.toISOString().split('T')[0]} // Can't select future dates
            className="w-full px-4 py-3 border border-primary/30 dark:border-primary-light/30 rounded-button focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light bg-white dark:bg-slate-700 text-text-primary dark:text-slate-100"
          />
        </div>

        {/* Time Picker */}
        <div className="mb-6">
          <label className="flex items-center text-sm font-medium text-text-primary dark:text-slate-100 mb-2">
            <ClockIcon className="w-5 h-5 mr-2 text-primary dark:text-primary-light" />
            Time
          </label>
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full px-4 py-3 border border-primary/30 dark:border-primary-light/30 rounded-button focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light bg-white dark:bg-slate-700 text-text-primary dark:text-slate-100"
          />
        </div>

        {/* Preview */}
        <div className="mb-6 p-3 bg-primary/5 dark:bg-primary-light/10 rounded-card border border-primary/20 dark:border-primary-light/20">
          <p className="text-sm text-text-secondary dark:text-slate-400">Selected time:</p>
          <p className="text-lg font-semibold text-text-primary dark:text-slate-100">
            {new Date(`${selectedDate}T${selectedTime}`).toLocaleString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full bg-gradient-to-br from-primary to-primary-dark dark:from-primary-light dark:to-primary text-white font-semibold py-3 rounded-button hover:shadow-fab transition-all duration-300"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default DateTimePickerModal;

