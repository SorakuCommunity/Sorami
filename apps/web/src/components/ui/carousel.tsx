"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselProps {
  children: ReactNode;
  title?: string;
  icon?: ReactNode;
  viewAllLink?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function Carousel({ 
  children, 
  title, 
  icon, 
  viewAllLink, 
  autoPlay = false,
  autoPlayInterval = 5000 
}: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -600 : 600;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  useEffect(() => {
    checkScroll();
    const element = scrollRef.current;
    if (element) {
      element.addEventListener("scroll", checkScroll);
      return () => element.removeEventListener("scroll", checkScroll);
    }
  }, []);

  useEffect(() => {
    if (!autoPlay) return;
    
    const interval = setInterval(() => {
      if (!scrollRef.current || !canScrollRight) {
        scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scroll("right");
      }
    }, autoPlayInterval);
    
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, canScrollRight]);

  return (
    <div className="relative">
      {/* Title */}
      {(title || icon) && (
        <div className="flex items-center justify-between px-4 md:px-6 mb-4">
          <div className="flex items-center gap-3">
            {icon && <span className="text-soraku-primary">{icon}</span>}
            {title && <h2 className="text-xl font-bold text-soraku-light">{title}</h2>}
          </div>
          {viewAllLink && (
            <a
              href={viewAllLink}
              className="text-sm text-soraku-secondary hover:text-soraku-primary transition-colors flex items-center gap-1"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </a>
          )}
        </div>
      )}

      {/* Carousel Container */}
      <div className="relative group">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-40 w-12 h-full bg-gradient-to-r from-soraku-dark to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-start pl-2"
          >
            <div className="w-10 h-10 rounded-full bg-soraku-dark/80 flex items-center justify-center text-soraku-light hover:bg-soraku-primary hover:text-white transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </div>
          </button>
        )}

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-4 md:px-6 py-2"
        >
          {children}
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-40 w-12 h-full bg-gradient-to-l from-soraku-dark to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-2"
          >
            <div className="w-10 h-10 rounded-full bg-soraku-dark/80 flex items-center justify-center text-soraku-light hover:bg-soraku-primary hover:text-white transition-colors">
              <ChevronRight className="w-6 h-6" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

interface CarouselItemProps {
  children: ReactNode;
  className?: string;
}

export function CarouselItem({ children, className }: CarouselItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("shrink-0", className)}
    >
      {children}
    </motion.div>
  );
}