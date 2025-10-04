import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  fullWidth = true,
  className = '',
  ...props
}) => {
  // Base input styles
  const baseInputStyles = 'px-4 py-3 bg-card border rounded-lg text-text-primary placeholder:text-text-secondary transition-all duration-300';

  // State styles
  const stateStyles = error
    ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
    : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20';

  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';

  const combinedInputClassName = `${baseInputStyles} ${stateStyles} ${widthStyles} ${className}`.trim();

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}
      <input
        className={combinedInputClassName}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-danger">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-text-secondary">{helperText}</p>
      )}
    </div>
  );
};

export default TextInput;

