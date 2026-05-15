import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { AnimeEntry, SearchResult, StreamResult, Provider } from './types';

const BASE = 'https://otakudesu.cloud';

@Injectable()
export class Otakudesu implements Provider {
  readonly name = 'Otakudesu';
  readonly type = 'indonesian' as const;

  private get http() {
    return axios.create({ baseURL: BASE, timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } });
  }

  async search(query: string, page = 1): Promise<SearchResult> {
    const { data } = await this.http.get(`/?s=${encodeURIComponent(query)}&post_type=anime&page=${page}`);
    return { results: this.parseEntries(data) };
  }

  async info(id: string): Promise<AnimeEntry | null> {
    try {
      const { data } = await this.http.get(`/anime/${id}/`);
      const $ = cheerio.load(data);
      return {
        id, title: $('.entry-title, h1').first().text().trim(),
        image: $('.post-thumbnail img, .thumb img, .series-thumb img').first().attr('src'),
        description: $('.entry-content p, .desc p').first().text().trim(),
        genres: ([] as string[]).concat(...$('.genre-info a, .genres a').map((_, e) => $(e).text().trim()).get()),
        status: $('.status-info').text().replace('Status', '').trim() || 'UNKNOWN',
      };
    } catch { return null; }
  }

  async stream(episodeId: string): Promise<StreamResult | null> {
    try {
      const { data } = await this.http.get(episodeId.startsWith('http') ? episodeId : `/${episodeId}`);
      const $ = cheerio.load(data);
      const sources: any[] = [];
      $('iframe').each((_, el) => {
        const src = $(el).attr('src');
        if (src) sources.push({ url: src, quality: 'iframe', isM3U8: false });
      });
      $('source').each((_, el) => {
        const src = $(el).attr('src');
        if (src) sources.push({ url: src, quality: '720p', isM3U8: src.includes('.m3u8') });
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
    $('.animposx, article, .post-show li').each((_, el) => {
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
