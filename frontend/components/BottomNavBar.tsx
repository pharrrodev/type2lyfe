import React from 'react';
import { ChartBarIcon, ListChecksIcon, CalendarDaysIcon } from './Icons';
import { Page } from '../src/MainApp';

interface BottomNavBarProps {
    activePage: Page;
    onNavigate: (page: Page) => void;
}

const NavButton: React.FC<{
    page: Page;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ page, label, icon, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-full pt-3 pb-2 transition-all duration-300 ${
                isActive
                    ? 'text-primary dark:text-primary-light'
                    : 'text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary-light'
            }`}
        >
            {icon}
            <span className="text-xs mt-1 font-medium">{label}</span>
        </button>
    );
};


const BottomNavBar: React.FC<BottomNavBarProps> = ({ activePage, onNavigate }) => {
    return (
        <nav className="flex-shrink-0 bg-white dark:bg-slate-800 border-t border-border-light dark:border-slate-700">
            <div className="container mx-auto flex justify-around">
                <NavButton
                    page="dashboard"
                    label="Dashboard"
                    icon={<ChartBarIcon className="w-6 h-6" />}
                    isActive={activePage === 'dashboard'}
                    onClick={() => onNavigate('dashboard')}
                />
                <NavButton
                    page="activity"
                    label="Activity"
                    icon={<ListChecksIcon className="w-6 h-6" />}
                    isActive={activePage === 'activity'}
                    onClick={() => onNavigate('activity')}
                />
                <NavButton
                    page="history"
                    label="History"
                    icon={<CalendarDaysIcon className="w-6 h-6" />}
                    isActive={activePage === 'history'}
                    onClick={() => onNavigate('history')}
                />
            </div>
        </nav>
    );
};

export default BottomNavBar;