import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { CacheService } from '../../common/cache.service';

const ANILIST_API = 'https://graphql.anilist.co';

const FULL_MEDIA_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title { romaji english native }
      description
      coverImage { large extraLarge }
      bannerImage
      genres
      season
      seasonYear
      format
      episodes
      duration
      status
      averageScore
      popularity
      favourites
      studios { nodes { name isAnimationStudio } }
      characters(perPage: 10, sort: ROLE) {
        nodes {
          id
          name { full native }
          image { large }
          role
          voiceActors(perPage: 1, sort: LANGUAGE) {
            id
            name { full }
            image { large }
            language
          }
        }
      }
      staff(perPage: 5, sort: RELEVANCE) {
        nodes {
          id
          name { full }
          image { large }
          primaryOccupations
        }
      }
      relations {
        edges {
          relationType
          node {
            id
            title { romaji english }
            coverImage { large }
            format
            status
            averageScore
          }
        }
      }
      recommendations(perPage: 5, sort: RATING_DESC) {
        nodes {
          mediaRecommendation {
            id
            title { romaji english }
            coverImage { large }
            format
            averageScore
          }
        }
      }
    }
  }
`;

const CHARACTERS_QUERY = `
  query ($id: Int, $page: Int) {
    Media(id: $id, type: ANIME) {
      characters(page: $page, perPage: 25, sort: ROLE) {
        nodes {
          id
          name { full native }
          image { large }
          role
          voiceActors(perPage: 2, sort: LANGUAGE) {
            id
            name { full }
            image { large }
            language
          }
        }
      }
    }
  }
`;

const STAFF_QUERY = `
  query ($id: Int, $page: Int) {
    Media(id: $id, type: ANIME) {
      staff(page: $page, perPage: 25, sort: RELEVANCE) {
        nodes {
          id
          name { full }
          image { large }
          primaryOccupations
        }
      }
    }
  }
`;

const STATS_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      averageScore
      meanScore
      popularity
      favourites
      trending
      stats {
        scoreDistribution {
          score
          amount
        }
        statusDistribution {
          status
          amount
        }
      }
    }
  }
`;

const CACHE_TTL = 24 * 60 * 60 * 1000;

export interface Character {
  id: number;
  name: string;
  nativeName: string | null;
  image: string | null;
  role: string;
  voiceActors: { id: number; name: string; image: string | null; language: string }[];
}

export interface Staff {
  id: number;
  name: string;
  image: string | null;
  roles: string[];
}

export interface AnimeStats {
  averageScore: number | null;
  meanScore: number | null;
  popularity: number | null;
  favourites: number | null;
  trending: number | null;
  scoreDistribution: { score: number; amount: number }[];
  statusDistribution: { status: string; amount: number }[];
}

export interface AnimeDetailResponse {
  id: number;
  titles: { romaji: string; english: string | null; native: string | null };
  description: string;
  images: { cover: string | null; banner: string | null };
  genres: string[];
  season: string | null;
  seasonYear: number | null;
  format: string | null;
  episodes: number | null;
  duration: number | null;
  status: string | null;
  score: number | null;
  popularity: number | null;
  studios: string[];
  characters: Character[];
  staff: Staff[];
  relations: { relationType: string; anime: { id: number; title: string; coverImage: string | null; format: string | null; status: string | null; score: number | null } }[];
  recommendations: { id: number; title: string; coverImage: string | null; format: string | null; score: number | null }[];
}

@Injectable()
export class MetadataService {
  private readonly logger = new Logger(MetadataService.name);

  constructor(private readonly cache: CacheService) {}

  async getFullMetadata(animeId: string): Promise<AnimeDetailResponse | null> {
    const cacheKey = `metadata:full:${animeId}`;
    const cached = await this.cache.get<AnimeDetailResponse>(cacheKey);
    if (cached) return cached;

    const id = parseInt(animeId, 10);
    if (isNaN(id)) return null;

    try {
      const { data } = await axios.post(ANILIST_API, {
        query: FULL_MEDIA_QUERY,
        variables: { id },
      });

      const media = data.data?.Media;
      if (!media) return null;

      const result: AnimeDetailResponse = {
        id: media.id,
        titles: {
          romaji: media.title?.romaji ?? '',
          english: media.title?.english ?? null,
          native: media.title?.native ?? null,
        },
        description: (media.description ?? '').replace(/<[^>]*>/g, '').trim(),
        images: {
          cover: media.coverImage?.large ?? null,
          banner: media.bannerImage ?? null,
        },
        genres: media.genres ?? [],
        season: media.season ?? null,
        seasonYear: media.seasonYear ?? null,
        format: media.format ?? null,
        episodes: media.episodes ?? null,
        duration: media.duration ?? null,
        status: media.status ?? null,
        score: media.averageScore ? media.averageScore / 10 : null,
        popularity: media.popularity ?? null,
        studios: (media.studios?.nodes ?? []).map((s: any) => s.name),
        characters: (media.characters?.nodes ?? []).map((c: any) => ({
          id: c.id,
          name: c.name?.full ?? '',
          nativeName: c.name?.native ?? null,
          image: c.image?.large ?? null,
          role: c.role ?? '',
          voiceActors: (c.voiceActors ?? []).map((va: any) => ({
            id: va.id,
            name: va.name?.full ?? '',
            image: va.image?.large ?? null,
            language: va.language ?? '',
          })),
        })),
        staff: (media.staff?.nodes ?? []).map((s: any) => ({
          id: s.id,
          name: s.name?.full ?? '',
          image: s.image?.large ?? null,
          roles: s.primaryOccupations ?? [],
        })),
        relations: (media.relations?.edges ?? []).map((e: any) => ({
          relationType: e.relationType,
          anime: {
            id: e.node.id,
            title: e.node.title?.english ?? e.node.title?.romaji ?? '',
            coverImage: e.node.coverImage?.large ?? null,
            format: e.node.format ?? null,
            status: e.node.status ?? null,
            score: e.node.averageScore ? e.node.averageScore / 10 : null,
          },
        })),
        recommendations: (media.recommendations?.nodes ?? [])
          .filter((r: any) => r.mediaRecommendation)
          .map((r: any) => ({
            id: r.mediaRecommendation.id,
            title: r.mediaRecommendation.title?.english ?? r.mediaRecommendation.title?.romaji ?? '',
            coverImage: r.mediaRecommendation.coverImage?.large ?? null,
            format: r.mediaRecommendation.format ?? null,
            score: r.mediaRecommendation.averageScore ? r.mediaRecommendation.averageScore / 10 : null,
          })),
      };

      await this.cache.set(cacheKey, result, CACHE_TTL);
      return result;
    } catch (err) {
      this.logger.error(`Failed to fetch metadata for ${animeId}: ${(err as Error).message}`);
      return null;
    }
  }

  async getCharacters(animeId: string): Promise<Character[]> {
    const cacheKey = `metadata:characters:${animeId}`;
    const cached = await this.cache.get<Character[]>(cacheKey);
    if (cached) return cached;

    const id = parseInt(animeId, 10);
    if (isNaN(id)) return [];

    try {
      const { data } = await axios.post(ANILIST_API, {
        query: CHARACTERS_QUERY,
        variables: { id, page: 1 },
      });

      const nodes = data.data?.Media?.characters?.nodes ?? [];
      const characters: Character[] = nodes.map((c: any) => ({
        id: c.id,
        name: c.name?.full ?? '',
        nativeName: c.name?.native ?? null,
        image: c.image?.large ?? null,
        role: c.role ?? '',
        voiceActors: (c.voiceActors ?? []).map((va: any) => ({
          id: va.id,
          name: va.name?.full ?? '',
          image: va.image?.large ?? null,
          language: va.language ?? '',
        })),
      }));

      await this.cache.set(cacheKey, characters, CACHE_TTL);
      return characters;
    } catch (err) {
      this.logger.error(`Failed to fetch characters for ${animeId}: ${(err as Error).message}`);
      return [];
    }
  }

  async getStaff(animeId: string): Promise<Staff[]> {
    const cacheKey = `metadata:staff:${animeId}`;
    const cached = await this.cache.get<Staff[]>(cacheKey);
    if (cached) return cached;

    const id = parseInt(animeId, 10);
    if (isNaN(id)) return [];

    try {
      const { data } = await axios.post(ANILIST_API, {
        query: STAFF_QUERY,
        variables: { id, page: 1 },
      });

      const nodes = data.data?.Media?.staff?.nodes ?? [];
      const staff: Staff[] = nodes.map((s: any) => ({
        id: s.id,
        name: s.name?.full ?? '',
        image: s.image?.large ?? null,
        roles: s.primaryOccupations ?? [],
      }));

      await this.cache.set(cacheKey, staff, CACHE_TTL);
      return staff;
    } catch (err) {
      this.logger.error(`Failed to fetch staff for ${animeId}: ${(err as Error).message}`);
      return [];
    }
  }

  async getStats(animeId: string): Promise<AnimeStats | null> {
    const cacheKey = `metadata:stats:${animeId}`;
    const cached = await this.cache.get<AnimeStats>(cacheKey);
    if (cached) return cached;

    const id = parseInt(animeId, 10);
    if (isNaN(id)) return null;

    try {
      const { data } = await axios.post(ANILIST_API, {
        query: STATS_QUERY,
        variables: { id },
      });

      const media = data.data?.Media;
      if (!media) return null;

      const stats: AnimeStats = {
        averageScore: media.averageScore ? media.averageScore / 10 : null,
        meanScore: media.meanScore ? media.meanScore / 10 : null,
        popularity: media.popularity ?? null,
        favourites: media.favourites ?? null,
        trending: media.trending ?? null,
        scoreDistribution: (media.stats?.scoreDistribution ?? []).map((d: any) => ({
          score: d.score,
          amount: d.amount,
        })),
        statusDistribution: (media.stats?.statusDistribution ?? []).map((d: any) => ({
          status: d.status,
          amount: d.amount,
        })),
      };

      await this.cache.set(cacheKey, stats, CACHE_TTL);
      return stats;
    } catch (err) {
      this.logger.error(`Failed to fetch stats for ${animeId}: ${(err as Error).message}`);
      return null;
    }
  }
}
