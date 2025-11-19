
import React, { useState } from 'react';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from './icons';
import { Logo } from './Logo';
import { User } from '../types';
import { useTranslation } from '../lib/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  users: User[];
  theme: string;
  setTheme: (theme: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, users, theme, setTheme }) => {
  const { t, language } = useTranslation();
  const [email, setEmail] = useState('alice@company.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Find user based on email. For demo, we'll check the name part of the email.
    // e.g., 'alice@company.com' logs in as 'Alice'.
    const emailName = email.split('@')[0].toLowerCase();
    const userToLogin = users.find(u => u.name.toLowerCase().startsWith(emailName));

    if (userToLogin && password.trim()) { // Still check for password presence
      onLoginSuccess(userToLogin);
    } else {
      setError(t('login.error'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <LanguageSwitcher />
        <ThemeSwitcher theme={theme} setTheme={setTheme} />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <Logo className="h-20 w-20 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('login.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">{t('login.subtitle')}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('login.emailLabel')}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('login.passwordLabel')}
              </label>
              <div className="mt-1 relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  {t('login.rememberMe')}
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                  {t('login.forgotPassword')}
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t('login.signInButton')}
              </button>
            </div>
          </form>
            <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-4">
              <p className="font-semibold mb-2">{t('login.demoLogins')}</p>
              <ul className="space-y-1">
                {users.filter(u => u.id !== 'user-5') // Thêm điều kiện filter() ở đây
                .map(u => (
                  <li key={u.id}>
                    <span className="font-mono text-indigo-500 dark:text-indigo-400">
                      {u.name.split(' ')[0].toLowerCase()}@company.com 
                    </span> ({language === 'vi' ? t(`enums.userRoles.${u.role}`) : u.role})
                  </li>
                ))}
              </ul>
            </div>
        </div>
      </div>
    </div>
  );
};
