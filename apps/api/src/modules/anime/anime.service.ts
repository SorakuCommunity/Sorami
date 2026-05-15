import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SourceRegistry } from '../sources/source-registry.service';
import { AniListSource } from '../sources/sources/anilist.source';
import { RelationGraphService } from '../resolver/relation-graph.service';

@Injectable()
export class AnimeService implements OnModuleInit {
  private readonly logger = new Logger(AnimeService.name);
  private anilistSource!: AniListSource;

  constructor(
    private readonly sourceRegistry: SourceRegistry,
    private readonly relationGraph: RelationGraphService,
  ) {}

  onModuleInit() {
    const source = this.sourceRegistry.get('AniList');
    if (!source) {
      throw new Error('AniList source not found in registry');
    }
    this.anilistSource = source as AniListSource;
  }

  getAllSources() {
    return this.sourceRegistry.getAll().map((s) => ({
      name: s.name,
      type: s.type,
      priority: s.priority,
    }));
  }

  async getSourceHealth() {
    const results: Record<string, boolean> = {};
    const promises = this.sourceRegistry.getAll().map(async (s) => {
      try {
        results[s.name] = await s.health();
      } catch {
        results[s.name] = false;
      }
    });
    await Promise.allSettled(promises);
    return results;
  }

  async searchAnime(query: string) {
    const results = await this.sourceRegistry.searchAll(query);
    const entries: Record<string, unknown> = {};
    for (const [source, items] of results) {
      if (items.length > 0) entries[source] = items;
    }
    return entries;
  }

  async findAnime(id: string) {
    const result = await this.sourceRegistry.findAnime(id);
    if (!result) return null;
    return result.data;
  }

  async getPopular(page = 1) {
    const results = await this.sourceRegistry.getPopularAll(page);
    const entries: Record<string, unknown> = {};
    for (const [source, items] of results) {
      if (items.length > 0) entries[source] = items;
    }
    return entries;
  }

  async getTrending(page = 1, perPage = 20) {
    return this.anilistSource.getTrending(page, perPage);
  }

  async getSeasonal(page = 1, perPage = 20, season?: string, seasonYear?: number) {
    return this.anilistSource.getSeasonal(page, perPage, season, seasonYear);
  }

  async getTopRated(page = 1, perPage = 20) {
    return this.anilistSource.getTopRated(page, perPage);
  }

  async getAiring(page = 1, perPage = 20) {
    return this.anilistSource.getAiring(page, perPage);
  }

  async getMovies(page = 1, perPage = 20) {
    return this.anilistSource.getMovies(page, perPage);
  }

  async getLatest(page = 1, perPage = 20) {
    return this.anilistSource.getLatest(page, perPage);
  }

  async getAniListPopular(page = 1, perPage = 20) {
    return this.anilistSource.getPopularRaw(page, perPage);
  }

  async searchAnilist(query: string, perPage = 20) {
    return this.anilistSource.searchRaw(query, perPage);
  }

  async getRecommendations(id: string) {
    return this.relationGraph.getSimilar(id);
  }

  async getRelations(id: string) {
    return this.relationGraph.buildGraph(id);
  }
}
