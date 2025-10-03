import React from 'react';
import Type2LifestylesLogo from './Type2LifestylesLogo';
import DarkModeToggle from './DarkModeToggle';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10 border-b border-border-light dark:border-slate-700">
      <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Type2LifestylesLogo size="md" iconOnly />
          <h1 className="text-xl font-semibold tracking-tight leading-tight">
            <span className="text-primary dark:text-primary-light">Type2</span>
            <span className="text-accent-blue dark:text-accent-blue-light">Lifestyles</span>
          </h1>
        </div>
        <div className="flex items-center space-x-2">
            <DarkModeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;