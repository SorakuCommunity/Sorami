import { Global, Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { ProviderResolverService } from './provider-resolver.service';

@Global()
@Module({
  controllers: [ProvidersController],
  providers: [ProviderResolverService],
  exports: [ProviderResolverService],
})
export class ProvidersModule {}
