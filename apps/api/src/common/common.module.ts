import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { CacheService } from './cache.service';

@Global()
@Module({
  providers: [
    { provide: APP_INTERCEPTOR, useClass: CacheInterceptor },
    CacheService,
  ],
  exports: [CacheService],
})
export class CommonModule {}
