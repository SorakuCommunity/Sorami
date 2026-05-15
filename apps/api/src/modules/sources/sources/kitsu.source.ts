import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AnimeSource, SourceAnimeEntry, SourceAnimeDetail, SourceEpisode } from '../interfaces/anime-source.interface';

const KITSU_API = 'https://kitsu.io/api/edge';

interface KitsuAttributes {
  slug: string;
  canonicalTitle: string;
  synopsis?: string;
  posterImage?: { large?: string };
  genres?: string[];
  averageRating?: string;
  status?: string;
  episodeCount?: number;
}

@Injectable()
export class KitsuSource implements AnimeSource {
  readonly name = 'Kitsu';
  readonly type = 'metadata' as const;
  readonly priority = 40;
  private readonly logger = new Logger(KitsuSource.name);

  async search(query: string): Promise<SourceAnimeEntry[]> {
    const { data } = await axios.get(`${KITSU_API}/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=20`);
    return (data.data ?? []).map((item: { id: string; attributes: KitsuAttributes }) => this.toEntry(item));
  }

  async getAnime(id: string): Promise<SourceAnimeDetail | null> {
    try {
      const isId = /^\d+$/.test(id);
      const url = isId
        ? `${KITSU_API}/anime/${id}`
        : `${KITSU_API}/anime?filter[slug]=${id}`;
      const { data } = await axios.get(url);
      const item = isId ? data.data : data.data?.[0];
      if (!item) return null;
      return this.toDetail(item);
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
    const { data } = await axios.get(`${KITSU_API}/anime?sort=-popularity_rank&page[limit]=20&page[number]=${page}`);
    return (data.data ?? []).map((item: { id: string; attributes: KitsuAttributes }) => this.toEntry(item));
  }

  async health(): Promise<boolean> {
    try {
      await axios.get(`${KITSU_API}/anime?page[limit]=1`, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  private toEntry(item: { id: string; attributes: KitsuAttributes }): SourceAnimeEntry {
    const a = item.attributes;
    return {
      title: a.canonicalTitle,
      slug: a.slug || item.id,
      synopsis: a.synopsis?.trim(),
      posterUrl: a.posterImage?.large,
      score: a.averageRating ? parseFloat(a.averageRating) / 10 : undefined,
      source: this.name,
    };
  }

  private toDetail(item: { id: string; attributes: KitsuAttributes }): SourceAnimeDetail {
    return {
      ...this.toEntry(item),
      status: item.attributes.status,
      episodes: [],
      source: this.name,
    };
  }
}
