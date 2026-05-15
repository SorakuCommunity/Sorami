export interface AnimeEntry {
  id: string;
  title: string;
  englishTitle?: string;
  nativeTitle?: string;
  image?: string;
  cover?: string;
  description?: string;
  genres?: string[];
  rating?: number;
  status?: string;
  type?: string;
  year?: number;
  season?: string;
  studios?: string[];
  totalEpisodes?: number;
  episodes?: EpisodeInfo[];
  nextAiringEpisode?: { episode: number; timeUntilAiring: number };
}

export interface EpisodeInfo {
  id: string;
  number: number;
  title?: string;
  image?: string;
}

export interface StreamSource {
  url: string;
  quality: string;
  isM3U8?: boolean;
}

export interface Subtitle {
  url: string;
  lang: string;
}

export interface StreamResult {
  sources: StreamSource[];
  subtitles: Subtitle[];
  headers?: Record<string, string>;
}

export interface SearchResult {
  results: AnimeEntry[];
  totalPages?: number;
  hasNextPage?: boolean;
}

export interface Provider {
  readonly name: string;
  readonly type: 'global' | 'indonesian' | 'metadata';
  search(query: string, page?: number): Promise<SearchResult>;
  info(id: string): Promise<AnimeEntry | null>;
  stream?(episodeId: string): Promise<StreamResult | null>;
  recent?(page?: number): Promise<SearchResult>;
  popular?(page?: number): Promise<SearchResult>;
  trending?(page?: number): Promise<SearchResult>;
  topRated?(page?: number): Promise<SearchResult>;
  health(): Promise<boolean>;
}
