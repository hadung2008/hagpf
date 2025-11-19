
import React, { useState } from 'react';
import { PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, PlusIcon } from '../../../components/icons';

interface CategoryManagementProps {
    categories: string[];
    onSave: (oldName: string | null, newName: string) => void;
    onDelete: (name: string) => void;
}

export const CategoryManagement: React.FC<CategoryManagementProps> = ({ categories, onSave, onDelete }) => {
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
        <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Manage Categories</h2>
            <div className="bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="p-4">
                    <form onSubmit={handleAddNew} className="flex space-x-2">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={e => setNewCategoryName(e.target.value)}
                            placeholder="Add new category..."
                            className="flex-grow bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200"
                            required
                        />
                        <button type="submit" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700">
                            <PlusIcon className="w-5 h-5 mr-2 -ml-1" /> Add
                        </button>
                    </form>
                </div>
                <ul className="space-y-2 p-4">
                    {categories.map(cat => (
                        <li key={cat} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-md">
                            {editingCategory?.oldName === cat ? (
                                <input
                                    type="text"
                                    value={editingCategory.newName}
                                    onChange={e => setEditingCategory({ ...editingCategory, newName: e.target.value })}
                                    className="flex-grow bg-slate-900 border border-slate-600 rounded-md p-1 text-sm text-slate-200"
                                    autoFocus
                                />
                            ) : (
                                <span className="text-slate-200">{cat}</span>
                            )}
                            <div className="flex items-center space-x-3 ml-4">
                                {editingCategory?.oldName === cat ? (
                                    <>
                                        <button onClick={handleSaveEdit} className="text-green-400 hover:text-green-300"><CheckCircleIcon className="w-5 h-5" /></button>
                                        <button onClick={handleCancelEdit} className="text-red-400 hover:text-red-300"><XCircleIcon className="w-5 h-5" /></button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleStartEdit(cat)} className="text-slate-400 hover:text-indigo-400"><PencilIcon className="w-5 h-5" /></button>
                                        <button onClick={() => onDelete(cat)} className="text-slate-400 hover:text-red-400"><TrashIcon className="w-5 h-5" /></button>
                                    </>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
