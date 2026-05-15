"use client";

import { create } from "zustand";

interface PlayerState {
  isPlaying: boolean;
  currentAnimeId: string | null;
  currentEpisodeId: string | null;
  currentEpisode: number;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isTheaterMode: boolean;
  isLoading: boolean;
  sources: Array<{ url: string; quality: string; isM3U8?: boolean }>;
  currentSource: string;
  subtitles: Array<{ url: string; label: string; lang?: string }>;
  currentSubtitle: string;
  
  setPlaying: (isPlaying: boolean) => void;
  setAnime: (animeId: string, episodeId: string, episode: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  toggleTheaterMode: () => void;
  setLoading: (isLoading: boolean) => void;
  setSources: (sources: Array<{ url: string; quality: string; isM3U8?: boolean }>) => void;
  setCurrentSource: (url: string) => void;
  setSubtitles: (subtitles: Array<{ url: string; label: string; lang?: string }>) => void;
  setCurrentSubtitle: (url: string) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  isPlaying: false,
  currentAnimeId: null,
  currentEpisodeId: null,
  currentEpisode: 1,
  progress: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  isFullscreen: false,
  isTheaterMode: false,
  isLoading: false,
  sources: [],
  currentSource: "",
  subtitles: [],
  currentSubtitle: "",
  
  setPlaying: (isPlaying) => set({ isPlaying }),
  setAnime: (animeId, episodeId, episode) => set({ 
    currentAnimeId: animeId, 
    currentEpisodeId: episodeId, 
    currentEpisode: episode,
    progress: 0,
    duration: 0,
  }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
  toggleTheaterMode: () => set((state) => ({ isTheaterMode: !state.isTheaterMode })),
  setLoading: (isLoading) => set({ isLoading }),
  setSources: (sources) => set({ sources, currentSource: sources[0]?.url || "" }),
  setCurrentSource: (url) => set({ currentSource: url }),
  setSubtitles: (subtitles) => set({ subtitles }),
  setCurrentSubtitle: (url) => set({ currentSubtitle: url }),
  reset: () => set({
    isPlaying: false,
    currentAnimeId: null,
    currentEpisodeId: null,
    currentEpisode: 1,
    progress: 0,
    duration: 0,
    isLoading: false,
    sources: [],
    currentSource: "",
    subtitles: [],
    currentSubtitle: "",
  }),
}));