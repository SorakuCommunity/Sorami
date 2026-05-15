import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../common/cache.service';

const ANILIST_API = 'https://graphql.anilist.co';

export type Season = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';

export interface SeasonData { season: Season; year: number; startDate: Date; endDate: Date; }
export type RelationType = 'SEQUEL' | 'PREQUEL' | 'SIDE_STORY' | 'MOVIE' | 'OVA' | 'SPIN_OFF';
export interface RelationNode { animeId: number; title: string; coverImage: string | null; relationType: RelationType; format: string | null; status: string | null; episodes: number | null; score: number | null; }
export interface RelationGraph { rootId: number; nodes: RelationNode[]; }
export interface AnimeMappingResult { id: string; animeId: string; provider: string; externalId: string; externalSlug: string | null; title: string | null; url: string | null; language: string | null; isPrimary: boolean; }

const RELATIONS_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id title { romaji english } coverImage { large } format status episodes averageScore
      relations { edges { relationType node { id title { romaji english } coverImage { large } format status episodes averageScore } } }
    }
  }`;

const RECOMMENDATIONS_QUERY = `
  query ($id: Int, $page: Int, $perPage: Int) {
    Media(id: $id, type: ANIME) {
      recommendations(page: $page, perPage: $perPage, sort: RATING_DESC) {
        nodes { mediaRecommendation { id title { romaji english } coverImage { large } format status episodes averageScore genres } }
      }
    }
  }`;

@Injectable()
export class Resolver {
  private readonly logger = new Logger(Resolver.name);
  private counter = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  getCurrentSeason(): { season: Season; year: number } {
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    if (m >= 2 && m <= 4) return { season: 'SPRING', year: y };
    if (m >= 5 && m <= 7) return { season: 'SUMMER', year: y };
    if (m >= 8 && m <= 10) return { season: 'FALL', year: y };
    return { season: 'WINTER', year: m === 11 ? y : y - 1 };
  }

  getSeasons(year?: number): SeasonData[] {
    const y = year ?? new Date().getFullYear();
    return [
      { season: 'WINTER', year: y, startDate: new Date(y, 0, 1), endDate: new Date(y, 2, 31) },
      { season: 'SPRING', year: y, startDate: new Date(y, 3, 1), endDate: new Date(y, 5, 30) },
      { season: 'SUMMER', year: y, startDate: new Date(y, 6, 1), endDate: new Date(y, 8, 30) },
      { season: 'FALL', year: y, startDate: new Date(y, 9, 1), endDate: new Date(y, 11, 31) },
    ];
  }

  async buildGraph(animeId: string): Promise<RelationGraph | null> {
    const cacheKey = `relation-graph:${animeId}`;
    const cached = await this.cache.get<RelationGraph>(cacheKey);
    if (cached) return cached;

    const id = parseInt(animeId, 10);
    if (isNaN(id)) return null;

    try {
      const { data } = await axios.post(ANILIST_API, { query: RELATIONS_QUERY, variables: { id } });
      const media = data.data?.Media;
      if (!media) return null;

      const nodes: RelationNode[] = [];
      const edges = media.relations?.edges ?? [];
      for (const e of edges) {
        nodes.push({
          animeId: e.node.id, title: e.node.title?.english ?? e.node.title?.romaji ?? '',
          coverImage: e.node.coverImage?.large ?? null, relationType: e.relationType as RelationType,
          format: e.node.format ?? null, status: e.node.status ?? null,
          episodes: e.node.episodes ?? null, score: e.node.averageScore ? e.node.averageScore / 10 : null,
        });
      }

      const graph: RelationGraph = { rootId: media.id, nodes };
      await this.cache.set(cacheKey, graph, 86400);
      return graph;
    } catch { return null; }
  }

  async getSimilar(id: string): Promise<any[]> {
    const cacheKey = `recommendations:${id}`;
    const cached = await this.cache.get<any[]>(cacheKey);
    if (cached) return cached;

    const nid = parseInt(id, 10);
    if (isNaN(nid)) return [];

    try {
      const { data } = await axios.post(ANILIST_API, { query: RECOMMENDATIONS_QUERY, variables: { id: nid, page: 1, perPage: 20 } });
      const nodes = data.data?.Media?.recommendations?.nodes ?? [];
      const results = nodes.filter((n: any) => n.mediaRecommendation).map((n: any) => {
        const m = n.mediaRecommendation;
        return { id: String(m.id), title: m.title?.english || m.title?.romaji || '', image: m.coverImage?.large, format: m.format, status: m.status, episodes: m.episodes, rating: m.averageScore ? m.averageScore / 10 : null, genres: m.genres };
      });
      await this.cache.set(cacheKey, results, 86400);
      return results;
    } catch { return []; }
  }

  generateId(): string {
    this.counter++;
    return `anime_${String((this.counter % 1000000) + 1).padStart(6, '0')}`;
  }

  async toCanonical(externalId: string, source: 'anilist' | 'mal' | 'tmdb'): Promise<string | null> {
    const provider = { anilist: 'ANILIST', mal: 'MAL', tmdb: 'TMDB' }[source];
    const cacheKey = `anime-mapping:${source}:${externalId}`;
    const cached = await this.cache.get<string>(cacheKey);
    if (cached) return cached;

    if (!this.prisma.isConnected) return null;
    const mapping = await this.prisma.animeMapping.findFirst({ where: { provider: provider as any, externalId } });
    if (!mapping) return null;
    await this.cache.set(cacheKey, mapping.animeId, 86400);
    return mapping.animeId;
  }

  async getMapping(animeId: string): Promise<AnimeMappingResult | null> {
    const cacheKey = `anime-mapping:${animeId}`;
    const cached = await this.cache.get<AnimeMappingResult>(cacheKey);
    if (cached) return cached;

    if (!this.prisma.isConnected) return null;
    const mapping = await this.prisma.animeMapping.findFirst({ where: { animeId, isPrimary: true } });
    if (!mapping) return null;

    const result: AnimeMappingResult = {
      id: mapping.id, animeId: mapping.animeId, provider: mapping.provider,
      externalId: mapping.externalId, externalSlug: mapping.externalSlug,
      title: mapping.title, url: mapping.url, language: mapping.language, isPrimary: mapping.isPrimary,
    };
    await this.cache.set(cacheKey, result, 86400);
    return result;
  }
}
