export interface ProviderSearchResult {
  title: string;
  slug: string;
  synopsis?: string;
  posterUrl?: string;
  genres?: string[];
  year?: number;
  source: string;
}

export interface ProviderAnime {
  title: string;
  slug: string;
  synopsis?: string;
  posterUrl?: string;
  bannerUrl?: string;
  genres: string[];
  status?: string;
  episodes: ProviderEpisode[];
}

export interface ProviderEpisode {
  id: string;
  number: number;
  title?: string;
  duration?: number;
  thumbnail?: string;
}

export interface ProviderStream {
  url: string;
  quality: '360p' | '480p' | '720p' | '1080p' | '4K';
  server: string;
  subtitle?: string;
  headers?: Record<string, string>;
}

export interface ProviderHealth {
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  region?: string;
  lastChecked: Date;
}

export interface ProviderAdapter {
  readonly name: string;
  readonly type: 'INDONESIAN' | 'ENGLISH' | 'MIRROR' | 'FALLBACK';
  readonly priority: number;
  readonly baseUrl: string;

  search(query: string): Promise<ProviderSearchResult[]>;
  getAnime(slug: string): Promise<ProviderAnime | null>;
  getEpisodes(animeSlug: string): Promise<ProviderEpisode[]>;
  getStreams(episodeId: string): Promise<ProviderStream[]>;
  healthCheck(): Promise<ProviderHealth>;
}
