// Shims for i18next libraries
// This file provides mock implementations of the i18next libraries
// to avoid Vite trying to resolve them during development

// Import translations
import enTranslation from './locales/en/translation.json';
import viTranslation from './locales/vi/translation.json';

// Translation resources
const resources = {
  en: { translation: enTranslation },
  vi: { translation: viTranslation }
};

// Helper function to get translation
const getTranslation = (key, lng) => {
  const parts = key.split('.');
  let current = resources[lng]?.translation;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return key; // Return key if translation not found
    }
  }

  return typeof current === 'string' ? current : key;
};

// Mock i18next
window.i18next = window.i18next || {
  createInstance: () => ({
    use: () => ({ use: () => ({ init: () => {} }) }),
    t: (key) => getTranslation(key, window.localStorage.getItem('i18nextLng') || 'en'),
    changeLanguage: (lng) => {
      window.localStorage.setItem('i18nextLng', lng);
      window.dispatchEvent(new Event('languageChanged'));
    },
    language: window.localStorage.getItem('i18nextLng') || 'en',
  }),
};

// Mock react-i18next
window.reactI18next = window.reactI18next || {
  useTranslation: () => {
    const currentLang = window.localStorage.getItem('i18nextLng') || 'en';
    return {
      t: (key) => getTranslation(key, currentLang),
      i18n: {
        changeLanguage: (lng) => {
          window.localStorage.setItem('i18nextLng', lng);
          window.dispatchEvent(new Event('languageChanged'));
          // Force re-render by dispatching a custom event
          window.dispatchEvent(new CustomEvent('i18nextLanguageChanged', { detail: lng }));
        },
        language: currentLang,
      },
    };
  },
  initReactI18next: { type: 'i18next' },
};

// Mock i18next-browser-languagedetector
window.i18nextBrowserLanguageDetector = window.i18nextBrowserLanguageDetector || {
  type: 'languageDetector',
};

// Export the mocks
export const i18n = window.i18next.createInstance ? window.i18next.createInstance() : window.i18next;
export const useTranslation = window.reactI18next.useTranslation;
export const initReactI18next = window.reactI18next.initReactI18next;
export const LanguageDetector = window.i18nextBrowserLanguageDetector;

export default i18n;
