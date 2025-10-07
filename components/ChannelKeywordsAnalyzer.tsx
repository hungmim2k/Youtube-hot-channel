import React, { useState } from 'react';
import { Panel } from './Panel';
import { CopyIcon, InfoIcon } from './icons/Icons';
import { useApiKeys } from '../contexts/ApiKeyContext';
import * as youtubeService from '../services/youtubeService';

export const ChannelKeywordsAnalyzer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keywords, setKeywords] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { activeKey } = useApiKeys();
  
  const handleAnalyze = async () => {
    const channelIdentifier = url.trim();
    if (!channelIdentifier) {
      setError("Please enter a YouTube channel URL, ID, or @handle.");
      return;
    }
    if (!activeKey) {
        setError("API Key is not set. Please add a key in the API Settings tab.");
        return;
    }
    
    setError(null);
    setIsLoading(true);
    setKeywords(null);
    
    try {
        const result = await youtubeService.getChannelKeywords(activeKey, channelIdentifier);
        if (result.length > 0) {
            setKeywords(result);
        } else {
            setKeywords([]);
            setError("Analysis complete, but no keywords were found for this channel.");
        }
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred during analysis.');
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
      <Panel title="Analysis Options" className="lg:col-span-1">
        <div className="space-y-4">
          <div>
            <label htmlFor="channel-url" className="block text-sm font-medium text-hud-text-secondary mb-2">Channel URL, ID, or @handle</label>
            <input
              type="text"
              id="channel-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="@mkbhd, /c/Google, etc."
              className="w-full bg-hud-bg-secondary border border-hud-border rounded-md px-3 py-2 text-hud-text focus:ring-2 focus:ring-hud-accent focus:outline-none"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full bg-hud-accent hover:bg-hud-accent-secondary text-hud-bg font-bold py-2 px-4 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Channel Keywords'}
          </button>
          {error && <p className="text-hud-red text-xs text-center mt-2">{error}</p>}
           <div className="flex items-start p-3 bg-hud-bg-secondary border-l-4 border-hud-accent-secondary mt-4 rounded-r-md">
            <InfoIcon className="w-5 h-5 text-hud-accent-secondary mr-3 flex-shrink-0 mt-1" />
            <p className="text-xs text-hud-text-secondary">
              This tool fetches the official "Channel Keywords" from the channel's branding settings using the YouTube API.
            </p>
          </div>
        </div>
      </Panel>

      <Panel title="Extracted Keywords" className="lg:col-span-2">
        {isLoading && (
          <div className="flex justify-center items-center h-full">
             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-hud-accent"></div>
          </div>
        )}
        {keywords && (
          <div>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Results: <span className="text-hud-accent">{keywords.length}</span> keywords</h3>
              <button onClick={copyToClipboard} disabled={keywords.length === 0} className="flex items-center text-sm bg-hud-border hover:bg-hud-accent hover:text-hud-bg px-3 py-1.5 rounded-md transition-all disabled:opacity-50">
                <CopyIcon className="w-4 h-4 mr-2" />
                Copy All
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 p-3 bg-black bg-opacity-20 rounded min-h-[4rem]">
                {keywords.length > 0 ? keywords.map((word, index) => (
                    <span key={index} className="bg-hud-border text-hud-text px-2 py-1 rounded-sm text-xs">{word}</span>
                )) : (
                    <p className="text-hud-text-secondary text-sm">No keywords specified by the channel owner.</p>
                )}
            </div>
          </div>
        )}
        {!isLoading && !keywords && !error && (
           <div className="flex justify-center items-center h-64 text-hud-text-secondary">
            <p>Results will appear here after analysis.</p>
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
