import { animeRouter } from "./routers/anime";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  anime: animeRouter,
});

export type AppRouter = typeof appRouter;