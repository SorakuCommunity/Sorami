import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { AnimeSource, SourceAnimeEntry, SourceAnimeDetail, SourceEpisode } from '../interfaces/anime-source.interface';

const BASE_URL = 'https://kuramanime.art';

@Injectable()
export class KuramanimeSource implements AnimeSource {
  readonly name = 'Kuramanime';
  readonly type = 'fallback' as const;
  readonly priority = 60;
  private readonly logger = new Logger(KuramanimeSource.name);

  private get axios() {
    return axios.create({
      baseURL: BASE_URL,
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' },
    });
  }

  async search(query: string): Promise<SourceAnimeEntry[]> {
    const { data } = await this.axios.get(`/?s=${encodeURIComponent(query)}&post_type=anime`);
    return this.parseEntries(data);
  }

  async getAnime(id: string): Promise<SourceAnimeDetail | null> {
    try {
      const { data } = await this.axios.get(`/anime/${id}/`);
      const $ = cheerio.load(data);
      const title = $('.entry-title, h1').first().text().trim();
      const posterUrl = $('.post-thumbnail img, .thumb img').first().attr('src');
      const synopsis = $('.entry-content p, .desc p').first().text().trim();
      const genres: string[] = [];
      $('.genre-info a, .genres a').each((_, el) => { genres.push($(el).text().trim()); });
      const status = $('.status-info').text().replace('Status', '').trim() || 'UNKNOWN';
      const episodes: SourceEpisode[] = [];
      $('.episodelist li, .listeps li').each((_, el) => {
        const link = $(el).find('a');
        const epNum = parseInt($(el).find('.eps, .episode-number').text().match(/\d+/)?.[0] || '', 10);
        const href = link.attr('href') || '';
        if (!isNaN(epNum)) episodes.push({ number: epNum, episodePageUrl: href, videoUrls: {} });
      });
      return { title, slug: id, synopsis, posterUrl, genres, status, episodes, source: this.name };
    } catch {
      return null;
    }
  }

  async resolveEpisodeUrl(animeSlug: string, episodeNumber: number): Promise<string | null> {
    try {
      const { data } = await this.axios.get(`/anime/${animeSlug}/`);
      const $ = cheerio.load(data);
      let episodeUrl = '';
      $('.episodelist li a, .listeps li a').each((_, el) => {
        const num = parseInt($(el).find('.eps, .episode-number').text().match(/\d+/)?.[0] || '', 10);
        if (num === episodeNumber) episodeUrl = $(el).attr('href') || '';
      });
      if (!episodeUrl) return null;
      return this.extractVideoFromEpisodePage(episodeUrl);
    } catch {
      return null;
    }
  }

  private async extractVideoFromEpisodePage(url: string): Promise<string | null> {
    try {
      const { data } = await this.axios.get(url);
      const $ = cheerio.load(data);
      const iframeSrc = $('iframe').first().attr('src');
      if (iframeSrc) return iframeSrc;
      const videoSrc = $('video source').first().attr('src') || $('video').first().attr('src');
      if (videoSrc) return videoSrc;
      const embedScript = $('script:contains(".m3u8")').first().text();
      const m3u8Match = embedScript.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/);
      return m3u8Match?.[1] || null;
    } catch {
      return null;
    }
  }

  async getEpisodes(animeId: string): Promise<SourceEpisode[]> {
    return (await this.getAnime(animeId))?.episodes ?? [];
  }

  async getPopular(page = 1): Promise<SourceAnimeEntry[]> {
    const { data } = await this.axios.get(`/popular-anime/page/${page}/`);
    return this.parseEntries(data);
  }

  async health(): Promise<boolean> {
    try {
      await this.axios.get('/', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  private parseEntries(html: string): SourceAnimeEntry[] {
    const $ = cheerio.load(html);
    const results: SourceAnimeEntry[] = [];
    $('.animposx, article, .post-show li').each((_, el) => {
      const link = $(el).find('a').first();
      const title = link.attr('title') || link.text().trim();
      const href = link.attr('href') || '';
      const slug = href.split('/').filter(Boolean).pop() || '';
      const img = $(el).find('img').first().attr('src');
      if (title && slug) results.push({ title, slug, posterUrl: img, source: this.name });
    });
    return results;
  }
}
