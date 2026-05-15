import { Module } from '@nestjs/common';
import { AnimeIdMapper } from '../../mappers/anime-id.mapper';
import { RelationGraphService } from './relation-graph.service';
import { SeasonalEngine } from './seasonal-engine.service';

@Module({
  providers: [AnimeIdMapper, RelationGraphService, SeasonalEngine],
  exports: [AnimeIdMapper, RelationGraphService, SeasonalEngine],
})
export class ResolverModule {}
