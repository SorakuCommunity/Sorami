import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../../common/cache.service';
import { AnimeIdMapper } from '../../mappers/anime-id.mapper';
import { ProviderResolverService } from '../providers/provider-resolver.service';

export interface StreamOptions {
  preferredServer?: string;
  quality?: string;
  lang?: 'sub' | 'dub';
}

export interface StreamManifest {
  animeId: string;
  episodeNumber: number;
  sources: { url: string; quality: string }[];
  subtitles: { lang: string; url: string }[];
  preferredServer: string;
  fallbackServers: string[];
  expiryTimestamp: number;
}

const CACHE_TTL = 60 * 60 * 1000;

@Injectable()
export class StreamingService {
  private readonly logger = new Logger(StreamingService.name);

  constructor(
    private readonly animeIdMapper: AnimeIdMapper,
    private readonly providerResolver: ProviderResolverService,
    private readonly cache: CacheService,
  ) {}

  async getStream(animeId: string, episodeNumber: number, options?: StreamOptions): Promise<StreamManifest | null> {
    const cacheKey = `stream:${animeId}:${episodeNumber}:${options?.lang ?? 'sub'}`;
    const cached = await this.cache.get<StreamManifest>(cacheKey);
    if (cached) return cached;

    const mapping = await this.animeIdMapper.getMapping(animeId);
    if (!mapping) {
      this.logger.warn(`No mapping found for animeId: ${animeId}`);
      return null;
    }

    const episodeId = `${animeId}/ep-${episodeNumber}`;
    const result = await this.providerResolver.resolveStream(episodeId, options?.preferredServer);

    if (!result) return null;

    const manifest: StreamManifest = {
      animeId,
      episodeNumber,
      sources: result.streams.map((s) => ({
        url: s.url,
        quality: s.quality,
      })),
      subtitles: [],
      preferredServer: result.selectedServer,
      fallbackServers: result.fallbackStreams.map((s) => s.server),
      expiryTimestamp: Date.now() + CACHE_TTL,
    };

    await this.cache.set(cacheKey, manifest, CACHE_TTL);
    return manifest;
  }

  async getStreamManifest(episodeId: string): Promise<StreamManifest | null> {
    const parts = episodeId.split('/ep-');
    if (parts.length !== 2) return null;

    const animeId = parts[0];
    const episodeNumber = parseInt(parts[1], 10);
    if (isNaN(episodeNumber)) return null;

    return this.getStream(animeId, episodeNumber);
  }
}
