import { Controller, Get, Post, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Registry } from '../../sources/registry';

@ApiTags('providers')
@Controller('providers')
export class Providers {
  constructor(private readonly registry: Registry) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all providers' })
  list() {
    return this.registry.getAll().map((p) => ({ name: p.name, type: p.type }));
  }

  @Public()
  @Get(':name')
  @ApiOperation({ summary: 'Provider details' })
  async detail(@Param('name') name: string) {
    const p = this.registry.get(name);
    if (!p) throw new NotFoundException(`Provider ${name} not found`);
    return { name: p.name, type: p.type, healthy: await p.health() };
  }

  @Public()
  @Post(':name/check')
  @ApiOperation({ summary: 'Check provider health' })
  async check(@Param('name') name: string) {
    const p = this.registry.get(name);
    if (!p) throw new NotFoundException(`Provider ${name} not found`);
    return { name: p.name, healthy: await p.health() };
  }
}
