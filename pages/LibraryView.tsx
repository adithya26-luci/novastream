
import React from 'react';
import { Playlist, Song } from '../types';
import { Plus, Heart, Music, Clock, Play } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

interface LibraryViewProps {
  playlists: Playlist[];
  likedSongs: Song[];
  history: Song[];
  onCreatePlaylist: (name: string) => void;
  onPlaylistClick: (p: Playlist) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ playlists, likedSongs, history, onCreatePlaylist, onPlaylistClick }) => {
  const { playSong } = useAudio();

  const handleNewPlaylist = () => {
    const name = prompt('Enter playlist name:');
    if (name && name.trim()) {
      onCreatePlaylist(name.trim());
    }
  };

  return (
    <div className="pt-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Your Library</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-16">
        {/* Liked Songs Special Tile */}
        <div 
          onClick={() => likedSongs.length > 0 && playSong(likedSongs[0])}
          className="aspect-square bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-500 rounded-xl p-6 flex flex-col justify-end group cursor-pointer relative shadow-xl hover:scale-[1.02] transition-transform"
        >
          <div className="mb-4">
            <p className="text-sm font-medium opacity-80 mb-1">Playlist</p>
            <h3 className="text-2xl font-bold">Liked Songs</h3>
          </div>
          <p className="text-xs font-semibold opacity-90">{likedSongs.length} songs</p>
          <button className="absolute bottom-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-6 h-6 text-indigo-600 fill-current ml-1" />
          </button>
        </div>

        {/* Create New Tile */}
        <div 
          onClick={handleNewPlaylist}
          className="aspect-square bg-white/5 hover:bg-white/10 rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer border border-dashed border-white/20 hover:border-white/40 transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-bold text-gray-400">New Playlist</p>
        </div>

        {playlists.map((p) => (
          <div 
            key={p.id} 
            className="group bg-white/5 hover:bg-white/10 p-4 rounded-xl transition-all cursor-pointer"
            onClick={() => onPlaylistClick(p)}
          >
            <div className="aspect-square bg-indigo-500/20 rounded-lg mb-4 flex items-center justify-center relative shadow-lg overflow-hidden">
              {p.songs.length > 0 ? (
                <img src={p.songs[0].thumbnail} className="w-full h-full object-cover" />
              ) : (
                <Music className="w-12 h-12 text-indigo-400" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <button className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-6 h-6 text-white fill-current ml-1" />
                  </button>
              </div>
            </div>
            <h3 className="font-bold truncate text-sm mb-1 text-white">{p.name}</h3>
            <p className="text-xs text-gray-500">{p.songs.length} songs</p>
          </div>
        ))}
      </div>
      
      {history.length > 0 && (
        <div className="mt-16">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Recently Played
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((song) => (
                  <div 
                    key={song.id} 
                    onClick={() => playSong(song)}
                    className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group cursor-pointer"
                  >
                      <img src={song.thumbnail} className="w-12 h-12 rounded object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold truncate text-white">{song.title}</h4>
                          <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                        <Play className="w-4 h-4 text-white fill-current" />
                      </div>
                  </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryView;
