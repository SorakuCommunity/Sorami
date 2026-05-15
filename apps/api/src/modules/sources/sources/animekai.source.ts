import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { AnimeSource, SourceAnimeEntry, SourceAnimeDetail, SourceEpisode } from '../interfaces/anime-source.interface';

const BASE_URL = 'https://animekai.to';

@Injectable()
export class AnimeKaiSource implements AnimeSource {
  readonly name = 'AnimeKai';
  readonly type = 'fallback' as const;
  readonly priority = 65;
  private readonly logger = new Logger(AnimeKaiSource.name);

  private get axios() {
    return axios.create({
      baseURL: BASE_URL,
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' },
    });
  }

  async search(query: string): Promise<SourceAnimeEntry[]> {
    const { data } = await this.axios.get(`/search?q=${encodeURIComponent(query)}`);
    return this.parseEntries(data);
  }

  async getAnime(id: string): Promise<SourceAnimeDetail | null> {
    try {
      const { data } = await this.axios.get(`/anime/${id}`);
      const $ = cheerio.load(data);
      const title = $('h1, .entry-title').first().text().trim();
      const posterUrl = $('.poster img, .thumb img').first().attr('src');
      const synopsis = $('.description, .desc').first().text().trim();
      const genres: string[] = [];
      $('.genre a, .genres a').each((_, el) => { genres.push($(el).text().trim()); });
      const episodes: SourceEpisode[] = [];
      $('.episode-list a, .episodes a').each((_, el) => {
        const epNum = parseInt($(el).text().match(/\d+/)?.[0] || '', 10);
        const href = $(el).attr('href') || '';
        if (!isNaN(epNum)) episodes.push({ number: epNum, episodePageUrl: href, videoUrls: {} });
      });
      return { title, slug: id, synopsis, posterUrl, genres, episodes, source: this.name };
    } catch {
      return null;
    }
  }

  async resolveEpisodeUrl(animeSlug: string, episodeNumber: number): Promise<string | null> {
    try {
      const { data } = await this.axios.get(`/anime/${animeSlug}`);
      const $ = cheerio.load(data);
      let episodeUrl = '';
      $('.episode-list a, .episodes a').each((_, el) => {
        const num = parseInt($(el).text().match(/\d+/)?.[0] || '', 10);
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
    const { data } = await this.axios.get(`/popular?page=${page}`);
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
    $('.item, .col-anime, article').each((_, el) => {
      const link = $(el).find('a').first();
      const title = link.attr('title') || link.text().trim();
      const href = link.attr('href') || '';
      const slug = href.split('/').filter(Boolean).pop() || '';
      const img = $(el).find('img').first().attr('data-src') || $(el).find('img').first().attr('src');
      if (title && slug) results.push({ title, slug, posterUrl: img, source: this.name });
    });
    return results;
  }
}
