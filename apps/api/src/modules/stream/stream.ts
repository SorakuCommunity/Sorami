import { Controller, Get, Param, Query, NotFoundException, Logger, Res, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Registry } from '../../sources/registry';
import { SourceRegistry } from '../sources/source-registry.service';
import { CacheService } from '../../common/cache.service';
import axios from 'axios';
import type { Request, Response } from 'express';

const ANILIST_EP_REGEX = /^anilist-ep-(\d+)-(\d+)$/;

const SERVER_PROVIDER_MAP: Record<string, string> = {
  Sorami: 'Samehadaku',
  Hikari: 'Oploverz',
  Sora: 'Otakudesu',
  Bun: 'Anoboy',
  Yun: 'Kuramanime',
  Kaze: 'AnimeKai',
  Hana: 'HiAnime',
};

@ApiTags('stream')
@Controller('stream')
export class Stream {
  private readonly log = new Logger(Stream.name);

  constructor(
    private readonly registry: Registry,
    private readonly sourceRegistry: SourceRegistry,
    private readonly cache: CacheService,
  ) {}

  private async getAnimeSlug(animeId: string): Promise<string | null> {
    const anilist = this.registry.get('AniList');
    if (!anilist) return null;
    try {
      const info = await anilist.info(animeId);
      if (info) {
        const title = info.englishTitle || info.title || '';
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
    } catch {}
    return null;
  }

  private async resolveAnilistEp(animeId: string, epNum: number): Promise<any | null> {
    const anilist = this.registry.get('AniList');
    if (!anilist) return null;
    let title = '';
    try {
      const info = await anilist.info(animeId);
      if (info) title = info.englishTitle || info.title || '';
    } catch {}
    if (!title) return null;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const attempts = [
      async () => { const p = this.registry.get('Samehadaku'); return p?.stream ? p.stream(`/episode/${slug}-episode-${epNum}/`) : null; },
      async () => { const p = this.registry.get('HiAnime'); return p?.stream ? p.stream(`${slug}?ep=${epNum}`) : null; },
      async () => { const p = this.registry.get('AnimePahe'); return p?.stream ? p.stream(`${slug}-${epNum}`) : null; },
      async () => {
        const epUrl = await this.sourceRegistry.resolveEpisodeUrl(slug, epNum);
        if (epUrl?.url) return { sources: [{ url: epUrl.url, quality: 'default', isM3U8: String(epUrl.url).includes('.m3u8') }], subtitles: [] };
        return null;
      },
    ];

    for (const fn of attempts) {
      try {
        const result: any = await Promise.race([
          fn(),
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000)),
        ]);
        if (result && result.sources && result.sources.length > 0) return result;
      } catch {}
    }
    return null;
  }

  @Public()
  @Get(':episodeId')
  @ApiOperation({ summary: 'Stream sources by episode ID' })
  @ApiQuery({ name: 'provider', required: false })
  @ApiQuery({ name: 'server', required: false })
  @ApiQuery({ name: 'proxy', required: false })
  async sources(
    @Param('episodeId') episodeId: string,
    @Query('provider') provider?: string,
    @Query('server') server?: string,
    @Query('proxy') proxy?: string,
    @Req() req?: Request,
  ) {
    if (server && SERVER_PROVIDER_MAP[server]) {
      provider = SERVER_PROVIDER_MAP[server];
    } else if (provider && SERVER_PROVIDER_MAP[provider]) {
      provider = SERVER_PROVIDER_MAP[provider];
    }

    const cacheKey = `stream:${episodeId}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    const match = episodeId.match(ANILIST_EP_REGEX);

    // Try preferred provider if specified
    if (provider) {
      if (match) {
        const result = await this.tryProviderForAnilist(match[1], parseInt(match[2], 10), provider);
        if (result) { await this.cache.set(cacheKey, result, 1800); return this.maybeProxySources(result, proxy, req); }
      } else {
        const p = this.registry.get(provider);
        if (p?.stream) {
          try {
            const result = await p.stream(episodeId);
            if (result && result.sources && result.sources.length > 0) { await this.cache.set(cacheKey, result, 1800); return this.maybeProxySources(result, proxy, req); }
          } catch {}
        }
      }
    }

    // Try default resolution for anilist-ep IDs
    if (match) {
      const result = await this.resolveAnilistEp(match[1], parseInt(match[2], 10));
      if (result) { await this.cache.set(cacheKey, result, 1800); return this.maybeProxySources(result, proxy, req); }
    }

    // Fallback through providers
    const fallbackOrder = ['Samehadaku', 'HiAnime', 'AnimePahe'];
    for (const name of fallbackOrder) {
      const p = this.registry.get(name);
      if (p?.stream) {
        try {
          const result: any = await Promise.race([
            p.stream(episodeId),
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000)),
          ]);
          if (result && result.sources && result.sources.length > 0) { await this.cache.set(cacheKey, result, 1800); return this.maybeProxySources(result, proxy, req); }
        } catch { continue; }
      }
    }

    // SourceRegistry as last resort
    if (match) {
      const slug = await this.getAnimeSlug(match[1]);
      if (!slug) return { sources: [], subtitles: [] };
      const epUrl = await this.sourceRegistry.resolveEpisodeUrl(slug, parseInt(match[2], 10));
      if (epUrl?.url) {
        const result = { sources: [{ url: epUrl.url, quality: 'default', isM3U8: String(epUrl.url).includes('.m3u8') }], subtitles: [] };
        await this.cache.set(cacheKey, result, 1800);
        return this.maybeProxySources(result, proxy, req);
      }
    }

    return { sources: [], subtitles: [] };
  }

  private maybeProxySources(result: any, proxy: string | undefined, req?: Request): any {
    if (proxy !== 'true' || !req || !result?.sources) return result;
    const proxyBase = `${req.protocol}://${req.get('host')}/stream/proxy/fetch?url=`;
    return {
      ...result,
      sources: result.sources.map((s: any) => ({
        ...s,
        url: `${proxyBase}${encodeURIComponent(s.url)}`,
      })),
    };
  }

  private readonly PROVIDER_STREAM_FORMATS: Record<string, (slug: string, epNum: number) => string> = {
    Samehadaku: (slug, epNum) => `/episode/${slug}-episode-${epNum}/`,
    HiAnime: (slug, epNum) => `${slug}?ep=${epNum}`,
    AnimePahe: (slug, epNum) => `${slug}-${epNum}`,
    Otakudesu: (slug, epNum) => `${slug}-episode-${epNum}`,
  };

  private async tryProviderForAnilist(animeId: string, epNum: number, providerName: string): Promise<any | null> {
    const slug = await this.getAnimeSlug(animeId);
    if (!slug) return null;

    // Try old Registry with provider-specific format
    const oldProvider = this.registry.get(providerName);
    const formatFn = this.PROVIDER_STREAM_FORMATS[providerName];
    if (oldProvider?.stream && formatFn) {
      try {
        const result: any = await Promise.race([
          oldProvider.stream(formatFn(slug, epNum)),
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000)),
        ]);
        if (result && result.sources && result.sources.length > 0) return result;
      } catch {}
    }

    // Try new SourceRegistry
    const source = this.sourceRegistry.get(providerName);
    if (source) {
      try {
        const url = await source.resolveEpisodeUrl(slug, epNum);
        if (url) {
          return { sources: [{ url, quality: 'default', isM3U8: String(url).includes('.m3u8') }], subtitles: [] };
        }
      } catch {}
    }

    return null;
  }

  @Public()
  @Get(':episodeId/sources')
  @ApiOperation({ summary: 'Alias for stream sources' })
  async sourcesAlias(@Param('episodeId') episodeId: string, @Query('provider') provider?: string, @Query('server') server?: string) {
    return this.sources(episodeId, provider, server);
  }

  @Public()
  @Get('proxy/fetch')
  @ApiOperation({ summary: 'Proxy video content through the VPS to bypass CDN blocks' })
  @ApiQuery({ name: 'url', required: true })
  async proxyFetch(@Query('url') url: string, @Req() req: Request, @Res() res: Response) {
    if (!url) throw new NotFoundException('Missing url query param');

    try {
      const response = await axios.get(url, {
        responseType: 'stream',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://hianime.to/',
        },
      });

      const contentType = String(response.headers['content-type'] || 'application/octet-stream');
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');

      // For m3u8 manifests: proxy the manifest but rewrite segment URLs
      // to direct CDN URLs (not through proxy) to save bandwidth
      if (contentType.includes('m3u8') || url.endsWith('.m3u8')) {
        let manifest = '';
        for await (const chunk of response.data) {
          manifest += chunk.toString();
        }

        const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
        const rewritten = manifest.split('\n').map((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) return line;
          if (trimmed.startsWith('http')) return trimmed;
          return `${baseUrl}${trimmed}`;
        }).join('\n');

        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        return res.send(rewritten);
      }

      // For non-m3u8 content (mp4, ts), pipe directly
      response.data.pipe(res);

      response.data.pipe(res);
    } catch (err: any) {
      this.log.error(`Proxy fetch failed for ${url}: ${err.message}`);
      res.status(502).json({ error: 'Failed to fetch proxied content' });
    }
  }
}
