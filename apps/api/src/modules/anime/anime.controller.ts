import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { AnimeService } from './anime.service';
import { SeasonalEngine } from '../resolver/seasonal-engine.service';

@ApiTags('anime')
@Controller('anime')
export class AnimeController {
  constructor(
    private readonly animeService: AnimeService,
    private readonly seasonalEngine: SeasonalEngine,
  ) {}

  @Public()
  @Get('sources')
  @ApiOperation({ summary: 'List all registered anime sources' })
  getSources() {
    return this.animeService.getAllSources();
  }

  @Public()
  @Get('sources/health')
  @ApiOperation({ summary: 'Check health of all sources' })
  getSourceHealth() {
    return this.animeService.getSourceHealth();
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search anime across all sources' })
  @ApiQuery({ name: 'q', required: true })
  search(@Query('q') query: string) {
    if (!query) throw new NotFoundException('Query parameter q is required');
    return this.animeService.searchAnime(query);
  }

  @Public()
  @Get('popular')
  @ApiOperation({ summary: 'Get popular anime' })
  @ApiQuery({ name: 'page', required: false })
  getPopular(@Query('page') page = '1') {
    return this.animeService.getPopular(parseInt(page, 10));
  }

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Get trending anime from AniList' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  getTrending(@Query('page') page = '1', @Query('perPage') perPage = '20') {
    return this.animeService.getTrending(parseInt(page, 10), parseInt(perPage, 10));
  }

  @Public()
  @Get('seasonal')
  @ApiOperation({ summary: 'Get seasonal anime from AniList' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'season', required: false })
  @ApiQuery({ name: 'seasonYear', required: false })
  getSeasonal(
    @Query('page') page = '1',
    @Query('perPage') perPage = '20',
    @Query('season') season?: string,
    @Query('seasonYear') seasonYear?: string,
  ) {
    return this.animeService.getSeasonal(
      parseInt(page, 10),
      parseInt(perPage, 10),
      season,
      seasonYear ? parseInt(seasonYear, 10) : undefined,
    );
  }

  @Public()
  @Get('seasonal/current')
  @ApiOperation({ summary: 'Get currently airing seasonal anime' })
  getCurrentSeasonal() {
    const current = this.seasonalEngine.getCurrentSeason();
    return this.animeService.getSeasonal(1, 20, current.season, current.year);
  }

  @Public()
  @Get('seasonal/:year/:season')
  @ApiOperation({ summary: 'Get anime for a specific season and year' })
  getSeasonalByYearSeason(
    @Param('year') year: string,
    @Param('season') season: string,
    @Query('page') page = '1',
  ) {
    return this.animeService.getSeasonal(parseInt(page, 10), 20, season.toUpperCase(), parseInt(year, 10));
  }

  @Public()
  @Get('top-rated')
  @ApiOperation({ summary: 'Get top rated anime from AniList' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  getTopRated(@Query('page') page = '1', @Query('perPage') perPage = '20') {
    return this.animeService.getTopRated(parseInt(page, 10), parseInt(perPage, 10));
  }

  @Public()
  @Get('airing')
  @ApiOperation({ summary: 'Get currently airing anime from AniList' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  getAiring(@Query('page') page = '1', @Query('perPage') perPage = '20') {
    return this.animeService.getAiring(parseInt(page, 10), parseInt(perPage, 10));
  }

  @Public()
  @Get('movies')
  @ApiOperation({ summary: 'Get anime movies from AniList' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  getMovies(@Query('page') page = '1', @Query('perPage') perPage = '20') {
    return this.animeService.getMovies(parseInt(page, 10), parseInt(perPage, 10));
  }

  @Public()
  @Get('latest')
  @ApiOperation({ summary: 'Get latest updated anime from AniList' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  getLatest(@Query('page') page = '1', @Query('perPage') perPage = '20') {
    return this.animeService.getLatest(parseInt(page, 10), parseInt(perPage, 10));
  }

  @Public()
  @Get(':id/recommendations')
  @ApiOperation({ summary: 'Get recommendations for an anime' })
  getRecommendations(@Param('id') id: string) {
    return this.animeService.getRecommendations(id);
  }

  @Public()
  @Get(':id/relations')
  @ApiOperation({ summary: 'Get relation graph for an anime' })
  getRelations(@Param('id') id: string) {
    return this.animeService.getRelations(id);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Find anime detail by slug/ID' })
  async getAnime(@Param('id') id: string) {
    const result = await this.animeService.findAnime(id);
    if (!result) throw new NotFoundException(`Anime ${id} not found`);
    return result;
  }
}