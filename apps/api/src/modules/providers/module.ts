import { Module } from '@nestjs/common';
import { Providers } from './providers';

@Module({ controllers: [Providers] })
export class ProvidersModule {}
