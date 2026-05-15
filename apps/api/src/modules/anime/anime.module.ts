import { Module } from '@nestjs/common';
import { ResolverModule } from '../resolver/resolver.module';
import { AnimeController } from './anime.controller';
import { AnimeService } from './anime.service';

@Module({
  imports: [ResolverModule],
  controllers: [AnimeController],
  providers: [AnimeService],
})
export class AnimeModule {}
