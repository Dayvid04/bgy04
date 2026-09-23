import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Language, translations, TranslationKey } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
  formatCurrency: (amount: number | undefined | null) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'bgy_language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'fr' || saved === 'en') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en'; // English is default language
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch (err) {
      console.warn('Could not persist language to localStorage:', err);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  }, [language, setLanguage]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback((key: string, variables?: Record<string, string | number>): string => {
    const langDict = translations[language] || translations.en;
    let text = (langDict as any)[key] || (translations.en as any)[key] || key;

    if (variables) {
      Object.entries(variables).forEach(([k, val]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(val));
      });
    }

    return text;
  }, [language]);

  // Format currency consistently as RWF in both languages
  const formatCurrency = useCallback((amount: number | undefined | null): string => {
    if (amount == null || isNaN(amount)) {
      return '0 RWF';
    }
    const rounded = Math.round(amount);
    return `${rounded.toLocaleString('en-US')} RWF`;
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        formatCurrency,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
