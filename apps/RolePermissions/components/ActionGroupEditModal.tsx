import React, { useState, useEffect } from 'react';
import { PermissionActionGroup } from '../types';
import { XMarkIcon } from '../../../components/icons';

interface ActionGroupEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (group: PermissionActionGroup) => void;
    groupData: Partial<PermissionActionGroup> | null;
}

export const ActionGroupEditModal: React.FC<ActionGroupEditModalProps> = ({ isOpen, onClose, onSave, groupData }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        if (groupData) {
            setName(groupData.name || '');
        }
    }, [groupData]);

    if (!isOpen || !groupData) return null;

    const isEditing = !!groupData.id;
    const title = isEditing ? 'Edit Action Group' : 'Add Action Group';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Group name is required.');
            return;
        }

        const newGroup: PermissionActionGroup = {
            id: groupData.id || name.trim().toLowerCase().replace(/\s/g, '-'),
            name: name.trim(),
            actions: groupData.actions || [],
        };
        onSave(newGroup);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{title}</h2>
                        <button type="button" onClick={onClose} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="groupName" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Group Name</label>
                            <input
                                type="text"
                                id="groupName"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                placeholder="e.g., Advanced Reporting"
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md text-sm text-gray-900 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                            />
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