// Shims for i18next libraries
// This file provides mock implementations of the i18next libraries
// to avoid Vite trying to resolve them during development

// Import translations
import enTranslation from './locales/en/translation.json';
import viTranslation from './locales/vi/translation.json';

// Log the imported translations to verify they're loaded correctly
console.log('Imported translations in shims.js:');
console.log('English translation:', enTranslation);
console.log('Vietnamese translation:', viTranslation);

// Translation resources
const resources = {
  en: { translation: enTranslation },
  vi: { translation: viTranslation }
};

// Log the resources to verify they're structured correctly
console.log('Translation resources in shims.js:', resources);

// Helper function to get translation
const getTranslation = (key, lng) => {
  console.log(`Getting translation for key: "${key}" in language: "${lng}"`);

  // Handle empty or invalid keys
  if (!key || typeof key !== 'string') {
    console.error(`Invalid key: "${key}"`);
    return key || '';
  }

  // Check if resources exist for the language
  if (!resources[lng]) {
    console.error(`No resources found for language: "${lng}"`);
    console.log('Available resources:', Object.keys(resources));

    // Try fallback to English
    if (lng !== 'en' && resources['en']) {
      console.log('Trying fallback to English');
      return getTranslation(key, 'en');
    }

    return key;
  }

  // Check if translation object exists
  if (!resources[lng].translation) {
    console.error(`No translation object found for language: "${lng}"`);
    return key;
  }

  // Split the key into parts and navigate the translation object
  const parts = key.split('.');
  let current = resources[lng]?.translation;

  console.log(`Translation object for "${lng}":`, current);
  console.log(`Looking for key "${key}" with parts:`, parts);

  // Traverse the translation object
  for (const part of parts) {
    console.log(`Looking for part: "${part}" in current object:`, current);

    if (current && typeof current === 'object' && part in current) {
      current = current[part];
      console.log(`Found part "${part}", new current:`, current);
    } else {
      console.error(`Part "${part}" not found in current object`);

      // Try to find similar keys for debugging
      if (current && typeof current === 'object') {
        const keys = Object.keys(current);
        const similarKeys = keys.filter(k => k.includes(part) || part.includes(k));
        if (similarKeys.length > 0) {
          console.log(`Similar keys found: ${similarKeys.join(', ')}`);
        }
      }

      // Try fallback to English if not already trying English
      if (lng !== 'en' && resources['en']) {
        console.log('Trying fallback to English');
        return getTranslation(key, 'en');
      }

      return key; // Return key if translation not found
    }
  }

  // Return the result
  const result = typeof current === 'string' ? current : key;
  console.log(`Final translation result for "${key}": "${result}"`);

  return result;
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
    console.log('useTranslation hook called');
    const currentLang = getCurrentLang();
    console.log(`Current language: "${currentLang}"`);

    // Create a wrapped t function that logs each translation call
    const t = (key) => {
      console.log(`Translation requested for key: "${key}"`);

      // Force direct access to the translation object for debugging
      if (key && key.includes('.')) {
        const parts = key.split('.');
        let value = resources[currentLang]?.translation;

        console.log(`Direct lookup for "${key}" in language "${currentLang}"`);
        console.log(`Initial value:`, value);

        let found = true;
        for (const part of parts) {
          if (value && typeof value === 'object' && part in value) {
            value = value[part];
            console.log(`Found part "${part}", value now:`, value);
          } else {
            console.error(`Direct lookup failed at part "${part}"`);
            found = false;
            break;
          }
        }

        if (found && typeof value === 'string') {
          console.log(`Direct lookup successful: "${value}"`);
          return value;
        }
      }

      // Fall back to regular getTranslation if direct lookup fails
      const result = getTranslation(key, currentLang);
      console.log(`Translation result for "${key}": "${result}"`);
      return result;
    };

    return {
      t,
      i18n: {
        changeLanguage: (lng) => {
          console.log(`Changing language to: "${lng}"`);
          if (isBrowser) {
            localStorage.setItem('i18nextLng', lng);
            console.log(`Language set in localStorage: "${lng}"`);
            window.dispatchEvent(new Event('languageChanged'));
            // Force re-render by dispatching a custom event
            window.dispatchEvent(new CustomEvent('i18nextLanguageChanged', { detail: lng }));
            console.log('Language change events dispatched');
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
