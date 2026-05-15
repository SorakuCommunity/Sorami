export interface AnimeSource {
  readonly name: string;
  readonly type: 'primary' | 'fallback' | 'metadata';
  readonly priority: number;

  search(query: string): Promise<SourceAnimeEntry[]>;
  getAnime(id: string): Promise<SourceAnimeDetail | null>;
  getEpisodes(animeId: string): Promise<SourceEpisode[]>;
  getPopular(page?: number): Promise<SourceAnimeEntry[]>;
  resolveEpisodeUrl(animeSlug: string, episodeNumber: number): Promise<string | null>;
  health(): Promise<boolean>;
}

export interface SourceAnimeEntry {
  title: string;
  slug: string;
  synopsis?: string;
  posterUrl?: string;
  genres?: string[];
  score?: number;
  source: string;
}

export interface SourceAnimeDetail extends SourceAnimeEntry {
  status?: string;
  season?: string;
  studio?: string;
  episodes: SourceEpisode[];
}

export interface SourceEpisode {
  number: number;
  title?: string;
  duration?: number;
  episodePageUrl?: string;
  videoUrls: Record<string, string | undefined>;
}
