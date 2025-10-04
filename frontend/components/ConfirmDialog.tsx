import React from 'react';
import { XIcon, AlertTriangleIcon } from './Icons';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: 'text-red-500 dark:text-red-400',
          iconBg: 'bg-red-50 dark:bg-red-900/20',
          confirmButton: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
        };
      case 'warning':
        return {
          icon: 'text-yellow-500 dark:text-yellow-400',
          iconBg: 'bg-yellow-50 dark:bg-yellow-900/20',
          confirmButton: 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700'
        };
      case 'info':
      default:
        return {
          icon: 'text-blue-500 dark:text-blue-400',
          iconBg: 'bg-blue-50 dark:bg-blue-900/20',
          confirmButton: 'bg-primary hover:bg-primary-dark dark:bg-primary dark:hover:bg-primary-dark'
        };
    }
  };

  const styles = getVariantStyles();

  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Dialog */}
      <div className="relative bg-card dark:bg-slate-800 rounded-2xl shadow-modal max-w-md w-full p-6 border-2 border-border dark:border-slate-700 animate-slide-in-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary dark:text-slate-400 hover:text-text-primary dark:hover:text-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <XIcon className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className={`${styles.iconBg} rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4`}>
          <AlertTriangleIcon className={`w-6 h-6 ${styles.icon}`} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-text-primary dark:text-slate-100 mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-text-secondary dark:text-slate-400 mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-text-primary dark:text-slate-100 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles.confirmButton}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

