
import React from 'react';
import { ManagedUser } from '../types';
import { ArrowLeftOnRectangleIcon, ArrowUturnLeftIcon } from '../../../components/icons';
import { useTranslation } from '../../../lib/i18n';
import { LanguageSwitcher } from '../../../components/LanguageSwitcher';
import { ThemeSwitcher } from '../../../components/ThemeSwitcher';

interface DashboardHeaderProps {
    user?: ManagedUser;
    onLogout: () => void;
    onBackToApps: () => void;
    theme: string;
    setTheme: (theme: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, onLogout, onBackToApps, theme, setTheme }) => {
    const { t } = useTranslation();

    return (
        <header className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center overflow-hidden">
                        <button onClick={onBackToApps} className="p-1.5 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 mr-2 sm:mr-4 flex-shrink-0" title={t('general.backToApps')}>
                            <ArrowUturnLeftIcon className="w-5 h-5" />
                        </button>
                        <div className="flex items-baseline space-x-4 overflow-hidden">
                            <h1 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white truncate">{t('rolePermissions.header')}</h1>
                            <p className="text-sm text-gray-600 dark:text-slate-400 hidden lg:block truncate">
                                {t('general.welcome', { name: user?.fullName || 'Admin' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0 ml-2">
                        <LanguageSwitcher />
                         <ThemeSwitcher theme={theme} setTheme={setTheme} />
                         <button
                            onClick={onLogout}
                            title={t('appSelector.logout')}
                            className="inline-flex items-center justify-center p-2 sm:px-3 sm:py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-slate-200 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-100 dark:focus:ring-offset-slate-800"
                        >
                            <ArrowLeftOnRectangleIcon className="w-5 h-5 sm:mr-2" />
                            <span className="hidden sm:inline">{t('appSelector.logout')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
