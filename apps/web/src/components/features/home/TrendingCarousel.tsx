"use client";

import { useState, useRef, useEffect } from "react";
import { AnimeCard } from "@/components/shared/AnimeCard";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { getTrendingAnime } from "@/lib/anime-client";
import type { Anime } from "@/lib/anime-client";

export function TrendingCarousel() {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getTrendingAnime(1).then((data) => {
      setAnimeList(data);
      setLoading(false);
    });
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!containerRef.current) return;
    const amount = dir === "left" ? -400 : 400;
    containerRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="py-8 md:py-12 px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-soraku-primary" />
            <h2 className="text-lg md:text-xl font-bold text-soraku-light">Trending Now</h2>
          </div>
          <Link
            href="/trending"
            className="text-sm text-soraku-secondary hover:text-soraku-primary transition-colors flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-3 md:gap-5 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shrink-0" style={{ width: "160px" }}>
              <div className="rounded-lg bg-soraku-surface border border-soraku-surface-light overflow-hidden">
                <div className="aspect-[2/3] bg-soraku-dark animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-soraku-dark rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-soraku-dark rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12 px-4 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-soraku-primary" />
          <h2 className="text-lg md:text-xl font-bold text-soraku-light">Trending Now</h2>
        </div>
        <Link
          href="/trending"
          className="text-sm text-soraku-secondary hover:text-soraku-primary transition-colors flex items-center gap-1"
        >
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded bg-soraku-surface border border-soraku-surface-light flex items-center justify-center hover:bg-soraku-surface-light -ml-2 md:-ml-3"
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-soraku-light" />
        </button>

        <div
          ref={containerRef}
          className="flex gap-3 md:gap-5 overflow-x-auto scrollbar-hide py-2"
        >
          {animeList.map((anime, i) => (
            <div key={anime.id} className="shrink-0" style={{ width: "160px" }}>
              <AnimeCard
                anime={{
                  id: anime.id,
                  title: anime.title,
                  poster: anime.poster,
                  rating: anime.rating,
                  episodes: anime.episodes,
                  status: anime.status,
                  type: anime.type,
                }}
                rank={i + 1}
                showRank
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded bg-soraku-surface border border-soraku-surface-light flex items-center justify-center hover:bg-soraku-surface-light -mr-2 md:-mr-3"
        >
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-soraku-light" />
        </button>
      </div>
    </section>
  );
}
