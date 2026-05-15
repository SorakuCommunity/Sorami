import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { AnimeEntry, SearchResult, StreamResult, Provider } from './types';

const BASE = 'https://animepahe.ru';

@Injectable()
export class AnimePahe implements Provider {
  readonly name = 'AnimePahe';
  readonly type = 'global' as const;

  private get http() {
    return axios.create({ baseURL: BASE, timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } });
  }

  async search(query: string, page = 1): Promise<SearchResult> {
    const { data } = await this.http.get(`/api?m=search&q=${encodeURIComponent(query)}&page=${page}`);
    return { results: (data.data || []).map((item: any) => ({ id: String(item.id), title: item.title, image: item.poster, type: item.type, year: item.year, totalEpisodes: item.episodes })) };
  }

  async info(id: string): Promise<AnimeEntry | null> {
    try {
      const { data } = await this.http.get(`/anime/${id}`);
      const $ = cheerio.load(data);
      return {
        id, title: $('.title-wrapper h1').first().text().trim(),
        image: $('.poster img').first().attr('src'),
        description: $('.description').first().text().trim(),
        genres: ([] as string[]).concat(...$('.genre a').map((_, e) => $(e).text().trim()).get()),
        status: $('.status').text().trim() || 'UNKNOWN',
      };
    } catch { return null; }
  }

  async stream(episodeId: string): Promise<StreamResult | null> {
    try {
      const { data } = await this.http.get(`/play/${episodeId}`);
      const $ = cheerio.load(data);
      const sources: any[] = [];
      $('source').each((_, el) => {
        const src = $(el).attr('src');
        if (src) sources.push({ url: src, quality: $(el).attr('data-quality') || '720p', isM3U8: false });
      });
      return { sources, subtitles: [] };
    } catch { return null; }
  }

  async health(): Promise<boolean> {
    try { await this.http.get('/', { timeout: 5000 }); return true; } catch { return false; }
  }
}
