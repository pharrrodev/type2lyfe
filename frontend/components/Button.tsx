import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Base styles
  const baseStyles = 'font-semibold rounded-lg transition-all duration-300 flex items-center justify-center';

  // Variant styles
  const variantStyles = {
    primary: 'bg-primary hover:bg-primary-dark text-white active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-card border-2 border-primary text-primary hover:bg-primary hover:text-white active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
    danger: 'bg-danger hover:bg-red-600 text-white active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
    ghost: 'bg-transparent hover:bg-background text-text-primary active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`.trim();

  return (
    <button
      className={combinedClassName}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

