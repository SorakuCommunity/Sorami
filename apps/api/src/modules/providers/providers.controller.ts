import { Controller, Get, Post, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProviderResolverService } from './provider-resolver.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('providers')
@Controller('providers')
export class ProvidersController {
  constructor(private readonly resolver: ProviderResolverService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all providers with health status' })
  async listProviders() {
    const healthy = await this.resolver.getHealthyProviders();
    return healthy.map((p) => ({
      name: p.name,
      type: p.type,
      priority: p.priority,
      baseUrl: p.baseUrl,
    }));
  }

  @Public()
  @Post(':name/check')
  @ApiOperation({ summary: 'Trigger health check for a provider' })
  async checkProvider(@Param('name') name: string) {
    throw new NotFoundException('Direct provider check requires adapter registration');
  }

  @Public()
  @Get('resolve/:episodeId')
  @ApiOperation({ summary: 'Resolve best stream for an episode' })
  @ApiQuery({ name: 'server', required: false })
  async resolveEpisode(@Param('episodeId') episodeId: string, @Query('server') server?: string) {
    const result = await this.resolver.resolveStream(episodeId, server);
    if (!result) throw new NotFoundException(`No stream found for episode ${episodeId}`);
    return result;
  }
}
