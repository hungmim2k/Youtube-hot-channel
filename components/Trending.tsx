import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Panel } from './Panel';
import { countries } from '../constants';
import { useApiKeys } from '../contexts/ApiKeyContext';
import { YouTubeVideo, Channel } from '../types';
import * as youtubeService from '../services/youtubeService';
import { ExternalLinkIcon, ArrowUpIcon, ArrowDownIcon } from './icons/Icons';
import { Tab, Tabs } from './Tabs';

type VideoSortKey = 'viewCount' | 'likeCount' | 'commentCount' | 'publishedAt';
type ChannelSortKey = 'subscribers' | 'videos' | 'age' | 'avgViews';
type SortDirection = 'asc' | 'desc';

const formatNumber = (numStr: string | number): string => {
  const num = typeof numStr === 'string' ? parseInt(numStr, 10) : numStr;
  if (isNaN(num)) return 'N/A';
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
};

const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString();
}

const TableHeader: React.FC<{
  title: string;
  sortKey: string;
  currentSort: string;
  currentDirection: SortDirection;
  onSort: (key: any) => void;
  className?: string;
}> = ({ title, sortKey, currentSort, currentDirection, onSort, className }) => (
  <th
    scope="col"
    className={`px-4 py-3 text-left text-xs font-bold text-hud-text-secondary uppercase tracking-wider cursor-pointer ${className}`}
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

export const Trending: React.FC = () => {
    const { activeKey, getNextKey } = useApiKeys();
    const { markKeyExhausted } = useApiKeys() as any;
    const [isLoading, setIsLoading] = useState(false);
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState('US');
    const [activeTab, setActiveTab] = useState<'videos' | 'channels'>('videos');
    const [status, setStatus] = useState('Loading...');

    // Sorting states
    const [videoSortKey, setVideoSortKey] = useState<VideoSortKey>('viewCount');
    const [videoSortDir, setVideoSortDir] = useState<SortDirection>('desc');
    const [channelSortKey, setChannelSortKey] = useState<ChannelSortKey>('subscribers');
    const [channelSortDir, setChannelSortDir] = useState<SortDirection>('desc');

    const fetchTrendingData = useCallback(async () => {
        if (!activeKey) {
            setError("API Key is not set. Please add a key in the API Settings tab.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setVideos([]);
        setChannels([]);

        try {
            // Try to load cached data for the selected country for today's date
            const today = new Date().toISOString().slice(0,10); // YYYY-MM-DD
            const cacheKey = `trending_${selectedCountry}_${today}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (parsed && Array.isArray(parsed.videos)) {
                        setVideos(parsed.videos);
                        if (Array.isArray(parsed.channels)) setChannels(parsed.channels);
                        setStatus(`Loaded trending data from cache for ${selectedCountry} (${parsed.videos.length} videos).`);
                        setIsLoading(false);
                        return;
                    }
                } catch (e) {
                    // ignore parse errors and continue to fetch
                }
            }

            let allVideos: YouTubeVideo[] = [];
            let nextPageToken: string | undefined = undefined;
            let page = 0;
            const MAX_PAGES = 5; // Limit to prevent excessive API calls, API usually stops after 4 pages (200 videos)

            do {
                page++;
                setStatus(`Fetching page ${page}...`);
                let keyToUse = activeKey || getNextKey();
                if (!keyToUse) throw new Error("No valid API key available.");
                let videoResults;
                try {
                    videoResults = await youtubeService.getTrendingVideos(keyToUse, selectedCountry, nextPageToken);
                } catch (err: any) {
                    if (err?.quota && markKeyExhausted) {
                        markKeyExhausted(keyToUse);
                        const altKey = getNextKey();
                        if (altKey && altKey !== keyToUse) {
                            keyToUse = altKey;
                            videoResults = await youtubeService.getTrendingVideos(keyToUse, selectedCountry, nextPageToken);
                        } else {
                            throw err;
                        }
                    } else {
                        throw err;
                    }
                }
                allVideos = [...allVideos, ...videoResults.videos];
                nextPageToken = videoResults.nextPageToken;
            } while (nextPageToken && page < MAX_PAGES);
            
            setVideos(allVideos);
            setStatus(`Found ${allVideos.length} videos. Fetching channel details...`);
            
            const channelIds = Array.from(new Set(allVideos.map(v => v.snippet.channelId)));
            if (channelIds.length > 0) {
                 let keyToUse = activeKey || getNextKey();
                 if (!keyToUse) throw new Error("No valid API key available.");
                let channelResults;
                try {
                    channelResults = await youtubeService.getChannelDetails(keyToUse, channelIds);
                } catch (err: any) {
                    if (err?.quota && markKeyExhausted) {
                        markKeyExhausted(keyToUse);
                        const altKey = getNextKey();
                        if (altKey && altKey !== keyToUse) {
                            keyToUse = altKey;
                            channelResults = await youtubeService.getChannelDetails(keyToUse, channelIds);
                        } else {
                            throw err;
                        }
                    } else {
                        throw err;
                    }
                }
                setChannels(channelResults);
                // Save combined data to cache to reuse for the rest of the day
                try {
                    const today = new Date().toISOString().slice(0,10);
                    const cacheKey = `trending_${selectedCountry}_${today}`;
                    localStorage.setItem(cacheKey, JSON.stringify({ videos: allVideos, channels: channelResults }));
                } catch (e) {
                    // ignore storage errors
                }
            }
            setStatus(`Analysis complete for ${selectedCountry}.`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            setStatus(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [activeKey, selectedCountry, getNextKey]);

    useEffect(() => {
        fetchTrendingData();
    }, [fetchTrendingData]);

    // If user selects Unknown country code (??), avoid calling the API which would reject the regionCode
    useEffect(() => {
        if (selectedCountry === '??') {
            setVideos([]);
            setChannels([]);
            setStatus('No trending data for Unknown country. Select a valid country.');
        }
    }, [selectedCountry]);
    
    // Memoized sorted data
    const sortedVideos = useMemo(() => {
        return [...videos].sort((a, b) => {
            let valA, valB;
            if (videoSortKey === 'publishedAt') {
                valA = new Date(a.snippet.publishedAt).getTime();
                valB = new Date(b.snippet.publishedAt).getTime();
            } else {
                valA = parseInt(a.statistics?.[videoSortKey] || '0', 10);
                valB = parseInt(b.statistics?.[videoSortKey] || '0', 10);
            }
            if (valA < valB) return videoSortDir === 'asc' ? -1 : 1;
            if (valA > valB) return videoSortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [videos, videoSortKey, videoSortDir]);

    const sortedChannels = useMemo(() => {
        return [...channels].sort((a, b) => {
            const valA = a[channelSortKey];
            const valB = b[channelSortKey];
            if (valA < valB) return channelSortDir === 'asc' ? -1 : 1;
            if (valA > valB) return channelSortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [channels, channelSortKey, channelSortDir]);
    
    const handleVideoSort = (key: VideoSortKey) => {
        setVideoSortDir(prev => videoSortKey === key && prev === 'desc' ? 'asc' : 'desc');
        setVideoSortKey(key);
    };

    const handleChannelSort = (key: ChannelSortKey) => {
        setChannelSortDir(prev => channelSortKey === key && prev === 'desc' ? 'asc' : 'desc');
        setChannelSortKey(key);
    };


    return (
        <Panel title="Trending Analysis" className="lg:col-span-3">
             <div className="flex justify-between items-center mb-4">
                <Tabs>
                    <Tab isActive={activeTab === 'videos'} onClick={() => setActiveTab('videos')}>Trending Videos ({videos.length})</Tab>
                    <Tab isActive={activeTab === 'channels'} onClick={() => setActiveTab('channels')}>Trending Channels ({channels.length})</Tab>
                </Tabs>
                <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="bg-hud-bg-secondary border border-hud-border rounded-md px-3 py-1.5 text-hud-text focus:ring-2 focus:ring-hud-accent focus:outline-none"
                >
                    {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                </select>
            </div>
            {error && <p className="text-hud-red text-center py-8">{error}</p>}
            {isLoading && (
                <div className="flex flex-col justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-hud-accent"></div>
                    <p className="mt-4 text-hud-text-secondary">{status}</p>
                </div>
            )}
            {!isLoading && !error && (
                <div className="overflow-auto max-h-[calc(100vh-320px)]">
                {activeTab === 'videos' && (
                     <table className="min-w-full divide-y divide-hud-border">
                        <thead className="bg-hud-bg-secondary sticky top-0">
                           <tr>
                                <TableHeader title="Video Title" sortKey="title" currentSort="" currentDirection="desc" onSort={() => {}} className="cursor-default" />
                                <TableHeader title="Views" sortKey="viewCount" currentSort={videoSortKey} currentDirection={videoSortDir} onSort={handleVideoSort} />
                                <TableHeader title="Likes" sortKey="likeCount" currentSort={videoSortKey} currentDirection={videoSortDir} onSort={handleVideoSort} />
                                <TableHeader title="Comments" sortKey="commentCount" currentSort={videoSortKey} currentDirection={videoSortDir} onSort={handleVideoSort} />
                                <TableHeader title="Published" sortKey="publishedAt" currentSort={videoSortKey} currentDirection={videoSortDir} onSort={handleVideoSort} />
                           </tr>
                        </thead>
                        <tbody className="bg-hud-bg divide-y divide-hud-border">
                            {sortedVideos.map(video => (
                                <tr key={video.id} className="hover:bg-hud-bg-secondary transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-sm font-medium text-hud-text hover:text-hud-accent">
                                            <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" className="line-clamp-2" title={video.snippet.title}>
                                                {video.snippet.title}
                                            </a>
                                            <p className="text-xs text-hud-text-secondary mt-1">{video.snippet.channelTitle}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-hud-text-secondary">{formatNumber(video.statistics.viewCount)}</td>
                                    <td className="px-4 py-3 text-sm text-hud-text-secondary">{formatNumber(video.statistics.likeCount)}</td>
                                    <td className="px-4 py-3 text-sm text-hud-text-secondary">{formatNumber(video.statistics.commentCount)}</td>
                                    <td className="px-4 py-3 text-sm text-hud-text-secondary">{formatDate(video.snippet.publishedAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                 {activeTab === 'channels' && (
                     <table className="min-w-full divide-y divide-hud-border">
                        <thead className="bg-hud-bg-secondary sticky top-0">
                           <tr>
                                <TableHeader title="Channel" sortKey="name" currentSort="" currentDirection="desc" onSort={() => {}} className="cursor-default" />
                                <TableHeader title="Subs" sortKey="subscribers" currentSort={channelSortKey} currentDirection={channelSortDir} onSort={handleChannelSort} />
                                <TableHeader title="Total Views" sortKey="avgViews" currentSort={channelSortKey} currentDirection={channelSortDir} onSort={handleChannelSort} />
                                <TableHeader title="Videos" sortKey="videos" currentSort={channelSortKey} currentDirection={channelSortDir} onSort={handleChannelSort} />
                                <TableHeader title="Age (d)" sortKey="age" currentSort={channelSortKey} currentDirection={channelSortDir} onSort={handleChannelSort} />
                           </tr>
                        </thead>
                        <tbody className="bg-hud-bg divide-y divide-hud-border">
                            {sortedChannels.map(channel => (
                                <tr key={channel.id} className="hover:bg-hud-bg-secondary transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img src={channel.thumbnail} alt={channel.name} className="w-8 h-8 rounded-full" />
                                            <a href={channel.url} target="_blank" rel="noopener noreferrer" className="ml-3 text-sm font-medium text-hud-text hover:text-hud-accent">{channel.name}</a>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-hud-text-secondary">{formatNumber(channel.subscribers)}</td>
                                    <td className="px-4 py-3 text-sm text-hud-text-secondary">{formatNumber(channel.avgViews * channel.videos)}</td>
                                    <td className="px-4 py-3 text-sm text-hud-text-secondary">{formatNumber(channel.videos)}</td>
                                    <td className="px-4 py-3 text-sm text-hud-text-secondary">{channel.age}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                </div>
            )}
        </Panel>
    );
};