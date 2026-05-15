import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MetadataService } from './metadata.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('metadata')
@Controller('metadata')
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Public()
  @Get(':animeId')
  @ApiOperation({ summary: 'Get full metadata for an anime' })
  async getFullMetadata(@Param('animeId') animeId: string) {
    const result = await this.metadataService.getFullMetadata(animeId);
    if (!result) throw new NotFoundException(`Metadata for anime ${animeId} not found`);
    return result;
  }

  @Public()
  @Get(':animeId/characters')
  @ApiOperation({ summary: 'Get characters for an anime' })
  async getCharacters(@Param('animeId') animeId: string) {
    return this.metadataService.getCharacters(animeId);
  }

  @Public()
  @Get(':animeId/staff')
  @ApiOperation({ summary: 'Get staff for an anime' })
  async getStaff(@Param('animeId') animeId: string) {
    return this.metadataService.getStaff(animeId);
  }

  @Public()
  @Get(':animeId/stats')
  @ApiOperation({ summary: 'Get stats for an anime' })
  async getStats(@Param('animeId') animeId: string) {
    const result = await this.metadataService.getStats(animeId);
    if (!result) throw new NotFoundException(`Stats for anime ${animeId} not found`);
    return result;
  }
}
