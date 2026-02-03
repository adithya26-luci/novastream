
import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, 
  Volume2, ListMusic, Maximize2, Minimize2, Heart, Loader2, Music4, AlertCircle, X
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { Song } from '../types';

interface PlayerProps {
  likedSongs: Song[];
  toggleLike: (song: Song) => void;
  isMiniPlayer: boolean;
  setIsMiniPlayer: (val: boolean) => void;
}

const Player: React.FC<PlayerProps> = ({ likedSongs, toggleLike, isMiniPlayer, setIsMiniPlayer }) => {
  const { 
    currentSong, isPlaying, isLoading, isFallback, error, togglePlay, nextSong, prevSong, 
    volume, setVolume, currentTime, duration, seek, clearError, queue
  } = useAudio();

  const [localProgress, setLocalProgress] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    if (!isSeeking) {
      setLocalProgress(currentTime);
    }
  }, [currentTime, isSeeking]);

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const isLiked = currentSong ? likedSongs.some(s => s.id === currentSong.id || s.title === currentSong.title) : false;

  if (!currentSong) return null;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setLocalProgress(val);
  };

  // Fixed: Changed from React.ChangeEvent to a parameter-less function since it's used with onMouseUp/onTouchEnd
  // and relies on localProgress state updated by handleSeekChange
  const handleSeekEnd = () => {
    setIsSeeking(false);
    seek(localProgress);
  };

  const PlayerControls = (small = false) => (
    <div className={`flex items-center ${small ? 'gap-3' : 'gap-6'}`}>
      {!small && (
        <button className="text-gray-500 hover:text-white transition-colors" title="Shuffle">
          <Shuffle className="w-4 h-4" />
        </button>
      )}
      <button onClick={prevSong} className="text-gray-200 hover:text-white transition-colors">
        <SkipBack className={`${small ? 'w-4 h-4' : 'w-6 h-6'} fill-current`} />
      </button>
      <button 
        onClick={togglePlay}
        className={`${small ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-white flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-xl group/play`}
      >
        {isLoading ? (
          <Loader2 className={`${small ? 'w-4 h-4' : 'w-5 h-5'} text-black animate-spin`} />
        ) : isPlaying ? (
          <Pause className={`${small ? 'w-4 h-4' : 'w-5 h-5'} text-black fill-current`} />
        ) : (
          <Play className={`${small ? 'w-4 h-4' : 'w-5 h-5'} text-black fill-current ${small ? 'ml-0' : 'ml-0.5'}`} />
        )}
      </button>
      <button 
        onClick={nextSong} 
        disabled={queue.length === 0}
        className={`${queue.length === 0 ? 'text-gray-600' : 'text-gray-200 hover:text-white'} transition-colors`}
      >
        <SkipForward className={`${small ? 'w-4 h-4' : 'w-6 h-6'} fill-current`} />
      </button>
      {!small && (
        <button className="text-gray-500 hover:text-white transition-colors" title="Repeat">
          <Repeat className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-28 right-8 z-[100] animate-in slide-in-from-right-10 fade-in duration-300">
          <div className="bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-xl p-4 flex items-center gap-3 shadow-2xl">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm font-medium text-red-200">{error}</span>
            <button onClick={clearError} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      )}

      {isMiniPlayer ? (
        <div className="fixed bottom-6 right-6 w-72 glass rounded-2xl shadow-2xl p-4 z-[60] animate-in fade-in zoom-in-95 duration-300 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-shrink-0">
              <img src={currentSong.thumbnail} alt={currentSong.title} className="w-16 h-16 rounded-xl object-cover shadow-lg" />
              {isPlaying && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                  <div className="flex items-end gap-0.5 h-4">
                    <div className="w-1 bg-white animate-[bounce_0.6s_infinite]" />
                    <div className="w-1 bg-white animate-[bounce_1s_infinite]" />
                    <div className="w-1 bg-white animate-[bounce_0.8s_infinite]" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate">{currentSong.title}</h4>
              <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
            </div>
            <button onClick={() => setIsMiniPlayer(false)} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <div className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-indigo-500 transition-all duration-300" 
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} 
              />
            </div>
            <div className="flex items-center justify-between">
              <button onClick={(e) => { e.stopPropagation(); toggleLike(currentSong); }} className={`${isLiked ? 'text-indigo-500' : 'text-gray-400 hover:text-white'} transition-colors`}>
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              {PlayerControls(true)}
              <div className="w-4 flex justify-end">
                 {isFallback && <Music4 className="w-3 h-3 text-indigo-400 animate-pulse" />}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-black/90 backdrop-blur-2xl border-t border-white/5 px-6 flex items-center justify-between z-50 animate-in fade-in slide-in-from-bottom-full duration-500">
          <div className="flex items-center gap-4 w-1/3 min-w-0">
            <div className="relative flex-shrink-0 group">
              <img src={currentSong.thumbnail} alt={currentSong.title} className="w-14 h-14 rounded-md object-cover shadow-2xl transition-transform group-hover:scale-105" />
              {isFallback && (
                <div className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-[7px] font-bold px-1.5 py-0.5 rounded-full border border-white/20 shadow-lg tracking-wider">
                  PREVIEW
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <h4 className="text-sm font-bold text-white truncate hover:text-indigo-400 transition-colors cursor-pointer">{currentSong.title}</h4>
              <p className="text-xs text-gray-400 truncate hover:text-gray-200 transition-colors cursor-pointer">{currentSong.artist}</p>
            </div>
            <button onClick={() => toggleLike(currentSong)} className={`ml-3 p-2 rounded-full hover:bg-white/5 transition-all ${isLiked ? 'text-indigo-500' : 'text-gray-500 hover:text-white'}`}>
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-1 w-1/3 max-w-xl">
            {PlayerControls(false)}
            <div className="w-full flex items-center gap-3 mt-1">
              <span className="text-[10px] text-gray-500 min-w-[35px] text-right font-mono tabular-nums">{formatTime(localProgress)}</span>
              <div className="relative flex-1 group py-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={localProgress}
                  onMouseDown={() => setIsSeeking(true)}
                  // Fixed: Use handleSeekChange (was handleSearchChange)
                  onChange={handleSeekChange}
                  // Fixed: handleSeekEnd is now compatible with mouse events
                  onMouseUp={handleSeekEnd}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white hover:accent-indigo-400 outline-none transition-all"
                  style={{
                    background: `linear-gradient(to right, ${isFallback ? '#6366f1' : '#ffffff'} 0%, ${isFallback ? '#6366f1' : '#ffffff'} ${(localProgress / (duration || 100)) * 100}%, rgba(255,255,255,0.1) ${(localProgress / (duration || 100)) * 100}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
              </div>
              <span className="text-[10px] text-gray-500 min-w-[35px] font-mono tabular-nums">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 w-1/3">
            <button onClick={() => setIsMiniPlayer(true)} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-all" title="Mini Player">
              <Minimize2 className="w-5 h-5" />
            </button>
            <div className="relative">
              <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-all group/queue">
                <ListMusic className="w-5 h-5" />
                {queue.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-black" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 w-32 group/vol">
              <Volume2 className="w-4 h-4 text-gray-500 group-hover/vol:text-white transition-colors" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-gray-400 hover:accent-indigo-400 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Player;
