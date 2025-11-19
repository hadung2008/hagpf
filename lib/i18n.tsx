
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { LoadingSpinner } from '../components/LoadingSpinner';

export type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const [enResponse, viResponse] = await Promise.all([
          fetch('/locales/en.json'),
          fetch('/locales/vi.json')
        ]);
        if (!enResponse.ok || !viResponse.ok) {
          throw new Error('Failed to load translation files');
        }
        const enData = await enResponse.json();
        const viData = await viResponse.json();
        setTranslations({ en: enData, vi: viData });
      } catch (error) {
        console.error("Could not load translations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslations();
  }, []);

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    if (isLoading || !translations) {
      return key; // Return key as fallback during load
    }

    const keys = key.split('.');
    let current = translations[language];
    let fallback = translations['en'];

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        current = null;
        break;
      }
    }

    if (current === null) {
      for (const k of keys) {
        if (fallback && typeof fallback === 'object' && k in fallback) {
          fallback = fallback[k];
        } else {
          return key;
        }
      }
      current = fallback;
    }
    
    let translated = String(current);

    if (replacements) {
      for (const placeholder in replacements) {
        translated = translated.replace(`{${placeholder}}`, String(replacements[placeholder]));
      }
    }

    return translated;
  };

  if (isLoading) {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex items-center justify-center">
            <LoadingSpinner message="Loading languages..." />
        </div>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
