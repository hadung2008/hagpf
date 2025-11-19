
import React, { useState, useEffect } from 'react';
import { XMarkIcon, iconMap, availableIcons } from './icons';
import { useTranslation } from '../lib/i18n';

interface AppInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  lastModified: string;
  link?: string;
}

interface AppEditModalProps {
  app: AppInfo | null;
  onSave: (appData: Omit<AppInfo, 'lastModified'>) => void;
  onClose: () => void;
  allApps: AppInfo[];
}

export const AppEditModal: React.FC<AppEditModalProps> = ({ app, onSave, onClose, allApps }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [appId, setAppId] = useState('');
  const [icon, setIcon] = useState('RectangleGroupIcon');
  const [link, setLink] = useState('');
  const [idError, setIdError] = useState('');
  const [nameError, setNameError] = useState('');

  const isEditing = !!app;

  useEffect(() => {
    if (app) {
      setName(app.name || '');
      setDescription(app.description || '');
      setAppId(app.id || '');
      setIcon(app.icon || 'RectangleGroupIcon');
      setLink(app.link || '');
    } else {
      setName('');
      setDescription('');
      setAppId('');
      setIcon('RectangleGroupIcon');
      setLink('');
    }
    setIdError('');
    setNameError('');
  }, [app]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (newName.trim()) setNameError('');
    
    if (!isEditing) {
      const suggestedId = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      setAppId(suggestedId);
      // Clear ID error if we generate a new one (we'll re-validate on blur or submit)
      setIdError(''); 
    }
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newId = e.target.value;
    setAppId(newId);
    if (newId.trim()) setIdError('');
  };
  
  const validateId = (id: string) => {
    if (!id.trim()) {
      setIdError(t('general.required'));
      return false;
    }
    if (allApps.some(a => a.id === id && a.id !== app?.id)) {
      setIdError(t('modals.appEdit.idError'));
      return false;
    }
    setIdError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let isValid = true;

    // Validate Name
    if (!name.trim()) {
        setNameError(t('general.required'));
        isValid = false;
    }

    // Validate ID
    if (!validateId(appId)) {
        isValid = false;
    }

    if (!isValid) return;

    onSave({
      id: appId,
      name,
      description,
      icon,
      link,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden transform transition-all scale-100"
      >
          <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                {isEditing ? t('modals.appEdit.editTitle') : t('modals.appEdit.addTitle')}
            </h2>
            <button 
                type="button" 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Added min-h-0 to ensure flex scrolling works correctly inside max-h container */}
          <div className="p-6 space-y-5 flex-grow overflow-y-auto min-h-0">
            <div>
                <label htmlFor="appName" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                    {t('modals.appEdit.nameLabel')}
                </label>
                <input
                type="text"
                id="appName"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g., HR Management"
                className={`w-full bg-white dark:bg-slate-900 border rounded-lg px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all ${nameError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-slate-600 focus:border-indigo-500'}`}
                />
                {nameError && <p className="mt-1.5 text-sm text-red-500 dark:text-red-400 font-medium">{nameError}</p>}
            </div>

            <div>
                <label htmlFor="appId" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                    {t('modals.appEdit.idLabel')}
                </label>
                <input
                type="text"
                id="appId"
                value={appId}
                onChange={handleIdChange}
                onBlur={() => validateId(appId)}
                disabled={isEditing}
                className={`w-full bg-white dark:bg-slate-900 border rounded-lg px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:text-gray-500 dark:disabled:text-slate-500 ${idError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-slate-600 focus:border-indigo-500'}`}
                />
                {idError ? (
                <p className="mt-1.5 text-sm text-red-500 dark:text-red-400 font-medium">{idError}</p>
                ) : (
                <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-500">{t('modals.appEdit.idHelp')}</p>
                )}
            </div>

            <div>
                <label htmlFor="appDescription" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                    {t('modals.appEdit.descriptionLabel')}
                </label>
                <textarea
                id="appDescription"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Briefly describe the application..."
                className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all resize-none"
                />
            </div>

             <div>
                <label htmlFor="appLink" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                    {t('modals.appEdit.linkLabel')}
                </label>
                <input
                type="url"
                id="appLink"
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                />
                <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-500">{t('modals.appEdit.linkHelp')}</p>
            </div>
            
             <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                {t('modals.appEdit.iconLabel')}
              </label>
              <div className="bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl p-4">
                  <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {availableIcons.map(iconName => {
                        const IconComponent = iconMap[iconName];
                        const isSelected = icon === iconName;
                        return (
                            <button
                                type="button"
                                key={iconName}
                                onClick={() => setIcon(iconName)}
                                title={iconName}
                                className={`aspect-square flex items-center justify-center rounded-lg transition-all duration-200 ${isSelected ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-800' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-slate-700'}`}
                            >
                                <IconComponent className="w-6 h-6" />
                            </button>
                        )
                    })}
                  </div>
              </div>
            </div>
          </div>

          <div className="p-5 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-3 flex-shrink-0">
            <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 focus:ring-2 focus:ring-gray-200 dark:focus:ring-slate-700 transition-all"
            >
                {t('general.cancel')}
            </button>
            <button 
                type="submit" 
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95"
            >
                {t('general.save')}
            </button>
          </div>
      </form>
    </div>
  );
};
