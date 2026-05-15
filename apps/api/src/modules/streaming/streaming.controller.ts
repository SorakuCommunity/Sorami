import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StreamingService } from './streaming.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('streaming')
@Controller('stream')
export class StreamingController {
  constructor(private readonly streamingService: StreamingService) {}

  @Public()
  @Get(':animeId/:episodeNumber')
  @ApiOperation({ summary: 'Get stream with failover chain' })
  @ApiQuery({ name: 'server', required: false })
  @ApiQuery({ name: 'quality', required: false })
  @ApiQuery({ name: 'lang', required: false, enum: ['sub', 'dub'] })
  async getStream(
    @Param('animeId') animeId: string,
    @Param('episodeNumber') episodeNumber: string,
    @Query('server') server?: string,
    @Query('quality') quality?: string,
    @Query('lang') lang?: 'sub' | 'dub',
  ) {
    const epNum = parseInt(episodeNumber, 10);
    if (isNaN(epNum)) throw new NotFoundException('Invalid episode number');

    const result = await this.streamingService.getStream(animeId, epNum, {
      preferredServer: server,
      quality,
      lang,
    });

    if (!result) throw new NotFoundException(`No stream found for ${animeId} episode ${episodeNumber}`);
    return result;
  }

  @Public()
  @Get('manifest/:episodeId')
  @ApiOperation({ summary: 'Direct manifest by episode ID' })
  async getManifest(@Param('episodeId') episodeId: string) {
    const result = await this.streamingService.getStreamManifest(episodeId);
    if (!result) throw new NotFoundException(`No manifest found for episode ${episodeId}`);
    return result;
  }
}
