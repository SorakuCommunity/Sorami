import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    // Database
    DATABASE_URL: z.string().url().or(z.string().startsWith('postgresql://')).or(z.string().startsWith('file:')),

    // Redis
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().default(6379),

    // Server
    PORT: z.coerce.number().default(3000),
    CORS_ORIGIN: z.string().default('http://localhost:3000'),

    // JWT
    JWT_SECRET: z.string(),
    JWT_EXPIRES_IN: z.string().default('7d'),

    // External API keys
    TMDB_API_KEY: z.string().optional(),
    ANILIST_CLIENT_ID: z.string().optional(),
    MAL_CLIENT_ID: z.string().optional(),

    // Cloudflare R2
    CLOUDFLARE_R2_ACCESS_KEY: z.string().optional(),
    CLOUDFLARE_R2_SECRET_KEY: z.string().optional(),
    CLOUDFLARE_R2_BUCKET: z.string().optional(),
    CLOUDFLARE_R2_PUBLIC_URL: z.string().optional(),

    // Stream providers
    CONSUMET_API_URL: z.string().url().default('https://kuroji-api-j4mh.onrender.com'),
    API_STREAMS_BASE_URL: z.string().url().default('https://apistreams.vercel.app'),
    DEFAULT_SUBTITLE_LANG: z.string().default('id'),

    // Monitoring
    SENTRY_DSN: z.string().optional(),

    // Admin
    ADMIN_API_KEY: z.string().optional(),

    // Bull/Queue
    BULL_REDIS_PREFIX: z.string().default('{sorami}'),
    WORKER_CONCURRENCY: z.coerce.number().default(5),
  },
  runtimeEnv: process.env,
  skipValidation: false,
});
