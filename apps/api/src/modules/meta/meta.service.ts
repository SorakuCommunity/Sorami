import { Injectable, Logger } from '@nestjs/common';
import { SourceRegistry } from '../sources/source-registry.service';

@Injectable()
export class MetaService {
  private readonly logger = new Logger(MetaService.name);

  constructor(private readonly sourceRegistry: SourceRegistry) {}

  async getMetadata(id: string) {
    const result = await this.sourceRegistry.findAnimeMeta(id);
    if (!result) return null;

    return {
      title: result.data.title,
      synopsis: result.data.synopsis,
      genres: result.data.genres,
      score: result.data.score,
      status: result.data.status,
      season: result.data.season,
      studio: result.data.studio,
      episodes: result.data.episodes?.length ?? 0,
      source: result.source,
    };
  }
}
