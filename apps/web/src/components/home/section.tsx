"use client";

import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  seeAllLink?: string;
  icon?: React.ReactNode;
}

export function Section({ title, children, seeAllLink, icon }: SectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  return (
    <section className="group/section relative">
      <div className="flex items-center justify-between px-4 mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <span className="text-soraku-primary shrink-0">{icon}</span>
          )}
          <h2 className="text-xl font-bold text-soraku-light border-l-4 border-soraku-primary pl-3 leading-tight">
            {title}
          </h2>
        </div>
        {seeAllLink && (
          <Link
            href={seeAllLink}
            className="text-sm text-soraku-secondary hover:text-soraku-primary transition-colors flex items-center gap-1 shrink-0"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="relative">
        <button
          onClick={scrollPrev}
          className={cn(
            "absolute left-2 top-1/2 -translate-y-1/2 z-40 opacity-0 group-hover/section:opacity-100 transition-opacity duration-300",
            "bg-soraku-surface/90 backdrop-blur-sm rounded-full p-2 text-soraku-secondary hover:text-soraku-primary hover:bg-soraku-surface shadow-lg"
          )}
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 py-4 px-4">{children}</div>
        </div>

        <button
          onClick={scrollNext}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 z-40 opacity-0 group-hover/section:opacity-100 transition-opacity duration-300",
            "bg-soraku-surface/90 backdrop-blur-sm rounded-full p-2 text-soraku-secondary hover:text-soraku-primary hover:bg-soraku-surface shadow-lg"
          )}
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-soraku-dark to-transparent pointer-events-none z-30" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-soraku-dark to-transparent pointer-events-none z-30" />
      </div>
    </section>
  );
}
