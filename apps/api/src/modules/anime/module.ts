import { Module } from '@nestjs/common';
import { Anime } from './anime';

@Module({ controllers: [Anime] })
export class AnimeModule {}
