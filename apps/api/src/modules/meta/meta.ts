import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Registry } from '../../sources/registry';

@ApiTags('meta')
@Controller('meta')
export class Meta {
  constructor(private readonly registry: Registry) {}

  @Public()
  @Get('schedule')
  @ApiOperation({ summary: 'Anime schedule' })
  @ApiQuery({ name: 'page', required: false })
  async schedule(@Query('page') page = '1') {
    const anilist = this.registry.get('AniList');
    if (anilist && 'airing' in anilist) return (anilist as any).airing(parseInt(page, 10));
    return { results: [] };
  }

  @Public()
  @Get('season')
  @ApiOperation({ summary: 'Current seasonal anime' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'season', required: false })
  @ApiQuery({ name: 'year', required: false })
  async season(@Query('page') page = '1', @Query('season') season?: string, @Query('year') year?: string) {
    const anilist = this.registry.get('AniList');
    if (anilist && 'seasonal' in anilist) return (anilist as any).seasonal(parseInt(page, 10), 20, season, year ? parseInt(year, 10) : undefined);
    return { results: [] };
  }

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Trending anime via metadata' })
  @ApiQuery({ name: 'page', required: false })
  async trending(@Query('page') page = '1') {
    const anilist = this.registry.get('AniList');
    if (anilist && 'trending' in anilist) return (anilist as any).trending(parseInt(page, 10));
    return { results: [] };
  }
}
