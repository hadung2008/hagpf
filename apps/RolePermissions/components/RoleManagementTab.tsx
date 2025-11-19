import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Role, PermissionMatrix, PermissionAction, PermissionFunction, PermissionActionDefinition, Application } from '../types';
import { permissionFunctions as staticPermissionFunctions } from '../data';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, ArrowDownTrayIcon, BeakerIcon } from '../../../components/icons';
import { useTranslation } from '../../../lib/i18n';

interface RoleManagementTabProps {
    roles: Role[];
    setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
    permissions: PermissionMatrix;
    setPermissions: React.Dispatch<React.SetStateAction<PermissionMatrix>>;
    permissionActions: PermissionActionDefinition[];
    selectedApplication: Application;
}

const ActionIcon: React.FC<{ icon: string }> = ({ icon }) => {
    switch (icon) {
        case 'PlusIcon': return <PlusIcon className="w-5 h-5 mx-auto" />;
        case 'EyeIcon': return <EyeIcon className="w-5 h-5 mx-auto" />;
        case 'PencilIcon': return <PencilIcon className="w-5 h-5 mx-auto" />;
        case 'TrashIcon': return <TrashIcon className="w-5 h-5 mx-auto" />;
        case 'ArrowDownTrayIcon': return <ArrowDownTrayIcon className="w-5 h-5 mx-auto" />;
        case 'BeakerIcon': return <BeakerIcon className="w-5 h-5 mx-auto" />;
        default: return null;
    }
};

type IndeterminateCheckboxProps = {
    indeterminate?: boolean;
} & React.ComponentPropsWithoutRef<'input'>;

const IndeterminateCheckbox = React.forwardRef<HTMLInputElement, IndeterminateCheckboxProps>(
    ({ indeterminate, className, ...rest }, ref) => {
        const defaultRef = useRef<HTMLInputElement>(null);
        const resolvedRef = (ref || defaultRef) as React.RefObject<HTMLInputElement>;

        useEffect(() => {
            if (resolvedRef.current) {
                resolvedRef.current.indeterminate = !!indeterminate;
            }
        }, [resolvedRef, indeterminate]);

        return <input type="checkbox" ref={resolvedRef} className={className} {...rest} />;
    }
);
IndeterminateCheckbox.displayName = 'IndeterminateCheckbox';


const DisabledPermissionBox: React.FC = () => (
    <div className="h-4 w-4 rounded border border-gray-300 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
        <div className="w-2 h-0.5 bg-gray-400 dark:bg-slate-600"></div>
    </div>
);

const appPrefixes = ['approvalflow', 'repairshop']; // Known app-specific function prefixes

export const RoleManagementTab: React.FC<RoleManagementTabProps> = ({ roles, setRoles, permissions, setPermissions, permissionActions, selectedApplication }) => {
    const { t } = useTranslation();
    const [selectedRoleId, setSelectedRoleId] = useState<string>('administrator');
    const [newRoleName, setNewRoleName] = useState('');
    const [copyFromRoleId, setCopyFromRoleId] = useState<string>('');
    const [expandedFunctions, setExpandedFunctions] = useState<Record<string, boolean>>({
        'userManagement': true,
        'reporting': true,
    });
    
    const permissionFunctions = useMemo(() => {
        const selectedAppIdLower = selectedApplication.id.toLowerCase();
        const isSpecificApp = appPrefixes.includes(selectedAppIdLower);

        return staticPermissionFunctions.filter(func => {
            const funcIdLower = func.id.toLowerCase();
            const funcPrefix = funcIdLower.split('.')[0];

            if (isSpecificApp) {
                return funcPrefix === selectedAppIdLower;
            }
            // Global app (e.g., Main Management Portal): show functions that DON'T have a specific app prefix
            return !appPrefixes.includes(funcPrefix);
        });
    }, [selectedApplication]);


    const handleAddRole = () => {
        if (newRoleName.trim() && !roles.some(r => r.name === newRoleName.trim())) {
            const newRoleId = newRoleName.trim().toLowerCase().replace(/\s+/g, '-');
            const newRole: Role = {
                id: newRoleId,
                name: newRoleName.trim(),
                description: 'Custom role'
            };
            setRoles(prev => [...prev, newRole]);
            setPermissions(prev => ({ ...prev, [newRoleId]: {} }));
            setNewRoleName('');
            setSelectedRoleId(newRoleId);
        } else {
            alert(t('rolePermissions.roleTab.alertUniqueName'));
        }
    };

    const handleCopyPermissions = () => {
        if (!copyFromRoleId || !selectedRoleId) return;
        const permissionsToCopy = permissions[copyFromRoleId];
        const confirmMessage = t('rolePermissions.roleTab.confirmCopy', {
            toRole: roles.find(r=>r.id === selectedRoleId)?.name || '',
            fromRole: roles.find(r=>r.id === copyFromRoleId)?.name || ''
        });
        if (window.confirm(confirmMessage)) {
            setPermissions(prev => ({
                ...prev,
                [selectedRoleId]: { ...permissionsToCopy }
            }));
        }
    };
    
    const togglePermission = (funcId: string, action: PermissionAction) => {
        const key = `${funcId}.${action}`;
        setPermissions(prev => {
            const newRolePermissions = { ...(prev[selectedRoleId] || {}) };
            newRolePermissions[key] = !newRolePermissions[key];
            return { ...prev, [selectedRoleId]: newRolePermissions };
        });
    };

    const toggleParentPermission = (funcId: string) => {
        const func = permissionFunctions.flatMap(f => [f, ...(f.subFunctions || [])]).find(f => f.id === funcId);
        if (!func || !func.subFunctions) return;

        const allKeys = [func, ...func.subFunctions].flatMap(f => f.availableActions.map(a => `${f.id}.${a}`));
        const areAllChecked = allKeys.every(key => permissions[selectedRoleId]?.[key]);
        
        setPermissions(prev => {
            const newRolePermissions = { ...(prev[selectedRoleId] || {}) };
            allKeys.forEach(key => {
                newRolePermissions[key] = !areAllChecked;
            });
            return { ...prev, [selectedRoleId]: newRolePermissions };
        });
    };
    
    const toggleParentColumnPermission = (parentFunc: PermissionFunction, action: PermissionAction) => {
        const allActionKeysInGroup = [parentFunc, ...(parentFunc.subFunctions || [])]
            .filter(f => f.availableActions.includes(action))
            .map(f => `${f.id}.${action}`);
        
        if (allActionKeysInGroup.length === 0) return;

        const areAllChecked = allActionKeysInGroup.every(key => permissions[selectedRoleId]?.[key]);

        setPermissions(prev => {
            const newRolePermissions = { ...(prev[selectedRoleId] || {}) };
            allActionKeysInGroup.forEach(key => {
                newRolePermissions[key] = !areAllChecked;
            });
            return { ...prev, [selectedRoleId]: newRolePermissions };
        });
    };

    const selectedRole = roles.find(r => r.id === selectedRoleId);
    const selectedRolePermissions = permissions[selectedRoleId] || {};
    
    const isParent = (func: PermissionFunction) => !!func.subFunctions && func.subFunctions.length > 0;

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <div>
                        <label htmlFor="select-role" className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">{t('rolePermissions.roleTab.selectRole')}</label>
                        <select
                            id="select-role"
                            value={selectedRoleId}
                            onChange={e => setSelectedRoleId(e.target.value)}
                            className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-gray-900 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="new-role" className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">{t('rolePermissions.roleTab.addNewRole')}</label>
                        <div className="flex">
                            <input
                                id="new-role"
                                type="text"
                                value={newRoleName}
                                onChange={e => setNewRoleName(e.target.value)}
                                placeholder={t('rolePermissions.roleTab.addRolePlaceholder')}
                                className="flex-grow bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-l-md p-2 text-gray-900 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button onClick={handleAddRole} className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700">{t('general.add')}</button>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="copy-from-role" className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">{t('rolePermissions.roleTab.copyFromLabel')}</label>
                        <div className="flex">
                            <select
                                id="copy-from-role"
                                value={copyFromRoleId}
                                onChange={e => setCopyFromRoleId(e.target.value)}
                                className="flex-grow bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-l-md p-2 text-gray-900 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">-- {t('rolePermissions.roleTab.selectRole')} --</option>
                                {roles.filter(r => r.id !== selectedRoleId).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                            <button onClick={handleCopyPermissions} disabled={!copyFromRoleId} className="px-4 py-2 bg-gray-600 dark:bg-slate-600 text-white rounded-r-md hover:bg-gray-500 dark:hover:bg-slate-500 disabled:opacity-50">{t('rolePermissions.roleTab.copyButton')}</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="overflow-x-auto border border-gray-200 dark:border-slate-700 rounded-lg">
                <table className="min-w-full table-fixed">
                    <thead className="text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        <tr className="bg-gray-50 dark:bg-slate-800">
                            <th scope="col" className="w-64 sticky left-0 bg-gray-50 dark:bg-slate-800 z-20 px-4 py-3 text-left text-xs font-bold border-r border-gray-200 dark:border-slate-700">
                                {t('rolePermissions.roleTab.function')}
                            </th>
                            {permissionActions.map(action => (
                                <th key={action.id} scope="col" className="w-24 px-4 py-3 text-center text-xs font-bold">
                                    <div className="flex flex-col items-center space-y-2">
                                        <ActionIcon icon={action.icon} />
                                        <span>{action.name}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {permissionFunctions.map(func => {
                            const allSubKeys = func.subFunctions?.flatMap(sf => sf.availableActions.map(a => `${sf.id}.${a}`)) || [];
                            const allParentAndSubKeys = [
                                ...func.availableActions.map(a => `${func.id}.${a}`),
                                ...allSubKeys
                            ];
                            const checkedCount = allParentAndSubKeys.filter(key => selectedRolePermissions[key]).length;
                            const isParentIndeterminate = checkedCount > 0 && checkedCount < allParentAndSubKeys.length;
                            const areAllCheckedForParent = allParentAndSubKeys.length > 0 && checkedCount === allParentAndSubKeys.length;

                            return (
                               <React.Fragment key={func.id}>
                                    <tr className="group">
                                        <td className="sticky left-0 bg-white dark:bg-slate-800 group-hover:bg-gray-50 dark:group-hover:bg-slate-700 z-10 px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-200 border-r border-gray-200 dark:border-slate-700">
                                            <div className="flex items-center">
                                                {isParent(func) && (
                                                    <button onClick={() => setExpandedFunctions(p => ({...p, [func.id]: !p[func.id]}))} className="mr-2 text-gray-500 dark:text-slate-400 w-5">
                                                        {expandedFunctions[func.id] ? '▼' : '►'}
                                                    </button>
                                                )}
                                                <IndeterminateCheckbox
                                                    className="h-4 w-4 rounded border-gray-300 dark:border-slate-500 text-indigo-600 focus:ring-indigo-500 bg-gray-100 dark:bg-slate-600 mr-3"
                                                    checked={areAllCheckedForParent}
                                                    indeterminate={isParentIndeterminate}
                                                    onChange={() => toggleParentPermission(func.id)}
                                                    title={`Toggle all ${func.name} permissions`}
                                                />
                                                {func.name}
                                            </div>
                                        </td>
                                        {permissionActions.map(action => {
                                             const allActionKeysInGroup = [func, ...(func.subFunctions || [])]
                                                .filter(f => f.availableActions.includes(action.id))
                                                .map(f => `${f.id}.${action.id}`);
                                            const checkedActionCount = allActionKeysInGroup.filter(key => selectedRolePermissions[key]).length;
                                            const isActionIndeterminate = checkedActionCount > 0 && checkedActionCount < allActionKeysInGroup.length;
                                            const areAllActionsChecked = allActionKeysInGroup.length > 0 && checkedActionCount === allActionKeysInGroup.length;

                                            return (
                                                <td key={action.id} className="px-4 py-3 whitespace-nowrap text-sm text-center bg-white dark:bg-slate-800 group-hover:bg-gray-50 dark:group-hover:bg-slate-700">
                                                    {func.availableActions.includes(action.id) ? (
                                                         <IndeterminateCheckbox
                                                            className="h-4 w-4 rounded border-gray-300 dark:border-slate-500 text-indigo-600 focus:ring-indigo-500 bg-gray-100 dark:bg-slate-600"
                                                            checked={areAllActionsChecked}
                                                            indeterminate={isActionIndeterminate}
                                                            onChange={() => toggleParentColumnPermission(func, action.id)}
                                                            title={`Toggle all ${action.name} permissions for ${func.name} group`}
                                                        />
                                                    ) : <DisabledPermissionBox />}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                    {isParent(func) && expandedFunctions[func.id] && func.subFunctions!.map(subFunc => (
                                         <tr key={subFunc.id} className="group">
                                            <td className="sticky left-0 bg-white dark:bg-slate-800 group-hover:bg-gray-50 dark:group-hover:bg-slate-700 z-10 px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300 border-r border-gray-200 dark:border-slate-700">
                                                <div className="flex items-center pl-8">
                                                    {subFunc.name}
                                                </div>
                                            </td>
                                            {permissionActions.map(action => (
                                                <td key={action.id} className="px-4 py-3 whitespace-nowrap text-sm text-center bg-white dark:bg-slate-800 group-hover:bg-gray-50 dark:group-hover:bg-slate-700">
                                                    {subFunc.availableActions.includes(action.id) ? (
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded border-gray-300 dark:border-slate-500 text-indigo-600 focus:ring-indigo-500 bg-gray-100 dark:bg-slate-600"
                                                            checked={!!selectedRolePermissions[`${subFunc.id}.${action.id}`]}
                                                            onChange={() => togglePermission(subFunc.id, action.id)}
                                                        />
                                                    ) : <DisabledPermissionBox />}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                               </React.Fragment>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};