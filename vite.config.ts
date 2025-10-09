import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // Include i18next libraries in the build
      optimizeDeps: {
        include: ['i18next', 'react-i18next', 'i18next-browser-languagedetector']
      },
      build: {
        // Ensure JSON files (translations) are included in the build
        assetsInlineLimit: 0,
        // Improve chunk splitting for better caching
        rollupOptions: {
          output: {
            manualChunks: {
              'i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
              'translations': ['./locales/en/translation.json', './locales/vi/translation.json']
            }
          }
        }
      }
    };
});
