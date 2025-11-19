import React, { useState, useMemo } from 'react';
import { ManagedUser, Role, UserRoleAssignment, Application } from '../types';
import { PencilIcon, TrashIcon, XMarkIcon, ChevronDownIcon, ChevronUpIcon, PlusIcon } from '../../../components/icons';
import { useTranslation } from '../../../lib/i18n';

interface UserManagementTabProps {
    users: ManagedUser[];
    setUsers: React.Dispatch<React.SetStateAction<ManagedUser[]>>;
    roles: Role[];
    applications: Application[];
    selectedApplication: Application;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({ users, setUsers, roles, applications, selectedApplication }) => {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

    const filteredUsers = useMemo(() => {
        if (selectedApplication.id === 'app-1') return users;
        return users.filter(u => u.roles.some(r => r.appName === selectedApplication.name));
    }, [users, selectedApplication]);

    const openModal = (user: ManagedUser | null = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingUser(null);
        setIsModalOpen(false);
    };

    const handleSave = (userToSave: ManagedUser) => {
        if (users.some(u => u.id === userToSave.id)) {
            setUsers(prev => prev.map(u => u.id === userToSave.id ? userToSave : u));
        } else {
            setUsers(prev => [...prev, userToSave]);
        }
        closeModal();
    };

    const handleDelete = (userId: string) => {
        if (window.confirm(t('rolePermissions.userTab.deleteConfirm'))) {
            setUsers(prev => prev.filter(u => u.id !== userId));
        }
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100">{t('rolePermissions.userTab.title', { appName: selectedApplication.name })}</h3>
                <button 
                    onClick={() => openModal()} 
                    className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800"
                >
                    <PlusIcon className="w-5 h-5 mr-2 -ml-1"/>
                    {t('rolePermissions.userTab.addUser')}
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="border-b border-gray-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('rolePermissions.userTab.table.fullName')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('rolePermissions.userTab.table.username')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">{t('rolePermissions.userTab.table.email')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('rolePermissions.userTab.table.roleInApp')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('general.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-200">{user.fullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{user.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 hidden md:table-cell">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                                    <div className="flex flex-col space-y-2">
                                        {user.roles
                                            .filter(role => selectedApplication.id === 'app-1' || role.appName === selectedApplication.name)
                                            .map((role, index) => (
                                            <div key={index}>
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-slate-600 dark:text-slate-200">
                                                    {role.roleName} {selectedApplication.id === 'app-1' && `(${role.appName})`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openModal(user)} className="text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1"><PencilIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleDelete(user.id)} className="text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1 ml-2"><TrashIcon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && <UserEditModal user={editingUser} roles={roles} applications={applications} onSave={handleSave} onClose={closeModal} />}
        </div>
    );
};


interface UserEditModalProps {
    user: ManagedUser | null;
    roles: Role[];
    applications: Application[];
    onSave: (user: ManagedUser) => void;
    onClose: () => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, roles, applications, onSave, onClose }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        username: user?.username || '',
        email: user?.email || '',
    });
    const [assignedRoles, setAssignedRoles] = useState<UserRoleAssignment[]>(user?.roles || []);
    const [expandedApps, setExpandedApps] = useState<Record<string, boolean>>(() => {
        const initialState: Record<string, boolean> = {};
        applications.forEach(app => initialState[app.name] = true);
        return initialState;
    });

    const isEditing = !!user;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleRoleChange = (appName: string, roleName: string, isChecked: boolean) => {
        if (isChecked) {
            setAssignedRoles(prev => [...prev, { appName, roleName }]);
        } else {
            setAssignedRoles(prev => prev.filter(r => !(r.appName === appName && r.roleName === roleName)));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const userToSave: ManagedUser = {
            id: user?.id || `user-${Date.now()}`,
            roles: assignedRoles,
            ...formData
        };
        onSave(userToSave);
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                    <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{isEditing ? t('rolePermissions.userTab.modal.editTitle') : t('rolePermissions.userTab.modal.addTitle')}</h2>
                        <button type="button" onClick={onClose} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6 pb-2 space-y-4 flex-shrink-0">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">{t('rolePermissions.userTab.modal.fullName')}</label>
                            <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md text-sm text-gray-900 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">{t('rolePermissions.userTab.modal.username')}</label>
                            <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md text-sm text-gray-900 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">{t('rolePermissions.userTab.modal.email')}</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md text-sm text-gray-900 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-slate-400 !mt-6">{t('rolePermissions.userTab.modal.assignRoles')}</h3>
                    </div>

                    <div className="flex-grow min-h-0 overflow-y-auto px-6 pb-6">
                        <div className="space-y-4 pr-2">
                            {applications.map(app => {
                                const selectedCount = assignedRoles.filter(r => r.appName === app.name).length;
                                return (
                                <div key={app.id} className="bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-md">
                                    <button
                                        type="button"
                                        className="w-full flex justify-between items-center p-3 text-left"
                                        onClick={() => setExpandedApps(p => ({ ...p, [app.name]: !p[app.name] }))}
                                    >
                                        <div>
                                            <span className="font-semibold text-gray-800 dark:text-slate-200">{app.name}</span>
                                            {selectedCount > 0 && (
                                                <span className="ml-3 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-500/50 dark:text-indigo-300 rounded-full px-2 py-0.5">
                                                    {t('rolePermissions.userTab.modal.selected', { count: selectedCount })}
                                                </span>
                                            )}
                                        </div>
                                        {expandedApps[app.name] ? <ChevronUpIcon className="w-5 h-5 text-gray-500 dark:text-slate-400" /> : <ChevronDownIcon className="w-5 h-5 text-gray-500 dark:text-slate-400" />}
                                    </button>
                                    {expandedApps[app.name] && (
                                        <div className="p-4 border-t border-gray-200 dark:border-slate-700 grid grid-cols-2 gap-3">
                                            {roles.map(role => {
                                                const isChecked = assignedRoles.some(r => r.appName === app.name && r.roleName === role.name);
                                                return (
                                                    <label key={role.id} className="flex items-center space-x-3 text-sm text-gray-700 dark:text-slate-300">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={(e) => handleRoleChange(app.name, role.name, e.target.checked)}
                                                            className="h-4 w-4 rounded border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-700 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-offset-slate-800"
                                                        />
                                                        <span>{role.name}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-3 flex-shrink-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500">{t('general.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700">{t('general.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};