import { Global, Module, OnModuleInit } from '@nestjs/common';
import { Registry } from './registry';
import { AniList } from './anilist';
import { Jikan } from './jikan';
import { HiAnime } from './hianime';
import { AnimePahe } from './animepahe';
import { AnimeKai } from './animekai';
import { KickAssAnime } from './kickassanime';
import { Samehadaku } from './samehadaku';
import { Otakudesu } from './otakudesu';

@Global()
@Module({
  providers: [Registry, AniList, Jikan, HiAnime, AnimePahe, AnimeKai, KickAssAnime, Samehadaku, Otakudesu],
  exports: [Registry],
})
export class SourcesModule implements OnModuleInit {
  constructor(
    private readonly registry: Registry,
    private readonly anilist: AniList,
    private readonly jikan: Jikan,
    private readonly hianime: HiAnime,
    private readonly animepahe: AnimePahe,
    private readonly animekai: AnimeKai,
    private readonly kickass: KickAssAnime,
    private readonly samehadaku: Samehadaku,
    private readonly otakudesu: Otakudesu,
  ) {}

  onModuleInit() {
    this.registry.register(this.anilist);
    this.registry.register(this.jikan);
    this.registry.register(this.samehadaku);
    this.registry.register(this.otakudesu);
    this.registry.register(this.hianime);
    this.registry.register(this.animepahe);
    this.registry.register(this.animekai);
    this.registry.register(this.kickass);
  }
}
