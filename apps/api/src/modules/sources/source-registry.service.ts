import { Injectable, Logger } from '@nestjs/common';
import { AnimeSource } from './interfaces/anime-source.interface';

@Injectable()
export class SourceRegistry {
  private readonly logger = new Logger(SourceRegistry.name);
  private sources: Map<string, AnimeSource> = new Map();

  register(source: AnimeSource) {
    if (this.sources.has(source.name)) {
      this.logger.warn(`Source ${source.name} already registered, overwriting`);
    }
    this.sources.set(source.name, source);
    this.logger.log(`Registered source: ${source.name} (${source.type})`);
  }

  get(name: string): AnimeSource | undefined {
    return this.sources.get(name);
  }

  getAll(): AnimeSource[] {
    return Array.from(this.sources.values());
  }

  getByType(type: AnimeSource['type']): AnimeSource[] {
    return this.getAll()
      .filter((s) => s.type === type)
      .sort((a, b) => b.priority - a.priority);
  }

  async searchAll(query: string): Promise<Map<string, Awaited<ReturnType<AnimeSource['search']>>>> {
    const results = new Map<string, Awaited<ReturnType<AnimeSource['search']>>>();
    const promises = this.getAll().map(async (source) => {
      try {
        const entries = await source.search(query);
        results.set(source.name, entries);
      } catch (err) {
        this.logger.error(`Search failed for ${source.name}: ${(err as Error).message}`);
        results.set(source.name, []);
      }
    });
    await Promise.allSettled(promises);
    return results;
  }

  async resolveEpisodeUrl(animeSlug: string, episodeNumber: number): Promise<{ source: string; url: string } | null> {
    const ordered = [
      ...this.getByType('primary'),
      ...this.getByType('fallback'),
      ...this.getByType('metadata'),
    ];
    for (const source of ordered) {
      try {
        const url = await source.resolveEpisodeUrl(animeSlug, episodeNumber);
        if (url) return { source: source.name, url };
      } catch {
        this.logger.warn(`Failed to resolve episode from ${source.name}`);
      }
    }
    return null;
  }

  async findAnime(id: string): Promise<{ source: string; data: NonNullable<Awaited<ReturnType<AnimeSource['getAnime']>>> } | null> {
    const ordered = [
      ...this.getByType('primary'),
      ...this.getByType('fallback'),
      ...this.getByType('metadata'),
    ];

    for (const source of ordered) {
      try {
        const detail = await source.getAnime(id);
        if (detail) {
          return { source: source.name, data: detail };
        }
      } catch (err) {
        this.logger.warn(`Failed to fetch from ${source.name}: ${(err as Error).message}`);
      }
    }
    return null;
  }

  async getPopularAll(page: number): Promise<Map<string, Awaited<ReturnType<AnimeSource['getPopular']>>>> {
    const results = new Map<string, Awaited<ReturnType<AnimeSource['getPopular']>>>();
    const promises = this.getAll().map(async (source) => {
      try {
        const entries = await source.getPopular(page);
        results.set(source.name, entries);
      } catch (err) {
        this.logger.error(`getPopular failed for ${source.name}: ${(err as Error).message}`);
        results.set(source.name, []);
      }
    });
    await Promise.allSettled(promises);
    return results;
  }

  async findAnimeMeta(id: string): Promise<{ source: string; data: NonNullable<Awaited<ReturnType<AnimeSource['getAnime']>>> } | null> {
    const metadataSources = this.getByType('metadata');
    for (const source of metadataSources) {
      try {
        const detail = await source.getAnime(id);
        if (detail) {
          return { source: source.name, data: detail };
        }
      } catch (err) {
        this.logger.warn(`Failed to fetch metadata from ${source.name}: ${(err as Error).message}`);
      }
    }
    return null;
  }

}
