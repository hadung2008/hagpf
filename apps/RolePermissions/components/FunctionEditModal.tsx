import React, { useState, useEffect } from 'react';
import { PermissionFunction, PermissionActionDefinition, PermissionAction } from '../types';
import { XMarkIcon } from '../../../components/icons';

interface FunctionEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (func: PermissionFunction, parentId?: string) => void;
    functionData: Partial<PermissionFunction> & { parentId?: string } | null;
    allActions: PermissionActionDefinition[];
}

export const FunctionEditModal: React.FC<FunctionEditModalProps> = ({ isOpen, onClose, onSave, functionData, allActions }) => {
    const [name, setName] = useState('');
    const [availableActions, setAvailableActions] = useState<PermissionAction[]>([]);

    useEffect(() => {
        if (functionData) {
            setName(functionData.name || '');
            setAvailableActions(functionData.availableActions || []);
        }
    }, [functionData]);

    if (!isOpen || !functionData) return null;

    const isEditing = !!functionData.id;
    const isSubFunction = !!functionData.parentId;
    const title = isEditing ? 'Edit Function' : (isSubFunction ? 'Add Sub-function' : 'Add Function');

    const handleActionToggle = (actionId: PermissionAction) => {
        setAvailableActions(prev => 
            prev.includes(actionId) 
                ? prev.filter(a => a !== actionId) 
                : [...prev, actionId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Function name is required.');
            return;
        }

        const newFunction: PermissionFunction = {
            id: functionData.id || name.trim().toLowerCase().replace(/\s/g, '-'),
            name: name.trim(),
            level: functionData.level || (isSubFunction ? 1 : 0),
            availableActions,
            subFunctions: functionData.subFunctions || [],
        };
        onSave(newFunction, functionData.parentId);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{title}</h2>
                        <button type="button" onClick={onClose} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="funcName" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Function Name</label>
                            <input
                                type="text"
                                id="funcName"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md text-sm text-gray-900 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Available Actions</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {allActions.map(action => (
                                    <label key={action.id} className="flex items-center space-x-3 text-sm text-gray-700 dark:text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={availableActions.includes(action.id)}
                                            onChange={() => handleActionToggle(action.id)}
                                            className="h-4 w-4 rounded border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-700 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-offset-slate-800"
                                        />
                                        <span>{action.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};