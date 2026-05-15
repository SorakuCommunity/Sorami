import { Global, Module, OnModuleInit } from '@nestjs/common';
import { SourceRegistry } from './source-registry.service';
import { ConsumetSource } from './sources/consumet.source';
import { SamehadakuSource } from './sources/samehadaku.source';
import { OploverzSource } from './sources/oploverz.source';
import { OtakudesuSource } from './sources/otakudesu.source';
import { HiAnimeSource } from './sources/hianime.source';
import { AnimeKaiSource } from './sources/animekai.source';
import { KuramanimeSource } from './sources/kuramanime.source';
import { AnoboySource } from './sources/anoboy.source';
import { AniListSource } from './sources/anilist.source';
import { JikanSource } from './sources/jikan.source';
import { KitsuSource } from './sources/kitsu.source';
import { TMDBAnimeSource } from './sources/tmdb.source';

@Global()
@Module({
  providers: [
    SourceRegistry,
    ConsumetSource,
    SamehadakuSource,
    OploverzSource,
    OtakudesuSource,
    HiAnimeSource,
    AnimeKaiSource,
    KuramanimeSource,
    AnoboySource,
    AniListSource,
    JikanSource,
    KitsuSource,
    TMDBAnimeSource,
  ],
  exports: [SourceRegistry],
})
export class SourcesModule implements OnModuleInit {
  constructor(
    private readonly registry: SourceRegistry,
    private readonly consumet: ConsumetSource,
    private readonly samehadaku: SamehadakuSource,
    private readonly oploverz: OploverzSource,
    private readonly otakudesu: OtakudesuSource,
    private readonly hianime: HiAnimeSource,
    private readonly animekai: AnimeKaiSource,
    private readonly kuramanime: KuramanimeSource,
    private readonly anoboy: AnoboySource,
    private readonly anilist: AniListSource,
    private readonly jikan: JikanSource,
    private readonly kitsu: KitsuSource,
    private readonly tmdb: TMDBAnimeSource,
  ) {}

  onModuleInit() {
    this.registry.register(this.consumet);
    this.registry.register(this.samehadaku);
    this.registry.register(this.oploverz);
    this.registry.register(this.otakudesu);
    this.registry.register(this.hianime);
    this.registry.register(this.animekai);
    this.registry.register(this.kuramanime);
    this.registry.register(this.anoboy);
    this.registry.register(this.anilist);
    this.registry.register(this.jikan);
    this.registry.register(this.kitsu);
    this.registry.register(this.tmdb);
  }
}
