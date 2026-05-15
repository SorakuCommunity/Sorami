import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EpisodeService } from './episode.service';

@ApiTags('episode')
@Controller('episode')
export class EpisodeController {
  constructor(private readonly episodeService: EpisodeService) {}

  @Get(':animeId')
  @ApiOperation({ summary: 'Get episodes for an anime' })
  async getEpisodes(@Param('animeId') animeId: string) {
    const result = await this.episodeService.getEpisodes(animeId);
    if (!result || !result.episodes || result.episodes.length === 0) {
      throw new NotFoundException(`No episodes found for ${animeId}`);
    }
    return result;
  }

  @Get(':animeSlug/:episodeNumber/stream')
  @ApiOperation({ summary: 'Resolve streaming URL for an episode' })
  async stream(
    @Param('animeSlug') animeSlug: string,
    @Param('episodeNumber') episodeNumber: string,
  ) {
    const epNum = parseInt(episodeNumber, 10);
    if (isNaN(epNum)) throw new NotFoundException('Invalid episode number');

    const result = await this.episodeService.resolveStreamUrl(animeSlug, epNum);
    if (!result) throw new NotFoundException('No streamable URL found for this episode');
    return result;
  }
}
