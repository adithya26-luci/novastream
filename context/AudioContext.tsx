
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Song } from '../types';
import { resolveYoutubeId } from '../services/youtubeService';

interface AudioContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  isLoading: boolean;
  isFallback: boolean;
  error: string | null;
  playSong: (song: Song) => Promise<void>;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  volume: number;
  setVolume: (v: number) => void;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
  queue: Song[];
  addToQueue: (song: Song) => void;
  clearError: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode; onPlay?: (song: Song) => void }> = ({ children, onPlay }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Song[]>([]);
  
  const playerRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // 1. Setup HTML5 Fallback Engine
    audioRef.current = new Audio();
    const a = audioRef.current;
    
    a.addEventListener('ended', () => nextSong());
    a.addEventListener('timeupdate', () => {
      if (isFallback) setCurrentTime(a.currentTime);
    });
    a.addEventListener('loadedmetadata', () => {
      if (isFallback) setDuration(a.duration);
    });
    a.addEventListener('error', () => {
      if (isFallback) setError("Failed to play fallback preview.");
    });

    // 2. Setup YouTube Engine
    const onYouTubeIframeAPIReady = () => {
      playerRef.current = new (window as any).YT.Player('yt-player', {
        height: '0',
        width: '0',
        videoId: '',
        playerVars: { 
          autoplay: 0, 
          controls: 0, 
          rel: 0, 
          showinfo: 0, 
          modestbranding: 1,
          origin: window.location.origin 
        },
        events: {
          onReady: (event: any) => event.target.setVolume(volume),
          onError: (event: any) => {
            console.warn("YouTube Player Error:", event.data);
            handleYoutubeError();
          },
          onStateChange: (event: any) => {
            if (isFallback) return;
            const state = event.data;
            const YT = (window as any).YT;

            if (state === YT.PlayerState.ENDED) nextSong();
            if (state === YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setIsLoading(false);
              setDuration(playerRef.current.getDuration());
              setError(null);
            } else if (state === YT.PlayerState.BUFFERING) {
              setIsLoading(true);
            } else if (state === YT.PlayerState.CUED) {
              setIsLoading(false);
            } else {
              setIsPlaying(false);
              setIsLoading(false);
            }
          },
        },
      });
    };

    if ((window as any).YT && (window as any).YT.Player) {
      onYouTubeIframeAPIReady();
    } else {
      (window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }

    return () => { 
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current); 
      a.pause();
      a.src = "";
    };
  }, [isFallback]); // Re-bind listeners if engine switches

  const handleYoutubeError = async () => {
    if (currentSong?.previewUrl) {
      console.warn("Switching to fallback due to YT error");
      await playFallback(currentSong);
    } else {
      setError("Could not play this track via YouTube.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isPlaying && !isFallback) {
      progressIntervalRef.current = window.setInterval(() => {
        if (playerRef.current?.getCurrentTime) {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }, 500);
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }
  }, [isPlaying, isFallback]);

  const playSong = async (song: Song) => {
    setError(null);
    setIsLoading(true);
    setCurrentSong(song);
    
    // Stop all engines
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (playerRef.current?.stopVideo) {
      playerRef.current.stopVideo();
    }

    let videoId = song.id;
    if (!videoId) {
      videoId = await resolveYoutubeId(song);
    }

    if (onPlay) onPlay(song);

    if (videoId && playerRef.current) {
      setIsFallback(false);
      try {
        playerRef.current.loadVideoById(videoId);
        playerRef.current.playVideo();
        setIsPlaying(true);
      } catch (e) {
        handleYoutubeError();
      }
    } else if (song.previewUrl) {
      await playFallback(song);
    } else {
      setIsLoading(false);
      setIsPlaying(false);
      setError(`No playable sources found for "${song.title}".`);
    }
  };

  const playFallback = async (song: Song) => {
    if (!audioRef.current || !song.previewUrl) return;
    setIsFallback(true);
    audioRef.current.src = song.previewUrl;
    audioRef.current.volume = volume / 100;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
    } catch (e) {
      setError("Fallback player failed.");
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (isFallback && audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play();
    } else if (playerRef.current) {
      isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    if (queue.length > 0) {
      const next = queue[0];
      setQueue(prev => prev.slice(1));
      playSong(next);
    }
  };

  const prevSong = () => {
    if (currentTime > 3) {
      seek(0);
    } else {
      // Logic for actual previous song in history could go here
      seek(0);
    }
  };

  const seek = (time: number) => {
    if (isFallback && audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    } else if (playerRef.current) {
      playerRef.current.seekTo(time);
      setCurrentTime(time);
    }
  };

  const handleSetVolume = (v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v / 100;
    if (playerRef.current?.setVolume) playerRef.current.setVolume(v);
  };

  const addToQueue = (song: Song) => setQueue(prev => [...prev, song]);
  const clearError = () => setError(null);

  return (
    <AudioContext.Provider value={{
      currentSong, isPlaying, isLoading, isFallback, error, playSong, togglePlay, nextSong, prevSong,
      volume, setVolume: handleSetVolume, currentTime, duration, seek,
      queue, addToQueue, clearError
    }}>
      {children}
      <div id="yt-player" className="hidden"></div>
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within AudioProvider');
  return context;
};
