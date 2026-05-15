import { Injectable, Logger } from '@nestjs/common';
import { Provider } from './types';

@Injectable()
export class Registry {
  private readonly logger = new Logger(Registry.name);
  private providers = new Map<string, Provider>();

  register(provider: Provider) {
    this.providers.set(provider.name, provider);
    this.logger.log(`Registered: ${provider.name} (${provider.type})`);
  }

  get(name: string): Provider | undefined {
    return this.providers.get(name);
  }

  getAll(): Provider[] {
    return Array.from(this.providers.values());
  }

  getByType(type: Provider['type']): Provider[] {
    return this.getAll().filter((p) => p.type === type);
  }
}
