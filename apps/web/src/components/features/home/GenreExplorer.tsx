"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getGenres } from "@/lib/anime-client";

export function GenreExplorer() {
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGenres()
      .then(setGenres)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-8 md:py-12 px-4 md:px-6">
      <h2 className="text-xl md:text-2xl font-bold text-soraku-light mb-6">Browse by Genre</h2>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-10 rounded-lg bg-soraku-surface border border-soraku-surface-light animate-pulse"
              />
            ))
          : genres.map((genre) => (
              <Link
                key={genre}
                href={`/genre/${genre.toLowerCase()}`}
                className="bg-soraku-surface border border-soraku-surface-light rounded-lg p-3 hover:border-soraku-primary hover:text-soraku-primary transition-colors text-center"
              >
                <span className="font-semibold text-sm">{genre}</span>
              </Link>
            ))}
      </div>
    </section>
  );
}
