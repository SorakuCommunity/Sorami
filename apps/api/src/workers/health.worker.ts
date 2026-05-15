import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';

@Processor('health-check')
export class HealthWorker {
  private readonly logger = new Logger(HealthWorker.name);

  constructor(private prisma: PrismaService) {}

  @Process('periodicHealthCheck')
  async periodicHealthCheck(job: Job) {
    this.logger.log('Running periodic health check');

    const servers = await this.prisma.streamingServer.findMany();

    for (const server of servers) {
      const start = Date.now();
      let status = 'healthy';
      let error: string | null = null;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(server.baseUrl, {
          method: 'HEAD',
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
          status = 'degraded';
          error = `HTTP ${response.status}`;
        }
      } catch (err) {
        status = 'down';
        error = (err as Error).message;
        this.logger.warn(`Health check failed for ${server.name}: ${error}`);
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

      this.logger.log(`${server.name}: ${status} (${latency}ms)`);
    }

    await job.progress(100);
    this.logger.log('Periodic health check completed');
  }
}
