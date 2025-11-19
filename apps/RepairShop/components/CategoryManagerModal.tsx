
import React, { useState } from 'react';
import { XMarkIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, PlusIcon } from '../../../components/icons';

interface CategoryManagerModalProps {
    categories: string[];
    onClose: () => void;
    onSave: (oldName: string | null, newName: string) => void;
    onDelete: (name: string) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ categories, onClose, onSave, onDelete }) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState<{ oldName: string, newName: string } | null>(null);

    const handleAddNew = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(null, newCategoryName);
        setNewCategoryName('');
    };

    const handleStartEdit = (name: string) => {
        setEditingCategory({ oldName: name, newName: name });
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
    };

    const handleSaveEdit = () => {
        if (editingCategory) {
            onSave(editingCategory.oldName, editingCategory.newName);
            setEditingCategory(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Categories</h2>
                    <button type="button" onClick={onClose} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"><XMarkIcon className="w-6 h-6" /></button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-6">
                    <ul className="space-y-2">
                        {categories.map(cat => (
                            <li key={cat} className="flex items-center justify-between bg-gray-100 dark:bg-slate-700/50 p-3 rounded-md">
                                {editingCategory?.oldName === cat ? (
                                    <input
                                        type="text"
                                        value={editingCategory.newName}
                                        onChange={e => setEditingCategory({ ...editingCategory, newName: e.target.value })}
                                        className="flex-grow bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md p-1 text-sm text-gray-900 dark:text-slate-200"
                                        autoFocus
                                    />
                                ) : (
                                    <span className="text-gray-800 dark:text-slate-200">{cat}</span>
                                )}
                                <div className="flex items-center space-x-3 ml-4">
                                    {editingCategory?.oldName === cat ? (
                                        <>
                                            <button onClick={handleSaveEdit} className="text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300"><CheckCircleIcon className="w-5 h-5" /></button>
                                            <button onClick={handleCancelEdit} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"><XCircleIcon className="w-5 h-5" /></button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => handleStartEdit(cat)} className="text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"><PencilIcon className="w-5 h-5" /></button>
                                            <button onClick={() => onDelete(cat)} className="text-gray-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400"><TrashIcon className="w-5 h-5" /></button>
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-slate-700">
                    <form onSubmit={handleAddNew} className="flex space-x-2">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={e => setNewCategoryName(e.target.value)}
                            placeholder="Add new category..."
                            className="flex-grow bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200"
                            required
                        />
                        <button type="submit" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700">
                            <PlusIcon className="w-5 h-5 mr-2 -ml-1" /> Add
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
