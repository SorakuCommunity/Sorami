import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AnimeSource, SourceAnimeEntry, SourceAnimeDetail, SourceEpisode } from '../interfaces/anime-source.interface';

const JIKAN_API = 'https://api.jikan.moe/v4';

interface JikanAnime {
  mal_id: number;
  title: string;
  title_english?: string;
  title_japanese?: string;
  images?: { jpg?: { large_image_url?: string; image_url?: string } };
  synopsis?: string;
  genres?: { name: string }[];
  score?: number;
  status?: string;
  season?: string;
  year?: number;
  studios?: { name: string }[];
  type?: string;
  episodes?: number;
  rating?: string;
}

interface JikanSearchResponse {
  data: JikanAnime[];
  pagination?: { last_visible_page: number; has_next_page: boolean };
}

interface JikanDetailResponse {
  data: JikanAnime;
}

@Injectable()
export class JikanSource implements AnimeSource {
  readonly name = 'MyAnimeList';
  readonly type = 'metadata' as const;
  readonly priority = 45;
  private readonly logger = new Logger(JikanSource.name);

  async search(query: string): Promise<SourceAnimeEntry[]> {
    try {
      const { data } = await axios.get<JikanSearchResponse>(`${JIKAN_API}/anime`, {
        params: { q: query, limit: 20 },
      });
      return (data.data || []).map((item) => this.toEntry(item));
    } catch {
      return [];
    }
  }

  async getAnime(input: string): Promise<SourceAnimeDetail | null> {
    try {
      const id = parseInt(input, 10);
      if (isNaN(id)) return null;
      const { data } = await axios.get<JikanDetailResponse>(`${JIKAN_API}/anime/${id}/full`);
      if (!data.data) return null;
      return this.toDetail(data.data);
    } catch {
      return null;
    }
  }

  async getEpisodes(_animeId: string): Promise<SourceEpisode[]> {
    return [];
  }

  async resolveEpisodeUrl(_animeSlug: string, _episodeNumber: number): Promise<string | null> {
    return null;
  }

  async getPopular(page = 1): Promise<SourceAnimeEntry[]> {
    try {
      const { data } = await axios.get<JikanSearchResponse>(`${JIKAN_API}/top/anime`, {
        params: { page, limit: 20 },
      });
      return (data.data || []).map((item) => this.toEntry(item));
    } catch {
      return [];
    }
  }

  async health(): Promise<boolean> {
    try {
      await axios.get(`${JIKAN_API}/random/anime`, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  private toEntry(item: JikanAnime): SourceAnimeEntry {
    return {
      title: item.title_english || item.title,
      slug: String(item.mal_id),
      synopsis: item.synopsis?.trim(),
      posterUrl: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
      genres: item.genres?.map((g) => g.name),
      score: item.score,
      source: this.name,
    };
  }

  private toDetail(item: JikanAnime): SourceAnimeDetail {
    return {
      ...this.toEntry(item),
      status: item.status,
      season: item.season ? `${item.season}${item.year ? ` ${item.year}` : ''}` : undefined,
      studio: item.studios?.[0]?.name,
      episodes: [],
    };
  }
}
