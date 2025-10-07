
import React, { useState, useEffect } from 'react';
import { ChannelKeywordsAnalyzer } from './components/ChannelKeywordsAnalyzer';
import { HotChannelsFinder } from './components/HotChannelsFinder';
import { HudHeader } from './components/HudHeader';
import { Tab, Tabs } from './components/Tabs';
import { AnalyticsIcon, SearchIcon, SettingsIcon, TrendingIcon } from './components/icons/Icons';
import { ApiKeyProvider, useApiKeys } from './contexts/ApiKeyContext';
import { OptimizationProvider } from './contexts/OptimizationContext';
import { ApiSettings } from './components/ApiSettings';
import { Trending } from './components/Trending';
import { setQuotaTracker } from './services/youtubeService';
import { useTranslation } from './shims';

type ActiveTab = 'finder' | 'trending' | 'analyzer' | 'settings';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('finder');
  const [, forceUpdate] = useState({});
  const { incrementQuotaUsage } = useApiKeys();
  const { t } = useTranslation();

  // Initialize the quota tracker
  useEffect(() => {
    if (incrementQuotaUsage) {
      setQuotaTracker(incrementQuotaUsage);
    }
  }, [incrementQuotaUsage]);

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
        </Tabs>

        <div className="mt-6">
          {activeTab === 'finder' && <HotChannelsFinder />}
          {activeTab === 'trending' && <Trending />}
          {activeTab === 'analyzer' && <ChannelKeywordsAnalyzer />}
          {activeTab === 'settings' && <ApiSettings />}
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
    <ApiKeyProvider>
      <OptimizationProvider>
        <AppContent />
      </OptimizationProvider>
    </ApiKeyProvider>
  );
};


export default App;
