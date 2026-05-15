// Mock prisma client for build-time
// When PRisma client is generated, replace this with the actual import

let prisma: any;

try {
  // Dynamic import to avoid build errors
  const { PrismaClient } = require("@prisma/client");
  const globalForPrisma = globalThis as unknown as {
    prisma: typeof PrismaClient | undefined;
  };
  
  prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
  
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
} catch (e) {
  // During build without generated client, use mock
  console.warn("Prisma client not available, using mock");
  prisma = {
    user: {
      findUnique: async () => null,
      update: async () => null,
    },
    anime: {
      findUnique: async () => null,
      findMany: async () => [],
    },
    episode: {
      findMany: async () => [],
    },
    favorite: {
      findMany: async () => [],
      create: async () => null,
      delete: async () => null,
    },
    watchHistory: {
      findUnique: async () => null,
      upsert: async () => null,
      findMany: async () => [],
    },
  };
}

export { prisma };