import i18n, { initReactI18next, LanguageDetector } from './shims';

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
