import React, { useMemo, useState } from 'react';
import { PermissionFunction, PermissionActionDefinition, PermissionActionGroup, Application } from '../types';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, ArrowDownTrayIcon, BeakerIcon } from '../../../components/icons';

interface PermissionMatrixTabProps {
    permissionFunctions: PermissionFunction[];
    actionGroups: PermissionActionGroup[];
    globalPermissions: Record<string, boolean>;
    setGlobalPermissions: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
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

const DisabledPermissionBox: React.FC = () => (
    <div className="h-5 w-5 rounded border border-gray-300 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
        <div className="w-2.5 h-0.5 bg-gray-400 dark:bg-slate-600"></div>
    </div>
);

const HierarchyIcon: React.FC<{ isParent?: boolean, isExpanded?: boolean, onClick?: () => void, level: number }> = ({ isParent, isExpanded, onClick, level }) => {
    if (level > 0) {
        return <span className="mr-2 w-5 inline-block" />;
    }
    if (isParent) {
        return (
            <button onClick={onClick} className="mr-2 w-5 text-center text-gray-500 dark:text-slate-400">
                {isExpanded ? '▼' : '►'}
            </button>
        );
    }
    return <span className="mr-2 w-5 inline-flex items-center justify-center bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400 rounded-sm leading-5 font-mono text-lg">-</span>;
};

const appPrefixes = ['approvalflow', 'repairshop'];

export const PermissionMatrixTab: React.FC<PermissionMatrixTabProps> = ({
    permissionFunctions: staticPermissionFunctions,
    actionGroups,
    globalPermissions,
    setGlobalPermissions,
    selectedApplication,
}) => {

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
    }, [selectedApplication, staticPermissionFunctions]);

    const allActions = useMemo(() => actionGroups.flatMap(g => g.actions), [actionGroups]);
    
    const togglePermission = (funcId: string, actionId: string) => {
        const key = `${funcId}.${actionId}`;
        setGlobalPermissions(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const toggleColumn = (actionId: string) => {
        const allKeysForAction = permissionFunctions
            .flatMap(f => [f, ...(f.subFunctions || [])])
            .filter(f => f.availableActions.some(a => a === actionId))
            .map(f => `${f.id}.${actionId}`);
        
        const areAllChecked = allKeysForAction.every(key => globalPermissions[key]);
        
        setGlobalPermissions(prev => {
            const newPermissions = { ...prev };
            allKeysForAction.forEach(key => {
                newPermissions[key] = !areAllChecked;
            });
            return newPermissions;
        });
    };
    
    const isParent = (func: PermissionFunction) => !!func.subFunctions && func.subFunctions.length > 0;

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Global Permission Mapping</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                    Use this matrix to enable or disable actions for functions across the entire application. If a checkbox is unchecked here, the corresponding permission cannot be assigned to any role.
                </p>
            </div>
            <div className="overflow-x-auto border border-gray-200 dark:border-slate-700 rounded-lg">
                <table className="min-w-full table-fixed">
                     <thead className="text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        <tr className="bg-gray-50 dark:bg-slate-800">
                            <th scope="col" rowSpan={2} className="w-64 sticky left-0 bg-gray-50 dark:bg-slate-800 z-20 px-4 py-3 text-left text-xs font-bold border-r border-gray-200 dark:border-slate-700">
                                Function
                            </th>
                            {actionGroups.map((group) => (
                                group.actions.length > 0 &&
                                <th key={group.id} colSpan={group.actions.length} className="px-4 py-2 text-center text-sm font-semibold text-gray-800 dark:text-slate-200 border-l border-b border-gray-200 dark:border-slate-700">
                                    {group.name}
                                </th>
                            ))}
                        </tr>
                        <tr className="bg-gray-50 dark:bg-slate-800">
                            {allActions.map(action => {
                                const groupForAction = actionGroups.find(g => g.actions.some(a => a.id === action.id));
                                const isFirstInGroup = groupForAction?.actions[0].id === action.id;

                                const allKeysForAction = permissionFunctions
                                    .flatMap(f => [f, ...(f.subFunctions || [])])
                                    .filter(f => f.availableActions.some(a => a === action.id))
                                    .map(f => `${f.id}.${action.id}`);
                                const areAllChecked = allKeysForAction.length > 0 && allKeysForAction.every(key => globalPermissions[key]);
                                return (
                                    <th key={action.id} scope="col" className={`w-36 px-4 py-3 text-center text-xs font-bold ${isFirstInGroup ? 'border-l border-gray-200 dark:border-slate-700' : ''}`}>
                                        <div className="flex flex-col items-center space-y-2">
                                            <ActionIcon icon={action.icon} />
                                            <span>{action.name}</span>
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 dark:border-slate-500 text-indigo-600 focus:ring-indigo-500 bg-gray-100 dark:bg-slate-600 checked:bg-indigo-500"
                                                checked={areAllChecked}
                                                onChange={() => toggleColumn(action.id)}
                                                title={`Toggle all ${action.name} permissions`}
                                            />
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {permissionFunctions.map(func => (
                           <React.Fragment key={func.id}>
                                <tr className="group">
                                    <td className="sticky left-0 bg-white dark:bg-slate-800 group-hover:bg-gray-50 dark:group-hover:bg-slate-700 z-10 px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-200 border-r border-gray-200 dark:border-slate-700">
                                        <div className="flex items-center">
                                            <HierarchyIcon
                                                isParent={isParent(func)}
                                                isExpanded={expandedFunctions[func.id]}
                                                onClick={() => setExpandedFunctions(p => ({...p, [func.id]: !p[func.id]}))}
                                                level={0}
                                            />
                                            {func.name}
                                        </div>
                                    </td>
                                    {allActions.map(action => {
                                         const isFirstInGroup = actionGroups.find(g => g.actions.length > 0 && g.actions[0].id === action.id);
                                         return (
                                            <td key={action.id} className={`px-4 py-3 whitespace-nowrap text-sm text-center bg-white dark:bg-slate-800 group-hover:bg-gray-50 dark:group-hover:bg-slate-700 ${isFirstInGroup ? 'border-l border-gray-200 dark:border-slate-700' : ''}`}>
                                                {func.availableActions.includes(action.id) ? (
                                                    <input
                                                        type="checkbox"
                                                        className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-gray-100 dark:bg-slate-700 checked:bg-indigo-500"
                                                        checked={!!globalPermissions[`${func.id}.${action.id}`]}
                                                        onChange={() => togglePermission(func.id, action.id)}
                                                    />
                                                ) : (
                                                    <DisabledPermissionBox />
                                                )}
                                            </td>
                                        )})}
                                </tr>
                                {isParent(func) && expandedFunctions[func.id] && func.subFunctions!.map(subFunc => (
                                     <tr key={subFunc.id} className="group">
                                        <td className="sticky left-0 bg-white dark:bg-slate-800 group-hover:bg-gray-50 dark:group-hover:bg-slate-700 z-10 px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-200 border-r border-gray-200 dark:border-slate-700">
                                            <div className="flex items-center" style={{ paddingLeft: `1.5rem` }}>
                                                <HierarchyIcon level={1} />
                                                {subFunc.name}
                                            </div>
                                        </td>
                                        {allActions.map(action => {
                                            const isFirstInGroup = actionGroups.find(g => g.actions.length > 0 && g.actions[0].id === action.id);
                                            return (
                                                <td key={action.id} className={`px-4 py-3 whitespace-nowrap text-sm text-center bg-white dark:bg-slate-800 group-hover:bg-gray-50 dark:group-hover:bg-slate-700 ${isFirstInGroup ? 'border-l border-gray-200 dark:border-slate-700' : ''}`}>
                                                    {subFunc.availableActions.includes(action.id) ? (
                                                        <input
                                                            type="checkbox"
                                                            className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-gray-100 dark:bg-slate-700 checked:bg-indigo-500"
                                                            checked={!!globalPermissions[`${subFunc.id}.${action.id}`]}
                                                            onChange={() => togglePermission(subFunc.id, action.id)}
                                                        />
                                                    ) : (
                                                        <DisabledPermissionBox />
                                                    )}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                           </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};