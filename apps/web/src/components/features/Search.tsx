"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X, Star, Calendar, Clock, Film } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { searchAnime, type Anime } from "@/services/anime.service";

const GENRES = [
  "Action", "Adventure", "Cars", "Comedy", "Dementia", "Demons", "Drama",
  "Ecchi", "Fantasy", "Game", "Harem", "Hentai", "Historical", "Horror",
  "Josei", "Kids", "Magic", "Martial Arts", "Mecha", "Military", "Music",
  "Mystery", "Parody", "Police", "Psychological", "Romance", "Samurai",
  "School", "Sci-Fi", "Seinen", "Shoujo", "Shoujo Ai", "Shounen",
  "Shounen Ai", "Slice of Life", "Space", "Sports", "Super Power",
  "Supernatural", "Thriller", "Vampire", "Yaoi", "Yuri"
];

const YEARS = Array.from({ length: 30 }, (_, i) => (2024 - i).toString());

const STATUS = ["Ongoing", "Completed", "Upcoming"];

const RATING = ["All", "9+", "8+", "7+", "6+"];

interface SearchFilters {
  genre?: string;
  year?: string;
  status?: string;
  rating?: string;
}

export function SearchComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialQuery = searchParams.get("q") || "";
  const initialPage = parseInt(searchParams.get("page") || "1");
  const initialGenre = searchParams.get("genre") || "";
  const initialYear = searchParams.get("year") || "";
  const initialStatus = searchParams.get("status") || "";
  const initialRating = searchParams.get("rating") || "";

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [page, setPage] = useState(initialPage);
  const [filters, setFilters] = useState<SearchFilters>({
    genre: initialGenre,
    year: initialYear,
    status: initialStatus,
    rating: initialRating,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["search", debouncedQuery, page, filters],
    queryFn: () => searchAnime(debouncedQuery, page, {
      genre: filters.genre,
      year: filters.year ? parseInt(filters.year) : undefined,
      status: filters.status,
    }),
    staleTime: 5 * 60 * 1000,
  });

  const updateURL = useCallback((newQuery: string, newPage: number, newFilters: SearchFilters) => {
    const params = new URLSearchParams();
    if (newQuery) params.set("q", newQuery);
    if (newPage > 1) params.set("page", newPage.toString());
    if (newFilters.genre) params.set("genre", newFilters.genre);
    if (newFilters.year) params.set("year", newFilters.year);
    if (newFilters.status) params.set("status", newFilters.status);
    if (newFilters.rating && newFilters.rating !== "All") params.set("rating", newFilters.rating);
    
    router.push(`/search?${params.toString()}`, { scroll: false });
  }, [router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    updateURL(query, 1, filters);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPage(1);
    updateURL(debouncedQuery, 1, newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
    updateURL(debouncedQuery, 1, {});
  };

  const hasActiveFilters = Object.values(filters).some(v => v && v !== "All");

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search anime..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
        <Button
          type="button"
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0">
              {Object.values(filters).filter(v => v && v !== "All").length}
            </Badge>
          )}
        </Button>
      </form>

      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Genre</label>
                <Select
                  value={filters.genre || ""}
                  onValueChange={(value) => handleFilterChange("genre", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Genres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Genres</SelectItem>
                    {GENRES.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Select
                  value={filters.year || ""}
                  onValueChange={(value) => handleFilterChange("year", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Years</SelectItem>
                    {YEARS.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status || ""}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    {STATUS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <Select
                  value={filters.rating || "All"}
                  onValueChange={(value) => handleFilterChange("rating", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    {RATING.map((rating) => (
                      <SelectItem key={rating} value={rating}>
                        {rating === "All" ? "All Ratings" : `${rating} Rating`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {filters.genre && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.genre}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange("genre", "")}
                    />
                  </Badge>
                )}
                {filters.year && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.year}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange("year", "")}
                    />
                  </Badge>
                )}
                {filters.status && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.status}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange("status", "")}
                    />
                  </Badge>
                )}
                {filters.rating && filters.rating !== "All" && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.rating}+
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange("rating", "All")}
                    />
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Failed to load search results</p>
        </Card>
      ) : data?.animes.length === 0 ? (
        <Card className="p-8 text-center">
          <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {data?.animes.map((anime) => (
              <Link key={anime.id} href={`/anime/${anime.id}`}>
                <Card className="overflow-hidden transition-all hover:scale-105 hover:shadow-lg">
                  <div className="aspect-[2/3] relative overflow-hidden">
                    <img
                      src={anime.poster}
                      alt={anime.title}
                      className="object-cover w-full h-full"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <h3 className="font-semibold text-sm truncate">
                        {anime.titleEnglish || anime.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {anime.rating && (
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            {anime.rating}
                          </span>
                        )}
                        {anime.episodes && (
                          <span>{anime.episodes} eps</span>
                        )}
                      </div>
                    </div>
                    {anime.status && (
                      <Badge
                        className="absolute top-2 right-2"
                        variant={anime.status === "ONGOING" ? "default" : "secondary"}
                      >
                        {anime.status === "ONGOING" ? "Ongoing" : anime.status === "COMPLETED" ? "Completed" : "Upcoming"}
                      </Badge>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => {
                  const newPage = page - 1;
                  setPage(newPage);
                  updateURL(debouncedQuery, newPage, filters);
                }}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= data.totalPages}
                onClick={() => {
                  const newPage = page + 1;
                  setPage(newPage);
                  updateURL(debouncedQuery, newPage, filters);
                }}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}