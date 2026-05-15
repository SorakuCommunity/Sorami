export interface SpotlightAnime {
  id: string;
  title: string;
  titleEnglish?: string;
  poster: string;
  cover?: string;
  description?: string;
  rating?: number;
  episodes?: number;
  totalEpisodes?: number;
  status: "ONGOING" | "COMPLETED" | "UPCOMING";
  year?: number;
  type?: "TV" | "MOVIE" | "OVA" | "SPECIAL" | "ONA" | "MUSIC";
  genres?: string[];
  hasSub?: boolean;
  hasDub?: boolean;
}

export interface Anime {
  id: string;
  slug: string;
  title: string;
  titleEnglish?: string;
  titleNative?: string;
  poster: string;
  cover?: string;
  banner?: string;
  description?: string;
  rating?: number;
  episodes?: number;
  totalEpisodes?: number;
  status: "ONGOING" | "COMPLETED" | "UPCOMING";
  releaseDate?: string;
  year?: number;
  duration?: string;
  genres: string[];
  studios?: string[];
  type?: "TV" | "MOVIE" | "OVA" | "SPECIAL" | "ONA" | "MUSIC";
  hasSub?: boolean;
  hasDub?: boolean;
  trailer?: string;
  countryOfOrigin?: string;
  season?: string;
  seasonYear?: number;
}

// Spotlight/Featured Anime (subset with focus on display)
export interface SpotlightAnime {
  id: string;
  title: string;
  titleEnglish?: string;
  poster: string;
  cover?: string;
  banner?: string;
  description?: string;
  rating?: number;
  episodes?: number;
  totalEpisodes?: number;
  status: "ONGOING" | "COMPLETED" | "UPCOMING";
  releaseDate?: string;
  year?: number;
  type?: "TV" | "MOVIE" | "OVA" | "SPECIAL" | "ONA" | "MUSIC";
  genres?: string[];
  hasSub?: boolean;
  hasDub?: boolean;
}

export interface Episode {
  id: string;
  animeId: string;
  number: number;
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  isSubbed?: boolean;
  isDubbed?: boolean;
  releaseDate?: string;
  airedAt?: string;
}

export interface EpisodeSource {
  sources: Array<{ url: string; quality: string; isM3U8?: boolean }>;
  subtitles: Array<{ url: string; label: string; lang?: string }>;
  headers?: Record<string, string>;
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
}

export interface WatchHistory {
  id: string;
  userId: string;
  animeId: string;
  episodeId: string;
  episodeNumber: number;
  progress: number;
  duration: number;
  completed: boolean;
  lastWatched: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  animeId: string;
  createdAt: Date;
}

export interface Bookmark {
  id: string;
  userId: string;
  animeId: string;
  episodeId?: string;
  note?: string;
  createdAt: Date;
}

export interface TrendingAnime {
  anime: Anime;
  score: number;
  views: number;
  clicks: number;
  watchTime: number;
  rank: number;
  period: "daily" | "weekly" | "monthly";
}

export interface TopRatedAnime {
  anime: Anime;
  rating: number;
  usersCount: number;
  rank: number;
}

export interface UpcomingAnime {
  anime: Anime;
  releaseDate: string;
  daysUntilRelease: number;
  trailer?: string;
}

export interface AiringAnime {
  anime: Anime;
  episode: number;
  totalEpisodes: number;
  nextEpisodeDate: string;
  timeUntilNext: string;
}

export interface Recommendation {
  anime: Anime;
  score: number;
  reason: string;
}

export interface ContinueWatching extends WatchHistory {
  anime: Anime;
  episode: Episode;
}

export interface CommunityActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  animeId: string;
  animeTitle: string;
  animePoster: string;
  episodeNumber?: number;
  action: "watching" | "completed" | "favorited" | "reviewed";
  timestamp: Date;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  count: number;
  color?: string;
  icon?: string;
}

export interface Episode {
  id: string;
  animeId: string;
  number: number;
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  isSubbed?: boolean;
  isDubbed?: boolean;
  releaseDate?: string;
  airedAt?: string;
}

export interface AnimeSearchResult {
  animes: Anime[];
  totalPages: number;
  currentPage: number;
  hasNextPage?: boolean;
}

export interface EpisodeSource {
  sources: Array<{ url: string; quality: string; isM3U8?: boolean }>;
  subtitles: Array<{ url: string; label: string; lang?: string }>;
  headers?: Record<string, string>;
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
}

export interface WatchHistory {
  id: string;
  userId: string;
  animeId: string;
  episodeId: string;
  episodeNumber: number;
  progress: number;
  duration: number;
  completed: boolean;
  lastWatched: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  animeId: string;
  createdAt: Date;
}

export interface Bookmark {
  id: string;
  userId: string;
  animeId: string;
  episodeId?: string;
  note?: string;
  createdAt: Date;
}

export interface TrendingAnime {
  anime: Anime;
  score: number;
  views: number;
  clicks: number;
  watchTime: number;
  rank: number;
  period: "daily" | "weekly" | "monthly";
}

export interface TopRatedAnime {
  anime: Anime;
  rating: number;
  usersCount: number;
  rank: number;
}

export interface UpcomingAnime {
  anime: Anime;
  releaseDate: string;
  daysUntilRelease: number;
  trailer?: string;
}

export interface AiringAnime {
  anime: Anime;
  episode: number;
  totalEpisodes: number;
  nextEpisodeDate: string;
  timeUntilNext: string;
}

export interface Recommendation {
  anime: Anime;
  score: number;
  reason: string;
}

export interface ContinueWatching extends WatchHistory {
  anime: Anime;
  episode: Episode;
}

export interface CommunityActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  animeId: string;
  animeTitle: string;
  animePoster: string;
  episodeNumber?: number;
  action: "watching" | "completed" | "favorited" | "reviewed";
  timestamp: Date;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  count: number;
  color?: string;
  icon?: string;
}

export type WatchStatus = "watching" | "completed" | "paused" | "dropped" | "plantowatch";

export interface UserAnimeList {
  id: string;
  userId: string;
  animeId: string;
  status: WatchStatus;
  progress: number;
  score?: number;
  startedAt?: Date;
  completedAt?: Date;
  updatedAt: Date;
}