
export interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: string;
  album?: string;
  previewUrl?: string; // Fallback 30s audio clip from iTunes
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  songs: Song[];
  createdAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export type View = 'home' | 'search' | 'library' | 'playlist' | 'artist';
