import { Module } from '@nestjs/common';
import { Resolver } from './resolver';

@Module({ providers: [Resolver], exports: [Resolver] })
export class ResolverModule {}
