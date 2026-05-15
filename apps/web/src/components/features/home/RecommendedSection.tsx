"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { AnimeCard } from "@/components/shared/AnimeCard";
import { getSeasonalAnime } from "@/lib/anime-server";
import type { Anime } from "@/lib/anime-server";

export function RecommendedSection() {
  const [anime, setAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSeasonalAnime()
      .then(setAnime)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-8 md:py-12 px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-3 mb-6">
        <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-soraku-primary" />
        <h2 className="text-xl md:text-2xl font-bold text-soraku-light">Recommended For You</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-soraku-surface border border-soraku-surface-light overflow-hidden animate-pulse">
                <div className="aspect-[2/3] bg-soraku-surface-light" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-soraku-surface-light rounded w-3/4" />
                  <div className="h-3 bg-soraku-surface-light rounded w-1/2" />
                </div>
              </div>
            ))
          : anime.slice(0, 12).map((a) => (
              <AnimeCard
                key={a.id}
                anime={{
                  id: a.id,
                  title: a.title,
                  poster: a.poster,
                  rating: a.rating,
                  episodes: a.episodes,
                  status: a.status,
                  type: a.type,
                }}
              />
            ))}
      </div>
    </section>
  );
}
