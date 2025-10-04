import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
  border?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = true,
  border = true,
  onClick,
}) => {
  // Base styles
  const baseStyles = 'bg-card rounded-2xl transition-all duration-300';

  // Padding styles
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  // Shadow styles
  const shadowStyles = shadow ? 'shadow-card hover:shadow-card-hover' : '';

  // Border styles
  const borderStyles = border ? 'border border-border' : '';

  // Interactive styles
  const interactiveStyles = onClick ? 'cursor-pointer hover:scale-[1.02]' : '';

  const combinedClassName = `${baseStyles} ${paddingStyles[padding]} ${shadowStyles} ${borderStyles} ${interactiveStyles} ${className}`.trim();

  return (
    <div className={combinedClassName} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;

