import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MetaService } from './meta.service';

@ApiTags('meta')
@Controller('meta')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get metadata for an anime' })
  async getMetadata(@Param('id') id: string) {
    const result = await this.metaService.getMetadata(id);
    if (!result) throw new NotFoundException(`Metadata for ${id} not found`);
    return result;
  }
}
