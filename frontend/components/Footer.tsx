import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-border-light dark:border-slate-700 py-3">
      <div className="container mx-auto px-4 text-center">
        <p className="text-xs text-text-secondary dark:text-slate-400">
          Powered by <span className="text-primary dark:text-primary-light font-semibold">PharrroAI</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;

