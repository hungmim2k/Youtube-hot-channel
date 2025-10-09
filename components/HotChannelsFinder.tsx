import React, { useState, useCallback, useEffect } from 'react';
import { Panel } from './Panel';
import { Checkbox } from './Checkbox';
import { countries } from '../constants';
import type { Channel } from '../types';
import * as youtubeService from '../services/youtubeService';
import { useApiKeys } from '../contexts/ApiKeyContext';
import { useOptimization } from '../contexts/OptimizationContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowDownIcon, ArrowUpIcon, ExternalLinkIcon } from './icons/Icons';
import { useTranslation } from '../shims';

type SortKey = 'subscribers' | 'videos' | 'age' | 'avgViews';
type SortDirection = 'asc' | 'desc';

const formatNumber = (num: number): string => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
};

const parseNumberWithSuffix = (input: string): number => {
    const str = String(input).trim().toLowerCase();
    if (!str) return 0;
    const suffix = str.slice(-1);
    const num = parseFloat(str);
    if (isNaN(num)) return 0;

    switch(suffix) {
        case 'k': return num * 1_000;
        case 'm': return num * 1_000_000;
        case 'b': return num * 1_000_000_000;
        default: return parseFloat(str) || 0;
    }
};

const TableHeader: React.FC<{
  title: string;
  sortKey: SortKey;
  currentSort: SortKey;
  currentDirection: SortDirection;
  onSort: (key: SortKey) => void;
}> = ({ title, sortKey, currentSort, currentDirection, onSort }) => (
  <th
    scope="col"
    className="px-4 py-3 text-left text-xs font-bold text-hud-text-secondary uppercase tracking-wider cursor-pointer"
    onClick={() => onSort(sortKey)}
  >
    <div className="flex items-center">
      {title}
      {currentSort === sortKey && (
        currentDirection === 'asc' ? <ArrowUpIcon className="w-3 h-3 ml-1" /> : <ArrowDownIcon className="w-3 h-3 ml-1" />
      )}
    </div>
  </th>
);


export const HotChannelsFinder: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(t('finder.enterKeywords'));
  const [channels, setChannels] = useState<Channel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('subscribers');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Filter states
  const [keywords, setKeywords] = useState('tech review');
  const [minSubs, setMinSubs] = useState('');
  const [maxSubs, setMaxSubs] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const { activeKey, getNextKey } = useApiKeys();
  const { markKeyExhausted } = useApiKeys() as any;
  const { settings } = useOptimization();
  const { trackKeyword } = useAuth();

  // Get optimization settings
  const SEARCH_DEPTH = settings.searchDepth;
  const CHANNEL_SEARCH_DEPTH = settings.channelSearchDepth;
  const RELATED_SEARCH_DEPTH = settings.relatedSearchDepth;

  // Enhanced caching system for search results
  const CACHE_PREFIX = 'hotchannels_search_v2_';
  const CACHE_DURATION_HOURS = settings.cacheDurationHours;

  // Generate a cache key based on search parameters
  const getCacheKey = (searchParams: {
    keywords: string,
    countries: string[],
    minSubs?: string,
    maxSubs?: string,
    minAge?: string,
    maxAge?: string
  }) => {
    // Create a deterministic string from the search parameters
    const countryKey = searchParams.countries.length > 0 ? searchParams.countries.sort().join(',') : 'global';
    return `${CACHE_PREFIX}${searchParams.keywords.toLowerCase().trim()}_${countryKey}`;
  };

  // Check if cache is still valid
  const isCacheValid = (timestamp: string) => {
    const cacheTime = new Date(timestamp).getTime();
    const now = new Date().getTime();
    const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);
    return hoursDiff < CACHE_DURATION_HOURS;
  };

  // Load cached search results on mount
  useEffect(() => {
    try {
      // Try to load the last search parameters
      const lastSearch = localStorage.getItem(`${CACHE_PREFIX}last_search`);
      if (lastSearch) {
        const parsed = JSON.parse(lastSearch);
        setKeywords(parsed.keywords || '');
        setMinSubs(parsed.minSubs || '');
        setMaxSubs(parsed.maxSubs || '');
        setMinAge(parsed.minAge || '');
        setMaxAge(parsed.maxAge || '');
        setSelectedCountries(parsed.selectedCountries || []);

        // Try to load cached results for these parameters
        const cacheKey = getCacheKey({
          keywords: parsed.keywords,
          countries: parsed.selectedCountries || [],
          minSubs: parsed.minSubs,
          maxSubs: parsed.maxSubs,
          minAge: parsed.minAge,
          maxAge: parsed.maxAge
        });

        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const cacheResult = JSON.parse(cachedData);
          if (cacheResult?.channels && Array.isArray(cacheResult.channels) && isCacheValid(cacheResult.timestamp)) {
            setChannels(cacheResult.channels);
            setStatus(`${t('finder.loadingCache')} ${new Date(cacheResult.timestamp).toLocaleString()}`);
          }
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

    useEffect(() => {
    if (!activeKey) {
        setStatus(t('finder.addApiKey'));
    } else {
        setStatus(t('finder.readyToSearch'));
    }
  }, [activeKey, t]);

  const handleCountryChange = (countryCode: string, isChecked: boolean) => {
    setSelectedCountries(prev => 
        isChecked ? [...prev, countryCode] : prev.filter(c => c !== countryCode)
    );
  };

  const handleSearch = useCallback(async () => {
    if (!keywords) {
        setError(t('errors.enterKeywords'));
        return;
    }
    if (!activeKey) {
        setError(t('errors.apiKeyNotSet'));
        return;
    }

    // Check if we have valid cached results for these exact search parameters
    const cacheKey = getCacheKey({
      keywords,
      countries: selectedCountries,
      minSubs,
      maxSubs,
      minAge,
      maxAge
    });

    try {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const cacheResult = JSON.parse(cachedData);
        if (cacheResult?.channels && Array.isArray(cacheResult.channels) && isCacheValid(cacheResult.timestamp)) {
          setChannels(cacheResult.channels);
          setStatus(`${t('finder.usingCache')} ${new Date(cacheResult.timestamp).toLocaleString()}`);
          return; // Skip the API calls if we have valid cached results
        }
      }
    } catch (e) {
      // If there's any error reading cache, proceed with the search
    }

    setIsLoading(true);
    setError(null);
    setChannels([]);

    // Track the keyword search
    try {
      // Get client IP address (in a real app, this would be done server-side)
      const clientIP = window.location.hostname || '127.0.0.1';
      await trackKeyword(keywords, clientIP);
    } catch (e) {
      console.error("Error tracking keyword:", e);
      // Continue with the search even if tracking fails
    }

    try {
    let allChannelIds = new Set<string>();

    const searchRegions = selectedCountries.length > 0 ? selectedCountries : [undefined]; // undefined for global search

    // 1) Search video results (type=video) as before
    for (const regionCode of searchRegions) {
      let nextPageToken: string | undefined = undefined;
      for(let i=0; i < SEARCH_DEPTH; i++) {
        const countryName = regionCode ? countries.find(c => c.code === regionCode)?.name : 'Global';
        setStatus(`Searching videos in ${countryName} (page ${i + 1}/${SEARCH_DEPTH})...`);
        let keyToUse = activeKey || getNextKey();
        if(!keyToUse) throw new Error("No valid API key available.");

        let searchResult;
        try {
          searchResult = await youtubeService.searchByKeyword(keyToUse, keywords, nextPageToken, regionCode);
        } catch (err: any) {
          if (err?.quota && markKeyExhausted) {
            markKeyExhausted(keyToUse);
            const altKey = getNextKey();
            if (altKey && altKey !== keyToUse) {
              keyToUse = altKey;
              searchResult = await youtubeService.searchByKeyword(keyToUse, keywords, nextPageToken, regionCode);
            } else {
              throw err;
            }
          } else {
            throw err;
          }
        }
        const channelIdsFromPage = searchResult.results.map(item => item.snippet.channelId);
        channelIdsFromPage.forEach(id => allChannelIds.add(id));

        if (!searchResult.nextPageToken) break;
        nextPageToken = searchResult.nextPageToken;
      }
    }

    // 2) Also search for channels directly (type=channel) using the same keywords to uncover channels missed by video search
    // Optimized: Use CHANNEL_SEARCH_DEPTH to limit quota usage
    for (const regionCode of searchRegions) {
      let nextPageToken: string | undefined = undefined;
      for (let i = 0; i < CHANNEL_SEARCH_DEPTH; i++) {
        setStatus(`Searching channels in ${regionCode || 'Global'} (page ${i + 1})...`);
        let keyToUse = activeKey || getNextKey();
        if(!keyToUse) throw new Error("No valid API key available.");
        let searchResult;
        try {
          searchResult = await youtubeService.searchChannelsByKeyword(keyToUse, keywords, nextPageToken, regionCode);
        } catch (err: any) {
          if (err?.quota && markKeyExhausted) {
            markKeyExhausted(keyToUse);
            const altKey = getNextKey();
            if (altKey && altKey !== keyToUse) {
              keyToUse = altKey;
              searchResult = await youtubeService.searchChannelsByKeyword(keyToUse, keywords, nextPageToken, regionCode);
            } else {
              throw err;
            }
          } else {
            throw err;
          }
        }
        const channelIdsFromPage = searchResult.results.map((item: any) => item.id?.channelId).filter(Boolean);
        channelIdsFromPage.forEach((id: string) => allChannelIds.add(id));
        if (!searchResult.nextPageToken) break;
        nextPageToken = searchResult.nextPageToken;
      }
    }

    const uniqueChannelIds = Array.from(allChannelIds);
    setStatus(`Found ${uniqueChannelIds.length} unique channels. Fetching details...`);

    if(uniqueChannelIds.length > 0) {
      let keyToUse = activeKey || getNextKey();
      if(!keyToUse) throw new Error("No valid API key available.");
      // Fetch channel details with quota-aware retry
      let channelDetails;
      try {
        channelDetails = await youtubeService.getChannelDetails(keyToUse, uniqueChannelIds);
      } catch (err: any) {
        if (err?.quota && markKeyExhausted) {
          markKeyExhausted(keyToUse);
          const altKey = getNextKey();
          if (altKey && altKey !== keyToUse) {
            keyToUse = altKey;
            channelDetails = await youtubeService.getChannelDetails(keyToUse, uniqueChannelIds);
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }

      // Try to expand results by doing limited related-channel discovery to find channels related to the top seeds
      // Optimized: More efficient related channel discovery to save quota
      try {
        // Skip related channel discovery if relatedSearchDepth is set to 0
        if (RELATED_SEARCH_DEPTH > 0) {
          // Check if we already have a good number of channels before doing related discovery
          if (channelDetails.length < 20) { // Only do related discovery if we have few results
            // pick top N seeds from the initial channelDetails (by subscribers)
            const seedLimit = RELATED_SEARCH_DEPTH === 1 ? 2 : 3; // Use more seeds if depth is higher
            const seeds = (channelDetails || []).sort((a,b) => b.subscribers - a.subscribers).slice(0, seedLimit);

            // For each seed, use only the most relevant query to find related channels
            for (const seed of seeds) {
              // Prioritize keywords if available, otherwise use title fragments
              let query = '';
              if (seed.keywords && seed.keywords.length) {
                query = seed.keywords.slice(0,2).join(' ');
              } else {
                query = seed.name.split(/\s+/).slice(0,3).join(' ');
              }

              if (query) {
                // Use only one page per query to save quota
                let keyToUse2 = activeKey || getNextKey();
                if (!keyToUse2) break;
                try {
                  setStatus(`Finding related channels for ${seed.name.substring(0, 20)}...`);
                  const chSearch = await youtubeService.searchChannelsByKeyword(keyToUse2, query, undefined, selectedCountries[0]);
                  const ids = (chSearch.results || []).map((it: any) => it.id?.channelId).filter(Boolean);
                  ids.forEach((id: string) => allChannelIds.add(id));
                } catch (err: any) {
                  if (err?.quota && markKeyExhausted) {
                    markKeyExhausted(keyToUse2);
                    // Don't retry with another key to save quota - we already have main results
                  } 
                  // Continue with main results even if related search fails
                  break;
                }
              }
            }
          }
        } else {
          setStatus("Related channel discovery is disabled in optimization settings.");
        }
      } catch (e) {
        // swallow related-search errors to avoid failing the whole search; we already have initial results
      }

      // Client-side filtering
            const minSubsNum = parseNumberWithSuffix(minSubs);
            const maxSubsNum = parseNumberWithSuffix(maxSubs);
            const minAgeNum = parseInt(minAge, 10) || 0;
            const maxAgeNum = parseInt(maxAge, 10) || 0;

      // If countries are selected, enforce exact country code match (including Vietnam 'VN')
      const filteredChannels = channelDetails.filter(channel => {
        const subOk = (!minSubsNum || channel.subscribers >= minSubsNum) && (!maxSubsNum || channel.subscribers <= maxSubsNum);
        const ageOk = (!minAgeNum || channel.age >= minAgeNum) && (!maxAgeNum || channel.age <= maxAgeNum);
        const countryOk = selectedCountries.length === 0 || selectedCountries.includes(channel.country.code);
        return subOk && ageOk && countryOk;
      });

      setChannels(filteredChannels);
            setStatus(`${t('finder.searchComplete')} ${filteredChannels.length} ${t('finder.of')} ${uniqueChannelIds.length} ${t('finder.foundChannelsText')}`);

            // Save search results to cache using the enhanced caching system
            try {
              // Save the search parameters
              const searchParams = {
                keywords,
                minSubs,
                maxSubs,
                minAge,
                maxAge,
                selectedCountries,
                timestamp: new Date().toISOString(),
              };
              localStorage.setItem(`${CACHE_PREFIX}last_search`, JSON.stringify(searchParams));

              // Save the search results with the specific cache key
              const cacheKey = getCacheKey({
                keywords,
                countries: selectedCountries,
                minSubs,
                maxSubs,
                minAge,
                maxAge
              });

              const cachePayload = {
                channels: filteredChannels,
                timestamp: new Date().toISOString(),
                totalFound: uniqueChannelIds.length
              };

              localStorage.setItem(cacheKey, JSON.stringify(cachePayload));
            } catch (e) {
              // ignore storage errors
            }
        } else {
             setStatus(`${t('finder.noChannels')} "${keywords}".`);
        }

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        setStatus(`Error: ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, [keywords, activeKey, getNextKey, selectedCountries, minSubs, maxSubs, minAge, maxAge]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const sortedChannels = React.useMemo(() => {
    const sorted = [...channels].sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return -1;
      if (a[sortKey] > b[sortKey]) return 1;
      return 0;
    });
    return sortDirection === 'asc' ? sorted : sorted.reverse();
  }, [channels, sortKey, sortDirection]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Panel title={t('finder.title')} className="lg:col-span-1">
        <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-medium text-hud-text-secondary mb-2">{t('finder.keywords')}</label>
              <input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder={t('finder.keywordsPlaceholder')} className="w-full bg-hud-bg-secondary border border-hud-border rounded-md px-3 py-2 text-hud-text focus:ring-2 focus:ring-hud-accent focus:outline-none" />
            </div>
             <div>
              <label className="block text-sm font-medium text-hud-text-secondary mb-2">{t('finder.subscribers')}</label>
              <div className="flex gap-2">
                <input type="text" value={minSubs} onChange={e => setMinSubs(e.target.value)} placeholder={t('finder.minSubsPlaceholder')} className="w-1/2 bg-hud-bg-secondary border border-hud-border rounded-md px-3 py-2 text-hud-text focus:ring-2 focus:ring-hud-accent focus:outline-none" />
                <input type="text" value={maxSubs} onChange={e => setMaxSubs(e.target.value)} placeholder={t('finder.maxSubsPlaceholder')} className="w-1/2 bg-hud-bg-secondary border border-hud-border rounded-md px-3 py-2 text-hud-text focus:ring-2 focus:ring-hud-accent focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-hud-text-secondary mb-2">{t('finder.channelAge')}</label>
              <div className="flex gap-2">
                <input type="text" value={minAge} onChange={e => setMinAge(e.target.value)} placeholder={t('finder.minAgePlaceholder')} className="w-1/2 bg-hud-bg-secondary border border-hud-border rounded-md px-3 py-2 text-hud-text focus:ring-2 focus:ring-hud-accent focus:outline-none" />
                <input type="text" value={maxAge} onChange={e => setMaxAge(e.target.value)} placeholder={t('finder.maxAgePlaceholder')} className="w-1/2 bg-hud-bg-secondary border border-hud-border rounded-md px-3 py-2 text-hud-text focus:ring-2 focus:ring-hud-accent focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-hud-text-secondary mb-2">{t('finder.country')}</label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-hud-bg-secondary rounded-md">
                {countries.map(c => <Checkbox key={c.code} id={c.code} label={`${c.flag} ${c.name}`} onChange={(e) => handleCountryChange(c.code, e.target.checked)} />)}
              </div>
            </div>
             <button
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full bg-hud-accent hover:bg-hud-accent-secondary text-hud-bg font-bold py-2 px-4 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t('finder.searchingButton') : t('finder.findButton')}
            </button>
            {error && <p className="text-hud-red text-xs text-center mt-2">{error}</p>}
        </div>
      </Panel>
  <Panel title={`${t('finder.foundChannels')} (${channels.length})`} className="lg:col-span-3">
        <div className="overflow-x-auto max-h-[calc(100vh-250px)]">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-hud-accent"></div>
              <p className="mt-4 text-hud-text-secondary">{status}</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-hud-border">
              <thead className="bg-hud-bg-secondary sticky top-0">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-hud-text-secondary uppercase tracking-wider">{t('finder.tableHeaders.number')}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-hud-text-secondary uppercase tracking-wider">{t('finder.tableHeaders.channel')}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-hud-text-secondary uppercase tracking-wider">{t('finder.tableHeaders.country')}</th>
                  <TableHeader title={t('finder.tableHeaders.subs')} sortKey="subscribers" currentSort={sortKey} currentDirection={sortDirection} onSort={handleSort} />
                  <TableHeader title={t('finder.tableHeaders.videos')} sortKey="videos" currentSort={sortKey} currentDirection={sortDirection} onSort={handleSort} />
                  <TableHeader title={t('finder.tableHeaders.age')} sortKey="age" currentSort={sortKey} currentDirection={sortDirection} onSort={handleSort} />
                  <TableHeader title={t('finder.tableHeaders.avgViews')} sortKey="avgViews" currentSort={sortKey} currentDirection={sortDirection} onSort={handleSort} />
                  <th scope="col" className="relative px-4 py-3"><span className="sr-only">{t('finder.tableHeaders.open')}</span></th>
                </tr>
              </thead>
              <tbody className="bg-hud-bg divide-y divide-hud-border">
                {sortedChannels.map((channel, index) => (
                  <tr key={channel.id} onDoubleClick={() => window.open(channel.url, '_blank')} className="hover:bg-hud-bg-secondary transition-colors duration-150 cursor-pointer">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-hud-text-secondary">{index + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <img className="h-8 w-8 rounded-full" src={channel.thumbnail} alt="" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-hud-text line-clamp-1" title={channel.name}>{channel.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-hud-text-secondary">{channel.country.flag} {channel.country.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-hud-text-secondary">{formatNumber(channel.subscribers)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-hud-text-secondary">{formatNumber(channel.videos)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-hud-text-secondary">{channel.age}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-hud-text-secondary">{formatNumber(channel.avgViews)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <a href={channel.url} target="_blank" rel="noopener noreferrer" className="text-hud-accent-secondary hover:text-hud-accent">
                        <ExternalLinkIcon className="w-4 h-4"/>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
           {!isLoading && channels.length === 0 && (
             <div className="flex justify-center items-center h-64 text-hud-text-secondary">
              <p>{status}</p>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
};
