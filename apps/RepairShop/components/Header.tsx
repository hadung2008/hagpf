import React from 'react';
import { User } from '../../../types';
import { ArrowUturnLeftIcon, ArrowLeftOnRectangleIcon, CurrencyDollarIcon, WrenchScrewdriverIcon, ServerStackIcon, ChartPieIcon } from '../../../components/icons';
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
        { id: 'sales', label: t('repairShop.header.sales'), icon: <CurrencyDollarIcon className="w-5 h-5 mr-2" /> },
        { id: 'repairs', label: t('repairShop.header.repairs'), icon: <WrenchScrewdriverIcon className="w-5 h-5 mr-2" /> },
        { id: 'inventory', label: t('repairShop.header.inventory'), icon: <ServerStackIcon className="w-5 h-5 mr-2" /> },
        { id: 'reports', label: t('repairShop.header.reports'), icon: <ChartPieIcon className="w-5 h-5 mr-2" /> },
    ];
    
    return (
        <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-40 border-b border-gray-200 dark:border-slate-700">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-3">
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-4">
                            <button onClick={onBackToApps} className="p-1.5 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700" title={t('general.backToApps')}>
                                <ArrowUturnLeftIcon className="w-5 h-5" />
                            </button>
                            <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('repairShop.header.title')}</h1>
                        </div>
                        <nav className="hidden md:flex items-center space-x-2">
                             {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => onNavigate(item.id as ActiveView)}
                                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activeView === item.id 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                             ))}
                        </nav>
                    </div>
                    <div className="flex items-center space-x-4">
                        <LanguageSwitcher />
                        <ThemeSwitcher theme={theme} setTheme={setTheme} />
                        <div className="text-right">
                            <span className="text-sm text-gray-600 dark:text-slate-300">
                                {t('general.welcome', { name: currentUser.name.split(' ')[0] })}
                            </span>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{t(`enums.userRoles.${currentUser.role}`)}</p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-1.5" />
                            {t('appSelector.logout')}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};