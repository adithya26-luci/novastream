
import React, { useEffect, useState } from 'react';
import { getTrendingSongs } from '../services/youtubeService';
import { getAIRecommendations } from '../services/geminiService';
import { Song, Playlist } from '../types';
import { Sparkles, RefreshCcw, Play, Info } from 'lucide-react';
import SongItem from '../components/SongItem';
import { useAudio } from '../context/AudioContext';

interface HomeViewProps {
  likedSongs: Song[];
  toggleLike: (song: Song) => void;
  playlists: Playlist[];
  onAddToPlaylist: (pid: string, s: Song) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ likedSongs, toggleLike, playlists, onAddToPlaylist }) => {
  const [trending, setTrending] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiPrompts, setAiPrompts] = useState<string[]>([]);
  const { playSong } = useAudio();

  const loadData = async () => {
    setLoading(true);
    try {
      const songs = await getTrendingSongs();
      setTrending(songs);
      const recs = await getAIRecommendations(songs.slice(0, 3));
      setAiPrompts(recs);
    } catch (err) {
      console.error("Failed to fetch home data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isLiked = (id: string, title: string) => 
    likedSongs.some(s => s.id === id || s.title === title);

  if (loading) {
    return (
      <div className="pt-8">
        <div className="h-64 w-full bg-white/5 animate-pulse rounded-3xl mb-12" />
        <div className="flex items-center justify-between mb-8">
           <div className="h-8 w-48 bg-white/5 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square bg-white/5 animate-pulse rounded-xl" />
              <div className="h-4 w-3/4 bg-white/5 animate-pulse rounded" />
              <div className="h-3 w-1/2 bg-white/5 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const heroSong = trending[0];

  return (
    <div className="pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Hero Banner */}
      {heroSong && (
        <section className="mb-12 relative h-80 rounded-3xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
          <img 
            src={heroSong.thumbnail} 
            alt="Hero" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-10000 group-hover:scale-110" 
          />
          <div className="relative z-20 h-full flex flex-col justify-center px-12 max-w-2xl">
            <span className="text-indigo-400 font-bold text-xs uppercase tracking-[0.3em] mb-4">Trending Now</span>
            <h1 className="text-5xl font-extrabold mb-4 tracking-tight drop-shadow-2xl">{heroSong.title}</h1>
            <p className="text-lg text-gray-300 mb-8 font-medium truncate">{heroSong.artist} • Global Hit</p>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => playSong(heroSong)}
                className="px-8 py-3.5 bg-white text-black font-bold rounded-full flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                <Play className="w-5 h-5 fill-current" /> Play Now
              </button>
              <button className="p-3.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/20 transition-all">
                <Info className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight mb-1">Global Discovery</h2>
            <p className="text-sm text-gray-400">Hand-picked viral tracks from across the globe.</p>
          </div>
          <button 
            onClick={loadData}
            className="p-3 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-gray-400 hover:text-white"
            title="Refresh Discovery"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {trending.slice(1, 11).map((song) => (
            <SongItem 
              key={song.id || song.title} 
              song={song} 
              isLiked={isLiked(song.id, song.title)} 
              toggleLike={toggleLike}
              playlists={playlists}
              onAddToPlaylist={onAddToPlaylist}
              displayMode="grid"
            />
          ))}
        </div>
      </section>

      <section className="mb-16">
        <div className="glass rounded-[32px] p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px]" />
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-7 h-7 text-indigo-400 animate-pulse" />
            <h2 className="text-2xl font-extrabold tracking-tight">AI Insights</h2>
          </div>
          <p className="text-gray-400 mb-8 max-w-xl">Our Gemini-powered engine analyzed your taste. Explore these custom categories generated just for you.</p>
          <div className="flex flex-wrap gap-4">
            {aiPrompts.map((prompt, i) => (
              <button 
                key={i}
                className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all hover:-translate-y-1"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-12">
        <h2 className="text-2xl font-extrabold tracking-tight mb-8">Hot Tracks</h2>
        <div className="space-y-2">
          {trending.slice(11, 21).map((song, i) => (
            <SongItem 
              key={song.id || song.title} 
              index={i + 1}
              song={song} 
              isLiked={isLiked(song.id, song.title)} 
              toggleLike={toggleLike}
              playlists={playlists}
              onAddToPlaylist={onAddToPlaylist}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeView;
