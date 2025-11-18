
import React, { useState, useMemo, useEffect } from 'react';
import { Department, User, UserRole } from './types';
import { LoginPage } from './components/LoginPage';
import { AppSelector } from './components/AppSelector';
import { ApprovalFlowApp } from './apps/ApprovalFlow';
import { RolePermissionsApp } from './apps/RolePermissions';
import { RepairShopApp } from './apps/RepairShop';
import { fetchAllUsers, fetchManagedUsers, fetchInitialRoles, fetchInitialPermissions } from './lib/mockApi';
import { Role, ManagedUser, PermissionMatrix } from './apps/RolePermissions/types';
import { LoadingSpinner } from './components/LoadingSpinner';
import { LanguageProvider } from './lib/i18n';

const AppContent: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [selectedApp, setSelectedApp] = useState<string | null>(null);
    const [theme, setTheme] = useState('dark');

    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
    const [initialRoles, setInitialRoles] = useState<Role[]>([]);
    const [initialPermissions, setInitialPermissions] = useState<PermissionMatrix>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);
    }, [theme]);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const [usersData, managedUsersData, rolesData, permissionsData] = await Promise.all([
                    fetchAllUsers(),
                    fetchManagedUsers(),
                    fetchInitialRoles(),
                    fetchInitialPermissions(),
                ]);
                setAllUsers(usersData);
                setManagedUsers(managedUsersData);
                setInitialRoles(rolesData);
                setInitialPermissions(permissionsData);
            } catch (error) {
                console.error("Failed to load initial app data", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, []);


    const handleLogout = () => {
        setCurrentUser(null);
        setSelectedApp(null);
    };

    const effectivePermissions = useMemo(() => {
        if (!currentUser) return {};

        const username = currentUser.name.split(' ')[0].toLowerCase();
        const managedUser = managedUsers.find(u => u.username.toLowerCase() === username);

        if (!managedUser) return {};

        const userPermissions: Record<string, boolean> = {};

        for (const assignedRole of managedUser.roles) {
            const roleDef = initialRoles.find(r => r.name === assignedRole.roleName);
            if (roleDef) {
                const rolePermissions = initialPermissions[roleDef.id] || {};
                for (const permissionKey in rolePermissions) {
                    if (rolePermissions[permissionKey]) {
                        userPermissions[permissionKey] = true;
                    }
                }
            }
        }
        return userPermissions;
    }, [currentUser, managedUsers, initialRoles, initialPermissions]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex items-center justify-center">
                <LoadingSpinner message="Initializing HAG Platform..." />
            </div>
        );
    }

    if (!currentUser) {
        return <LoginPage 
            onLoginSuccess={(user) => setCurrentUser(user)}
            users={allUsers}
            theme={theme}
            setTheme={setTheme}
        />;
    }

    if (!selectedApp) {
        return <AppSelector 
            currentUser={currentUser}
            onSelectApp={setSelectedApp}
            onLogout={handleLogout}
            theme={theme}
            setTheme={setTheme}
        />
    }

    if (selectedApp === 'ApprovalFlow') {
        return <ApprovalFlowApp
            currentUser={currentUser}
            allUsers={allUsers}
            onLogout={handleLogout}
            onBackToApps={() => setSelectedApp(null)}
            effectivePermissions={effectivePermissions}
            theme={theme}
            setTheme={setTheme}
        />
    }

    if (selectedApp === 'RolePermissions') {
        return <RolePermissionsApp
            currentUser={currentUser}
            allUsers={allUsers}
            onLogout={handleLogout}
            onBackToApps={() => setSelectedApp(null)}
            theme={theme}
            setTheme={setTheme}
        />
    }
    
    if (selectedApp === 'RepairShop') {
        return <RepairShopApp
            currentUser={currentUser}
            allUsers={allUsers}
            onLogout={handleLogout}
            onBackToApps={() => setSelectedApp(null)}
            effectivePermissions={effectivePermissions}
            theme={theme}
            setTheme={setTheme}
        />
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex items-center justify-center">
            <p className="text-gray-800 dark:text-white">Error: Unknown application selected.</p>
            <button onClick={() => setSelectedApp(null)} className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded">Go Back</button>
        </div>
    );
};


const App: React.FC = () => {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    );
};

export default App;
