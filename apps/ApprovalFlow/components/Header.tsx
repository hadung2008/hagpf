import React from 'react';
import { User } from '../../../types';
import { PlusCircleIcon, ArrowLeftOnRectangleIcon, HomeIcon, DocumentTextIcon, Cog8ToothIcon, ArrowUturnLeftIcon } from '../../../components/icons';
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
        { id: 'dashboard', label: t('approvalFlow.header.dashboard'), icon: <HomeIcon className="w-5 h-5 mr-2" />, permission: 'approvalFlow.READ' },
        { id: 'form-templates', label: t('approvalFlow.header.formTemplates'), icon: <DocumentTextIcon className="w-5 h-5 mr-2" />, permission: 'approvalFlow.templates.READ' },
        { id: 'workflows', label: t('approvalFlow.header.workflows'), icon: <Cog8ToothIcon className="w-5 h-5 mr-2" />, permission: 'approvalFlow.workflows.READ' },
    ];
    
    return (
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-3">
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-4">
                            <button onClick={onBackToApps} className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" title={t('general.backToApps')}>
                                <ArrowUturnLeftIcon className="w-5 h-5" />
                            </button>
                            <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('approvalFlow.header.title')}</h1>
                        </div>
                        <nav className="hidden md:flex items-center space-x-4">
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
                                    {item.icon}
                                    {item.label}
                                </button>
                             ))}
                        </nav>
                    </div>
                    <div className="flex items-center space-x-4">
                        {hasPermission('approvalFlow.requests.CREATE') && (
                            <button
                                onClick={onNewRequest}
                                className="hidden sm:inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            >
                                <PlusCircleIcon className="w-5 h-5 mr-1.5" />
                                {t('approvalFlow.header.newRequest')}
                            </button>
                        )}
                        <LanguageSwitcher />
                        <ThemeSwitcher theme={theme} setTheme={setTheme} />
                        <div>
                            <span className="text-sm text-gray-600 dark:text-gray-300 mr-4">
                                {t('general.welcome', { name: currentUser.name.split(' (')[0] })}
                            </span>
                            <button
                                onClick={onLogout}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-1.5" />
                                {t('appSelector.logout')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};