import React from 'react';

export type TabItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
};

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex space-x-1 bg-bg-light dark:bg-slate-900 p-1 rounded-xl border-2 border-border dark:border-slate-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
            ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-md'
                : 'text-text-secondary dark:text-slate-400 hover:text-text-primary dark:hover:text-slate-200 hover:bg-card dark:hover:bg-slate-800'
            }
          `}
        >
          {tab.icon && <span className="w-5 h-5">{tab.icon}</span>}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;

