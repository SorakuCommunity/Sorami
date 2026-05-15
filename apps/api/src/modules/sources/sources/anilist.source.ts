import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AnimeSource, SourceAnimeEntry, SourceAnimeDetail, SourceEpisode } from '../interfaces/anime-source.interface';

const ANILIST_API = 'https://graphql.anilist.co';

const SEARCH_QUERY = `
  query ($query: String, $perPage: Int) {
    Page(perPage: $perPage) {
      media(search: $query, type: ANIME) {
        id
        title { romaji english native }
        coverImage { large }
        description
        genres
        averageScore
        status
        season
        studios { nodes { name } }
      }
    }
  }
`;

const DETAIL_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title { romaji english native }
      coverImage { large }
      description
      genres
      averageScore
      status
      season
      studios { nodes { name } }
      episodes {
        id
        number
        title
      }
    }
  }
`;

const POPULAR_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(sort: POPULARITY_DESC, type: ANIME) {
        id
        title { romaji english native }
        coverImage { large }
        description
        genres
        averageScore
        status
      }
    }
  }
`;

const TRENDING_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(sort: TRENDING_DESC, type: ANIME) {
        id
        title { romaji english native }
        bannerImage
        coverImage { large }
        genres
        format
        episodes
        averageScore
        season
        seasonYear
        status
        description
        studios { nodes { name } }
        nextAiringEpisode { episode timeUntilAiring }
      }
    }
  }
`;

const SEASONAL_QUERY = `
  query ($page: Int, $perPage: Int, $season: MediaSeason, $seasonYear: Int) {
    Page(page: $page, perPage: $perPage) {
      media(season: $season, seasonYear: $seasonYear, sort: POPULARITY_DESC, type: ANIME) {
        id
        title { romaji english native }
        bannerImage
        coverImage { large }
        genres
        format
        episodes
        averageScore
        season
        seasonYear
        status
        description
        studios { nodes { name } }
      }
    }
  }
`;

const TOP_RATED_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(sort: SCORE_DESC, type: ANIME) {
        id
        title { romaji english native }
        bannerImage
        coverImage { large }
        genres
        format
        episodes
        averageScore
        season
        seasonYear
        status
        description
        studios { nodes { name } }
      }
    }
  }
`;

const AIRING_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(status: RELEASING, sort: POPULARITY_DESC, type: ANIME) {
        id
        title { romaji english native }
        bannerImage
        coverImage { large }
        genres
        format
        episodes
        averageScore
        season
        seasonYear
        status
        description
        studios { nodes { name } }
        nextAiringEpisode { episode timeUntilAiring }
      }
    }
  }
`;

const MOVIES_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(format: MOVIE, sort: POPULARITY_DESC, type: ANIME) {
        id
        title { romaji english native }
        bannerImage
        coverImage { large }
        genres
        format
        episodes
        averageScore
        season
        seasonYear
        status
        description
        studios { nodes { name } }
      }
    }
  }
`;

const LATEST_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(status: RELEASING, sort: UPDATED_AT_DESC, type: ANIME) {
        id
        title { romaji english native }
        bannerImage
        coverImage { large }
        genres
        format
        episodes
        averageScore
        season
        seasonYear
        status
        description
        studios { nodes { name } }
        nextAiringEpisode { episode timeUntilAiring }
      }
    }
  }
`;

interface AniListMedia {
  id: number;
  title: { romaji?: string; english?: string; native?: string };
  bannerImage?: string;
  coverImage?: { large?: string };
  description?: string;
  genres?: string[];
  format?: string;
  averageScore?: number;
  status?: string;
  season?: string;
  seasonYear?: number;
  studios?: { nodes: { name: string }[] };
  episodes?: number | { id: number; number: number; title?: string }[];
  nextAiringEpisode?: { episode: number; timeUntilAiring: number };
}

@Injectable()
export class AniListSource implements AnimeSource {
  readonly name = 'AniList';
  readonly type = 'metadata' as const;
  readonly priority = 50;
  private readonly logger = new Logger(AniListSource.name);

  async search(query: string): Promise<SourceAnimeEntry[]> {
    const { data } = await axios.post(ANILIST_API, {
      query: SEARCH_QUERY,
      variables: { query },
    });
    return (data.data?.Page?.media ?? []).map((m: AniListMedia) => this.toEntry(m));
  }

  async getAnime(input: string): Promise<SourceAnimeDetail | null> {
    const id = parseInt(input, 10);
    if (isNaN(id)) return null;
    try {
      const { data } = await axios.post(ANILIST_API, {
        query: DETAIL_QUERY,
        variables: { id },
      });
      const media: AniListMedia | undefined = data.data?.Media;
      if (!media) return null;
      return this.toDetail(media);
    } catch {
      return null;
    }
  }

  async getEpisodes(animeId: string): Promise<SourceEpisode[]> {
    return (await this.getAnime(animeId))?.episodes ?? [];
  }

  async resolveEpisodeUrl(_animeSlug: string, _episodeNumber: number): Promise<string | null> {
    return null;
  }

  async getPopular(page = 1): Promise<SourceAnimeEntry[]> {
    const { data } = await axios.post(ANILIST_API, {
      query: POPULAR_QUERY,
      variables: { page, perPage: 20 },
    });
    return (data.data?.Page?.media ?? []).map((m: AniListMedia) => this.toEntry(m));
  }

  async searchRaw(query: string, perPage = 20): Promise<Record<string, unknown>[]> {
    const { data } = await axios.post(ANILIST_API, {
      query: SEARCH_QUERY,
      variables: { query, perPage },
    });
    return data.data?.Page?.media ?? [];
  }

  async getPopularRaw(page = 1, perPage = 20): Promise<Record<string, unknown>[]> {
    const { data } = await axios.post(ANILIST_API, {
      query: POPULAR_QUERY,
      variables: { page, perPage },
    });
    return data.data?.Page?.media ?? [];
  }

  async getTrending(page = 1, perPage = 20): Promise<Record<string, unknown>[]> {
    const { data } = await axios.post(ANILIST_API, {
      query: TRENDING_QUERY,
      variables: { page, perPage },
    });
    return data.data?.Page?.media ?? [];
  }

  async getSeasonal(page = 1, perPage = 20, season?: string, seasonYear?: number): Promise<Record<string, unknown>[]> {
    const now = new Date();
    const s = season ?? ['WINTER', 'SPRING', 'SUMMER', 'FALL'][Math.floor(now.getMonth() / 3)];
    const y = seasonYear ?? now.getFullYear();
    const { data } = await axios.post(ANILIST_API, {
      query: SEASONAL_QUERY,
      variables: { page, perPage, season: s, seasonYear: y },
    });
    return data.data?.Page?.media ?? [];
  }

  async getTopRated(page = 1, perPage = 20): Promise<Record<string, unknown>[]> {
    const { data } = await axios.post(ANILIST_API, {
      query: TOP_RATED_QUERY,
      variables: { page, perPage },
    });
    return data.data?.Page?.media ?? [];
  }

  async getAiring(page = 1, perPage = 20): Promise<Record<string, unknown>[]> {
    const { data } = await axios.post(ANILIST_API, {
      query: AIRING_QUERY,
      variables: { page, perPage },
    });
    return data.data?.Page?.media ?? [];
  }

  async getMovies(page = 1, perPage = 20): Promise<Record<string, unknown>[]> {
    const { data } = await axios.post(ANILIST_API, {
      query: MOVIES_QUERY,
      variables: { page, perPage },
    });
    return data.data?.Page?.media ?? [];
  }

  async getLatest(page = 1, perPage = 20): Promise<Record<string, unknown>[]> {
    const { data } = await axios.post(ANILIST_API, {
      query: LATEST_QUERY,
      variables: { page, perPage },
    });
    return data.data?.Page?.media ?? [];
  }

  async health(): Promise<boolean> {
    try {
      await axios.post(ANILIST_API, {
        query: 'query { Page(perPage: 1) { media(type: ANIME) { id } } }',
      }, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  private toEntry(media: AniListMedia): SourceAnimeEntry {
    return {
      title: media.title?.english ?? media.title?.romaji ?? '',
      slug: String(media.id),
      synopsis: media.description?.replace(/<[^>]*>/g, '').trim(),
      posterUrl: media.coverImage?.large,
      genres: media.genres,
      score: media.averageScore ? media.averageScore / 10 : undefined,
      source: this.name,
    };
  }

  private toDetail(media: AniListMedia): SourceAnimeDetail {
    return {
      ...this.toEntry(media),
      status: media.status,
      season: media.season,
      studio: media.studios?.nodes?.[0]?.name,
      episodes: Array.isArray(media.episodes)
        ? media.episodes.map((ep) => ({
            number: ep.number,
            title: ep.title,
            videoUrls: {},
          }))
        : [],
    };
  }
}
