import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../common/cache.service';

const PROVIDER_MAP = {
  anilist: 'ANILIST',
  mal: 'MAL',
  tmdb: 'TMDB',
} as const;

export interface AnimeMappingResult {
  id: string;
  animeId: string;
  provider: string;
  externalId: string;
  externalSlug: string | null;
  title: string | null;
  url: string | null;
  language: string | null;
  isPrimary: boolean;
}

export interface CreateMappingInput {
  anilistId?: number;
  malId?: number;
  tmdbId?: number;
  slug: string;
  aliases?: string[];
}

const CACHE_PREFIX = 'anime-mapping:';
const CACHE_TTL = 24 * 60 * 60 * 1000;

@Injectable()
export class AnimeIdMapper {
  private readonly logger = new Logger(AnimeIdMapper.name);
  private counter = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  generateId(): string {
    this.counter++;
    const count = (this.counter % 1000000) + 1;
    return `anime_${String(count).padStart(6, '0')}`;
  }

  async toCanonical(externalId: string, source: 'anilist' | 'mal' | 'tmdb'): Promise<string | null> {
    const providerName = PROVIDER_MAP[source];
    const cacheKey = `${CACHE_PREFIX}${source}:${externalId}`;
    const cached = await this.cache.get<string>(cacheKey);
    if (cached) return cached;

    const mapping = await this.prisma.animeMapping.findFirst({
      where: { provider: providerName as any, externalId },
    });

    if (!mapping) return null;

    await this.cache.set(cacheKey, mapping.animeId, CACHE_TTL);
    return mapping.animeId;
  }

  async getMapping(animeId: string): Promise<AnimeMappingResult | null> {
    const cacheKey = `${CACHE_PREFIX}${animeId}`;
    const cached = await this.cache.get<AnimeMappingResult>(cacheKey);
    if (cached) return cached;

    const mapping = await this.prisma.animeMapping.findFirst({
      where: { animeId, isPrimary: true },
    });

    if (!mapping) return null;

    const result: AnimeMappingResult = {
      id: mapping.id,
      animeId: mapping.animeId,
      provider: mapping.provider,
      externalId: mapping.externalId,
      externalSlug: mapping.externalSlug,
      title: mapping.title,
      url: mapping.url,
      language: mapping.language,
      isPrimary: mapping.isPrimary,
    };

    await this.cache.set(cacheKey, result, CACHE_TTL);
    return result;
  }

  async findBySlug(slug: string): Promise<string | null> {
    const cacheKey = `${CACHE_PREFIX}slug:${slug}`;
    const cached = await this.cache.get<string>(cacheKey);
    if (cached) return cached;

    const anime = await this.prisma.anime.findUnique({ where: { slug } });
    if (!anime) return null;

    await this.cache.set(cacheKey, anime.id, CACHE_TTL);
    return anime.id;
  }

  async createMapping(data: CreateMappingInput): Promise<AnimeMappingResult> {
    const animeId = this.generateId();

    await this.prisma.anime.create({
      data: {
        id: animeId,
        slug: data.slug,
        title: data.slug,
        status: 'NOT_YET_RELEASED' as any,
      },
    });

    const entries: { provider: string; externalId: string; isPrimary: boolean }[] = [];
    if (data.anilistId != null) entries.push({ provider: 'ANILIST', externalId: String(data.anilistId), isPrimary: true });
    if (data.malId != null) entries.push({ provider: 'MAL', externalId: String(data.malId), isPrimary: false });
    if (data.tmdbId != null) entries.push({ provider: 'TMDB', externalId: String(data.tmdbId), isPrimary: false });

    for (const entry of entries) {
      await this.prisma.animeMapping.create({
        data: {
          animeId,
          provider: entry.provider as any,
          externalId: entry.externalId,
          isPrimary: entry.isPrimary,
        },
      });
    }

    const mapping = await this.prisma.animeMapping.findFirst({
      where: { animeId, isPrimary: true },
    })!;

    const result: AnimeMappingResult = {
      id: mapping!.id,
      animeId: mapping!.animeId,
      provider: mapping!.provider,
      externalId: mapping!.externalId,
      externalSlug: mapping!.externalSlug,
      title: mapping!.title,
      url: mapping!.url,
      language: mapping!.language,
      isPrimary: mapping!.isPrimary,
    };

    await this.cache.set(`${CACHE_PREFIX}${animeId}`, result, CACHE_TTL);
    if (data.anilistId != null) {
      await this.cache.set(`${CACHE_PREFIX}anilist:${data.anilistId}`, animeId, CACHE_TTL);
    }
    if (data.malId != null) {
      await this.cache.set(`${CACHE_PREFIX}mal:${data.malId}`, animeId, CACHE_TTL);
    }
    if (data.tmdbId != null) {
      await this.cache.set(`${CACHE_PREFIX}tmdb:${data.tmdbId}`, animeId, CACHE_TTL);
    }
    await this.cache.set(`${CACHE_PREFIX}slug:${data.slug}`, animeId, CACHE_TTL);

    return result;
  }
}
