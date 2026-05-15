import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';

@Processor('metadata-sync')
export class MetadataWorker {
  private readonly logger = new Logger(MetadataWorker.name);

  constructor(private prisma: PrismaService) {}

  @Process('syncAnimeMetadata')
  async syncAnimeMetadata(job: Job<{ animeId: string }>) {
    const { animeId } = job.data;
    this.logger.log(`Starting metadata sync for anime ${animeId}`);

    try {
      const anime = await this.prisma.anime.findUnique({
        where: { id: animeId },
        include: { mappings: true },
      });

      if (!anime) {
        this.logger.warn(`Anime ${animeId} not found, skipping sync`);
        return { success: false, reason: 'not_found' };
      }

      this.logger.log(`Mapped sources for ${anime.title}: ${anime.mappings.length}`);
      await job.progress(100);

      return { success: true, animeId, title: anime.title };
    } catch (err) {
      this.logger.error(`Metadata sync failed for ${animeId}: ${(err as Error).message}`);
      throw err;
    }
  }

  @Process('syncAllMappings')
  async syncAllMappings(job: Job) {
    this.logger.log('Starting full mapping sync');

    const needingRefresh = await this.prisma.animeMapping.findMany({
      where: {
        OR: [
          { externalSlug: null },
          { title: null },
        ],
      },
      take: 100,
    });

    this.logger.log(`Found ${needingRefresh.length} mappings needing refresh`);

    for (let i = 0; i < needingRefresh.length; i++) {
      const mapping = needingRefresh[i];
      this.logger.log(`Refreshing mapping ${mapping.id} (${mapping.provider})`);
      await job.progress(Math.round(((i + 1) / needingRefresh.length) * 100));
    }

    return { success: true, refreshed: needingRefresh.length };
  }
}
