import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../../types';
import { GoogleGenAI } from '@google/genai';
import { fetchRolePermissionsData, saveManagedUser, deleteManagedUser, saveRole, savePermissions } from '../../lib/mockApi';
import { Role, ManagedUser, PermissionMatrix, Application, PermissionFunction, PermissionActionGroup } from './types';
import { UserManagementTab } from './components/UserManagementTab';
import { RoleManagementTab } from './components/RoleManagementTab';
import { PermissionMatrixTab } from './components/PermissionMatrixTab';
import { DashboardHeader } from './components/DashboardHeader';
import { ShieldCheckIcon, UsersIcon, LinkIcon, CogIcon, SparklesIcon, XMarkIcon } from '../../components/icons';
import { DefinitionsTab } from './components/DefinitionsTab';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useTranslation } from '../../lib/i18n';

interface RolePermissionsAppProps {
    currentUser: User;
    allUsers: User[];
    onLogout: () => void;
    onBackToApps: () => void;
    theme: string;
    setTheme: (theme: string) => void;
}

type ActiveTab = 'Role Management' | 'User Management' | 'Permissions' | 'Definitions';

export const RolePermissionsApp: React.FC<RolePermissionsAppProps> = ({ currentUser, allUsers, onLogout, onBackToApps, theme, setTheme }) => {
    const { t } = useTranslation();
    const [permissions, setPermissions] = useState<PermissionMatrix>({});
    const [roles, setRoles] = useState<Role[]>([]);
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [functions, setFunctions] = useState<PermissionFunction[]>([]);
    const [actionGroups, setActionGroups] = useState<PermissionActionGroup[]>([]);
    const [globalPermissions, setGlobalPermissions] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(true);

    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    
    const [explanation, setExplanation] = useState<{title: string; content: string} | null>(null);
    const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
    const [activeTab, setActiveTab] = useState<ActiveTab>('Definitions');

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const data = await fetchRolePermissionsData();
            setPermissions(data.permissions);
            setRoles(data.roles);
            setUsers(data.users);
            setApplications(data.applications);
            setFunctions(data.functions);
            setActionGroups(data.actionGroups);
            setGlobalPermissions(data.globalPermissions);
            setSelectedApplication(data.applications[0]);
            setIsLoading(false);
        };
        loadData();
    }, []);

    const allActions = useMemo(() => actionGroups.flatMap(g => g.actions), [actionGroups]);
    
    const handleGetExplanation = async (permissionKey: string, permissionLabel: string) => {
        setExplanation({ title: permissionLabel, content: '' });
        setIsLoadingExplanation(true);
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
            const prompt = `Explain the permission "${permissionLabel}" in a business application for a non-technical manager. What can a user with this permission do, and what are the risks if it's assigned incorrectly? Keep it concise and clear.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setExplanation({ title: permissionLabel, content: response.text });
        } catch (error) {
            console.error("Error fetching explanation:", error);
            setExplanation({ title: permissionLabel, content: t('rolePermissions.aiExplanationError') });
        } finally {
            setIsLoadingExplanation(false);
        }
    };

    const renderActiveTab = () => {
        if (isLoading || !selectedApplication) {
            return <LoadingSpinner message={t('rolePermissions.loadingData')} />;
        }
        switch(activeTab) {
            case 'User Management':
                return <UserManagementTab users={users} setUsers={setUsers} roles={roles} applications={applications} selectedApplication={selectedApplication} />;
            case 'Role Management':
                return <RoleManagementTab 
                    roles={roles}
                    setRoles={setRoles}
                    permissions={permissions}
                    setPermissions={setPermissions}
                    permissionActions={allActions}
                    selectedApplication={selectedApplication}
                    />;
            case 'Permissions':
                return <PermissionMatrixTab
                    permissionFunctions={functions}
                    actionGroups={actionGroups}
                    globalPermissions={globalPermissions}
                    setGlobalPermissions={setGlobalPermissions}
                    selectedApplication={selectedApplication}
                />;
            case 'Definitions':
                return <DefinitionsTab 
                    functions={functions}
                    setFunctions={setFunctions}
                    actionGroups={actionGroups}
                    setActionGroups={setActionGroups}
                    selectedApplication={selectedApplication}
                />;
        }
    }

    const navItems: {id: ActiveTab, labelKey: string, icon: React.ReactNode}[] = [
        {id: 'Role Management', labelKey: 'rolePermissions.tabs.roleManagement', icon: <ShieldCheckIcon className="w-5 h-5 mr-2" />},
        {id: 'User Management', labelKey: 'rolePermissions.tabs.userManagement', icon: <UsersIcon className="w-5 h-5 mr-2" />},
        {id: 'Permissions', labelKey: 'rolePermissions.tabs.permissions', icon: <LinkIcon className="w-5 h-5 mr-2" />},
        {id: 'Definitions', labelKey: 'rolePermissions.tabs.definitions', icon: <CogIcon className="w-5 h-5 mr-2" />},
    ];

    const loggedInUser = users.find(u => u.username.toLowerCase() === currentUser.name.split(" ")[0].toLowerCase());

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-slate-300 font-sans">
            <DashboardHeader 
                user={loggedInUser} 
                onLogout={onLogout}
                theme={theme}
                setTheme={setTheme}
                onBackToApps={onBackToApps}
            />
            <main className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 flex items-center">
                        <span className="text-sm font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-md px-2 py-1 mr-4">AI Summary</span>
                        <p className="text-sm text-gray-600 dark:text-slate-400">{t('rolePermissions.aiSummaryDefault')}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                        <label htmlFor="application" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">{t('rolePermissions.manageApp')}</label>
                        <select
                            id="application"
                            name="application"
                            className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md w-full sm:w-1/3 p-2 text-gray-800 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                            value={selectedApplication?.id || ''}
                            onChange={(e) => {
                                const app = applications.find(a => a.id === e.target.value);
                                if (app) setSelectedApplication(app);
                            }}
                        >
                           {applications.map(app => <option key={app.id} value={app.id}>{app.name}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center space-x-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
                                    activeTab === item.id
                                        ? 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white'
                                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:text-gray-800 dark:hover:text-slate-200'
                                }`}
                            >
                                {item.icon}
                                {t(item.labelKey)}
                            </button>
                        ))}
                    </div>

                     <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 sm:p-6">
                        {renderActiveTab()}
                    </div>
                </div>
            </main>
            {explanation && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setExplanation(null)}>
                    <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                         <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <SparklesIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400"/>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">{explanation.title}</h3>
                            </div>
                            <button onClick={() => setExplanation(null)} className="text-gray-500 dark:text-slate-500 hover:text-gray-800 dark:hover:text-slate-300">
                                <XMarkIcon className="w-6 h-6"/>
                            </button>
                        </div>
                        <div className="p-6">
                            {isLoadingExplanation ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                    <span className="text-gray-700 dark:text-slate-300">{t('rolePermissions.generatingExplanation')}</span>
                                </div>
                            ) : (
                                <p className="text-gray-700 dark:text-slate-300 whitespace-pre-wrap">{explanation.content}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};