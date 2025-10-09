import enTranslation from './locales/en/translation.json';
import viTranslation from './locales/vi/translation.json';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Import shims directly to avoid dynamic imports
import * as shims from './shims';

// Create a synchronous initialization function for server-side rendering
const initializeI18nSync = () => {
  // Use shims directly for consistent behavior
  const i18n = shims.default;
  const initReactI18next = shims.initReactI18next;
  const LanguageDetector = shims.LanguageDetector;

  console.log('Initializing i18n synchronously');
  console.log('Translations loaded:', { en: enTranslation, vi: viTranslation });

  // Initialize i18next synchronously
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
      debug: true, // Enable debug mode to see more information
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

  console.log('i18n initialized synchronously:', i18n);
  return i18n;
};

// Create an asynchronous initialization function for client-side
const initializeI18nAsync = async () => {
  let i18n, initReactI18next, LanguageDetector;

  console.log('Initializing i18n asynchronously');
  console.log('Translations loaded:', { en: enTranslation, vi: viTranslation });

  try {
    // Import from actual libraries
    console.log('Importing i18next libraries...');
    i18n = (await import('i18next')).default;
    initReactI18next = (await import('react-i18next')).initReactI18next;
    LanguageDetector = (await import('i18next-browser-languagedetector')).default;
    console.log('Successfully imported i18next libraries');
  } catch (e) {
    console.warn('Failed to import i18next libraries, falling back to shims', e);
    // Fall back to shims
    i18n = shims.default;
    initReactI18next = shims.initReactI18next;
    LanguageDetector = shims.LanguageDetector;
    console.log('Using shims for i18next libraries');
  }

  console.log('Initializing i18next with libraries:', { i18n, initReactI18next, LanguageDetector });

  // Initialize i18next
  await i18n
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
      debug: true, // Enable debug mode to see more information
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

  // Force a language change to trigger a re-render
  const currentLang = i18n.language || 'en';
  await i18n.changeLanguage(currentLang);

  console.log('i18n initialized asynchronously:', i18n);
  return i18n;
};

// Initialize i18n based on environment
let i18nInstance;
let i18nPromise;

// In browser, use async initialization
// In server, use sync initialization
if (isBrowser) {
  i18nPromise = initializeI18nAsync().then(instance => {
    i18nInstance = instance;
    return instance;
  });
} else {
  // For server-side rendering, initialize synchronously
  i18nInstance = initializeI18nSync();
}

// Export a function that returns the i18n instance or the promise
export default function getI18n() {
  return i18nInstance || i18nPromise;
}
