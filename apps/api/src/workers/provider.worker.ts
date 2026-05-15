import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';

@Processor('provider-sync')
export class ProviderWorker {
  private readonly logger = new Logger(ProviderWorker.name);

  constructor(private prisma: PrismaService) {}

  @Process('checkProviderHealth')
  async checkProviderHealth(job: Job) {
    this.logger.log('Starting provider health check');

    const servers = await this.prisma.streamingServer.findMany({
      where: { isActive: true },
    });

    const results: { serverId: string; status: string; latency: number | null; error: string | null }[] = [];

    for (const server of servers) {
      const start = Date.now();
      let status = 'healthy';
      let error: string | null = null;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(server.baseUrl, {
          method: 'GET',
          signal: controller.signal,
        });
        clearTimeout(timeout);
        status = response.ok ? 'healthy' : 'degraded';
      } catch (err) {
        status = 'down';
        error = (err as Error).message;
        this.logger.warn(`Provider ${server.name} health check failed: ${error}`);
      }

      const latency = Date.now() - start;

      await this.prisma.serverHealth.create({
        data: {
          serverId: server.id,
          status,
          latency,
          error,
        },
      });

      results.push({ serverId: server.id, status, latency, error: null });
    }

    await job.progress(100);
    return { success: true, checked: results.length, servers: results };
  }

  @Process('syncProviderEpisodes')
  async syncProviderEpisodes(job: Job<{ animeSlug: string }>) {
    const { animeSlug } = job.data;
    this.logger.log(`Syncing provider episodes for ${animeSlug}`);

    await job.progress(100);
    return { success: true, animeSlug };
  }
}
