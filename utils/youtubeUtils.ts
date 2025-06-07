import { YOUTUBE_THUMBNAIL_BASE_URL, YOUTUBE_OEMBED_BASE_URL } from '../constants';

export const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  let videoId = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      videoId = urlObj.searchParams.get('v');
    } else if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.substring(1);
    }
  } catch (error) {
    console.warn("Invalid URL, attempting regex fallback for YouTube ID extraction:", url);
    // Regex fallback for cases where URL object might fail or for simpler patterns
    // Covers: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/v/
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    if (match && match[1]) {
      videoId = match[1];
    }
  }
  
  // Final check if videoId contains extra params (less likely with stricter regex)
  if (videoId && videoId.includes('&')) {
    videoId = videoId.split('&')[0];
  }
  if (videoId && videoId.includes('?')) {
    videoId = videoId.split('?')[0];
  }
  
  return videoId;
};

export const getYouTubeThumbnailUrl = (videoId: string, quality: 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault' = 'hqdefault'): string => {
  if (!videoId) return 'https://picsum.photos/480/360?grayscale&blur=1'; // Placeholder
  return `${YOUTUBE_THUMBNAIL_BASE_URL}${videoId}/${quality}.jpg`;
};

interface YouTubeOEmbedResponse {
  title: string;
  author_name: string;
  author_url: string;
  type: string;
  height: number;
  width: number;
  version: string;
  provider_name: string;
  provider_url: string;
  thumbnail_height: number;
  thumbnail_width: number;
  thumbnail_url: string;
  html: string;
}

export const fetchYouTubeVideoInfo = async (videoUrl: string): Promise<{ title: string; thumbnailUrl: string; videoId: string } | null> => {
  const videoId = extractYouTubeVideoId(videoUrl);
  if (!videoId) {
    console.error('Could not extract video ID from URL:', videoUrl);
    return null;
  }

  try {
    // It's generally better to use the video ID for oEmbed if you have it, but URL works too.
    // Let's ensure we use a clean watch URL for oEmbed.
    const cleanWatchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(`${YOUTUBE_OEMBED_BASE_URL}?url=${encodeURIComponent(cleanWatchUrl)}&format=json`);
    if (!response.ok) {
      throw new Error(`oEmbed request failed with status ${response.status}`);
    }
    const data: YouTubeOEmbedResponse = await response.json();
    return {
      title: data.title,
      thumbnailUrl: data.thumbnail_url || getYouTubeThumbnailUrl(videoId), // Fallback to standard thumbnail if oEmbed doesn't provide one
      videoId: videoId,
    };
  } catch (error) {
    console.error('Error fetching YouTube video info via oEmbed:', error);
    // Fallback if oEmbed fails: use extracted ID and default thumbnail URL pattern
    return {
      title: 'YouTube Video', // Generic title
      thumbnailUrl: getYouTubeThumbnailUrl(videoId),
      videoId: videoId,
    };
  }
};