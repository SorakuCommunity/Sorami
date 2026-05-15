import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { SourcesModule } from './sources/module';
import { SourcesModule as NewSourcesModule } from './modules/sources/sources.module';
import { AnimeModule } from './modules/anime/module';
import { EpisodeModule } from './modules/episode/episode.module';
import { MetaModule } from './modules/meta/module';
import { CommonModule } from './common/common.module';
import { ResolverModule } from './modules/resolver/module';
import { MetadataModule } from './modules/metadata/metadata.module';
import { ProvidersModule } from './modules/providers/module';
import { StreamModule } from './modules/stream/module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CommunityModule } from './modules/community/community.module';
import { LibraryModule } from './modules/library/library.module';
import { AdminModule } from './modules/admin/admin.module';
import { WorkersModule } from './workers/workers.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    PrismaModule,
    SourcesModule,
    NewSourcesModule,
    AnimeModule,
    EpisodeModule,
    MetaModule,
    CommonModule,
    ResolverModule,
    MetadataModule,
    ProvidersModule,
    StreamModule,
    AuthModule,
    UsersModule,
    CommunityModule,
    LibraryModule,
    AdminModule,
    WorkersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
