import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { AnimeEntry, SearchResult, StreamResult, Provider } from './types';

const BASE = 'https://kickassanime.am';

@Injectable()
export class KickAssAnime implements Provider {
  readonly name = 'KickAssAnime';
  readonly type = 'global' as const;

  private get http() {
    return axios.create({ baseURL: BASE, timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } });
  }

  async search(query: string, page = 1): Promise<SearchResult> {
    const { data } = await this.http.get(`/?s=${encodeURIComponent(query)}&page=${page}`);
    return { results: this.parseEntries(data) };
  }

  async info(id: string): Promise<AnimeEntry | null> {
    try {
      const { data } = await this.http.get(`/anime/${id}`);
      const $ = cheerio.load(data);
      return {
        id, title: $('h1, .entry-title').first().text().trim(),
        image: $('.poster img, .thumb img').first().attr('src'),
        description: $('.desc, .description').first().text().trim(),
        genres: ([] as string[]).concat(...$('.genre a, .genres a').map((_, e) => $(e).text().trim()).get()),
        status: $('.status').text().trim() || 'UNKNOWN',
      };
    } catch { return null; }
  }

  async stream(episodeId: string): Promise<StreamResult | null> {
    try {
      const { data } = await this.http.get(`/episode/${episodeId}`);
      const $ = cheerio.load(data);
      const sources: any[] = [];
      $('source').each((_, el) => {
        const src = $(el).attr('src');
        if (src) sources.push({ url: src, quality: $(el).attr('label') || '720p', isM3U8: src.includes('.m3u8') });
      });
      $('track').each((_, el) => {
        const src = $(el).attr('src');
        if (src) sources.push({ url: src, quality: 'subtitle' });
      });
      return { sources, subtitles: [] };
    } catch { return null; }
  }

  async health(): Promise<boolean> {
    try { await this.http.get('/', { timeout: 5000 }); return true; } catch { return false; }
  }

  private parseEntries(html: string): AnimeEntry[] {
    const $ = cheerio.load(html);
    const results: AnimeEntry[] = [];
    $('.post-show li, .animpost, article').each((_, el) => {
      const link = $(el).find('a').first();
      const title = link.attr('title') || link.text().trim();
      const href = link.attr('href') || '';
      const slug = href.split('/').filter(Boolean).pop() || '';
      const img = $(el).find('img').first().attr('src');
      if (title && slug) results.push({ id: slug, title, image: img });
    });
    return results;
  }
}
