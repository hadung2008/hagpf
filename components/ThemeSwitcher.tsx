import React from 'react';
import { SunIcon, MoonIcon } from './icons';

interface ThemeSwitcherProps {
  theme: string;
  setTheme: (theme: string) => void;
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, setTheme, className }) => {
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-slate-500" />}
    </button>
  );
};