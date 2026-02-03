
import React, { useState, useRef, useEffect } from 'react';
import { Play, Heart, MoreHorizontal, ListPlus, Trash2, Volume2 } from 'lucide-react';
import { Song, Playlist } from '../types';
import { useAudio } from '../context/AudioContext';

interface SongItemProps {
  song: Song;
  index?: number;
  isLiked: boolean;
  toggleLike: (s: Song) => void;
  playlists: Playlist[];
  onAddToPlaylist: (pid: string, s: Song) => void;
  onRemoveFromPlaylist?: (sid: string) => void;
  displayMode?: 'grid' | 'list';
}

const SongItem: React.FC<SongItemProps> = ({ 
  song, index, isLiked, toggleLike, playlists, onAddToPlaylist, onRemoveFromPlaylist, displayMode = 'list' 
}) => {
  const { playSong, addToQueue, currentSong, isPlaying } = useAudio();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isCurrent = currentSong?.title === song.title && currentSong?.artist === song.artist;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  if (displayMode === 'grid') {
    return (
      <div 
        className={`group bg-white/5 hover:bg-white/10 p-4 rounded-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-white/10 relative ${isCurrent ? 'ring-1 ring-indigo-500/50' : ''}`}
        onClick={() => playSong(song)}
      >
        <div className="relative aspect-square mb-4 overflow-hidden rounded-lg shadow-2xl">
          <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <div className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center gap-2 ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <button 
              onClick={(e) => { e.stopPropagation(); playSong(song); }}
              className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-90"
            >
              {isCurrent && isPlaying ? (
                <div className="flex items-end gap-1 h-4">
                  <div className="w-1 bg-white animate-[bounce_0.6s_infinite]" />
                  <div className="w-1 bg-white animate-[bounce_1s_infinite]" />
                  <div className="w-1 bg-white animate-[bounce_0.8s_infinite]" />
                </div>
              ) : (
                <Play className="w-6 h-6 text-white fill-current ml-1" />
              )}
            </button>
          </div>
        </div>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold truncate text-sm mb-1 ${isCurrent ? 'text-indigo-400' : 'text-white'}`}>{song.title}</h3>
            <p className="text-xs text-gray-400 truncate">{song.artist}</p>
          </div>
          <div className="flex flex-col gap-2 relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMenu && (
              <div ref={menuRef} className="absolute right-0 top-8 w-48 glass rounded-xl shadow-2xl border border-white/10 p-2 z-[70] animate-in fade-in zoom-in-95 duration-200">
                <button 
                  onClick={(e) => { e.stopPropagation(); addToQueue(song); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <ListPlus className="w-4 h-4" /> Add to Queue
                </button>
                <div className="my-1 border-t border-white/5" />
                <p className="px-3 py-1 text-[10px] text-gray-500 uppercase font-bold tracking-widest">Add to Playlist</p>
                {playlists.length > 0 ? playlists.map(p => (
                  <button 
                    key={p.id}
                    onClick={(e) => { e.stopPropagation(); onAddToPlaylist(p.id, song); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded-lg truncate transition-colors"
                  >
                    {p.name}
                  </button>
                )) : <p className="px-3 py-1 text-xs text-gray-600">No playlists</p>}
              </div>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
              className={`transition-colors p-1 rounded-full hover:bg-white/5 ${isLiked ? 'text-indigo-500' : 'text-gray-500 hover:text-white'}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer relative ${isCurrent ? 'bg-white/5' : ''}`}
      onClick={() => playSong(song)}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {index !== undefined && (
          <div className="w-4 text-right">
             {isCurrent && isPlaying ? (
               <Volume2 className="w-3 h-3 text-indigo-400" />
             ) : (
               <span className={`text-sm ${isCurrent ? 'text-indigo-400 font-bold' : 'text-gray-500'}`}>{index}</span>
             )}
          </div>
        )}
        <img src={song.thumbnail} className="w-10 h-10 rounded object-cover flex-shrink-0 shadow-md" alt={song.title} />
        <div className="min-w-0 flex-1">
          <h4 className={`text-sm font-semibold truncate ${isCurrent ? 'text-indigo-400' : 'text-white'}`}>{song.title}</h4>
          <p className="text-xs text-gray-500 truncate">{song.artist}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-gray-500 pr-4">
        <button 
          onClick={(e) => { e.stopPropagation(); addToQueue(song); }}
          className="hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          title="Add to queue"
        >
          <ListPlus className="w-4 h-4" />
        </button>
        <Heart 
          className={`w-4 h-4 hover:text-indigo-400 cursor-pointer transition-all hover:scale-110 ${isLiked ? 'text-indigo-500 fill-current opacity-100' : 'opacity-0 group-hover:opacity-100'}`} 
          onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
        />
        {onRemoveFromPlaylist ? (
           <Trash2 
            className="w-4 h-4 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-all hover:scale-110" 
            onClick={(e) => { e.stopPropagation(); onRemoveFromPlaylist(song.id); }}
           />
        ) : (
          <div className="relative">
            <MoreHorizontal 
              className="w-4 h-4 hover:text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-all" 
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            />
            {showMenu && (
              <div ref={menuRef} className="absolute right-0 top-6 w-48 glass rounded-xl shadow-2xl border border-white/10 p-2 z-[70] animate-in fade-in zoom-in-95 duration-200">
                <p className="px-3 py-1 text-[10px] text-gray-500 uppercase font-bold tracking-widest">Add to Playlist</p>
                {playlists.length > 0 ? playlists.map(p => (
                  <button 
                    key={p.id}
                    onClick={(e) => { e.stopPropagation(); onAddToPlaylist(p.id, song); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded-lg truncate transition-colors"
                  >
                    {p.name}
                  </button>
                )) : <p className="px-3 py-1 text-xs text-gray-600 italic">Create a playlist first</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SongItem;
