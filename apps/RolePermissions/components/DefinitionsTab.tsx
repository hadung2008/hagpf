import React, { useState, useMemo } from 'react';
import { PermissionFunction, PermissionActionDefinition, PermissionActionGroup, Application } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '../../../components/icons';
import { FunctionEditModal } from './FunctionEditModal';
import { ActionEditModal } from './ActionEditModal';
import { ActionGroupEditModal } from './ActionGroupEditModal';

interface DefinitionsTabProps {
    functions: PermissionFunction[];
    setFunctions: React.Dispatch<React.SetStateAction<PermissionFunction[]>>;
    actionGroups: PermissionActionGroup[];
    setActionGroups: React.Dispatch<React.SetStateAction<PermissionActionGroup[]>>;
    selectedApplication: Application;
}

const flattenFunctions = (functions: PermissionFunction[]): PermissionFunction[] => {
    const flatList: PermissionFunction[] = [];
    const recurse = (funcs: PermissionFunction[], level = 0) => {
        for (const func of funcs) {
            flatList.push({ ...func, level });
            if (func.subFunctions) {
                recurse(func.subFunctions, level + 1);
            }
        }
    };
    recurse(functions);
    return flatList;
};

const appPrefixes = ['approvalflow', 'repairshop']; // Known app-specific function prefixes

export const DefinitionsTab: React.FC<DefinitionsTabProps> = ({ functions, setFunctions, actionGroups, setActionGroups, selectedApplication }) => {
    const [isFunctionModalOpen, setIsFunctionModalOpen] = useState(false);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [editingFunction, setEditingFunction] = useState<Partial<PermissionFunction> & { parentId?: string } | null>(null);
    const [editingAction, setEditingAction] = useState<Partial<PermissionActionDefinition> & { groupId?: string } | null>(null);
    const [editingGroup, setEditingGroup] = useState<Partial<PermissionActionGroup> | null>(null);

    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
        const initialState: Record<string, boolean> = {};
        actionGroups.forEach(g => initialState[g.id] = true);
        return initialState;
    });

    const filteredFunctions = useMemo(() => {
        const selectedAppIdLower = selectedApplication.id.toLowerCase();
        const isSpecificApp = appPrefixes.includes(selectedAppIdLower);

        return functions.filter(func => {
            const funcIdLower = func.id.toLowerCase();
            const funcPrefix = funcIdLower.split('.')[0];

            if (isSpecificApp) {
                return funcPrefix === selectedAppIdLower;
            }
            // Global app (e.g., Main Management Portal): show functions that DON'T have a specific app prefix
            return !appPrefixes.includes(funcPrefix);
        });
    }, [functions, selectedApplication]);

    const allFilteredFunctions = useMemo(() => flattenFunctions(filteredFunctions), [filteredFunctions]);
    const allActions = actionGroups.flatMap(g => g.actions);

    const handleOpenFunctionModal = (funcData: Partial<PermissionFunction> & { parentId?: string } | null) => {
        setEditingFunction(funcData);
        setIsFunctionModalOpen(true);
    };

    const handleOpenActionModal = (actionData: Partial<PermissionActionDefinition> & { groupId?: string } | null) => {
        setEditingAction(actionData);
        setIsActionModalOpen(true);
    };

    const handleOpenGroupModal = (groupData: Partial<PermissionActionGroup> | null) => {
        setEditingGroup(groupData);
        setIsGroupModalOpen(true);
    };
    
    const handleCloseModals = () => {
        setIsFunctionModalOpen(false);
        setEditingFunction(null);
        setIsActionModalOpen(false);
        setEditingAction(null);
        setIsGroupModalOpen(false);
        setEditingGroup(null);
    };

    const handleSaveFunction = (funcToSave: PermissionFunction, parentId?: string) => {
        const updateRecursively = (funcs: PermissionFunction[], isAddingSub: boolean): PermissionFunction[] => {
            if (isAddingSub) {
                 return funcs.map(f => {
                    if (f.id === parentId) {
                        return { ...f, subFunctions: [...(f.subFunctions || []), funcToSave] };
                    }
                    if (f.subFunctions) {
                        return { ...f, subFunctions: updateRecursively(f.subFunctions, true) };
                    }
                    return f;
                });
            }
            // Editing
            const found = funcs.some(f => f.id === funcToSave.id);
            if (found) {
                return funcs.map(f => f.id === funcToSave.id ? funcToSave : { ...f, subFunctions: f.subFunctions ? updateRecursively(f.subFunctions, false) : undefined });
            }
            // Searching in subfunctions
            return funcs.map(f => ({ ...f, subFunctions: f.subFunctions ? updateRecursively(f.subFunctions, false) : undefined }));
        };

        // FIX: Replaced undefined variable `functionData` with state variable `editingFunction`.
        if (editingFunction?.id) { // Editing existing
            setFunctions(prev => updateRecursively(prev, false));
        } else if (parentId) { // Adding subfunction
             setFunctions(prev => updateRecursively(prev, true));
        } else { // Adding new top-level
            setFunctions(prev => [...prev, funcToSave]);
        }
        handleCloseModals();
    };

    const handleSaveAction = (actionToSave: PermissionActionDefinition, groupId: string) => {
        if (editingAction?.id) { // Editing
             setActionGroups(prev => prev.map(g => ({
                ...g,
                actions: g.actions.map(a => a.id === actionToSave.id ? actionToSave : a)
             })));
        } else { // Adding
            if (allActions.some(a => a.id === actionToSave.id)) {
                alert("An action with this ID already exists."); return;
            }
             setActionGroups(prev => prev.map(g => g.id === groupId ? {...g, actions: [...g.actions, actionToSave]} : g));
        }
        handleCloseModals();
    };

    const handleSaveGroup = (groupToSave: PermissionActionGroup) => {
        if (editingGroup?.id) { // Editing
            setActionGroups(prev => prev.map(g => g.id === groupToSave.id ? groupToSave : g));
        } else { // Adding
             if (actionGroups.some(g => g.id === groupToSave.id)) {
                alert("A group with this ID already exists."); return;
            }
            setActionGroups(prev => [...prev, groupToSave]);
        }
        handleCloseModals();
    };
    
    const handleDeleteFunction = (funcId: string) => {
        if (window.confirm("Are you sure you want to delete this function? This may affect existing roles.")) {
            const removeRecursively = (funcs: PermissionFunction[], idToRemove: string): PermissionFunction[] => {
                return funcs.filter(f => f.id !== idToRemove).map(f => {
                    if (f.subFunctions) {
                        return { ...f, subFunctions: removeRecursively(f.subFunctions, idToRemove) };
                    }
                    return f;
                });
            };
            setFunctions(prev => removeRecursively(prev, funcId));
        }
    };

    const handleDeleteAction = (actionId: string) => {
        if(window.confirm("Are you sure you want to delete this action? It will be removed from all functions.")) {
            setActionGroups(prev => prev.map(g => ({
                ...g,
                actions: g.actions.filter(a => a.id !== actionId)
            })));
            
            const removeActionFromFunctions = (funcs: PermissionFunction[]): PermissionFunction[] => {
                return funcs.map(f => ({
                    ...f,
                    availableActions: f.availableActions.filter(a => a as string !== actionId),
                    subFunctions: f.subFunctions ? removeActionFromFunctions(f.subFunctions) : undefined
                }));
            };
            setFunctions(removeActionFromFunctions);
        }
    };

    const handleDeleteGroup = (groupId: string) => {
        const group = actionGroups.find(g => g.id === groupId);
        if (group && group.actions.length > 0) {
            alert("Cannot delete a group that contains actions. Please move or delete the actions first.");
            return;
        }
        if(window.confirm("Are you sure you want to delete this action group?")) {
            setActionGroups(prev => prev.filter(g => g.id !== groupId));
        }
    }

    return (
        <>
            {/* This grid is responsive by default, stacking on screens smaller than 'lg' */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Manage Functions Column */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Manage Functions</h3>
                        <button onClick={() => handleOpenFunctionModal({})} className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800">
                            <PlusIcon className="w-4 h-4 mr-2"/> Add Function
                        </button>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-700">
                            <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                <span>Function Name</span>
                                <span>Controls</span>
                            </div>
                        </div>
                        <ul className="divide-y divide-gray-100 dark:divide-slate-800">
                            {allFilteredFunctions.map(func => (
                                <li key={func.id} className="flex justify-between items-center px-4 py-2.5">
                                    <span className="text-sm text-gray-800 dark:text-slate-300" style={{ paddingLeft: `${func.level * 1.25}rem` }}>
                                        {func.level > 0 && <span className="mr-2 text-gray-400 dark:text-slate-500">└</span>}
                                        {func.name}
                                    </span>
                                    <div className="flex items-center space-x-3 text-gray-500 dark:text-slate-400">
                                        {func.level === 0 && (
                                            <button className="hover:text-gray-800 dark:hover:text-white" title="Add Sub-function" onClick={() => handleOpenFunctionModal({ parentId: func.id })}>
                                                <PlusIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button className="hover:text-indigo-600 dark:hover:text-indigo-400" title="Edit Function" onClick={() => handleOpenFunctionModal(func)}><PencilIcon className="w-4 h-4" /></button>
                                        <button className="hover:text-red-600 dark:hover:text-red-400" title="Delete Function" onClick={() => handleDeleteFunction(func.id)}><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Manage Actions Column */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Manage Actions</h3>
                         <div className="flex space-x-2">
                             <button onClick={() => handleOpenGroupModal({})} className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-gray-800 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600">
                                <PlusIcon className="w-4 h-4 mr-2"/> Add Group
                            </button>
                            <button onClick={() => handleOpenActionModal({})} className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                                <PlusIcon className="w-4 h-4 mr-2"/> Add Action
                            </button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {actionGroups.map(group => (
                             <div key={group.id} className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                                <div className="w-full flex justify-between items-center px-4 py-2 border-b border-gray-200 dark:border-slate-700">
                                    <button className="flex items-center flex-grow text-left" onClick={() => setExpandedGroups(p => ({...p, [group.id]: !p[group.id]}))}>
                                        <h4 className="font-semibold text-gray-800 dark:text-slate-300">{group.name}</h4>
                                        {expandedGroups[group.id] ? <ChevronUpIcon className="w-5 h-5 text-gray-500 dark:text-slate-400 ml-2" /> : <ChevronDownIcon className="w-5 h-5 text-gray-500 dark:text-slate-400 ml-2" />}
                                    </button>
                                    <div className="flex items-center space-x-3 text-gray-500 dark:text-slate-400">
                                        <button className="hover:text-indigo-600 dark:hover:text-indigo-400" title="Edit Group" onClick={() => handleOpenGroupModal(group)}><PencilIcon className="w-4 h-4" /></button>
                                        <button className="hover:text-red-600 dark:hover:text-red-400" title="Delete Group" onClick={() => handleDeleteGroup(group.id)}><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                {expandedGroups[group.id] && (
                                    <ul className="divide-y divide-gray-100 dark:divide-slate-800">
                                        {group.actions.map(action => (
                                            <li key={action.id} className="flex justify-between items-center px-4 py-2.5">
                                                <span className="text-sm text-gray-800 dark:text-slate-300">{action.name}</span>
                                                <div className="flex items-center space-x-3 text-gray-500 dark:text-slate-400">
                                                    <button className="hover:text-indigo-600 dark:hover:text-indigo-400" title="Edit Action" onClick={() => handleOpenActionModal({ ...action, groupId: group.id })}><PencilIcon className="w-4 h-4" /></button>
                                                    <button className="hover:text-red-600 dark:hover:text-red-400" title="Delete Action" onClick={() => handleDeleteAction(action.id as string)}><TrashIcon className="w-4 h-4" /></button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <FunctionEditModal 
                isOpen={isFunctionModalOpen}
                onClose={handleCloseModals}
                onSave={handleSaveFunction}
                functionData={editingFunction}
                allActions={allActions}
            />

            <ActionEditModal
                isOpen={isActionModalOpen}
                onClose={handleCloseModals}
                onSave={handleSaveAction}
                actionData={editingAction}
                actionGroups={actionGroups}
            />

            <ActionGroupEditModal
                isOpen={isGroupModalOpen}
                onClose={handleCloseModals}
                onSave={handleSaveGroup}
                groupData={editingGroup}
            />
        </>
    );
};