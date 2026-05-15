import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../cache.service';

export const CACHE_TTL_KEY = 'cacheTTL';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    if (request.method !== 'GET') {
      return next.handle();
    }

    const ttl = this.reflector.getAllAndOverride<number>(CACHE_TTL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!ttl) {
      return next.handle();
    }

    const cacheKey = `cache:${request.route?.path || request.url}:${JSON.stringify(request.query)}`;

    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached !== null) {
      return of(cached);
    }

    return next.handle().pipe(
      tap((data) => {
        this.cacheService.set(cacheKey, data, ttl).catch((err) => {
          this.logger.error(`Failed to cache response: ${err.message}`);
        });
      }),
    );
  }
}
