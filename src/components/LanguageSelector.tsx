'use client';

import { useTranslation } from '@/lib/i18n';

export function LanguageSelector() {
  const { locale, setLocale } = useTranslation();

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'he' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="lang-toggle gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700"
      title={`Switch to ${locale === 'en' ? 'Hebrew' : 'English'}`}
    >
      <span className="text-base">{locale === 'en' ? '🇺🇸' : '🇮🇱'}</span>
      <span>{locale === 'en' ? 'EN' : 'עב'}</span>
    </button>
  );
} 