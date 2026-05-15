import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { CacheService } from '../../common/cache.service';

const ANILIST_API = 'https://graphql.anilist.co';

export type RelationType = 'SEQUEL' | 'PREQUEL' | 'SIDE_STORY' | 'MOVIE' | 'OVA' | 'SPIN_OFF';

export interface RelationNode {
  animeId: number;
  title: string;
  coverImage: string | null;
  relationType: RelationType;
  format: string | null;
  status: string | null;
  episodes: number | null;
  score: number | null;
}

export interface RelationGraph {
  rootId: number;
  nodes: RelationNode[];
  levels: Map<number, number>;
}

const RELATIONS_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title { romaji english }
      coverImage { large }
      format
      status
      episodes
      averageScore
      studios { nodes { name } }
      genres
      relations {
        edges {
          relationType
          node {
            id
            title { romaji english }
            coverImage { large }
            format
            status
            episodes
            averageScore
          }
        }
      }
    }
  }
`;

const RECOMMENDATIONS_QUERY = `
  query ($id: Int, $page: Int, $perPage: Int) {
    Media(id: $id, type: ANIME) {
      recommendations(page: $page, perPage: $perPage, sort: RATING_DESC) {
        nodes {
          mediaRecommendation {
            id
            title { romaji english }
            coverImage { large }
            format
            status
            episodes
            averageScore
            genres
          }
        }
      }
    }
  }
`;

const CACHE_TTL = 24 * 60 * 60 * 1000;

@Injectable()
export class RelationGraphService {
  private readonly logger = new Logger(RelationGraphService.name);

  constructor(private readonly cache: CacheService) {}

  async buildGraph(animeId: string): Promise<RelationGraph | null> {
    const cacheKey = `relation-graph:${animeId}`;
    const cached = await this.cache.get<RelationGraph>(cacheKey);
    if (cached) return cached;

    const id = parseInt(animeId, 10);
    if (isNaN(id)) return null;

    try {
      const { data } = await axios.post(ANILIST_API, {
        query: RELATIONS_QUERY,
        variables: { id },
      });

      const media = data.data?.Media;
      if (!media) return null;

      const nodes: RelationNode[] = [];
      const levels = new Map<number, number>();

      levels.set(media.id, 0);

      const edges = media.relations?.edges ?? [];
      for (const edge of edges) {
        const node = edge.node;
        nodes.push({
          animeId: node.id,
          title: node.title?.english ?? node.title?.romaji ?? '',
          coverImage: node.coverImage?.large ?? null,
          relationType: edge.relationType as RelationType,
          format: node.format ?? null,
          status: node.status ?? null,
          episodes: node.episodes ?? null,
          score: node.averageScore ? node.averageScore / 10 : null,
        });
        levels.set(node.id, 1);
      }

      const graph: RelationGraph = { rootId: media.id, nodes, levels };
      await this.cache.set(cacheKey, graph, CACHE_TTL);
      return graph;
    } catch (err) {
      this.logger.error(`Failed to build relation graph for ${animeId}: ${(err as Error).message}`);
      return null;
    }
  }

  async getFranchiseOrder(animeId: string): Promise<RelationNode[]> {
    const graph = await this.buildGraph(animeId);
    if (!graph) return [];

    const orderPriority: Record<string, number> = {
      PREQUEL: 0,
      SEQUEL: 2,
      SIDE_STORY: 3,
      MOVIE: 4,
      OVA: 5,
      SPIN_OFF: 6,
    };

    return [...graph.nodes].sort((a, b) => {
      const pa = orderPriority[a.relationType] ?? 99;
      const pb = orderPriority[b.relationType] ?? 99;
      if (pa !== pb) return pa - pb;
      return a.animeId - b.animeId;
    });
  }

  async getSimilar(animeId: string): Promise<RelationNode[]> {
    const cacheKey = `similar:${animeId}`;
    const cached = await this.cache.get<RelationNode[]>(cacheKey);
    if (cached) return cached;

    const id = parseInt(animeId, 10);
    if (isNaN(id)) return [];

    try {
      const { data } = await axios.post(ANILIST_API, {
        query: RECOMMENDATIONS_QUERY,
        variables: { id, page: 1, perPage: 10 },
      });

      const nodes = data.data?.Media?.recommendations?.nodes ?? [];
      const results: RelationNode[] = nodes
        .filter((r: { mediaRecommendation: unknown }) => r.mediaRecommendation)
        .map((r: { mediaRecommendation: any }) => ({
          animeId: r.mediaRecommendation.id,
          title: r.mediaRecommendation.title?.english ?? r.mediaRecommendation.title?.romaji ?? '',
          coverImage: r.mediaRecommendation.coverImage?.large ?? null,
          relationType: 'SIDE_STORY' as RelationType,
          format: r.mediaRecommendation.format ?? null,
          status: r.mediaRecommendation.status ?? null,
          episodes: r.mediaRecommendation.episodes ?? null,
          score: r.mediaRecommendation.averageScore ? r.mediaRecommendation.averageScore / 10 : null,
        }));

      await this.cache.set(cacheKey, results, CACHE_TTL);
      return results;
    } catch (err) {
      this.logger.error(`Failed to get similar anime for ${animeId}: ${(err as Error).message}`);
      return [];
    }
  }
}
