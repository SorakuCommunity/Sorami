import { NotFoundException } from '@nestjs/common';

export class AnimeNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Anime with id "${id}" not found`);
  }
}

export class ProviderNotFoundException extends NotFoundException {
  constructor(provider: string) {
    super(`Provider "${provider}" not found`);
  }
}

export class StreamNotFoundException extends NotFoundException {
  constructor(episodeId: string) {
    super(`Stream not found for episode "${episodeId}"`);
  }
}

export class MappingNotFoundException extends NotFoundException {
  constructor(externalId: string, provider?: string) {
    const msg = provider
      ? `Mapping not found for external id "${externalId}" on provider "${provider}"`
      : `Mapping not found for external id "${externalId}"`;
    super(msg);
  }
}
