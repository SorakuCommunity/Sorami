import {
  Controller, Get, Post, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('community')
@Controller()
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('anime/:animeId/comments')
  @ApiOperation({ summary: 'Get paginated comments for an anime' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getComments(
    @Param('animeId') animeId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.communityService.getComments(animeId, parseInt(page, 10), parseInt(limit, 10));
  }

  @Post('anime/:animeId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a comment on an anime' })
  async createComment(
    @Param('animeId') animeId: string,
    @CurrentUser('id') userId: string,
    @Body('content') content: string,
  ) {
    return this.communityService.createComment(animeId, userId, content);
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete own comment' })
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.communityService.deleteComment(commentId, userId);
    return { deleted: true };
  }

  @Get('community/feed')
  @ApiOperation({ summary: 'Get recent community activity' })
  @ApiQuery({ name: 'limit', required: false })
  async getFeed(@Query('limit') limit = '20') {
    return this.communityService.getRecentActivity(parseInt(limit, 10));
  }
}
