import {
  Controller, Get, Post, Delete, Param, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LibraryService } from './library.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('library')
@Controller('library')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  // Favorites
  @Get('favorites')
  @ApiOperation({ summary: 'Get user favorites' })
  getFavorites(@CurrentUser('id') userId: string) {
    return this.libraryService.getFavorites(userId);
  }

  @Post('favorites/:animeId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add anime to favorites' })
  addFavorite(@CurrentUser('id') userId: string, @Param('animeId') animeId: string) {
    return this.libraryService.addFavorite(userId, animeId);
  }

  @Delete('favorites/:animeId')
  @ApiOperation({ summary: 'Remove anime from favorites' })
  removeFavorite(@CurrentUser('id') userId: string, @Param('animeId') animeId: string) {
    return this.libraryService.removeFavorite(userId, animeId);
  }

  // Watchlist
  @Get('watchlist')
  @ApiOperation({ summary: 'Get user watchlist' })
  getWatchlist(@CurrentUser('id') userId: string) {
    return this.libraryService.getWatchlist(userId);
  }

  @Post('watchlist/:animeId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add anime to watchlist' })
  addToWatchlist(
    @CurrentUser('id') userId: string,
    @Param('animeId') animeId: string,
    @Body('status') status?: string,
  ) {
    return this.libraryService.addToWatchlist(userId, animeId, status);
  }

  @Delete('watchlist/:animeId')
  @ApiOperation({ summary: 'Remove anime from watchlist' })
  removeFromWatchlist(@CurrentUser('id') userId: string, @Param('animeId') animeId: string) {
    return this.libraryService.removeFromWatchlist(userId, animeId);
  }

  // History
  @Get('history')
  @ApiOperation({ summary: 'Get watch history' })
  getHistory(@CurrentUser('id') userId: string) {
    return this.libraryService.getHistory(userId);
  }

  @Post('progress')
  @ApiOperation({ summary: 'Update watch progress for an episode' })
  updateProgress(
    @CurrentUser('id') userId: string,
    @Body('episodeId') episodeId: string,
    @Body('progress') progress: number,
  ) {
    return this.libraryService.updateProgress(userId, episodeId, progress);
  }

  @Get('continue-watching')
  @ApiOperation({ summary: 'Get continue-watching items' })
  getContinueWatching(@CurrentUser('id') userId: string) {
    return this.libraryService.getContinueWatching(userId);
  }
}
