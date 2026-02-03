
import { Song } from '../types';

const YT_API_KEY = process.env.API_KEY;
const YT_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const ITUNES_BASE_URL = 'https://itunes.apple.com/search';

/**
 * Clean strings for better search results
 */
const cleanQuery = (str: string) => {
  return str.replace(/\(feat\..*?\)/gi, '').replace(/\[.*?\]/g, '').trim();
};

export const searchSongs = async (query: string): Promise<Song[]> => {
  try {
    const itunesResponse = await fetch(`${ITUNES_BASE_URL}?term=${encodeURIComponent(query)}&entity=song&limit=15`);
    const itunesData = await itunesResponse.json();

    if (itunesData.results && itunesData.results.length > 0) {
      return itunesData.results.map((item: any) => ({
        id: '', 
        title: item.trackName,
        artist: item.artistName,
        thumbnail: item.artworkUrl100.replace('100x100', '600x600'),
        album: item.collectionName,
        previewUrl: item.previewUrl
      }));
    }

    const response = await fetch(
      `${YT_BASE_URL}/search?part=snippet&q=${encodeURIComponent(query + ' music')}&type=video&videoCategoryId=10&maxResults=15&key=${YT_API_KEY}`
    );
    const data = await response.json();
    return data.items?.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    })) || [];
  } catch (error) {
    console.error('Error searching:', error);
    return [];
  }
};

export const resolveYoutubeId = async (song: Song): Promise<string> => {
  if (song.id) return song.id;
  
  // Try multiple variations of the query for robustness
  const sanitizedTitle = cleanQuery(song.title);
  const sanitizedArtist = cleanQuery(song.artist);
  
  const queryCandidates = [
    `${sanitizedTitle} ${sanitizedArtist} official audio`,
    `${sanitizedTitle} ${sanitizedArtist}`,
    `${song.title} ${song.artist}`
  ];

  for (const query of queryCandidates) {
    try {
      const response = await fetch(
        `${YT_BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${YT_API_KEY}`
      );
      const data = await response.json();
      
      const videoId = data.items?.[0]?.id?.videoId;
      if (videoId) return videoId;

      // Handle Quota or API errors gracefully
      if (data.error) {
        console.warn("YouTube API issue:", data.error.message);
        return ''; 
      }
    } catch (error) {
      console.error(`Attempt failed for query "${query}":`, error);
    }
  }
  
  return '';
};

export const getTrendingSongs = async (): Promise<Song[]> => {
  try {
    const response = await fetch(`${ITUNES_BASE_URL}?term=music&entity=song&limit=20&sort=recent`);
    const data = await response.json();
    
    if (!data.results) return [];

    return data.results.map((item: any) => ({
      id: '',
      title: item.trackName,
      artist: item.artistName,
      thumbnail: item.artworkUrl100.replace('100x100', '600x600'),
      album: item.collectionName,
      previewUrl: item.previewUrl
    }));
  } catch (error) {
    console.error('Error fetching trending songs:', error);
    return [];
  }
};
