
import React from 'react';
import { User } from '../../../types';
import { ArrowUturnLeftIcon, ArrowLeftOnRectangleIcon, CurrencyDollarIcon, WrenchScrewdriverIcon, ServerStackIcon, ChartPieIcon } from '../../../components/icons';
import { Logo } from '../../../components/Logo';
import { useTranslation } from '../../../lib/i18n';
import { LanguageSwitcher } from '../../../components/LanguageSwitcher';
import { ThemeSwitcher } from '../../../components/ThemeSwitcher';

export type ActiveView = 'sales' | 'repairs' | 'inventory' | 'reports';

interface HeaderProps {
    currentUser: User;
    onLogout: () => void;
    onBackToApps: () => void;
    activeView: ActiveView;
    onNavigate: (view: ActiveView) => void;
    theme: string;
    setTheme: (theme: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onBackToApps, activeView, onNavigate, theme, setTheme }) => {
    const { t } = useTranslation();

    const navItems = [
        { id: 'sales', label: t('repairShop.header.sales'), icon: <CurrencyDollarIcon className="w-5 h-5" /> },
        { id: 'repairs', label: t('repairShop.header.repairs'), icon: <WrenchScrewdriverIcon className="w-5 h-5" /> },
        { id: 'inventory', label: t('repairShop.header.inventory'), icon: <ServerStackIcon className="w-5 h-5" /> },
        { id: 'reports', label: t('repairShop.header.reports'), icon: <ChartPieIcon className="w-5 h-5" /> },
    ];
    
    return (
        <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-40 border-b border-gray-200 dark:border-slate-700">
            <div className="container mx-auto px-2 sm:px-4">
                {/* Top Row: Logo, Controls */}
                <div className="flex justify-between items-center py-2 md:py-3">
                    <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
                        <button onClick={onBackToApps} className="p-1.5 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700" title={t('general.backToApps')}>
                            <ArrowUturnLeftIcon className="w-5 h-5" />
                        </button>
                        <div className="flex items-center">
                            <Logo className="h-20 w-20 mr-3" />
                            <h1 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white truncate max-w-[150px] sm:max-w-none">{t('repairShop.header.title')}</h1>
                        </div>
                    </div>

                    {/* Desktop Navigation (Hidden on mobile/tablet < lg) */}
                    <div className="hidden lg:flex items-center space-x-1 lg:space-x-2 mx-4">
                         {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id as ActiveView)}
                                className={`inline-flex items-center px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    activeView === item.id 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                }`}
                            >
                                <span className="mr-2">{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                         ))}
                    </div>

                    <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 flex-shrink-0">
                        <LanguageSwitcher />
                        <ThemeSwitcher theme={theme} setTheme={setTheme} />
                        <div className="text-right hidden lg:block">
                            <span className="text-sm text-gray-600 dark:text-slate-300 truncate block max-w-[100px]">
                                {t('general.welcome', { name: currentUser.name.split(' ')[0] })}
                            </span>
                        </div>
                        <button
                            onClick={onLogout}
                            title={t('appSelector.logout')}
                            className="inline-flex items-center justify-center p-2 sm:px-3 sm:py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <ArrowLeftOnRectangleIcon className="w-4 h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">{t('appSelector.logout')}</span>
                        </button>
                    </div>
                </div>

                {/* Mobile/Tablet Navigation (Visible on screens < lg) */}
                <div className="lg:hidden border-t border-gray-200 dark:border-slate-700 py-2">
                    <nav className="flex justify-between items-center">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id as ActiveView)}
                                className={`flex flex-col items-center justify-center px-2 py-1 rounded-md text-[10px] sm:text-xs font-medium transition-colors flex-1 ${
                                    activeView === item.id 
                                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' 
                                    : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                                }`}
                            >
                                {item.icon}
                                <span className="mt-1 text-center leading-tight">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
};
