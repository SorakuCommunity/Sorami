import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { env } from '../config/env';
import { MetadataWorker } from './metadata.worker';
import { ProviderWorker } from './provider.worker';
import { HealthWorker } from './health.worker';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
      },
      prefix: env.BULL_REDIS_PREFIX,
    }),
    BullModule.registerQueue(
      { name: 'metadata-sync' },
      { name: 'provider-sync' },
      { name: 'health-check' },
      { name: 'seasonal-update' },
    ),
  ],
  providers: [MetadataWorker, ProviderWorker, HealthWorker],
})
export class WorkersModule {}
