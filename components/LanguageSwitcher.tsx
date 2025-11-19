import React from 'react';
import { useTranslation } from '../lib/i18n';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
  const { language, setLanguage } = useTranslation();

  return (
    <div className={`flex items-center bg-gray-200 dark:bg-slate-700 rounded-full p-1 ${className}`}>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${language === 'en' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-300 dark:hover:bg-slate-600'}`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('vi')}
        className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${language === 'vi' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-300 dark:hover:bg-slate-600'}`}
      >
        VI
      </button>
    </div>
  );
};