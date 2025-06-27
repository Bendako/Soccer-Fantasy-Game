'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import en from '../../messages/en.json';
import he from '../../messages/he.json';

type Messages = typeof en;
type Locale = 'en' | 'he';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const messages: Record<Locale, Messages> = {
  en,
  he
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');
  
  // Load saved locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && ['en', 'he'].includes(savedLocale)) {
      setLocale(savedLocale);
    }
  }, []);
  
  // Save locale to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('locale', locale);
    
    // Update document language without changing direction
    document.documentElement.lang = locale;
    
    // Add a data attribute for CSS styling if needed
    document.documentElement.setAttribute('data-locale', locale);
  }, [locale]);
  
  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: unknown = messages[locale];
    
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    
    if (typeof value !== 'string') {
      return key; // Return key if translation not found
    }
    
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] || match;
      });
    }
    
    return value;
  };

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}

// Utility function to get direction for text elements when needed
export function getTextDirection(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'he' ? 'rtl' : 'ltr';
}

// Custom hook for Hebrew text styling
export function useHebrewText() {
  const { locale } = useTranslation();
  
  const getTextProps = () => {
    const isHebrew = locale === 'he';
    return {
      dir: isHebrew ? 'rtl' as const : 'ltr' as const,
      className: isHebrew ? 'text-right' : 'text-left'
    };
  };
  
  return { getTextProps, isHebrew: locale === 'he' };
} 