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

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Default language
const defaultLang = 'en';

// Get current language (safely)
const getCurrentLang = () => {
  if (isBrowser) {
    return localStorage.getItem('i18nextLng') || defaultLang;
  }
  return defaultLang;
};

// Create mock i18next
const mockI18next = {
  createInstance: () => ({
    use: () => ({ use: () => ({ init: () => {} }) }),
    t: (key) => getTranslation(key, getCurrentLang()),
    changeLanguage: (lng) => {
      if (isBrowser) {
        localStorage.setItem('i18nextLng', lng);
        window.dispatchEvent(new Event('languageChanged'));
      }
    },
    language: getCurrentLang(),
  }),
};

// Create mock reactI18next
const mockReactI18next = {
  useTranslation: () => {
    const currentLang = getCurrentLang();
    return {
      t: (key) => getTranslation(key, currentLang),
      i18n: {
        changeLanguage: (lng) => {
          if (isBrowser) {
            localStorage.setItem('i18nextLng', lng);
            window.dispatchEvent(new Event('languageChanged'));
            // Force re-render by dispatching a custom event
            window.dispatchEvent(new CustomEvent('i18nextLanguageChanged', { detail: lng }));
          }
        },
        language: currentLang,
      },
    };
  },
  initReactI18next: { type: 'i18next' },
};

// Create mock languageDetector
const mockLanguageDetector = {
  type: 'languageDetector',
};

// Set up browser globals if we're in a browser
if (isBrowser) {
  // Check if the actual libraries are already loaded
  const hasI18next = typeof window.i18next !== 'undefined' && typeof window.i18next.createInstance === 'function';
  const hasReactI18next = typeof window.reactI18next !== 'undefined' && typeof window.reactI18next.useTranslation === 'function';
  const hasLanguageDetector = typeof window.i18nextBrowserLanguageDetector !== 'undefined';

  // Only create mock objects if the actual libraries are not already loaded
  if (!hasI18next) {
    window.i18next = mockI18next;
  }

  if (!hasReactI18next) {
    window.reactI18next = mockReactI18next;
  }

  if (!hasLanguageDetector) {
    window.i18nextBrowserLanguageDetector = mockLanguageDetector;
  }
}

// Export the mocks (safely)
export const i18n = isBrowser && window.i18next.createInstance ? 
  window.i18next.createInstance() : 
  mockI18next.createInstance();

export const useTranslation = isBrowser && window.reactI18next ? 
  window.reactI18next.useTranslation : 
  mockReactI18next.useTranslation;

export const initReactI18next = isBrowser && window.reactI18next ? 
  window.reactI18next.initReactI18next : 
  mockReactI18next.initReactI18next;

export const LanguageDetector = isBrowser && window.i18nextBrowserLanguageDetector ? 
  window.i18nextBrowserLanguageDetector : 
  mockLanguageDetector;

export default i18n;
