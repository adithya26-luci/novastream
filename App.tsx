
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import HomeView from './pages/HomeView';
import SearchView from './pages/SearchView';
import LibraryView from './pages/LibraryView';
import PlaylistDetailView from './pages/PlaylistDetailView';
import { AudioProvider } from './context/AudioContext';
import { View, Playlist, Song } from './types';
import { Search, Bell, User as UserIcon, ChevronLeft, ChevronRight, Settings, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [history, setHistory] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Persistence logic
  useEffect(() => {
    const savedPlaylists = localStorage.getItem('nova_playlists');
    const savedLiked = localStorage.getItem('nova_liked');
    const savedHistory = localStorage.getItem('nova_history');
    
    if (savedPlaylists) setPlaylists(JSON.parse(savedPlaylists));
    if (savedLiked) setLikedSongs(JSON.parse(savedLiked));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem('nova_playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('nova_liked', JSON.stringify(likedSongs));
  }, [likedSongs]);

  useEffect(() => {
    localStorage.setItem('nova_history', JSON.stringify(history));
  }, [history]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setView('search');
    }
  };

  const toggleLike = (song: Song) => {
    setLikedSongs(prev => {
      const exists = prev.find(s => s.title === song.title && s.artist === song.artist);
      if (exists) return prev.filter(s => s.title !== song.title || s.artist !== song.artist);
      return [song, ...prev];
    });
  };

  const addToHistory = (song: Song) => {
    setHistory(prev => {
      const filtered = prev.filter(s => s.title !== song.title || s.artist !== song.artist);
      return [song, ...filtered].slice(0, 20);
    });
  };

  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description: 'Your custom collection',
      songs: [],
      createdAt: Date.now()
    };
    setPlaylists(prev => [...prev, newPlaylist]);
  };

  const addSongToPlaylist = (playlistId: string, song: Song) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        const exists = p.songs.find(s => s.title === song.title && s.artist === song.artist);
        if (exists) return p;
        return { ...p, songs: [...p.songs, song] };
      }
      return p;
    }));
  };

  const removeSongFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return { ...p, songs: p.songs.filter(s => s.id !== songId) };
      }
      return p;
    }));
  };

  const openPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setView('playlist');
  };

  const activePlaylist = useMemo(() => {
    if (!selectedPlaylist) return null;
    return playlists.find(p => p.id === selectedPlaylist.id) || selectedPlaylist;
  }, [selectedPlaylist, playlists]);

  return (
    <AudioProvider onPlay={addToHistory}>
      <div className="flex h-screen bg-[#030303] overflow-hidden select-none text-white font-sans">
        <Sidebar 
          currentView={view} 
          setView={setView} 
          playlists={playlists} 
          likedCount={likedSongs.length}
          onPlaylistClick={openPlaylist}
        />
        
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Main Background Glow */}
          <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-indigo-600/10 via-transparent to-transparent pointer-events-none" />
          
          <header className="h-20 flex items-center justify-between px-8 z-30 sticky top-0 bg-[#030303]/40 backdrop-blur-xl border-b border-white/5">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSearch} className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  placeholder="Search tracks, artists, or moods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[450px] pl-11 pr-4 py-2.5 bg-white/5 border border-white/5 rounded-full text-sm focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all placeholder:text-gray-500"
                />
              </form>
            </div>

            <div className="flex items-center gap-5">
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#030303]" />
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-200">Guest Studio</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-14 w-56 glass rounded-2xl p-2 shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/10 rounded-xl transition-colors">
                      <UserIcon className="w-4 h-4" /> Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/10 rounded-xl transition-colors">
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                    <div className="h-px bg-white/5 my-1" />
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                      <LogOut className="w-4 h-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-8 pb-40 relative z-20">
            {view === 'home' && (
              <HomeView 
                likedSongs={likedSongs} 
                toggleLike={toggleLike} 
                playlists={playlists}
                onAddToPlaylist={addSongToPlaylist}
              />
            )}
            {view === 'search' && (
              <SearchView 
                initialQuery={searchQuery} 
                likedSongs={likedSongs} 
                toggleLike={toggleLike} 
                playlists={playlists}
                onAddToPlaylist={addSongToPlaylist}
              />
            )}
            {view === 'library' && (
              <LibraryView 
                playlists={playlists} 
                likedSongs={likedSongs} 
                history={history}
                onCreatePlaylist={createPlaylist}
                onPlaylistClick={openPlaylist}
              />
            )}
            {view === 'playlist' && activePlaylist && (
              <PlaylistDetailView 
                playlist={activePlaylist} 
                onRemoveSong={(songId) => removeSongFromPlaylist(activePlaylist.id, songId)}
                likedSongs={likedSongs}
                toggleLike={toggleLike}
              />
            )}
          </div>
        </main>

        <Player 
          likedSongs={likedSongs} 
          toggleLike={toggleLike} 
          isMiniPlayer={isMiniPlayer}
          setIsMiniPlayer={setIsMiniPlayer}
        />
      </div>
    </AudioProvider>
  );
};

export default App;
