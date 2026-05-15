import { Module } from '@nestjs/common';
import { Meta } from './meta';

@Module({ controllers: [Meta] })
export class MetaModule {}
