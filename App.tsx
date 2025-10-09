
import React, { useState, useEffect } from 'react';
import { ChannelKeywordsAnalyzer } from './components/ChannelKeywordsAnalyzer';
import { HotChannelsFinder } from './components/HotChannelsFinder';
import { HudHeader } from './components/HudHeader';
import { Tab, Tabs } from './components/Tabs';
import { AnalyticsIcon, SearchIcon, SettingsIcon, TrendingIcon, UserIcon } from './components/icons/Icons';
import { ApiKeyProvider, useApiKeys } from './contexts/ApiKeyContext';
import { OptimizationProvider } from './contexts/OptimizationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ApiSettings } from './components/ApiSettings';
import { Trending } from './components/Trending';
import { setQuotaTracker } from './services/youtubeService';
import { useTranslation } from './shims';
import { LoginForm } from './components/LoginForm';

type ActiveTab = 'finder' | 'trending' | 'analyzer' | 'settings' | 'admin';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('settings');
  const [, forceUpdate] = useState({});
  const { incrementQuotaUsage, apiKeys } = useApiKeys();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  // Debug translations
  useEffect(() => {
    console.log('AppContent: Translations test');
    console.log('Current language:', i18n?.language);
    console.log('Translation for "login.title":', t('login.title'));
    console.log('Translation for "app.title":', t('app.title'));
    console.log('Translation for "tabs.finder":', t('tabs.finder'));

    // Check if translations are working
    const isWorking = 
      t('login.title') !== 'login.title' && 
      t('app.title') !== 'app.title' && 
      t('tabs.finder') !== 'tabs.finder';

    console.log('AppContent: Translations working:', isWorking);

    if (!isWorking && i18n) {
      // Try to force a language change
      console.log('AppContent: Forcing language change to ensure translations are loaded...');
      const currentLang = i18n.language || 'en';
      i18n.changeLanguage(currentLang);
    }
  }, [t, i18n]);

  // Initialize the quota tracker
  useEffect(() => {
    if (incrementQuotaUsage) {
      setQuotaTracker(incrementQuotaUsage);
    }
  }, [incrementQuotaUsage]);

  // Redirect to finder tab if API keys are already set (only on initial load)
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (apiKeys && apiKeys.length > 0 && initialLoad) {
      setActiveTab('finder');
      setInitialLoad(false);
    }
  }, [apiKeys, initialLoad]);

  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      // Force re-render
      forceUpdate({});
    };

    window.addEventListener('i18nextLanguageChanged', handleLanguageChange);

    return () => {
      window.removeEventListener('i18nextLanguageChanged', handleLanguageChange);
    };
  }, []);

  // Check if user is logged in
  if (!user) {
    return <LoginForm />;
  }

  return (
    <div 
      className="min-h-screen bg-hud-bg text-hud-text bg-fixed"
      style={{
        backgroundImage: 'linear-gradient(rgba(10, 16, 20, 0.95), rgba(10, 16, 20, 0.95)), radial-gradient(circle at center, rgba(39, 67, 88, 0.2) 0%, transparent 60%), linear-gradient(0deg, rgba(39, 67, 88, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(39, 67, 88, 0.1) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 100% 100%, 20px 20px, 20px 20px',
      }}
    >
      <HudHeader />
      <main className="p-4 sm:p-6 lg:p-8">
        <Tabs>
          <Tab 
            isActive={activeTab === 'finder'} 
            onClick={() => setActiveTab('finder')}
          >
            <SearchIcon className="w-5 h-5 mr-2" />
            {t('tabs.finder')}
          </Tab>
           <Tab 
            isActive={activeTab === 'trending'} 
            onClick={() => setActiveTab('trending')}
          >
            <TrendingIcon className="w-5 h-5 mr-2" />
            {t('tabs.trending')}
          </Tab>
          <Tab 
            isActive={activeTab === 'analyzer'} 
            onClick={() => setActiveTab('analyzer')}
          >
            <AnalyticsIcon className="w-5 h-5 mr-2" />
            {t('tabs.analyzer')}
          </Tab>
          <Tab 
            isActive={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
          >
            <SettingsIcon className="w-5 h-5 mr-2" />
            {t('tabs.settings')}
          </Tab>
          {user.role === 'admin' && (
            <Tab 
              isActive={activeTab === 'admin'} 
              onClick={() => setActiveTab('admin')}
            >
              <UserIcon className="w-5 h-5 mr-2" />
              {t('tabs.admin')}
            </Tab>
          )}
        </Tabs>

        <div className="mt-6">
          {activeTab === 'finder' && <HotChannelsFinder />}
          {activeTab === 'trending' && <Trending />}
          {activeTab === 'analyzer' && <ChannelKeywordsAnalyzer />}
          {activeTab === 'settings' && <ApiSettings />}
          {activeTab === 'admin' && user.role === 'admin' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-hud-text">{t('admin.adminPanel')}</h2>
              {/* Admin panel components will go here */}
            </div>
          )}
        </div>
      </main>
      <footer className="text-center p-4 text-hud-text-secondary text-xs">
        <p>{t('app.footer')}</p>
      </footer>
    </div>
  );
}


const App: React.FC = () => {
  return (
    <AuthProvider>
      <ApiKeyProvider>
        <OptimizationProvider>
          <AppContent />
        </OptimizationProvider>
      </ApiKeyProvider>
    </AuthProvider>
  );
};


export default App;
