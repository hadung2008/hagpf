
// FIX: Corrected React import to include useState and useMemo.
import React, { useState, useMemo, useEffect } from 'react';
import { User } from '../types';
import { RectangleGroupIcon, ShieldCheckIcon, ArrowLeftOnRectangleIcon, PinIcon, PencilIcon, TrashIcon, PlusIcon, iconMap, LinkIcon } from './icons';
import { Logo } from './Logo';
import { AppEditModal } from './AppEditModal';
import { ConfirmationModal } from './ConfirmationModal';
import { useTranslation } from '../lib/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';

interface AppInfo {
  id: string;
  name: string; // This will now be a translation key OR a custom name
  description: string; // This will now be a translation key OR a custom description
  icon: string;
  lastModified: string;
  link?: string;
}

const initialApps: (Omit<AppInfo, 'name' | 'description'> & { name?: string; description?: string })[] = [
  { 
    id: 'ApprovalFlow', 
    icon: 'RectangleGroupIcon',
    lastModified: '4 hours ago'
  },
  { 
    id: 'RolePermissions', 
    icon: 'ShieldCheckIcon',
    lastModified: '12 minutes ago'
  },
  { 
    id: 'RepairShop', 
    icon: 'BriefcaseIcon',
    lastModified: 'Just now'
  },
];

interface AppSelectorProps {
  currentUser: User;
  onSelectApp: (appId: string) => void;
  onLogout: () => void;
  theme: string;
  setTheme: (theme: string) => void;
}

interface AppCardProps {
    app: AppInfo;
    isPinned: boolean;
    onSelectApp: (appId: string) => void;
    onTogglePin: (e: React.MouseEvent, appId: string) => void;
    onOpenEditModal: (e: React.MouseEvent, app: AppInfo) => void;
    onOpenDeleteConfirm: (e: React.MouseEvent, appId: string) => void;
}

// FIX: Moved AppCard outside of AppSelector to prevent re-definition on every render, which is a React anti-pattern and likely cause of error #310.
const AppCard: React.FC<AppCardProps> = ({ app, isPinned, onSelectApp, onTogglePin, onOpenEditModal, onOpenDeleteConfirm }) => {
    const IconComponent = iconMap[app.icon] || RectangleGroupIcon;
    const { t } = useTranslation();

    const handleAppClick = () => {
        if (app.link) {
            window.open(app.link, '_blank');
        } else {
            onSelectApp(app.id);
        }
    };

    return (
      <div className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 hover:border-indigo-500/50 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
          <button 
              onClick={handleAppClick}
              className="w-full h-full text-left p-6 flex flex-col"
              aria-label={`Open ${app.name}`}
          >
              <div className="mb-4 flex justify-between items-start">
                  <IconComponent className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
                  {app.link && <LinkIcon className="w-5 h-5 text-gray-400 dark:text-slate-500" />}
              </div>
              
              <div className="flex-grow">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                      {app.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {app.description}
                  </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700/50">
                   <p className="text-xs text-gray-500 dark:text-slate-500">
                      {t('appSelector.lastModified', { time: app.lastModified })}
                  </p>
              </div>
          </button>
          
          <div className="absolute top-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                  onClick={(e) => onTogglePin(e, app.id)}
                  className={`p-1.5 bg-gray-100 dark:bg-slate-700/50 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors ${isPinned ? 'text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300' : 'text-gray-500 dark:text-slate-400 hover:text-black dark:hover:text-white'}`}
                  title={isPinned ? t('appSelector.unpinApp') : t('appSelector.pinApp')}
              >
                  <PinIcon className="w-4 h-4"/>
              </button>
              <button 
                  onClick={(e) => onOpenEditModal(e, app)}
                  className="p-1.5 bg-gray-100 dark:bg-slate-700/50 rounded-full text-gray-500 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors" 
                  title={t('appSelector.editApp')}
              >
                  <PencilIcon className="w-4 h-4"/>
              </button>
               <button 
                  onClick={(e) => onOpenDeleteConfirm(e, app.id)}
                  className="p-1.5 bg-gray-100 dark:bg-slate-700/50 rounded-full text-gray-500 dark:text-slate-400 hover:text-white hover:bg-red-500 dark:hover:bg-red-500/80 transition-colors" 
                  title={t('appSelector.deleteApp')}
              >
                  <TrashIcon className="w-4 h-4"/>
              </button>
          </div>
      </div>
    );
};


export const AppSelector: React.FC<AppSelectorProps> = ({ currentUser, onSelectApp, onLogout, theme, setTheme }) => {
  const { t } = useTranslation();
  
  // Initialize apps from localStorage if available, otherwise use initialApps
  const [appsData, setAppsData] = useState<(Omit<AppInfo, 'name' | 'description'> & { name?: string; description?: string })[]>(() => {
    try {
      const savedApps = localStorage.getItem('HAG_APPS_DATA');
      return savedApps ? JSON.parse(savedApps) : initialApps;
    } catch (error) {
      console.error('Failed to load apps from localStorage', error);
      return initialApps;
    }
  });

  // Initialize pinned state from localStorage
  const [pinnedAppIds, setPinnedAppIds] = useState<Set<string>>(() => {
    try {
      const savedPins = localStorage.getItem('HAG_PINNED_APPS');
      return savedPins ? new Set(JSON.parse(savedPins)) : new Set();
    } catch (error) {
      console.error('Failed to load pinned apps from localStorage', error);
      return new Set();
    }
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AppInfo | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deletingAppId, setDeletingAppId] = useState<string | null>(null);

  // Save to localStorage whenever appsData changes
  useEffect(() => {
    localStorage.setItem('HAG_APPS_DATA', JSON.stringify(appsData));
  }, [appsData]);

  // Save to localStorage whenever pinnedAppIds changes
  useEffect(() => {
    localStorage.setItem('HAG_PINNED_APPS', JSON.stringify(Array.from(pinnedAppIds)));
  }, [pinnedAppIds]);

  const apps: AppInfo[] = useMemo(() => appsData.map(app => {
      // Try to get translation
      const translatedName = t(`apps.${app.id}.name`);
      const translatedDesc = t(`apps.${app.id}.description`);

      // If translation key matches the input (meaning no translation found), or if app has a custom name override (from user input), prefer custom name
      // Note: t() returns the key if not found.
      const hasTranslationName = translatedName !== `apps.${app.id}.name`;
      const hasTranslationDesc = translatedDesc !== `apps.${app.id}.description`;

      return {
        ...app,
        name: (hasTranslationName ? translatedName : app.name) || app.name || translatedName,
        description: (hasTranslationDesc ? translatedDesc : app.description) || app.description || translatedDesc,
      };
  }), [appsData, t]);


  const togglePin = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation(); // Prevent card click which would launch the app
    setPinnedAppIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(appId)) {
        newSet.delete(appId);
      } else {
        newSet.add(appId);
      }
      return newSet;
    });
  };

  const handleOpenEditModal = (e: React.MouseEvent, app: AppInfo | null) => {
    e.stopPropagation();
    setEditingApp(app);
    setIsEditModalOpen(true);
  };
  
  const handleOpenAddModal = () => {
    setEditingApp(null);
    setIsEditModalOpen(true);
  };

  const handleSaveApp = (appData: Omit<AppInfo, 'lastModified'>) => {
    if (editingApp) { // Editing
      setAppsData(prev => prev.map(app => 
        app.id === editingApp.id 
        ? { ...app, ...appData, id: editingApp.id, lastModified: 'Just now' } 
        : app
      ));
    } else { // Adding
      if (appsData.some(app => app.id === appData.id)) {
        alert(t('appSelector.idExistsError'));
        return;
      }
      const newApp = {
        ...appData,
        lastModified: 'Just now',
      };
      setAppsData(prev => [...prev, newApp]);
    }
    setIsEditModalOpen(false);
    setEditingApp(null);
  };
  
  const handleOpenDeleteConfirm = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    setDeletingAppId(appId);
    setIsConfirmModalOpen(true);
  }

  const handleDeleteApp = () => {
    if (deletingAppId) {
      setAppsData(prev => prev.filter(app => app.id !== deletingAppId));
      // Also unpin it if it was pinned
      setPinnedAppIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(deletingAppId);
        return newSet;
      });
      setDeletingAppId(null);
      setIsConfirmModalOpen(false);
    }
  };

  const pinnedApps = useMemo(() => {
    return apps.filter(app => pinnedAppIds.has(app.id));
  }, [apps, pinnedAppIds]);
  
  const unpinnedApps = useMemo(() => {
    return apps.filter(app => !pinnedAppIds.has(app.id));
  }, [apps, pinnedAppIds]);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                    <Logo className="h-8 w-8 mr-3" />
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white tracking-tight truncate">
                        {t('appSelector.title')}
                    </h1>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                     <LanguageSwitcher />
                     <ThemeSwitcher theme={theme} setTheme={setTheme} />
                     <div className="text-right hidden lg:block">
                        <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{currentUser.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{t(`enums.userRoles.${currentUser.role}`)} - {t(`enums.departments.${currentUser.department}`)}</p>
                     </div>
                    <button
                        onClick={onLogout}
                        title={t('appSelector.logout')}
                        className="flex items-center justify-center h-10 w-10 sm:w-auto sm:px-3 sm:py-2 rounded-md text-gray-500 dark:text-slate-400 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-100 dark:focus:ring-offset-slate-900 transition-colors"
                    >
                        <ArrowLeftOnRectangleIcon className="w-5 h-5 sm:mr-2" />
                        <span className="hidden sm:inline">{t('appSelector.logout')}</span>
                    </button>
                </div>
            </div>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {pinnedApps.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">{t('appSelector.pinnedApps')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pinnedApps.map(app => <AppCard 
                key={app.id} 
                app={app} 
                isPinned={true}
                onSelectApp={onSelectApp}
                onTogglePin={togglePin}
                onOpenEditModal={handleOpenEditModal}
                onOpenDeleteConfirm={handleOpenDeleteConfirm}
              />)}
            </div>
          </section>
        )}

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {pinnedApps.length > 0 ? t('appSelector.allApps') : 'HAG Applications'}
            </h2>
            <button onClick={handleOpenAddModal} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-50 dark:focus:ring-offset-slate-950">
                <PlusIcon className="w-5 h-5 mr-2 -ml-1"/>
                {t('appSelector.addApp')}
            </button>
          </div>
          {apps.length > 0 && unpinnedApps.length === 0 && pinnedApps.length > 0 ? (
             <div className="text-center py-10 bg-gray-100 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
                <p className="text-gray-500 dark:text-slate-400">{t('appSelector.allPinned')}</p>
             </div>
          ) : unpinnedApps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unpinnedApps.map(app => <AppCard 
                key={app.id}
                app={app}
                isPinned={false}
                onSelectApp={onSelectApp}
                onTogglePin={togglePin}
                onOpenEditModal={handleOpenEditModal}
                onOpenDeleteConfirm={handleOpenDeleteConfirm}
              />)}
            </div>
          ) : (
             <div className="text-center py-10 bg-gray-100 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
                <p className="text-gray-500 dark:text-slate-400">{t('appSelector.noApps')}</p>
             </div>
          )}
        </section>
      </main>
      
      {isEditModalOpen && (
          <AppEditModal 
              app={editingApp}
              onSave={handleSaveApp}
              onClose={() => setIsEditModalOpen(false)}
              allApps={apps}
          />
      )}

      {isConfirmModalOpen && (
          <ConfirmationModal
              title={t('modals.deleteAppTitle')}
              message={t('modals.deleteAppMessage')}
              onConfirm={handleDeleteApp}
              onCancel={() => setIsConfirmModalOpen(false)}
          />
      )}
    </div>
  );
};
