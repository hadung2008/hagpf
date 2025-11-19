import React, { useState, useEffect } from 'react';
import { PermissionActionDefinition, PermissionActionGroup } from '../types';
import { XMarkIcon } from '../../../components/icons';

interface ActionEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (action: PermissionActionDefinition, groupId: string) => void;
    actionData: Partial<PermissionActionDefinition> & { groupId?: string } | null;
    actionGroups: PermissionActionGroup[];
}

export const ActionEditModal: React.FC<ActionEditModalProps> = ({ isOpen, onClose, onSave, actionData, actionGroups }) => {
    const [name, setName] = useState('');
    const [groupId, setGroupId] = useState<string>('');

    useEffect(() => {
        if (actionData) {
            setName(actionData.name || '');
            setGroupId(actionData.groupId || (actionGroups.length > 0 ? actionGroups[0].id : ''));
        }
    }, [actionData, actionGroups]);

    if (!isOpen || !actionData) return null;

    const isEditing = !!actionData.id;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Action name is required.');
            return;
        }
        if (!isEditing && !groupId) {
            alert('Please select a group for the new action.');
            return;
        }

        const newAction: PermissionActionDefinition = {
            id: actionData.id || (name.trim().toUpperCase() as any), // Simplification
            name: name.trim(),
            icon: actionData.icon || 'PencilIcon', // Default icon
        };
        onSave(newAction, groupId);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{isEditing ? 'Edit Action' : 'Add Action'}</h2>
                        <button type="button" onClick={onClose} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="actionName" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Action Name</label>
                            <input
                                type="text"
                                id="actionName"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                placeholder="e.g., Approve"
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md text-sm text-gray-900 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        {!isEditing && (
                             <div>
                                <label htmlFor="groupId" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Group</label>
                                <select
                                    id="groupId"
                                    value={groupId}
                                    onChange={e => setGroupId(e.target.value)}
                                    required
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md text-sm text-gray-900 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">-- Select a group --</option>
                                    {actionGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                        )}
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