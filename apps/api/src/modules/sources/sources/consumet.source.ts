import { Injectable, Logger } from '@nestjs/common';
import { META, ANIME } from '@consumet/extensions';
import { ISearch, IAnimeInfo, IAnimeResult, ISource } from '@consumet/extensions';
import { AnimeSource, SourceAnimeEntry, SourceAnimeDetail, SourceEpisode } from '../interfaces/anime-source.interface';
import { env } from '../../../config/env';

function createProvider(provider?: any) {
  return new META.Anilist(provider);
}

const providerFactories = [
  () => createProvider(),
  () => createProvider(new ANIME.AnimeSaturn()),
  () => createProvider(new ANIME.AnimeUnity()),
  () => createProvider(new ANIME.AnimeKai()),
  () => createProvider(new ANIME.AnimePahe()),
];

@Injectable()
export class ConsumetSource implements AnimeSource {
  readonly name = 'Consumet';
  readonly type = 'metadata' as const;
  readonly priority = 55;
  readonly subtitleLanguages = ['id', 'en'];
  readonly defaultSubtitleLang = env.DEFAULT_SUBTITLE_LANG;
  private readonly logger = new Logger(ConsumetSource.name);
  private readonly clients = providerFactories.map((fn) => fn());

  private get defaultClient() {
    return this.clients[0];
  }

  async search(query: string): Promise<SourceAnimeEntry[]> {
    for (const client of this.clients) {
      try {
        const res: ISearch<IAnimeResult> = await client.search(query, 1, 20);
        if (res.results?.length) return (res.results || []).map((item) => this.toEntry(item));
      } catch {}
    }
    return [];
  }

  async getAnime(id: string): Promise<SourceAnimeDetail | null> {
    for (const client of this.clients) {
      try {
        const info: IAnimeInfo = await client.fetchAnimeInfo(id);
        if (info) return this.toDetail(info);
      } catch {}
    }
    return null;
  }

  async getEpisodes(animeId: string): Promise<SourceEpisode[]> {
    const detail = await this.getAnime(animeId);
    return detail?.episodes ?? [];
  }

  async resolveEpisodeUrl(animeSlug: string, episodeNumber: number): Promise<string | null> {
    for (const client of this.clients) {
      try {
        let episodeId = '';
        try {
          const info: IAnimeInfo = await client.fetchAnimeInfo(animeSlug);
          const ep = (info.episodes || []).find((e) => e.number === episodeNumber);
          if (ep?.id) episodeId = ep.id;
        } catch {
          episodeId = `${animeSlug}-ep-${episodeNumber}`;
        }
        if (!episodeId) continue;

        const sources: ISource = await client.fetchEpisodeSources(episodeId);
        const m3u8 = (sources.sources || []).find(
          (s) => s.isM3U8 || s.url?.includes('.m3u8'),
        );
        const url = m3u8?.url || sources.sources?.[0]?.url || null;
        if (url) return url;
      } catch (err) {
        this.logger.verbose(`resolveEpisodeUrl failed for provider: ${(err as Error).message}`);
      }
    }
    return null;
  }

  async getPopular(page = 1): Promise<SourceAnimeEntry[]> {
    for (const client of this.clients) {
      try {
        const res: ISearch<IAnimeResult> = await client.fetchPopularAnime(page, 20);
        if (res.results?.length) return (res.results || []).map((item) => this.toEntry(item));
      } catch {}
    }
    return [];
  }

  async health(): Promise<boolean> {
    try {
      await this.defaultClient.search('naruto', 1, 1);
      return true;
    } catch {
      return false;
    }
  }

  private toEntry(item: IAnimeResult): SourceAnimeEntry {
    return {
      title: typeof item.title === 'string' ? item.title : (item.title?.english ?? item.title?.romaji ?? ''),
      slug: String(item.id),
      synopsis: item.description?.replace(/<[^>]*>/g, '').trim(),
      posterUrl: item.image,
      genres: item.genres as string[],
      score: item.rating ? item.rating / 10 : undefined,
      source: this.name,
    };
  }

  private toDetail(info: IAnimeInfo): SourceAnimeDetail {
    return {
      title: typeof info.title === 'string' ? info.title : (info.title?.english ?? info.title?.romaji ?? ''),
      slug: String(info.id),
      synopsis: info.description?.replace(/<[^>]*>/g, '').trim(),
      posterUrl: info.image,
      genres: info.genres as string[],
      score: info.rating ? info.rating / 10 : undefined,
      status: info.status,
      season: info.season,
      studio: info.studios?.[0],
      episodes: (info.episodes || []).map((ep) => ({
        number: ep.number,
        title: ep.title,
        duration: ep.duration as number | undefined,
        episodePageUrl: ep.id,
        videoUrls: {},
      })),
      source: this.name,
    };
  }
}
