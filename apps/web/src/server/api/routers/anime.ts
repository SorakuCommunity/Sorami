import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

const MOCK_SPOTLIGHT = [
  {
    id: "1",
    title: "Demon Slayer: Kimetsu no Yaiba",
    titleEnglish: "Demon Slayer",
    poster: "https://cdn.myanimelist.net/images/anime/1286/99835l.jpg",
    cover: "https://cdn.myanimelist.net/images/anime/1286/99835l.jpg",
    description:
      "A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon slowly. Tanjiro sets out to become a demon slayer to avenge his family and cure his sister.",
    rating: 88,
    episodes: 26,
    totalEpisodes: 26,
    status: "COMPLETED",
    year: 2019,
    type: "TV",
    genres: ["Action", "Drama", "Fantasy", "Supernatural"],
  },
  {
    id: "2",
    title: "Jujutsu Kaisen",
    titleEnglish: "Jujutsu Kaisen",
    poster: "https://cdn.myanimelist.net/images/anime/1295/106927l.jpg",
    cover: "https://cdn.myanimelist.net/images/anime/1295/106927l.jpg",
    description:
      "Yuji Itadori is a boy with tremendous physical strength. To save a classmate from curses, Yuji swallows a cursed object...",
    rating: 87,
    episodes: 24,
    totalEpisodes: 24,
    status: "COMPLETED",
    year: 2020,
    type: "TV",
    genres: ["Action", "Dark Fantasy", "Supernatural"],
  },
  {
    id: "3",
    title: "One Piece",
    titleEnglish: "One Piece",
    poster: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg",
    cover: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg",
    description:
      "Monkey D. Luffy and his pirate crew search for the ultimate treasure, the One Piece, left by the legendary pirate Gol D. Roger.",
    rating: 89,
    episodes: 1000,
    totalEpisodes: 1000,
    status: "ONGOING",
    year: 1999,
    type: "TV",
    genres: ["Action", "Adventure", "Comedy", "Shounen"],
  },
  {
    id: "4",
    title: "Attack on Titan",
    titleEnglish: "Attack on Titan",
    poster: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg",
    cover: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg",
    description:
      "Humanity fights for survival against giant humanoid Titans behind enormous walls. Eren Yeager joins the Survey Corps.",
    rating: 90,
    episodes: 87,
    totalEpisodes: 87,
    status: "COMPLETED",
    year: 2013,
    type: "TV",
    genres: ["Action", "Drama", "Fantasy", "Mystery"],
  },
  {
    id: "5",
    title: "My Hero Academia",
    titleEnglish: "My Hero Academia",
    poster: "https://cdn.myanimelist.net/images/anime/10/71745l.jpg",
    cover: "https://cdn.myanimelist.net/images/anime/10/71745l.jpg",
    description:
      "In a world where 80% of humans have superpowers, Izuku Midoriya dreams of becoming a hero despite being born Quirkless.",
    rating: 85,
    episodes: 138,
    totalEpisodes: 138,
    status: "COMPLETED",
    year: 2016,
    type: "TV",
    genres: ["Action", "Comedy", "School", "Shounen"],
  },
  {
    id: "6",
    title: "Chainsaw Man",
    titleEnglish: "Chainsaw Man",
    poster: "https://cdn.myanimelist.net/images/anime/169387l.jpg",
    cover: "https://cdn.myanimelist.net/images/anime/169387l.jpg",
    description: "Denji has a simple dream - to live a happy and peaceful life. As a Devil Hunter, his reality is far from it.",
    rating: 86,
    episodes: 12,
    totalEpisodes: 12,
    status: "COMPLETED",
    year: 2022,
    type: "TV",
    genres: ["Action", "Dark Fantasy", "Supernatural"],
  },
];

const MOCK_TRENDING = [
  { id: "1", title: "Attack on Titan", poster: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg", rating: 9.0, episodes: 87, type: "TV", status: "COMPLETED" },
  { id: "2", title: "Demon Slayer", poster: "https://cdn.myanimelist.net/images/anime/1286/99835l.jpg", rating: 8.8, episodes: 26, type: "TV", status: "COMPLETED" },
  { id: "3", title: "Jujutsu Kaisen", poster: "https://cdn.myanimelist.net/images/anime/1295/106927l.jpg", rating: 8.7, episodes: 24, type: "TV", status: "COMPLETED" },
  { id: "4", title: "One Piece", poster: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg", rating: 8.9, episodes: 1000, type: "TV", status: "ONGOING" },
  { id: "5", title: "Fullmetal Alchemist", poster: "https://cdn.myanimelist.net/images/anime/5/73580l.jpg", rating: 9.1, episodes: 64, type: "TV", status: "COMPLETED" },
  { id: "6", title: "My Hero Academia", poster: "https://cdn.myanimelist.net/images/anime/10/71745l.jpg", rating: 8.5, episodes: 138, type: "TV", status: "COMPLETED" },
  { id: "7", title: "Tokyo Ghoul", poster: "https://cdn.myanimelist.net/images/anime/10/63580l.jpg", rating: 8.3, episodes: 48, type: "TV", status: "COMPLETED" },
  { id: "8", title: "Hunter x Hunter", poster: "https://cdn.myanimelist.net/images/anime/8/63031l.jpg", rating: 9.0, episodes: 148, type: "TV", status: "COMPLETED" },
  { id: "9", title: "Death Note", poster: "https://cdn.myanimelist.net/images/anime/539/96677l.jpg", rating: 8.9, episodes: 37, type: "TV", status: "COMPLETED" },
  { id: "10", title: "Naruto", poster: "https://cdn.myanimelist.net/images/anime/13/17407l.jpg", rating: 8.3, episodes: 220, type: "TV", status: "COMPLETED" },
];

const MOCK_POPULAR = [
  { id: "1", title: "One Piece", poster: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg", rating: 8.9, episodes: 1000, type: "TV", status: "ONGOING" },
  { id: "2", title: "Demon Slayer", poster: "https://cdn.myanimelist.net/images/anime/1286/99835l.jpg", rating: 8.8, episodes: 26, type: "TV", status: "COMPLETED" },
  { id: "3", title: "Jujutsu Kaisen", poster: "https://cdn.myanimelist.net/images/anime/1295/106927l.jpg", rating: 8.7, episodes: 24, type: "TV", status: "COMPLETED" },
  { id: "5", title: "Fullmetal Alchemist", poster: "https://cdn.myanimelist.net/images/anime/5/73580l.jpg", rating: 9.1, episodes: 64, type: "TV", status: "COMPLETED" },
  { id: "6", title: "Hunter x Hunter", poster: "https://cdn.myanimelist.net/images/anime/8/63031l.jpg", rating: 9.0, episodes: 148, type: "TV", status: "COMPLETED" },
];

const MOCK_SEASONAL = [
  { id: "184951", title: "Classroom of the Elite 4th Season", poster: "https://cdn.myanimelist.net/images/anime/172463l.jpg", rating: 82, episodes: 13, type: "TV", status: "ONGOING", year: 2024, genres: ["Drama", "School"], season: "SPRING", seasonYear: 2024 },
  { id: "180745", title: "That Time I Got Reincarnated as a Slime", poster: "https://cdn.myanimelist.net/images/anime/180745l.jpg", rating: 85, episodes: 24, type: "TV", status: "ONGOING", year: 2024, genres: ["Fantasy", "Adventure"], season: "SPRING", seasonYear: 2024 },
  { id: "206150", title: "Frieren: Beyond Journey's End", poster: "https://cdn.myanimelist.net/images/anime/182255l.jpg", rating: 92, episodes: 28, type: "TV", status: "COMPLETED", year: 2024, genres: ["Fantasy", "Drama"], season: "FALL", seasonYear: 2023 },
  { id: "195515", title: "There was a Cute Girl in the Hero's Party", poster: "https://cdn.myanimelist.net/images/anime/195515l.jpg", rating: 78, episodes: 12, type: "TV", status: "ONGOING", year: 2024, genres: ["Romance", "Fantasy"], season: "SPRING", seasonYear: 2024 },
];

const MOCK_UPCOMING = [
  { anime: { id: "199221", title: "Dr. STONE SCIENCE FUTURE Season 3", poster: "https://cdn.myanimelist.net/images/anime/199221l.jpg", type: "TV" }, releaseDate: "2024-11-01", daysUntilRelease: 45, trailer: "" },
  { anime: { id: "170019", title: "The Angel Next Door Spoils Me Rotten2", poster: "https://cdn.myanimelist.net/images/anime/170019l.jpg", type: "TV" }, releaseDate: "2024-06-01", daysUntilRelease: 15, trailer: "" },
  { anime: { id: "195515", title: "There was a Cute Girl in the Hero's Party", poster: "https://cdn.myanimelist.net/images/anime/195515l.jpg", type: "TV" }, releaseDate: "2024-05-15", daysUntilRelease: 5, trailer: "" },
  { anime: { id: "194317", title: "The Beginning After the End Season 2", poster: "https://cdn.myanimelist.net/images/anime/194317l.jpg", type: "TV" }, releaseDate: "2024-10-01", daysUntilRelease: 75, trailer: "" },
];

const MOCK_EPISODES = [
  { id: "ep1", animeId: "1", number: 1, title: "Episode 1", description: "Pilot", releaseDate: "2024-01-01", image: "https://cdn.myanimelist.net/images/anime/1286/99835l.jpg" },
  { id: "ep2", animeId: "2", number: 2, title: "Episode 2", description: "Second Episode", releaseDate: "2024-01-08", image: "https://cdn.myanimelist.net/images/anime/1295/106927l.jpg" },
];

function mapStatus(status?: string): "ONGOING" | "COMPLETED" | "UPCOMING" {
  switch (status?.toLowerCase()) {
    case "ongoing":
    case "releasing":
      return "ONGOING";
    case "completed":
    case "finished":
      return "COMPLETED";
    default:
      return "UPCOMING";
  }
}

export const animeRouter = createTRPCRouter({
  getSpotlight: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(12) }).optional())
    .query(async ({ input }) => {
      return MOCK_SPOTLIGHT.slice(0, input?.limit || 12);
    }),

  getTrending: publicProcedure
    .input(z.object({ page: z.number().min(1).default(1), limit: z.number().min(1).max(20).default(10) }).optional())
    .query(async ({ input }) => {
      const page = input?.page || 1;
      const limit = input?.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      return MOCK_TRENDING.slice(start, end);
    }),

  getPopular: publicProcedure
    .input(z.object({ page: z.number().min(1).default(1), limit: z.number().min(1).max(20).default(10) }).optional())
    .query(async ({ input }) => {
      const page = input?.page || 1;
      const limit = input?.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      return MOCK_POPULAR.slice(start, end);
    }),

  getTopRated: publicProcedure
    .input(z.object({ page: z.number().min(1).default(1), limit: z.number().min(1).max(20).default(10) }).optional())
    .query(async ({ input }) => {
      const page = input?.page || 1;
      const limit = input?.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      const items = MOCK_POPULAR.slice(start, end);
      return items.map((item, index) => ({
        rank: start + index + 1,
        anime: item,
        usersCount: Math.floor(Math.random() * 100000) + 10000,
      }));
    }),

  getSeasonal: publicProcedure
    .input(z.object({ page: z.number().min(1).default(1), limit: z.number().min(1).max(20).default(10) }).optional())
    .query(async ({ input }) => {
      const page = input?.page || 1;
      const limit = input?.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      return MOCK_SEASONAL.slice(start, end);
    }),

  getUpcoming: publicProcedure
    .input(z.object({ page: z.number().min(1).default(1), limit: z.number().min(1).max(20).default(10) }).optional())
    .query(async ({ input }) => {
      const page = input?.page || 1;
      const limit = input?.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      return MOCK_UPCOMING.slice(start, end);
    }),

  getAiringToday: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(10) }).optional())
    .query(async ({ input }) => {
      const limit = input?.limit || 10;
      return MOCK_TRENDING.slice(0, limit).map(item => ({
        anime: { id: item.id, title: item.title, poster: item.poster, banner: item.poster, rating: item.rating, type: item.type },
        episode: 1,
        totalEpisodes: item.episodes,
        nextEpisodeDate: "TBA",
        timeUntilNext: `Episode 1`,
      }));
    }),

  getLatestEpisodes: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(12) }).optional())
    .query(async ({ input }) => {
      const limit = input?.limit || 12;
      return MOCK_EPISODES.slice(0, limit);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const anime = MOCK_SPOTLIGHT.find(a => a.id === input.id);
      if (!anime) return null;
      return anime;
    }),

  getEpisodes: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return MOCK_EPISODES.filter(ep => ep.animeId === input.id);
    }),

  getEpisodeSources: publicProcedure
    .input(z.object({ episodeId: z.string(), server: z.enum(["vidcloud", "streamsb"]).default("vidcloud"), subOrDub: z.enum(["sub", "dub"]).default("sub")}))
    .query(async () => {
      return {
        sources: [{ url: "https://example.com/video.m3u8", quality: "1080p", isM3U8: true }],
        subtitles: [{ url: "https://example.com/sub.vtt", label: "English", lang: "en" }],
        headers: {},
        intro: { start: 0, end: 90 },
        outro: { start: 1380, end: 1470 },
      };
    }),

  search: publicProcedure
    .input(z.object({ query: z.string(), page: z.number().min(1).default(1), limit: z.number().min(1).max(20).default(10), type: z.string().optional(), status: z.string().optional(), genre: z.string().optional() }))
    .query(async ({ input }) => {
      const start = (input.page - 1) * input.limit;
      const end = start + input.limit;
      const results = MOCK_TRENDING.filter(item => item.title.toLowerCase().includes(input.query.toLowerCase()));
      return {
        animes: results.slice(start, end).map(item => ({ ...item, titleEnglish: item.title, genres: ["Action"] })),
        totalPages: Math.ceil(results.length / input.limit),
        currentPage: input.page,
        hasNextPage: end < results.length,
      };
    }),

  getGenres: publicProcedure.query(async () => {
    return ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller"];
  }),

  getByGenre: publicProcedure
    .input(z.object({ genre: z.string(), page: z.number().min(1).default(1), limit: z.number().min(1).max(20).default(10) }))
    .query(async ({ input }) => {
      const start = (input.page - 1) * input.limit;
      const end = start + input.limit;
      return {
        animes: MOCK_TRENDING.slice(start, end),
        totalPages: Math.ceil(MOCK_TRENDING.length / input.limit),
        currentPage: input.page,
        hasNextPage: end < MOCK_TRENDING.length,
      };
    }),

  getRandom: publicProcedure.query(async () => {
    return MOCK_SPOTLIGHT[Math.floor(Math.random() * MOCK_SPOTLIGHT.length)];
  }),
});