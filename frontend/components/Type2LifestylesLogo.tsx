import React from 'react';

interface Type2LifestylesLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
}

const Type2LifestylesLogo: React.FC<Type2LifestylesLogoProps> = ({
  className = '',
  size = 'md',
  iconOnly = false
}) => {
  const sizeClasses = {
    sm: iconOnly ? 'h-6' : 'h-8',
    md: iconOnly ? 'h-8' : 'h-10',
    lg: iconOnly ? 'h-12' : 'h-16'
  };

  // Using the new Type2Lifestyles logo PNG with no background
  const logoPath = '/logo_no_background_main.png';

  if (iconOnly) {
    // For icon-only mode, we'll use the same logo but with smaller size
    // The logo already has the leaf and droplet design
    return (
      <img
        src={logoPath}
        alt="Type2Lifestyles Logo"
        className={`${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <img
      src={logoPath}
      alt="Type2Lifestyles"
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

export default Type2LifestylesLogo;

