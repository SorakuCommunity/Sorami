import { Injectable, Logger } from '@nestjs/common';
import { Registry } from '../../sources/registry';

@Injectable()
export class EpisodeService {
  private readonly logger = new Logger(EpisodeService.name);

  constructor(private readonly registry: Registry) {}

  async getEpisodes(animeId: string) {
    const ordered = [...this.registry.getByType('indonesian'), ...this.registry.getByType('global')];
    for (const p of ordered) {
      try {
        const result = await p.info(animeId);
        if (result?.episodes) return { animeId, episodes: result.episodes, title: result.title, image: result.image };
      } catch { continue; }
    }
    return null;
  }

  async resolveStreamUrl(animeSlug: string, episodeNumber: number) {
    const fallbackOrder = ['Samehadaku', 'Otakudesu', 'HiAnime', 'AnimePahe', 'KickAssAnime', 'AnimeKai'];
    for (const name of fallbackOrder) {
      const p = this.registry.get(name);
      if (p && p.stream) {
        try {
          const result = await p.stream(`${animeSlug}/ep-${episodeNumber}`);
          if (result && result.sources.length > 0) {
            return { source: name, url: result.sources[0].url, animeSlug, episodeNumber };
          }
        } catch { continue; }
      }
    }
    return null;
  }
}
