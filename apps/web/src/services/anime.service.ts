export interface Anime {
  id: string;
  title: string;
  titleEnglish?: string;
  titleNative?: string;
  poster: string;
  cover?: string;
  banner?: string;
  description?: string;
  rating?: number;
  episodes?: number;
  totalEpisodes?: number;
  status: "ONGOING" | "COMPLETED" | "UPCOMING";
  releaseDate?: string;
  year?: number;
  duration?: string;
  genres?: string[];
  studios?: string[];
  type?: string;
  hasSub?: boolean;
  hasDub?: boolean;
}

export interface Episode {
  id: string;
  animeId: string;
  number: number;
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  isSubbed?: boolean;
  isDubbed?: boolean;
  releaseDate?: string;
}

export interface AnimeSearchResult {
  animes: Anime[];
  totalPages: number;
  currentPage: number;
  hasNextPage?: boolean;
}

export interface EpisodeSource {
  sources: Array<{ url: string; quality: string; isM3U8?: boolean }>;
  subtitles: Array<{ url: string; label: string; lang?: string }>;
  headers?: Record<string, string>;
}

export async function getTrendingAnime(page = 1): Promise<Anime[]> {
  try {
    const res = await fetch(`/api/anime/trending?page=${page}`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getPopularAnime(page = 1): Promise<Anime[]> {
  try {
    const res = await fetch(`/api/anime/popular?page=${page}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getSeasonalAnime(): Promise<Anime[]> {
  try {
    const res = await fetch("/api/anime/seasonal", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getAnimeById(id: string): Promise<Anime | null> {
  try {
    const res = await fetch(`/api/anime/${id}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getAnimeEpisodes(id: string): Promise<Episode[]> {
  try {
    const res = await fetch(`/api/anime/${id}/episodes`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getEpisodeSources(
  episodeId: string,
  server?: string,
  subOrDub?: string
): Promise<EpisodeSource | null> {
  try {
    const params = new URLSearchParams();
    if (server) params.set("server", server);
    if (subOrDub) params.set("subOrDub", subOrDub);
    
    const res = await fetch(`/api/anime/episode/sources/${episodeId}?${params}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function searchAnime(
  query: string,
  page = 1,
  filters?: {
    genre?: string;
    year?: number;
    status?: string;
    type?: string;
  }
): Promise<AnimeSearchResult> {
  try {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
    });
    if (filters?.genre) params.set("genre", filters.genre);
    if (filters?.year) params.set("year", filters.year.toString());
    if (filters?.status) params.set("status", filters.status);
    if (filters?.type) params.set("type", filters.type);
    
    const res = await fetch(`/api/anime/search?${params}`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return { animes: [], totalPages: 0, currentPage: page };
    return res.json();
  } catch {
    return { animes: [], totalPages: 0, currentPage: page };
  }
}

export async function getGenres(): Promise<string[]> {
  return [
    "Action",
    "Adventure",
    "Cars",
    "Comedy",
    "Drama",
    "Fantasy",
    "Horror",
    "Mecha",
    "Music",
    "Mystery",
    "Psychological",
    "Romance",
    "Sci-Fi",
    "Slice of Life",
    "Sports",
    "Supernatural",
    "Thriller",
  ];
}