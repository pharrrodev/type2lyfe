import React from 'react';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon,
  position = 'bottom-right',
  className = '',
}) => {
  // Position styles
  const positionStyles = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
  };

  // Base styles
  const baseStyles = 'fixed w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-fab flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-50';

  const combinedClassName = `${baseStyles} ${positionStyles[position]} ${className}`.trim();

  return (
    <button
      onClick={onClick}
      className={combinedClassName}
      aria-label="Floating action button"
    >
      {icon || (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )}
    </button>
  );
};

export default FloatingActionButton;

