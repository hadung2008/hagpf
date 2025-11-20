
import React from 'react';
import { User } from '../../../types';
import { PlusCircleIcon, ArrowLeftOnRectangleIcon, HomeIcon, DocumentTextIcon, Cog8ToothIcon, ArrowUturnLeftIcon } from '../../../components/icons';
import { Logo } from '../../../components/Logo';
import { useTranslation } from '../../../lib/i18n';
import { LanguageSwitcher } from '../../../components/LanguageSwitcher';
import { ThemeSwitcher } from '../../../components/ThemeSwitcher';

export type ActiveView = 'dashboard' | 'form-templates' | 'workflows';

interface HeaderProps {
    currentUser: User;
    onLogout: () => void;
    onBackToApps: () => void;
    activeView: ActiveView;
    onNavigate: (view: ActiveView) => void;
    onNewRequest: () => void;
    hasPermission: (key: string) => boolean;
    theme: string;
    setTheme: (theme: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onBackToApps, activeView, onNavigate, onNewRequest, hasPermission, theme, setTheme }) => {
    const { t } = useTranslation();
    
    const navItems = [
        { id: 'dashboard', label: t('approvalFlow.header.dashboard'), icon: <HomeIcon className="w-5 h-5" />, permission: 'approvalFlow.READ' },
        { id: 'form-templates', label: t('approvalFlow.header.formTemplates'), icon: <DocumentTextIcon className="w-5 h-5" />, permission: 'approvalFlow.templates.READ' },
        { id: 'workflows', label: t('approvalFlow.header.workflows'), icon: <Cog8ToothIcon className="w-5 h-5" />, permission: 'approvalFlow.workflows.READ' },
    ];
    
    return (
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-2 md:py-3">
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <button onClick={onBackToApps} className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0" title={t('general.backToApps')}>
                            <ArrowUturnLeftIcon className="w-5 h-5" />
                        </button>
                        <div className="flex items-center">
                            <Logo className="h-20 w-20 mr-2" />
                            <h1 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white truncate max-w-[150px] sm:max-w-none">{t('approvalFlow.header.title')}</h1>
                        </div>
                        
                        {/* Desktop Nav: Hidden on mobile and tablets (screens < lg) */}
                        <nav className="hidden lg:flex items-center space-x-1 lg:space-x-4 ml-4 lg:ml-8">
                             {navItems.filter(item => hasPermission(item.permission)).map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => onNavigate(item.id as ActiveView)}
                                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activeView === item.id 
                                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' 
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <span className="mr-2">{item.icon}</span>
                                    {item.label}
                                </button>
                             ))}
                        </nav>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                        {/* New Request Button - Desktop Only (lg+) */}
                        {hasPermission('approvalFlow.requests.CREATE') && (
                            <button
                                onClick={onNewRequest}
                                className="hidden lg:inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                title={t('approvalFlow.header.newRequest')}
                            >
                                <PlusCircleIcon className="w-5 h-5 mr-1.5" />
                                <span>{t('approvalFlow.header.newRequest')}</span>
                            </button>
                        )}
                        <LanguageSwitcher />
                        <ThemeSwitcher theme={theme} setTheme={setTheme} />
                        <div className="hidden lg:block">
                            <span className="text-sm text-gray-600 dark:text-gray-300 mr-4">
                                {t('general.welcome', { name: currentUser.name.split(' (')[0] })}
                            </span>
                        </div>
                        <button
                            onClick={onLogout}
                            className="inline-flex items-center justify-center p-2 sm:px-3 sm:py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            title={t('appSelector.logout')}
                        >
                            <ArrowLeftOnRectangleIcon className="w-5 h-5 sm:mr-1.5" />
                            <span className="hidden sm:inline">{t('appSelector.logout')}</span>
                        </button>
                    </div>
                </div>

                 {/* Mobile/Tablet Navigation: Visible on screens < lg */}
                 <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-2">
                    <nav className="flex justify-around items-center">
                        {navItems.filter(item => hasPermission(item.permission)).map(item => (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id as ActiveView)}
                                className={`flex flex-col items-center justify-center px-2 py-1 rounded-md text-[10px] sm:text-xs font-medium transition-colors flex-1 ${
                                    activeView === item.id 
                                    ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20' 
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                {item.icon}
                                <span className="mt-1 text-center leading-tight">{item.label}</span>
                            </button>
                        ))}
                        
                        {/* New Request Action for Mobile */}
                        {hasPermission('approvalFlow.requests.CREATE') && (
                            <button
                                onClick={onNewRequest}
                                className="flex flex-col items-center justify-center px-2 py-1 rounded-md text-[10px] sm:text-xs font-medium transition-colors flex-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                            >
                                <PlusCircleIcon className="w-5 h-5" />
                                <span className="mt-1 text-center leading-tight">{t('approvalFlow.header.newRequest')}</span>
                            </button>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};
