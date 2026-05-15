import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { AnimeEntry, SearchResult, StreamResult, Provider } from './types';

const BASE = 'https://hianime.to';

@Injectable()
export class HiAnime implements Provider {
  readonly name = 'HiAnime';
  readonly type = 'global' as const;

  private get http() {
    return axios.create({ baseURL: BASE, timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } });
  }

  async search(query: string, page = 1): Promise<SearchResult> {
    const { data } = await this.http.get(`/search?keyword=${encodeURIComponent(query)}&page=${page}`);
    return { results: this.parseEntries(data) };
  }

  async info(id: string): Promise<AnimeEntry | null> {
    try {
      const { data } = await this.http.get(`/watch/${id}`);
      const $ = cheerio.load(data);
      return {
        id, title: $('.anisc-info .heading, h1').first().text().trim(),
        image: $('.anisc-poster img, .thumb img').first().attr('src'),
        description: $('.description, .desc').first().text().trim(),
        genres: ([] as string[]).concat(...$('.genre a, .genres a').map((_, e) => $(e).text().trim()).get()),
        status: $('.status span:last, .info-item:contains("Status") span').text().trim() || 'UNKNOWN',
      };
    } catch { return null; }
  }

  async stream(episodeId: string): Promise<StreamResult | null> {
    try {
      const { data } = await this.http.get(`/ajax/v2/episode/servers?episodeId=${episodeId}`);
      const $ = cheerio.load(data);
      const serverId = $('.server-item').first().attr('data-id');
      if (!serverId) return null;
      const { data: srcData } = await this.http.get(`/ajax/v2/episode/sources?id=${serverId}`);
      return { sources: (srcData.sources || []).map((s: any) => ({ url: s.url, quality: s.quality, isM3U8: s.isM3U8 })), subtitles: [] };
    } catch { return null; }
  }

  async trending(page = 1): Promise<SearchResult> {
    const { data } = await this.http.get(`/most-popular?page=${page}`);
    return { results: this.parseEntries(data) };
  }

  async health(): Promise<boolean> {
    try { await this.http.get('/', { timeout: 5000 }); return true; } catch { return false; }
  }

  private parseEntries(html: string): AnimeEntry[] {
    const $ = cheerio.load(html);
    const results: AnimeEntry[] = [];
    $('.film-list-wrap .item, .flw-item').each((_, el) => {
      const link = $(el).find('a').first();
      const title = link.attr('title') || link.text().trim();
      const href = link.attr('href') || '';
      const slug = href.split('/').filter(Boolean).pop() || '';
      const img = $(el).find('img').first().attr('data-src') || $(el).find('img').first().attr('src');
      if (title && slug) results.push({ id: slug, title, image: img });
    });
    return results;
  }
}
