"use client";

import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, Star, Calendar, Clapperboard } from "lucide-react";
import type { SpotlightAnime } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface SpotlightSliderProps {
  anime: SpotlightAnime[];
  isLoading?: boolean;
}

function SpotlightSkeleton() {
  return (
    <section className="relative h-[55vh] md:h-[75vh] min-h-[400px] md:min-h-[500px] w-full overflow-hidden bg-soraku-dark">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-soraku-dark via-soraku-dark/70 to-transparent" />
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl space-y-6">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-14 md:h-20 w-full max-w-2xl" />
          <div className="flex gap-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full max-w-xl" />
          <Skeleton className="h-4 w-3/4 max-w-lg" />
          <div className="flex gap-4 pt-2">
            <Skeleton className="h-12 w-36 rounded-full" />
            <Skeleton className="h-12 w-28 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function SpotlightSlider({ anime, isLoading = false }: SpotlightSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: true }),
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setScrollSnaps(emblaApi.scrollSnapList());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  if (isLoading || anime.length === 0) {
    return <SpotlightSkeleton />;
  }

  return (
    <section className="relative h-[55vh] md:h-[75vh] min-h-[400px] md:min-h-[500px] w-full overflow-hidden bg-soraku-dark group">
      <div className="embla h-full" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {anime.map((item) => (
            <div
              key={item.id}
              className="embla__slide flex-[0_0_100%] relative min-w-0 h-full"
            >
              <div className="absolute inset-0">
                <img
                  src={item.cover || item.banner || item.poster}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-r from-soraku-dark via-soraku-dark/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-soraku-dark via-transparent to-transparent" />

              <div className="relative h-full flex items-center">
                <div className="container mx-auto px-4 md:px-6 max-w-7xl">
                  <div className="max-w-2xl space-y-4 md:space-y-5 animate-fade-in-up">
                    <span className="inline-block text-soraku-primary font-bold tracking-wider text-sm uppercase">
                      Spotlight
                    </span>

                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                      {item.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-3">
                      {item.type && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-soraku-surface text-white/90 text-xs font-medium">
                          {item.type}
                        </span>
                      )}
                      {item.totalEpisodes && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-soraku-surface text-soraku-secondary text-xs">
                          <Clapperboard className="w-3.5 h-3.5" />
                          {item.totalEpisodes} {item.totalEpisodes === 1 ? "Episode" : "Episodes"}
                        </span>
                      )}
                      {item.year && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-soraku-surface text-soraku-secondary text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                          {item.year}
                        </span>
                      )}
                      {item.rating && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-soraku-surface text-soraku-secondary text-xs">
                          <Star className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" />
                          {item.rating}
                        </span>
                      )}
                    </div>

                    <p className="text-soraku-secondary line-clamp-2 text-sm md:text-base max-w-xl leading-relaxed">
                      {item.description || "No description available."}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 md:gap-4 pt-2">
                      <Link
                        href={`/watch/${item.id}?ep=1`}
                        className="inline-flex items-center gap-2 bg-soraku-primary hover:bg-soraku-primary/80 text-white rounded-full px-6 py-3 font-bold text-sm md:text-base transition-colors"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        Watch Now
                      </Link>
                      <Link
                        href={`/anime/${item.id}`}
                        className="inline-flex items-center border border-white/20 hover:border-soraku-primary text-white rounded-full px-6 py-3 font-bold text-sm md:text-base transition-colors"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-lg bg-soraku-surface/80 hover:bg-soraku-surface text-white/80 hover:text-white transition-all opacity-0 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={scrollNext}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-lg bg-soraku-surface/80 hover:bg-soraku-surface text-white/80 hover:text-white transition-all opacity-0 group-hover:opacity-100"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 md:hidden">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`transition-all duration-300 rounded-full ${
              index === selectedIndex
                ? "w-6 h-2 bg-soraku-primary"
                : "w-2 h-2 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-3">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`transition-all duration-300 rounded-full ${
              index === selectedIndex
                ? "w-6 h-2 bg-soraku-primary"
                : "w-2 h-2 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
