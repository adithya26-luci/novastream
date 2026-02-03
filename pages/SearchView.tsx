
import React, { useState, useEffect } from 'react';
import { searchSongs } from '../services/youtubeService';
import { Song, Playlist } from '../types';
import { useAudio } from '../context/AudioContext';
import { Search as SearchIcon } from 'lucide-react';
import SongItem from '../components/SongItem';

interface SearchViewProps {
  initialQuery: string;
  likedSongs: Song[];
  toggleLike: (song: Song) => void;
  playlists: Playlist[];
  onAddToPlaylist: (pid: string, s: Song) => void;
}

const SearchView: React.FC<SearchViewProps> = ({ initialQuery, likedSongs, toggleLike, playlists, onAddToPlaylist }) => {
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const { playSong } = useAudio();

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const songs = await searchSongs(query);
      setResults(songs);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  const isLiked = (id: string) => likedSongs.some(s => s.id === id);

  return (
    <div className="pt-8">
      {loading ? (
        <div className="flex flex-col gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-white/5 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          <section>
            <h2 className="text-2xl font-bold mb-6">Top Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {results.slice(0, 2).map(song => (
                <div key={song.id} className="bg-white/5 hover:bg-white/10 p-6 rounded-2xl transition-all group relative cursor-pointer" onClick={() => playSong(song)}>
                   <div className="flex gap-6 items-center">
                    <img src={song.thumbnail} className="w-24 h-24 rounded-lg shadow-xl" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-bold mb-1 truncate">{song.title}</h3>
                      <p className="text-sm font-semibold text-gray-400">{song.artist}</p>
                    </div>
                   </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Songs</h2>
            <div className="grid grid-cols-1 gap-1">
              {results.map((song) => (
                <SongItem 
                  key={song.id} 
                  song={song} 
                  isLiked={isLiked(song.id)} 
                  toggleLike={toggleLike}
                  playlists={playlists}
                  onAddToPlaylist={onAddToPlaylist}
                />
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <SearchIcon className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Explore the vibe</h2>
          <p className="text-gray-400 max-w-sm">Search for tracks to add to your library and custom playlists.</p>
        </div>
      )}
    </div>
  );
};

export default SearchView;
