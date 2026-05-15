"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { getTopRatedAnime } from "@/lib/anime-server";
import type { Anime } from "@/lib/anime-server";

export function TopRanked() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopRatedAnime(1).then((data) => {
      setAnimes(data.slice(0, 10));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <section className="py-8 md:py-12 px-4 md:px-6">
        <h2 className="text-lg md:text-xl font-bold text-soraku-light mb-6">Top Rated</h2>
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 md:gap-4 p-3 bg-soraku-surface border border-soraku-surface-light rounded-lg animate-pulse">
              <div className="w-10 h-10 bg-soraku-surface-light rounded" />
              <div className="w-16 h-20 md:w-20 md:h-24 bg-soraku-surface-light rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-soraku-surface-light rounded w-3/4" />
                <div className="h-3 bg-soraku-surface-light rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12 px-4 md:px-6">
      <h2 className="text-lg md:text-xl font-bold text-soraku-light mb-6">Top Rated</h2>
      <div className="space-y-4">
        {animes.map((anime, index) => (
          <div
            key={anime.id}
            className="flex items-center gap-3 md:gap-4 p-3 bg-soraku-surface border border-soraku-surface-light rounded-lg hover:border-soraku-primary/40 transition-colors"
          >
            <span className="text-2xl font-bold text-soraku-secondary w-10 text-center flex-shrink-0">
              {index + 1}
            </span>

            <div className="w-16 h-20 md:w-20 md:h-24 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={anime.poster}
                alt={anime.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={`/anime/${anime.id}`}
                  className="font-semibold text-soraku-light truncate hover:text-soraku-primary transition-colors"
                >
                  {anime.title}
                </Link>
                {anime.status && (
                  <span className="bg-soraku-primary/10 text-soraku-primary text-xs px-2 py-0.5 rounded whitespace-nowrap">
                    {anime.status}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs md:text-sm text-soraku-secondary">
                {anime.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-soraku-primary" />
                    <span className="font-medium text-soraku-light">{anime.rating.toFixed(1)}</span>
                  </div>
                )}
                {anime.episodes && <span>{anime.episodes} eps</span>}
                {anime.type && <span>{anime.type}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
