import type { Channel, YouTubeVideo, YouTubeSearchResult, YouTubeChannel } from '../types';
import { countries } from '../constants';

// Function to get the ApiKeyContext from outside React components
let incrementQuotaUsageCallback: ((key: string, operation: string, count?: number) => void) | null = null;

export const setQuotaTracker = (callback: (key: string, operation: string, count?: number) => void) => {
  incrementQuotaUsageCallback = callback;
};

// Helper to track quota usage
const trackQuotaUsage = (apiKey: string, operation: string, count: number = 1) => {
  if (incrementQuotaUsageCallback) {
    incrementQuotaUsageCallback(apiKey, operation, count);
  }
};

const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// --- API HELPER FUNCTIONS ---

/**
 * A helper function to handle responses from the YouTube API.
 * It checks for errors and throws a formatted error message if the request was not successful.
 */
async function handleApiResponse(response: Response) {
  const data = await response.json();
  if (!response.ok) {
    const message = data.error?.message || 'An unknown API error occurred.';
    // Specifically check for quota errors to give a more helpful message.
        if (message.includes('quotaExceeded') || message.includes('daily limit')) {
                const err: any = new Error('YouTube API quota exceeded.');
                err.quota = true;
                throw err;
        }
        const err: any = new Error(message);
        err.quota = false;
        throw err;
  }
  return data;
}

/**
 * Resolves a channel identifier (like @handle, /c/vanity, or /user/name) to a canonical channel ID (UC...).
 * If the identifier is already a channel ID, it returns it directly.
 */
async function resolveChannelIdentifier(apiKey: string, identifier: string): Promise<string> {
    // If it's already a standard channel ID, no need to resolve.
    if (identifier.startsWith('UC') && identifier.length === 24) {
        return identifier;
    }

    // The YouTube API doesn't have a direct lookup for vanity URLs.
    // The most reliable way is to use the search endpoint.
    const url = new URL(`${API_BASE_URL}/search`);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', identifier);
    url.searchParams.set('type', 'channel');
    url.searchParams.set('maxResults', '1');

    // Track quota usage - search operation costs 100 units
    trackQuotaUsage(apiKey, 'search', 1);

    const response = await fetch(url.toString());
    const data = await handleApiResponse(response);

    if (data.items && data.items.length > 0) {
        // We assume the first result is the correct one for a specific handle/vanity name.
        return data.items[0].id.channelId;
    }
    throw new Error(`Could not find a channel for identifier: "${identifier}"`);
}


// --- LIVE API FUNCTIONS ---

/**
 * 1. Searches for videos by keyword.
 * Fetches a page of video search results from the YouTube API.
 */
export const searchByKeyword = async (apiKey: string, query: string, pageToken?: string, regionCode?: string): Promise<{ results: YouTubeSearchResult[], nextPageToken?: string }> => {
    const url = new URL(`${API_BASE_URL}/search`);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', '50'); // Max allowed is 50
    if (pageToken) {
        url.searchParams.set('pageToken', pageToken);
    }
    if (regionCode) {
        // Only set regionCode when it looks like a valid ISO 3166-1 alpha-2 code (two uppercase letters)
        if (/^[A-Z]{2}$/.test(regionCode)) {
            url.searchParams.set('regionCode', regionCode);
        }
    }

    // Track quota usage - search operation costs 100 units
    trackQuotaUsage(apiKey, 'search', 1);

    const response = await fetch(url.toString());
    const data = await handleApiResponse(response);

    return {
        results: data.items,
        nextPageToken: data.nextPageToken
    };
};

/**
 * Search for channels by keyword (type=channel). Returns search items and nextPageToken.
 */
export const searchChannelsByKeyword = async (apiKey: string, query: string, pageToken?: string, regionCode?: string): Promise<{ results: any[], nextPageToken?: string }> => {
    const url = new URL(`${API_BASE_URL}/search`);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'channel');
    url.searchParams.set('maxResults', '50');
    if (pageToken) {
        url.searchParams.set('pageToken', pageToken);
    }
    // Only set regionCode when it looks like a valid ISO 3166-1 alpha-2 code (two uppercase letters)
    if (regionCode && /^[A-Z]{2}$/.test(regionCode)) {
        url.searchParams.set('regionCode', regionCode);
    }

    // Track quota usage - search operation costs 100 units
    trackQuotaUsage(apiKey, 'search', 1);

    const response = await fetch(url.toString());
    const data = await handleApiResponse(response);

    return {
        results: data.items || [],
        nextPageToken: data.nextPageToken
    };
};



/**
 * 2. Gets detailed information for a list of channel IDs.
 * Batches requests to be more efficient with API quota.
 */
export const getChannelDetails = async (apiKey: string, channelIds: string[]): Promise<Channel[]> => {
    if (channelIds.length === 0) return [];
    const allChannels: Channel[] = [];
    // The API allows up to 50 IDs per request.
    for (let i = 0; i < channelIds.length; i += 50) {
        const batch = channelIds.slice(i, i + 50);

        const url = new URL(`${API_BASE_URL}/channels`);
        url.searchParams.set('key', apiKey);
        url.searchParams.set('part', 'snippet,statistics,brandingSettings');
        url.searchParams.set('id', batch.join(','));

        // Track quota usage - list operation costs 1 unit per resource, 3 parts = 3 units per channel
        trackQuotaUsage(apiKey, 'list', batch.length * 3);

        const response = await fetch(url.toString());
        const data = await handleApiResponse(response);
        const rawChannels: YouTubeChannel[] = data.items || [];

        const formattedChannels: Channel[] = rawChannels.map(raw => {
            const countryInfo = countries.find(c => c.code === raw.snippet.country) || { code: raw.snippet.country || '??', name: 'Unknown', flag: '🏳️' };
            const subscribers = parseInt(raw.statistics.subscriberCount, 10) || 0;
            const videos = parseInt(raw.statistics.videoCount, 10) || 0;
            const ageInMs = Date.now() - new Date(raw.snippet.publishedAt).getTime();

            return {
                id: raw.id,
                name: raw.snippet.title,
                thumbnail: raw.snippet.thumbnails.default.url,
                url: `https://www.youtube.com/channel/${raw.id}`,
                country: countryInfo,
                subscribers: subscribers,
                videos: videos,
                age: Math.floor(ageInMs / (1000 * 60 * 60 * 24)),
                avgViews: Math.floor(parseInt(raw.statistics.viewCount, 10) / (videos || 1)) || 0,
                keywords: raw.brandingSettings?.channel?.keywords?.split(' ').filter(Boolean) || [],
            }
        });
        allChannels.push(...formattedChannels);
    }

    return allChannels;
};


/**
 * 3. Gets the most popular (trending) videos for a specific country.
 */
export const getTrendingVideos = async (apiKey: string, regionCode?: string, pageToken?: string): Promise<{ videos: YouTubeVideo[], nextPageToken?: string }> => {
    const url = new URL(`${API_BASE_URL}/videos`);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('part', 'snippet,statistics');
    url.searchParams.set('chart', 'mostPopular');
    // Only set regionCode when it looks like a valid ISO 3166-1 alpha-2 code (two uppercase letters)
    if (regionCode && /^[A-Z]{2}$/.test(regionCode)) {
        url.searchParams.set('regionCode', regionCode);
    }
    url.searchParams.set('maxResults', '50');
    if (pageToken) {
        url.searchParams.set('pageToken', pageToken);
    }

    // Track quota usage - videos.list operation costs 1 unit per part, 2 parts = 2 units per call
    // This is more efficient than tracking per video since it's a single API call
    trackQuotaUsage(apiKey, 'list', 2);

    const response = await fetch(url.toString());
    const data = await handleApiResponse(response);

    return { videos: data.items || [], nextPageToken: data.nextPageToken };
};

/**
 * 4. Gets the branding keywords for a single channel, resolving the identifier first.
 */
export const getChannelKeywords = async (apiKey: string, channelIdentifier: string): Promise<string[]> => {
    const channelId = await resolveChannelIdentifier(apiKey, channelIdentifier);

    const url = new URL(`${API_BASE_URL}/channels`);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('part', 'brandingSettings');
    url.searchParams.set('id', channelId);

    // Track quota usage - list operation costs 1 unit per resource, 1 part = 1 unit per channel
    trackQuotaUsage(apiKey, 'list', 1);

    const response = await fetch(url.toString());
    const data = await handleApiResponse(response);

    if (data.items && data.items.length > 0) {
        const keywordsString = data.items[0].brandingSettings?.channel?.keywords;
        if (keywordsString) {
            // Keywords can sometimes be quoted strings, so we need a more robust split.
            return keywordsString.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
        }
    }
    return [];
};
