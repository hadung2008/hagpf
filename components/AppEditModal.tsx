import React, { useState, useEffect } from 'react';
import { XMarkIcon, iconMap, availableIcons } from './icons';
import { useTranslation } from '../lib/i18n';

interface AppInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  lastModified: string;
}

interface AppEditModalProps {
  app: AppInfo | null;
  onSave: (appData: Omit<AppInfo, 'lastModified' | 'name' | 'description'>) => void;
  onClose: () => void;
  allApps: AppInfo[];
}

export const AppEditModal: React.FC<AppEditModalProps> = ({ app, onSave, onClose, allApps }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [appId, setAppId] = useState('');
  const [icon, setIcon] = useState('RectangleGroupIcon');
  const [idError, setIdError] = useState('');

  const isEditing = !!app;

  useEffect(() => {
    if (app) {
      setName(app.name || '');
      setDescription(app.description || '');
      setAppId(app.id || '');
      setIcon(app.icon || 'RectangleGroupIcon');
    } else {
      setName('');
      setDescription('');
      setAppId('');
      setIcon('RectangleGroupIcon');
    }
    setIdError('');
  }, [app]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!isEditing) {
      const suggestedId = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      setAppId(suggestedId);
      validateId(suggestedId, true);
    }
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newId = e.target.value;
    setAppId(newId);
    validateId(newId, true);
  };
  
  const validateId = (id: string, isTyping: boolean = false) => {
    if (!id && !isTyping) {
      setIdError(t('general.required'));
      return false;
    }
    if (id && allApps.some(a => a.id === id && a.id !== app?.id)) {
      setIdError(t('modals.appEdit.idError'));
      return false;
    }
    setIdError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !validateId(appId)) return;

    // FIX: Removed `name` and `description` properties. The `onSave` callback's type
    // only expects `id` and `icon`, as `name` and `description` are derived
    // from translation files based on the `id`.
    onSave({
      id: appId,
      icon,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{isEditing ? t('modals.appEdit.editTitle') : t('modals.appEdit.addTitle')}</h2>
            <button type="button" onClick={onClose} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 space-y-4 flex-grow overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label htmlFor="appName" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('modals.appEdit.nameLabel')}</label>
                  <input
                    type="text"
                    id="appName"
                    value={name}
                    onChange={handleNameChange}
                    required
                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-gray-900 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="appId" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('modals.appEdit.idLabel')}</label>
                  <input
                    type="text"
                    id="appId"
                    value={appId}
                    onChange={handleIdChange}
                    required
                    disabled={isEditing}
                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-gray-900 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-200 dark:disabled:bg-slate-800 disabled:text-gray-500 dark:disabled:text-slate-500"
                  />
                  {idError ? (
                    <p className="mt-1 text-xs text-red-500 dark:text-red-400">{idError}</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500 dark:text-slate-500">{t('modals.appEdit.idHelp')}</p>
                  )}
                </div>
            </div>
            <div>
              <label htmlFor="appDescription" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('modals.appEdit.descriptionLabel')}</label>
              <textarea
                id="appDescription"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-gray-900 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">{t('modals.appEdit.iconLabel')}</label>
              <div className="p-3 bg-gray-100 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-lg grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {availableIcons.map(iconName => {
                    const IconComponent = iconMap[iconName];
                    const isSelected = icon === iconName;
                    return (
                        <button
                            type="button"
                            key={iconName}
                            onClick={() => setIcon(iconName)}
                            title={iconName}
                            className={`p-2 rounded-lg border-2 transition-colors duration-200 ${isSelected ? 'border-indigo-500 bg-indigo-100 dark:bg-indigo-500/20' : 'border-transparent hover:bg-gray-200 dark:hover:bg-slate-700'}`}
                        >
                            <IconComponent className="w-8 h-8 mx-auto text-gray-600 dark:text-slate-300" />
                        </button>
                    )
                })}
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500">{t('general.cancel')}</button>
            <button type="submit" disabled={!name.trim() || !!idError} className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">{t('general.save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
