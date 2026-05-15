import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Registry } from '../../sources/registry';
import { CacheService } from '../../common/cache.service';

const ANILIST_EPISODE_PREFIX = 'anilist-ep-';

@ApiTags('anime')
@Controller('anime')
export class Anime {
  constructor(
    private readonly registry: Registry,
    private readonly cache: CacheService,
  ) {}

  private generateEpisodes(animeId: string, total: number): any[] {
    const eps: any[] = [];
    for (let i = 1; i <= total; i++) {
      eps.push({
        id: `${ANILIST_EPISODE_PREFIX}${animeId}-${i}`,
        number: i,
        title: `Episode ${i}`,
      });
    }
    return eps;
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search anime' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'page', required: false })
  async search(@Query('q') q: string, @Query('page') page = '1') {
    if (!q) throw new NotFoundException('Query q is required');
    const p = parseInt(page, 10);
    const anilist = this.registry.get('AniList');
    if (anilist) return anilist.search(q, p);
    const [first] = this.registry.getAll();
    return first?.search(q, p) ?? { results: [] };
  }

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Trending anime' })
  @ApiQuery({ name: 'page', required: false })
  async trending(@Query('page') page = '1') {
    const anilist = this.registry.get('AniList');
    if (anilist && 'trending' in anilist) return (anilist as any).trending(parseInt(page, 10));
    return { results: [] };
  }

  @Public()
  @Get('popular')
  @ApiOperation({ summary: 'Popular anime' })
  @ApiQuery({ name: 'page', required: false })
  async popular(@Query('page') page = '1') {
    const results: Record<string, any[]> = {};
    const promises = this.registry.getAll().map(async (p) => {
      if (p.popular) {
        try {
          const res = await p.popular(parseInt(page, 10));
          results[p.name] = res.results;
        } catch { results[p.name] = []; }
      }
    });
    await Promise.allSettled(promises);
    return results;
  }

  @Public()
  @Get('top-rated')
  @ApiOperation({ summary: 'Top rated anime' })
  @ApiQuery({ name: 'page', required: false })
  async topRated(@Query('page') page = '1') {
    const anilist = this.registry.get('AniList');
    if (anilist && 'topRated' in anilist) return (anilist as any).topRated(parseInt(page, 10));
    return { results: [] };
  }

  @Public()
  @Get('airing')
  @ApiOperation({ summary: 'Currently airing anime' })
  @ApiQuery({ name: 'page', required: false })
  async airing(@Query('page') page = '1') {
    const anilist = this.registry.get('AniList');
    if (anilist && 'airing' in anilist) return (anilist as any).airing(parseInt(page, 10));
    return { results: [] };
  }

  @Public()
  @Get('seasonal')
  @ApiOperation({ summary: 'Seasonal anime' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'season', required: false })
  @ApiQuery({ name: 'year', required: false })
  async seasonal(@Query('page') page = '1', @Query('season') season?: string, @Query('year') year?: string) {
    const anilist = this.registry.get('AniList');
    if (anilist && 'seasonal' in anilist) return (anilist as any).seasonal(parseInt(page, 10), 20, season, year ? parseInt(year, 10) : undefined);
    return { results: [] };
  }

  @Public()
  @Get('recent')
  @ApiOperation({ summary: 'Recent episodes' })
  @ApiQuery({ name: 'page', required: false })
  async recent(@Query('page') page = '1') {
    const results: Record<string, any[]> = {};
    const promises = this.registry.getAll().map(async (p) => {
      if (p.recent) {
        try {
          const res = await p.recent(parseInt(page, 10));
          results[p.name] = res.results;
        } catch { results[p.name] = []; }
      }
    });
    await Promise.allSettled(promises);
    return results;
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Anime details by ID' })
  async info(@Param('id') id: string) {
    const cacheKey = `anime:info:${id}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    const ordered = [...this.registry.getByType('metadata'), ...this.registry.getByType('indonesian'), ...this.registry.getByType('global')];
    for (const p of ordered) {
      try {
        const result = await p.info(id);
        if (result) {
          if (!result.episodes || result.episodes.length === 0) {
            if (result.totalEpisodes && result.totalEpisodes > 0) {
              result.episodes = this.generateEpisodes(id, result.totalEpisodes);
            }
          }
          await this.cache.set(cacheKey, result, 3600);
          return result;
        }
      } catch { continue; }
    }
    throw new NotFoundException(`Anime ${id} not found`);
  }

  @Public()
  @Get(':id/episodes')
  @ApiOperation({ summary: 'Episode list for an anime' })
  async episodes(@Param('id') id: string) {
    const cacheKey = `anime:episodes:${id}`;
    const cached = await this.cache.get<any[]>(cacheKey);
    if (cached) return cached;

    const anilist = this.registry.get('AniList');
    if (anilist) {
      try {
        const info = await anilist.info(id);
        if (info && info.totalEpisodes && info.totalEpisodes > 0) {
          const eps = this.generateEpisodes(id, info.totalEpisodes);
          await this.cache.set(cacheKey, eps, 3600);
          return eps;
        }
      } catch {}
    }
    return [];
  }
}
