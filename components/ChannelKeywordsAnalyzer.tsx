import React, { useState } from 'react';
import { Panel } from './Panel';
import { CopyIcon, InfoIcon } from './icons/Icons';
import { useApiKeys } from '../contexts/ApiKeyContext';
import { useAuth } from '../contexts/AuthContext';
import * as youtubeService from '../services/youtubeService';
import { useTranslation } from '../shims';

export const ChannelKeywordsAnalyzer: React.FC = () => {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keywords, setKeywords] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { activeKey } = useApiKeys();
  const { trackKeyword } = useAuth();

  const handleAnalyze = async () => {
    const channelIdentifier = url.trim();
    if (!channelIdentifier) {
      setError(t('errors.enterChannelUrl'));
      return;
    }
    if (!activeKey) {
        setError(t('errors.apiKeyNotSet'));
        return;
    }

    setError(null);
    setIsLoading(true);
    setKeywords(null);

    // Track the channel URL search
    try {
      // Get client IP address (in a real app, this would be done server-side)
      const clientIP = window.location.hostname || '127.0.0.1';
      await trackKeyword(channelIdentifier, clientIP);
    } catch (e) {
      console.error("Error tracking channel URL:", e);
      // Continue with the analysis even if tracking fails
    }

    try {
        const result = await youtubeService.getChannelKeywords(activeKey, channelIdentifier);
        if (result.length > 0) {
            setKeywords(result);
        } else {
            setKeywords([]);
            setError(t('errors.noKeywordsFound'));
        }
    } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.analysisError'));
    } finally {
        setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if(keywords) {
        navigator.clipboard.writeText(keywords.join(', '));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Panel title={t('analyzer.title')} className="lg:col-span-1">
        <div className="space-y-4">
          <div>
            <label htmlFor="channel-url" className="block text-sm font-medium text-hud-text-secondary mb-2">{t('analyzer.channelUrl')}</label>
            <input
              type="text"
              id="channel-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t('analyzer.channelUrlPlaceholder')}
              className="w-full bg-hud-bg-secondary border border-hud-border rounded-md px-3 py-2 text-hud-text focus:ring-2 focus:ring-hud-accent focus:outline-none"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full bg-hud-accent hover:bg-hud-accent-secondary text-hud-bg font-bold py-2 px-4 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t('analyzer.analyzingButton') : t('analyzer.analyzeButton')}
          </button>
          {error && <p className="text-hud-red text-xs text-center mt-2">{error}</p>}
           <div className="flex items-start p-3 bg-hud-bg-secondary border-l-4 border-hud-accent-secondary mt-4 rounded-r-md">
            <InfoIcon className="w-5 h-5 text-hud-accent-secondary mr-3 flex-shrink-0 mt-1" />
            <p className="text-xs text-hud-text-secondary">
              {t('analyzer.infoText')}
            </p>
          </div>
        </div>
      </Panel>

      <Panel title={t('analyzer.extractedKeywords')} className="lg:col-span-2">
        {isLoading && (
          <div className="flex justify-center items-center h-full">
             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-hud-accent"></div>
          </div>
        )}
        {keywords && (
          <div>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{t('analyzer.results')} <span className="text-hud-accent">{keywords.length}</span> {t('analyzer.keywords')}</h3>
              <button onClick={copyToClipboard} disabled={keywords.length === 0} className="flex items-center text-sm bg-hud-border hover:bg-hud-accent hover:text-hud-bg px-3 py-1.5 rounded-md transition-all disabled:opacity-50">
                <CopyIcon className="w-4 h-4 mr-2" />
                {t('analyzer.copyAll')}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 p-3 bg-black bg-opacity-20 rounded min-h-[4rem]">
                {keywords.length > 0 ? keywords.map((word, index) => (
                    <span key={index} className="bg-hud-border text-hud-text px-2 py-1 rounded-sm text-xs">{word}</span>
                )) : (
                    <p className="text-hud-text-secondary text-sm">{t('analyzer.noKeywords')}</p>
                )}
            </div>
          </div>
        )}
        {!isLoading && !keywords && !error && (
           <div className="flex justify-center items-center h-64 text-hud-text-secondary">
            <p>{t('analyzer.resultsWillAppear')}</p>
          </div>
        )}
         {!isLoading && error && (
           <div className="flex justify-center items-center h-64 text-hud-red">
            <p>{error}</p>
          </div>
        )}
      </Panel>
    </div>
  );
};
