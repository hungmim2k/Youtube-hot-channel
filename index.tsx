
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import getI18n from './i18n'; // Import i18n configuration function

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Initialize the app
const initApp = async () => {
  console.log('Initializing app...');

  try {
    // Wait for i18n to initialize
    console.log('Waiting for i18n to initialize...');
    const i18n = await getI18n();
    console.log('i18n initialized successfully:', i18n);

    // Check if translations are loaded
    if (i18n && typeof i18n.t === 'function') {
      console.log('Testing translation function...');

      // Test some translations
      const loginTitle = i18n.t('login.title');
      const appTitle = i18n.t('app.title');
      const tabsFinder = i18n.t('tabs.finder');

      console.log('Translation for "login.title":', loginTitle);
      console.log('Translation for "app.title":', appTitle);
      console.log('Translation for "tabs.finder":', tabsFinder);

      // Check if translations are working
      const isWorking = 
        loginTitle !== 'login.title' && 
        appTitle !== 'app.title' && 
        tabsFinder !== 'tabs.finder';

      console.log('Translations working:', isWorking);

      if (!isWorking) {
        console.error('Translations are not working correctly. Raw keys are being returned.');

        // Try to diagnose the issue
        console.log('Current language:', i18n.language);
        console.log('Available languages:', i18n.languages);
        console.log('Resources:', i18n.options?.resources);

        // Try to force a language change
        console.log('Forcing language change to ensure translations are loaded...');
        await i18n.changeLanguage(i18n.language || 'en');

        // Test again
        console.log('Translation after language change - "login.title":', i18n.t('login.title'));
      }
    } else {
      console.error('i18n.t is not a function or i18n is not properly initialized');
    }
  } catch (error) {
    console.error('Error initializing i18n:', error);
  }

  console.log('Rendering app...');
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('App rendered');
};

// Start the app
initApp().catch(error => {
  console.error('Failed to initialize app:', error);
});
