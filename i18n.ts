// Try to import from actual libraries first, fall back to shims if not available
let i18n, initReactI18next, LanguageDetector;

try {
  // Import from actual libraries
  i18n = (await import('i18next')).default;
  initReactI18next = (await import('react-i18next')).initReactI18next;
  LanguageDetector = (await import('i18next-browser-languagedetector')).default;
} catch (e) {
  console.warn('Failed to import i18next libraries, falling back to shims', e);
  // Fall back to shims
  const shims = await import('./shims');
  i18n = shims.default;
  initReactI18next = shims.initReactI18next;
  LanguageDetector = shims.LanguageDetector;
}

import enTranslation from './locales/en/translation.json';
import viTranslation from './locales/vi/translation.json';

// Initialize i18next
i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Resources containing translations
    resources: {
      en: {
        translation: enTranslation
      },
      vi: {
        translation: viTranslation
      }
    },
    // Default language
    fallbackLng: 'en',
    // Debug mode
    debug: false,
    // Detect and cache language on localStorage
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    // Interpolation options
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
