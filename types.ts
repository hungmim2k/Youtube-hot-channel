export interface Country {
  code: string;
  name: string;
  flag: string;
}

// Represents the processed channel data for the UI
export interface Channel {
  id: string;
  name:string;
  thumbnail: string;
  url: string;
  country: Country;
  subscribers: number;
  videos: number;
  age: number; // in days
  avgViews: number;
  keywords?: string[];
}

// Represents raw data from YouTube API videos.list
export interface YouTubeVideo {
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; };
      medium: { url: string; };
      high: { url: string; };
    };
    channelTitle: string;
    tags: string[];
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

// Represents raw data from YouTube API search.list
export interface YouTubeSearchResult {
  id: {
    kind: string;
    videoId: string;
  };
  snippet: YouTubeVideo['snippet'];
}


// Represents raw data from YouTube API channels.list
export interface YouTubeChannel {
    id: string;
    snippet: {
        title: string;
        description: string;
        publishedAt: string;
        thumbnails: {
            default: { url: string; };
            medium: { url: string; };
        };
        country?: string;
    };
    statistics: {
        viewCount: string;
        subscriberCount: string;
        videoCount: string;
    };
    brandingSettings?: {
        channel?: {
            keywords?: string;
        };
    };
}