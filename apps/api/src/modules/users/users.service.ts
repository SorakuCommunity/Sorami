import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: { username: string; email: string; passwordHash: string }) {
    return this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash: data.passwordHash,
      },
    });
  }

  async update(id: string, data: { username?: string; email?: string; avatar?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async getProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            favorites: true,
            watchlist: true,
            watchHistory: true,
          },
        },
      },
    });

    if (!user) return null;

    const { passwordHash, ...profile } = user;
    return {
      ...profile,
      stats: {
        favoritesCount: profile._count.favorites,
        watchlistCount: profile._count.watchlist,
        totalWatched: profile._count.watchHistory,
      },
    };
  }
}
