import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Overview stats for admin dashboard' })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('providers')
  @ApiOperation({ summary: 'List all streaming providers with health status' })
  getProviders() {
    return this.adminService.getProviders();
  }

  @Patch('providers/:slug')
  @ApiOperation({ summary: 'Enable/disable provider or set priority' })
  updateProvider(
    @Param('slug') slug: string,
    @Body() data: { isActive?: boolean; priority?: number },
  ) {
    return this.adminService.updateProvider(slug, data);
  }

  @Get('mappings')
  @ApiOperation({ summary: 'List all anime mappings' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getMappings(@Query('page') page = '1', @Query('limit') limit = '50') {
    return this.adminService.getMappings(parseInt(page, 10), parseInt(limit, 10));
  }

  @Post('mappings')
  @ApiOperation({ summary: 'Create a new anime mapping' })
  createMapping(@Body() data: {
    animeId: string;
    provider: string;
    externalId: string;
    externalSlug?: string;
    title?: string;
    url?: string;
    isPrimary?: boolean;
    language?: string;
  }) {
    return this.adminService.createMapping(data);
  }

  @Patch('mappings/:id')
  @ApiOperation({ summary: 'Update an existing mapping' })
  updateMapping(@Param('id') id: string, @Body() data: {
    externalId?: string;
    externalSlug?: string;
    title?: string;
    url?: string;
    isPrimary?: boolean;
    language?: string;
  }) {
    return this.adminService.updateMapping(id, data);
  }

  @Post('mappings/sync/:animeId')
  @ApiOperation({ summary: 'Trigger metadata resync for an anime' })
  triggerSync(@Param('animeId') animeId: string) {
    return this.adminService.triggerSync(animeId);
  }

  @Get('analytics/streams')
  @ApiOperation({ summary: 'Stream analytics including failures, latency, and usage' })
  getStreamAnalytics() {
    return this.adminService.getStreamAnalytics();
  }

  @Get('health')
  @ApiOperation({ summary: 'Full system health check' })
  getHealth() {
    return this.adminService.getHealth();
  }
}
