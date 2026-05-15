import { Injectable, Logger } from '@nestjs/common';
import { ProviderAdapter, ProviderStream, ProviderHealth } from './interfaces/provider-adapter.interface';

export interface ProviderResult {
  provider: string;
  streams: ProviderStream[];
  health: ProviderHealth;
}

export interface StreamResult {
  provider: string;
  selectedServer: string;
  streams: ProviderStream[];
  fallbackStreams: ProviderStream[];
}

@Injectable()
export class ProviderResolverService {
  private readonly logger = new Logger(ProviderResolverService.name);
  private adapters: ProviderAdapter[] = [];
  private healthCache = new Map<string, ProviderHealth>();

  register(adapter: ProviderAdapter) {
    this.adapters.push(adapter);
    this.adapters.sort((a, b) => a.priority - b.priority);
  }

  async resolveBestProvider(episodeId: string): Promise<ProviderResult | null> {
    const healthy = await this.getHealthyProviders();

    for (const adapter of healthy) {
      try {
        this.logger.debug(`Trying provider ${adapter.name} for episode ${episodeId}`);
        const streams = await adapter.getStreams(episodeId);
        if (streams && streams.length > 0) {
          const health = this.healthCache.get(adapter.name) ?? {
            status: 'healthy',
            latency: 0,
            lastChecked: new Date(),
          } as ProviderHealth;
          return { provider: adapter.name, streams, health };
        }
      } catch (err) {
        this.logger.warn(`Provider ${adapter.name} failed for episode ${episodeId}: ${(err as Error).message}`);
      }
    }

    return null;
  }

  async resolveStream(episodeId: string, preferredServer?: string): Promise<StreamResult | null> {
    const result = await this.resolveBestProvider(episodeId);
    if (!result) return null;

    const { streams, provider } = result;

    let candidateStreams = streams;
    if (preferredServer) {
      const filtered = streams.filter((s) => s.server.toLowerCase() === preferredServer.toLowerCase());
      if (filtered.length > 0) candidateStreams = filtered;
    }

    const sorted = this.sortByQuality(candidateStreams);
    const best = sorted.slice(0, 1);
    const fallback = sorted.slice(1);

    return {
      provider,
      selectedServer: best[0]?.server ?? 'unknown',
      streams: best,
      fallbackStreams: fallback,
    };
  }

  async getHealthyProviders(): Promise<ProviderAdapter[]> {
    const results = await Promise.allSettled(
      this.adapters.map(async (adapter) => {
        try {
          const health = await adapter.healthCheck();
          this.healthCache.set(adapter.name, health);
          return { adapter, healthy: health.status === 'healthy' || health.status === 'degraded' };
        } catch {
          const down: ProviderHealth = { status: 'down', latency: 0, lastChecked: new Date() };
          this.healthCache.set(adapter.name, down);
          return { adapter, healthy: false };
        }
      }),
    );

    return results
      .filter((r) => r.status === 'fulfilled' && (r as PromiseFulfilledResult<{ adapter: ProviderAdapter; healthy: boolean }>).value.healthy)
      .map((r) => (r as PromiseFulfilledResult<{ adapter: ProviderAdapter; healthy: boolean }>).value.adapter)
      .sort((a, b) => a.priority - b.priority);
  }

  getProviderPriority(name: string): number {
    const adapter = this.adapters.find((a) => a.name === name);
    return adapter?.priority ?? 999;
  }

  private sortByQuality(streams: ProviderStream[]): ProviderStream[] {
    const qualityOrder: Record<string, number> = {
      '4K': 4,
      '1080p': 3,
      '720p': 2,
      '480p': 1,
      '360p': 0,
    };
    return [...streams].sort((a, b) => (qualityOrder[b.quality] ?? 0) - (qualityOrder[a.quality] ?? 0));
  }
}
