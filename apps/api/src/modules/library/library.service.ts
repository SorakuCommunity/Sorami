import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LibraryService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // Favorites
  // ---------------------------------------------------------------------------

  async getFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        anime: {
          select: {
            id: true, slug: true, title: true, posterUrl: true,
            genres: true, score: true, status: true, episodes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((f: any) => f.anime);
  }

  async addFavorite(userId: string, animeId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_animeId: { userId, animeId } },
    });
    if (existing) throw new ConflictException('Already in favorites');

    await this.prisma.favorite.create({ data: { userId, animeId } });
  }

  async removeFavorite(userId: string, animeId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_animeId: { userId, animeId } },
    });
    if (!existing) throw new NotFoundException('Favorite not found');

    await this.prisma.favorite.delete({ where: { id: existing.id } });
  }

  // ---------------------------------------------------------------------------
  // Watchlist
  // ---------------------------------------------------------------------------

  async getWatchlist(userId: string) {
    return this.prisma.watchlist.findMany({
      where: { userId },
      include: {
        anime: {
          select: {
            id: true, slug: true, title: true, posterUrl: true,
            genres: true, score: true, status: true, episodes: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async addToWatchlist(userId: string, animeId: string, status = 'PLANNING') {
    const existing = await this.prisma.watchlist.findUnique({
      where: { userId_animeId: { userId, animeId } },
    });
    if (existing) throw new ConflictException('Already in watchlist');

    await this.prisma.watchlist.create({ data: { userId, animeId, status } });
  }

  async removeFromWatchlist(userId: string, animeId: string) {
    const existing = await this.prisma.watchlist.findUnique({
      where: { userId_animeId: { userId, animeId } },
    });
    if (!existing) throw new NotFoundException('Watchlist item not found');

    await this.prisma.watchlist.delete({ where: { id: existing.id } });
  }

  async updateWatchlistItem(userId: string, animeId: string, data: { status?: string; progress?: number }) {
    const existing = await this.prisma.watchlist.findUnique({
      where: { userId_animeId: { userId, animeId } },
    });
    if (!existing) throw new NotFoundException('Watchlist item not found');

    return this.prisma.watchlist.update({
      where: { id: existing.id },
      data,
    });
  }

  // ---------------------------------------------------------------------------
  // History
  // ---------------------------------------------------------------------------

  async getHistory(userId: string) {
    return this.prisma.watchHistory.findMany({
      where: { userId },
      include: {
        episode: {
          include: {
            anime: {
              select: {
                id: true, slug: true, title: true, posterUrl: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
  }

  async updateProgress(userId: string, episodeId: string, progress: number) {
    const episode = await this.prisma.episode.findUnique({ where: { id: episodeId } });
    if (!episode) throw new NotFoundException('Episode not found');

    const completed = progress >= 0.95;

    const history = await this.prisma.watchHistory.upsert({
      where: { userId_episodeId: { userId, episodeId } },
      update: {
        progress,
        completed,
        watchedAt: new Date(),
      },
      create: {
        userId,
        episodeId,
        progress,
        completed,
      },
    });

    if (completed) {
      await this.prisma.watchlist.upsert({
        where: { userId_animeId: { userId, animeId: episode.animeId } },
        update: { progress: { increment: 1 }, status: 'WATCHING' },
        create: { userId, animeId: episode.animeId, status: 'WATCHING', progress: 1 },
      });
    }

    return history;
  }

  async getContinueWatching(userId: string) {
    const historyEntries = await this.prisma.watchHistory.findMany({
      where: {
        userId,
        completed: false,
        progress: { gt: 0 },
      },
      include: {
        episode: {
          include: {
            anime: {
              select: {
                id: true, slug: true, title: true, posterUrl: true,
                bannerUrl: true, episodes: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    const seen = new Map<string, typeof historyEntries[0]>();
    for (const entry of historyEntries) {
      const animeId = entry.episode.animeId;
      if (!seen.has(animeId) || entry.updatedAt > seen.get(animeId)!.updatedAt) {
        seen.set(animeId, entry);
      }
    }

    return Array.from(seen.values()).map((entry) => ({
      anime: entry.episode.anime,
      episode: {
        id: entry.episode.id,
        number: entry.episode.number,
        title: entry.episode.title,
      },
      progress: entry.progress,
      watchedAt: entry.watchedAt,
    }));
  }
}
