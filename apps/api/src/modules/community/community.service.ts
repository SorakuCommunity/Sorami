import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  async getComments(animeId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { animeId },
        include: {
          user: { select: { id: true, username: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({ where: { animeId } }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createComment(animeId: string, userId: string, content: string) {
    const comment = await this.prisma.comment.create({
      data: { animeId, userId, content },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    });

    return comment;
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId) throw new ForbiddenException('Not your comment');

    await this.prisma.comment.delete({ where: { id: commentId } });
  }

  async getRecentActivity(limit = 20) {
    const comments = await this.prisma.comment.findMany({
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        anime: { select: { id: true, title: true, slug: true, posterUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return comments.map((c: any) => ({
      id: c.id,
      type: 'comment' as const,
      user: c.user,
      anime: c.anime,
      content: c.content,
      createdAt: c.createdAt,
    }));
  }
}
