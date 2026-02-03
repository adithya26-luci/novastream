
import React from 'react';
import { Playlist, Song } from '../types';
import { Play, MoreHorizontal, Clock } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import SongItem from '../components/SongItem';

interface PlaylistDetailViewProps {
  playlist: Playlist;
  onRemoveSong: (sid: string) => void;
  likedSongs: Song[];
  toggleLike: (s: Song) => void;
}

const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({ playlist, onRemoveSong, likedSongs, toggleLike }) => {
  const { playSong } = useAudio();

  const isLiked = (id: string) => likedSongs.some(s => s.id === id);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-end gap-8 mb-8 pt-4">
        <div className="w-56 h-56 bg-indigo-600/20 rounded-xl flex items-center justify-center shadow-2xl overflow-hidden flex-shrink-0">
          {playlist.songs.length > 0 ? (
            <img src={playlist.songs[0].thumbnail} className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Play className="w-16 h-16 text-white/40" />
             </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Playlist</p>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">{playlist.name}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
            <span className="text-white">Guest User</span>
            <span>•</span>
            <span>{playlist.songs.length} songs</span>
            <span>•</span>
            <span>Created {new Date(playlist.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-8">
        <button 
          onClick={() => playlist.songs.length > 0 && playSong(playlist.songs[0])}
          className="w-14 h-14 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <Play className="w-6 h-6 text-white fill-current ml-1" />
        </button>
        <button className="text-gray-400 hover:text-white transition-colors">
          <MoreHorizontal className="w-8 h-8" />
        </button>
      </div>

      <div className="mb-4 grid grid-cols-[48px_1fr_120px] px-2 text-gray-500 text-xs font-bold uppercase tracking-widest border-b border-white/5 pb-2">
        <span>#</span>
        <span>Title</span>
        <div className="flex justify-end pr-4">
          <Clock className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-1">
        {playlist.songs.length > 0 ? playlist.songs.map((song, i) => (
          <SongItem 
            key={`${song.id}-${i}`}
            index={i + 1}
            song={song}
            isLiked={isLiked(song.id)}
            toggleLike={toggleLike}
            playlists={[]} // Not needed here
            onAddToPlaylist={() => {}} // Not needed here
            onRemoveFromPlaylist={onRemoveSong}
          />
        )) : (
          <div className="py-12 text-center text-gray-500">
            <p className="text-lg font-medium mb-2">No songs in this playlist yet.</p>
            <p className="text-sm">Search and add tracks to populate your collection.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetailView;
