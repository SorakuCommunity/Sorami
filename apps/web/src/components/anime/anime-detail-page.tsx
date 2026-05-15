import Link from "next/link";
import Image from "next/image";
import { notFound, redirect, permanentRedirect } from "next/navigation";
import { Star, Calendar, Clock, Play, Plus, Heart, Share2, Tv, Film } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/home/section";
import { AnimeCard } from "@/components/anime/anime-card";
import { getAnimeById, getAnimeEpisodes } from "@/lib/anime-server";

interface RelatedAnime {
  id: string;
  title: string;
  poster: string;
  rating?: number;
  episodes?: number;
}

const relatedAnime: RelatedAnime[] = [
  { id: "21", title: "Jujutsu Kaisen", poster: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg", rating: 8.6, episodes: 24 },
  { id: "10", title: "Attack on Titan", poster: "https://cdn.myanimelist.net/images/anime/10/47347.jpg", rating: 9.0, episodes: 87 },
  { id: "15125", title: "Solo Leveling", poster: "https://cdn.myanimelist.net/images/anime/1793/138898.jpg", rating: 8.4, episodes: 13 },
  { id: "154587", title: "Frieren: Beyond Journey's End", poster: "https://cdn.myanimelist.net/images/anime/1665/142625.jpg", rating: 9.0, episodes: 28 },
];

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

const ITEMS_PER_PAGE = 12;

interface Props {
  id: string;
  slug?: string;
  page?: string;
  basePath?: string;
}

export default async function AnimeDetailPage({ id, slug, page: pageStr = "1", basePath }: Props) {
  const currentPage = Math.max(1, parseInt(pageStr) || 1);

  const [anime, episodes] = await Promise.all([
    getAnimeById(id),
    getAnimeEpisodes(id),
  ]);

  if (!anime) {
    notFound();
  }

  const expectedSlug = slugify(anime.titleEnglish || anime.title);
  if (slug && slug !== expectedSlug) {
    const correctPath = basePath ? `/${basePath}/${id}/${expectedSlug}` : `/info/${id}/${expectedSlug}`;
    permanentRedirect(correctPath);
  }

  const totalPages = Math.ceil(episodes.length / ITEMS_PER_PAGE);
  const paginatedEpisodes = episodes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const statusLabel =
    anime.status === "ONGOING" ? "Ongoing"
    : anime.status === "COMPLETED" ? "Completed"
    : "Upcoming";

  const statusVariant =
    anime.status === "ONGOING" ? "airing"
    : anime.status === "COMPLETED" ? "completed"
    : "upcoming";

  const description = anime.description ? stripHtml(anime.description) : "";
  const bannerImage = anime.cover || anime.poster;
  const pathPrefix = basePath || "info";

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="relative h-[45vh] min-h-[380px] max-h-[560px] w-full overflow-hidden">
        {bannerImage ? (
          <div className="absolute inset-0">
            <Image
              src={bannerImage}
              alt={anime.title}
              fill
              className="object-cover object-top scale-105"
              priority
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0A0A0F]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/70 via-50% to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F]/60 to-transparent" />
      </div>

      <Container className="-mt-[220px] md:-mt-[300px] relative z-10">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-14">
          <div className="shrink-0 flex justify-center md:justify-start">
            <div className="relative w-44 md:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/10">
              {anime.poster ? (
                <Image
                  src={anime.poster}
                  alt={anime.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center">
                  <span className="text-5xl font-bold text-white/10">{anime.title[0]}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-5 pt-1">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                {anime.title}
              </h1>
              {anime.titleEnglish && anime.titleEnglish !== anime.title && (
                <p className="text-base md:text-lg text-white/50 mt-1.5">{anime.titleEnglish}</p>
              )}
              {anime.titleNative && (
                <p className="text-sm md:text-base text-white/30 mt-0.5">{anime.titleNative}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {anime.rating != null && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-sm text-yellow-400">{anime.rating}</span>
                </div>
              )}
              {anime.releaseDate && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm">
                  <Calendar className="w-3.5 h-3.5" />
                  {anime.releaseDate}
                </div>
              )}
              {anime.duration && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm">
                  <Clock className="w-3.5 h-3.5" />
                  {anime.duration}
                </div>
              )}
              {anime.type && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4FA3D1]/10 border border-[#4FA3D1]/20 text-[#4FA3D1] text-sm font-medium">
                  <Tv className="w-3.5 h-3.5" />
                  {anime.type}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={statusVariant} className="text-sm px-3 py-1">
                {statusLabel}
              </Badge>
              {anime.totalEpisodes && (
                <span className="text-sm text-white/50 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5" />
                  {anime.totalEpisodes} {anime.totalEpisodes === 1 ? "Episode" : "Episodes"}
                </span>
              )}
            </div>

            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {anime.genres.map((genre) => (
                  <Link
                    key={genre}
                    href={`/genre/${genre.toLowerCase().replace(/\s+/g, "-")}`}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-[#4FA3D1]/20 hover:border-[#4FA3D1]/40 hover:text-white transition-all duration-200"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            )}

            {description && (
              <p className="text-white/60 leading-relaxed max-w-3xl text-sm md:text-base line-clamp-4 md:line-clamp-none">
                {description}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                className="gap-2.5 bg-[#4FA3D1] hover:bg-[#4FA3D1] text-white shadow-lg shadow-[#4FA3D1]/30 px-6 h-12 text-base"
                asChild
              >
                <Link href={`/watch/${id}/${expectedSlug}?ep=1`}>
                  <Play className="w-5 h-5 fill-current" />
                  Watch Now
                </Link>
              </Button>
              <Button variant="outline" size="icon" className="border-white/10 hover:bg-white/5 hover:border-[#4FA3D1]/40 text-white/60 hover:text-white">
                <Plus className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="border-white/10 hover:bg-white/5 hover:border-[#4FA3D1]/40 text-white/60 hover:text-white">
                <Heart className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="border-white/10 hover:bg-white/5 hover:border-[#4FA3D1]/40 text-white/60 hover:text-white">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Episodes</h2>
            {totalPages > 1 && (
              <span className="text-sm text-white/40">{episodes.length} total</span>
            )}
          </div>

          {episodes.length > 0 ? (
            <>
              <div className="grid gap-3">
                {paginatedEpisodes.map((ep) => (
                  <Link
                    key={ep.number}
                    href={`/watch/${id}/${expectedSlug}?ep=${ep.number}`}
                    className="group flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-[#4FA3D1]/30 transition-all duration-200"
                  >
                    <div className="relative w-28 md:w-40 aspect-[16/9] rounded-lg overflow-hidden shrink-0 bg-[#1a1a2e]">
                      {ep.image ? (
                        <Image
                          src={ep.image}
                          alt={ep.title || `Episode ${ep.number}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="160px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-6 h-6 text-white/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#4FA3D1] bg-[#4FA3D1]/10 px-2 py-0.5 rounded">
                          EP {ep.number}
                        </span>
                        {ep.isSubbed && (
                          <span className="text-[10px] font-medium text-white/50 bg-white/5 px-1.5 py-0.5 rounded">SUB</span>
                        )}
                        {ep.isDubbed && (
                          <span className="text-[10px] font-medium text-white/50 bg-white/5 px-1.5 py-0.5 rounded">DUB</span>
                        )}
                      </div>
                      <p className="font-medium text-white/80 group-hover:text-white transition-colors line-clamp-1 text-sm md:text-base">
                        {ep.title || `Episode ${ep.number}`}
                      </p>
                      {ep.description && (
                        <p className="text-xs md:text-sm text-white/40 line-clamp-1 mt-0.5">{ep.description}</p>
                      )}
                    </div>

                    <div className="shrink-0 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#4FA3D1]/20 group-hover:scale-110 transition-all duration-200">
                      <Play className="w-4 h-4 text-white/40 group-hover:text-[#4FA3D1] transition-colors ml-0.5" />
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Link
                      key={pageNum}
                      href={`/${pathPrefix}/${id}/${expectedSlug}?page=${pageNum}`}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                        currentPage === pageNum
                          ? "bg-[#4FA3D1] text-white shadow-lg shadow-[#4FA3D1]/25"
                          : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10"
                      }`}
                    >
                      {pageNum}
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white/[0.02] rounded-xl border border-white/[0.06]">
              <p className="text-white/40">No episodes available yet. Check back later!</p>
            </div>
          )}
        </section>

        <Section title="Related Anime" seeAllLink={`/${pathPrefix}/${id}/${expectedSlug}/related`}>
          {relatedAnime.map((a) => (
            <AnimeCard key={a.id} anime={a} />
          ))}
        </Section>
      </Container>
    </div>
  );
}
