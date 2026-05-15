import { create } from "zustand";

interface PlayerState {
  isTheaterMode: boolean;
  volume: number;
  isMuted: boolean;
  playbackSpeed: number;
  selectedSubtitle: string | null;
  introSkipSeconds: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  toggleTheaterMode: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setSelectedSubtitle: (subtitle: string | null) => void;
  setIntroSkipSeconds: (seconds: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  isTheaterMode: false,
  volume: 1,
  isMuted: false,
  playbackSpeed: 1,
  selectedSubtitle: null,
  introSkipSeconds: 85,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  toggleTheaterMode: () => set((state) => ({ isTheaterMode: !state.isTheaterMode })),
  setVolume: (volume) => set({ volume }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  setSelectedSubtitle: (selectedSubtitle) => set({ selectedSubtitle }),
  setIntroSkipSeconds: (introSkipSeconds) => set({ introSkipSeconds }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
}));