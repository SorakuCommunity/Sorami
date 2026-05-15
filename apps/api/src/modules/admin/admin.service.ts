import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalAnime,
      totalUsers,
      totalEpisodes,
      totalComments,
      activeStreams,
      recentHealth,
    ] = await Promise.all([
      this.prisma.anime.count(),
      this.prisma.user.count(),
      this.prisma.episode.count(),
      this.prisma.comment.count(),
      this.prisma.streamingServer.count({ where: { isActive: true } }),
      this.prisma.serverHealth.findMany({
        distinct: ['serverId'],
        orderBy: { checkedAt: 'desc' },
        include: { server: { select: { name: true, slug: true, type: true } } },
      }),
    ]);

    return {
      totalAnime,
      totalUsers,
      totalEpisodes,
      totalComments,
      activeStreams,
      providerHealth: recentHealth.map((h: any) => ({
        server: h.server,
        status: h.status,
        latency: h.latency,
        error: h.error,
        checkedAt: h.checkedAt,
      })),
    };
  }

  async getProviders() {
    const servers = await this.prisma.streamingServer.findMany({
      include: {
        healthChecks: {
          orderBy: { checkedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { priority: 'asc' },
    });

    return servers.map((s: any) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      type: s.type,
      baseUrl: s.baseUrl,
      region: s.region,
      priority: s.priority,
      isActive: s.isActive,
      lastHealth: s.healthChecks[0] ?? null,
    }));
  }

  async updateProvider(slug: string, data: { isActive?: boolean; priority?: number }) {
    const server = await this.prisma.streamingServer.findUnique({ where: { slug } });
    if (!server) throw new NotFoundException(`Provider "${slug}" not found`);

    return this.prisma.streamingServer.update({
      where: { slug },
      data: {
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.priority !== undefined && { priority: data.priority }),
      },
    });
  }

  async getMappings(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.animeMapping.findMany({
        include: {
          anime: { select: { id: true, title: true, slug: true } },
        },
        orderBy: [{ provider: 'asc' }, { externalId: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.animeMapping.count(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createMapping(data: {
    animeId: string;
    provider: string;
    externalId: string;
    externalSlug?: string;
    title?: string;
    url?: string;
    isPrimary?: boolean;
    language?: string;
  }) {
    return this.prisma.animeMapping.create({
      data: {
        animeId: data.animeId,
        provider: data.provider as any,
        externalId: data.externalId,
        externalSlug: data.externalSlug,
        title: data.title,
        url: data.url,
        isPrimary: data.isPrimary ?? false,
        language: data.language ?? 'en',
      },
    });
  }

  async updateMapping(id: string, data: {
    externalId?: string;
    externalSlug?: string;
    title?: string;
    url?: string;
    isPrimary?: boolean;
    language?: string;
  }) {
    const mapping = await this.prisma.animeMapping.findUnique({ where: { id } });
    if (!mapping) throw new NotFoundException('Mapping not found');

    return this.prisma.animeMapping.update({ where: { id }, data });
  }

  async triggerSync(animeId: string) {
    this.logger.log(`Sync triggered for anime ${animeId}`);
    return { message: `Sync queued for anime ${animeId}`, animeId };
  }

  async getStreamAnalytics() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      recentHealthChecks,
      totalWatchHistory,
    ] = await Promise.all([
      this.prisma.serverHealth.findMany({
        where: { checkedAt: { gte: thirtyDaysAgo } },
        include: { server: { select: { name: true, slug: true } } },
        orderBy: { checkedAt: 'desc' },
      }),
      this.prisma.watchHistory.count({
        where: { watchedAt: { gte: thirtyDaysAgo } },
      }),
    ]);

    const failures = recentHealthChecks.filter((h: any) => h.status === 'down' || h.status === 'error');
    const avgLatency = recentHealthChecks
      .filter((h: any) => h.latency != null)
      .reduce((acc: number, h: any) => acc + (h.latency ?? 0), 0) / Math.max(recentHealthChecks.filter((h: any) => h.latency != null).length, 1);

    return {
      totalStreams: totalWatchHistory,
      totalFailures: failures.length,
      avgLatency: Math.round(avgLatency),
      failures,
      healthByServer: recentHealthChecks.reduce((acc: any, h: any) => {
        const key = h.server.slug;
        if (!acc[key]) acc[key] = [];
        acc[key].push({ status: h.status, latency: h.latency, checkedAt: h.checkedAt });
        return acc;
      }, {} as Record<string, any[]>),
    };
  }

  async getHealth() {
    const dbConnected = this.prisma.isConnected;

    const [animeCount, userCount, activeServers, recentHealth] = await Promise.all([
      this.prisma.anime.count().catch(() => -1),
      this.prisma.user.count().catch(() => -1),
      this.prisma.streamingServer.count({ where: { isActive: true } }).catch(() => -1),
      this.prisma.serverHealth.findMany({
        distinct: ['serverId'],
        orderBy: { checkedAt: 'desc' },
        take: 10,
      }).catch(() => [] as any[]),
    ]);

    const allHealthy = recentHealth.length > 0
      ? recentHealth.every((h: any) => h.status === 'healthy')
      : true;

    return {
      status: dbConnected && animeCount >= 0 ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      database: { connected: dbConnected, animeCount, userCount },
      streaming: { activeServers, serverHealth: recentHealth },
      overall: allHealthy ? 'healthy' : 'degraded',
    };
  }
}
