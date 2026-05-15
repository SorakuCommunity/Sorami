export interface MetadataSource {
  source: 'ANILIST' | 'MAL' | 'TMDB';
  title?: {
    romaji?: string;
    english?: string;
    native?: string;
    synonyms?: string[];
  };
  description?: string;
  coverImage?: string;
  bannerImage?: string;
  genres?: string[];
  season?: string;
  seasonYear?: number;
  format?: string;
  episodes?: number;
  duration?: number;
  status?: string;
  score?: number;
  popularity?: number;
  studios?: string[];
}

export interface MergedAnimeMetadata {
  titles: {
    romaji: string;
    english: string | null;
    native: string | null;
    synonyms: string[];
  };
  description: string;
  images: {
    cover: string | null;
    banner: string | null;
  };
  genres: string[];
  season: string | null;
  seasonYear: number | null;
  format: string | null;
  episodes: number | null;
  duration: number | null;
  status: string | null;
  score: number | null;
  popularity: number | null;
  studios: string[];
}

function normalizeScore(score: number | undefined, source: 'ANILIST' | 'MAL' | 'TMDB'): number | null {
  if (score === null || score === undefined) return null;
  if (source === 'ANILIST') return score / 10;
  if (source === 'TMDB') return score / 10;
  return score;
}

function prioritize<T>(sources: MetadataSource[], extract: (s: MetadataSource) => T | undefined): T | null {
  for (const src of sources) {
    const val = extract(src);
    if (val !== null && val !== undefined) return val;
  }
  return null;
}

function mergeStrings(existing: string[], incoming: string[] | undefined): string[] {
  if (!incoming || incoming.length === 0) return existing;
  return Array.from(new Set([...existing, ...incoming]));
}

export function mergeMetadata(sources: MetadataSource[]): MergedAnimeMetadata {
  const ordered = [
    sources.find((s) => s.source === 'ANILIST'),
    sources.find((s) => s.source === 'MAL'),
    sources.find((s) => s.source === 'TMDB'),
  ].filter(Boolean) as MetadataSource[];

  let synonyms: string[] = [];
  for (const src of ordered) {
    if (src.title?.synonyms) synonyms = mergeStrings(synonyms, src.title.synonyms);
  }

  let allGenres: string[] = [];
  for (const src of ordered) {
    allGenres = mergeStrings(allGenres, src.genres);
  }

  let allStudios: string[] = [];
  for (const src of ordered) {
    allStudios = mergeStrings(allStudios, src.studios);
  }

  return {
    titles: {
      romaji: prioritize(ordered, (s) => s.title?.romaji) ?? '',
      english: prioritize(ordered, (s) => s.title?.english) ?? null,
      native: prioritize(ordered, (s) => s.title?.native) ?? null,
      synonyms,
    },
    description: prioritize(ordered, (s) => s.description) ?? '',
    images: {
      cover: prioritize(ordered, (s) => s.coverImage) ?? null,
      banner: prioritize(ordered, (s) => s.bannerImage) ?? null,
    },
    genres: allGenres,
    season: prioritize(ordered, (s) => s.season) ?? null,
    seasonYear: prioritize(ordered, (s) => s.seasonYear) ?? null,
    format: prioritize(ordered, (s) => s.format) ?? null,
    episodes: prioritize(ordered, (s) => s.episodes) ?? null,
    duration: prioritize(ordered, (s) => s.duration) ?? null,
    status: prioritize(ordered, (s) => s.status) ?? null,
    score: prioritize(ordered, (s) => normalizeScore(s.score, s.source)),
    popularity: prioritize(ordered, (s) => s.popularity) ?? null,
    studios: allStudios,
  };
}
