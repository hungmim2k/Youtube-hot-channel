
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
  // Wait for i18n to initialize
  await getI18n();

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Start the app
initApp().catch(error => {
  console.error('Failed to initialize app:', error);
});
