import React from 'react';

interface Type2LyfeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Type2LyfeLogo: React.FC<Type2LyfeLogoProps> = ({
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-16'
  };

  // Using the new MAIN_LOGO.svg which includes both the icon and "Type2Lyfe" text
  const logoPath = '/MAIN_LOGO.svg';

  return (
    <img
      src={logoPath}
      alt="Type2Lyfe"
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

export default Type2LyfeLogo;

