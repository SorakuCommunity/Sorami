import { Module } from '@nestjs/common';
import { Stream } from './stream';

@Module({ controllers: [Stream] })
export class StreamModule {}
