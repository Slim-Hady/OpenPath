import { Injectable } from '@nestjs/common';
import type { LearningResource } from '@osh/contracts';
import { PrismaService } from '../../prisma/prisma.service';
import { AppError } from '../../common/errors';

@Injectable()
export class LearningService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string | undefined, topic: string | undefined) {
    if (query !== undefined && query.trim().length === 0) {
      throw new AppError('EMPTY_QUERY', 'Enter a topic to search', 400);
    }
    const where = {
      ...(topic ? { topic } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: 'insensitive' as const } },
              { summary: { contains: query, mode: 'insensitive' as const } },
              { body: { contains: query, mode: 'insensitive' as const } },
              { topic: { contains: query, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const [rows, topicRows] = await Promise.all([
      this.prisma.learningResource.findMany({ where, orderBy: { topic: 'asc' } }),
      this.prisma.learningResource.findMany({ distinct: ['topic'], select: { topic: true } }),
    ]);
    return {
      items: rows.map(toDto),
      query: query ?? '',
      topics: topicRows.map((row) => row.topic).sort(),
    };
  }

  async bySlug(slug: string): Promise<LearningResource> {
    const row = await this.prisma.learningResource.findUnique({ where: { slug } });
    if (!row) throw AppError.notFound('Resource not found');
    return toDto(row);
  }
}

function toDto(row: {
  id: string;
  slug: string;
  title: string;
  topic: string;
  summary: string;
  body: string;
  kind: string;
  externalUrl: string | null;
  readingMinutes: number;
  updatedAt: Date;
}): LearningResource {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    topic: row.topic,
    summary: row.summary,
    body: row.body,
    kind: row.kind as LearningResource['kind'],
    externalUrl: row.externalUrl,
    readingMinutes: row.readingMinutes,
    updatedAt: row.updatedAt.toISOString(),
  };
}
