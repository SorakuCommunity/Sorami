import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AnimeSource, SourceAnimeEntry, SourceAnimeDetail, SourceEpisode } from '../interfaces/anime-source.interface';
import { env } from '../../../config/env';

const TMDB_API = 'https://api.themoviedb.org/3';
const TMDB_KEY = env.TMDB_API_KEY || '';

interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string;
  genre_ids?: number[];
  vote_average?: number;
  status?: string;
  type?: string;
  seasons?: TMDBSeason[];
}

interface TMDBSeason {
  season_number: number;
  name?: string;
  episode_count?: number;
}

@Injectable()
export class TMDBAnimeSource implements AnimeSource {
  readonly name = 'TMDB';
  readonly type = 'metadata' as const;
  readonly priority = 30;
  private readonly logger = new Logger(TMDBAnimeSource.name);

  private async fetch<T>(path: string, params: Record<string, string | number> = {}): Promise<T | null> {
    if (!TMDB_KEY) return null;
    try {
      const { data } = await axios.get(`${TMDB_API}${path}`, {
        params: { api_key: TMDB_KEY, ...params },
        timeout: 10000,
      });
      return data;
    } catch {
      return null;
    }
  }

  async search(query: string): Promise<SourceAnimeEntry[]> {
    const data = await this.fetch<{ results: TMDBResult[] }>('/search/tv', { query });
    if (!data) return [];
    return data.results.filter(r => r.genre_ids?.includes(16)).map(r => ({
      title: r.title || r.name || '',
      slug: String(r.id),
      synopsis: r.overview?.trim(),
      posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : undefined,
      score: r.vote_average ? r.vote_average / 10 : undefined,
      source: this.name,
    }));
  }

  async getAnime(input: string): Promise<SourceAnimeDetail | null> {
    const id = parseInt(input, 10);
    if (isNaN(id)) return null;
    const data = await this.fetch<TMDBResult>(`/tv/${id}`);
    if (!data) return null;
    return {
      title: data.title || data.name || '',
      slug: String(data.id),
      synopsis: data.overview?.trim(),
      posterUrl: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : undefined,
      status: data.status,
      episodes: (data.seasons ?? []).map(s => ({
        number: s.season_number,
        title: s.name,
        videoUrls: {},
      })),
      source: this.name,
    };
  }

  async getEpisodes(animeId: string): Promise<SourceEpisode[]> {
    return (await this.getAnime(animeId))?.episodes ?? [];
  }

  async resolveEpisodeUrl(_animeSlug: string, _episodeNumber: number): Promise<string | null> {
    return null;
  }

  async getPopular(page = 1): Promise<SourceAnimeEntry[]> {
    const data = await this.fetch<{ results: TMDBResult[] }>('/trending/tv/week', { page });
    if (!data) return [];
    return data.results.filter(r => r.genre_ids?.includes(16)).map(r => ({
      title: r.title || r.name || '',
      slug: String(r.id),
      synopsis: r.overview?.trim(),
      posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : undefined,
      score: r.vote_average ? r.vote_average / 10 : undefined,
      source: this.name,
    }));
  }

  async health(): Promise<boolean> {
    if (!TMDB_KEY) return false;
    const data = await this.fetch<{ results: TMDBResult[] }>('/trending/tv/week', { page: 1 });
    return data !== null;
  }
}
