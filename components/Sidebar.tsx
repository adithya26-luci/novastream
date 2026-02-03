
import React from 'react';
import { Home, Search, Library, PlusCircle, Heart, Music2 } from 'lucide-react';
import { View, Playlist } from '../types';

interface SidebarProps {
  currentView: View;
  setView: (v: View) => void;
  playlists: Playlist[];
  likedCount: number;
  onPlaylistClick: (p: Playlist) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, playlists, likedCount, onPlaylistClick }) => {
  const navItems = [
    { icon: Home, label: 'Home', view: 'home' as View },
    { icon: Search, label: 'Search', view: 'search' as View },
    { icon: Library, label: 'Your Library', view: 'library' as View },
  ];

  return (
    <div className="w-64 bg-black h-full flex flex-col p-4 border-r border-white/5 hidden md:flex">
      <div className="flex items-center gap-2 mb-8 px-2 cursor-pointer" onClick={() => setView('home')}>
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Music2 className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          NovaStream
        </span>
      </div>

      <nav className="space-y-1 mb-8">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setView(item.view)}
            className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-md transition-all duration-200 group ${
              currentView === item.view 
              ? 'bg-white/10 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon className={`w-5 h-5 ${currentView === item.view ? 'text-indigo-400' : 'group-hover:text-indigo-300'}`} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="space-y-4 flex-1 flex flex-col min-h-0">
        <div className="px-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Your Music</h3>
          <button 
            onClick={() => setView('library')}
            className="w-full flex items-center gap-4 text-gray-400 hover:text-white transition-colors group mb-3"
          >
            <PlusCircle className="w-5 h-5 group-hover:text-indigo-400" />
            <span className="font-medium">Create Playlist</span>
          </button>
          <button 
            onClick={() => setView('library')}
            className="w-full flex items-center gap-4 text-gray-400 hover:text-white transition-colors group"
          >
            <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-700 to-blue-300 flex items-center justify-center">
              <Heart className="w-3 h-3 text-white fill-white" />
            </div>
            <div className="flex flex-col items-start">
                <span className="font-medium">Liked Songs</span>
                <span className="text-[10px] text-gray-500">{likedCount} songs</span>
            </div>
          </button>
        </div>
        
        <div className="border-t border-white/5 pt-4 px-3 flex-1 overflow-y-auto space-y-2">
          {playlists.length > 0 ? (
            playlists.map(p => (
              <button 
                key={p.id} 
                className="block w-full text-left text-sm text-gray-400 hover:text-white truncate py-1 transition-colors"
                onClick={() => onPlaylistClick(p)}
              >
                {p.name}
              </button>
            ))
          ) : (
            <p className="text-xs text-gray-600 italic px-1">No playlists yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
