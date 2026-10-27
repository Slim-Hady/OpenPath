import { Injectable } from '@nestjs/common';
import type {
  CreateSavedList,
  SavedItem,
  SavedList,
  SavedListDetail,
  SaveItem,
  Selection,
} from '@osh/contracts';
import { PrismaService } from '../../prisma/prisma.service';
import { AppError } from '../../common/errors';
import { mapGithubIssue } from '../github/github.service';
import { SelectionService } from '../selection/selection.service';

@Injectable()
export class SavedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly selection: SelectionService,
  ) {}

  async lists(userId: string): Promise<SavedList[]> {
    await this.ensureDefault(userId);
    const lists = await this.prisma.savedList.findMany({
      where: { userId },
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return lists.map((list) => ({
      id: list.id,
      name: list.name,
      itemCount: list._count.items,
      createdAt: list.createdAt.toISOString(),
      updatedAt: list.updatedAt.toISOString(),
    }));
  }

  async createList(userId: string, input: CreateSavedList): Promise<SavedList> {
    const existing = await this.prisma.savedList.findUnique({
      where: { userId_name: { userId, name: input.name } },
    });
    if (existing) throw AppError.conflict('LIST_EXISTS', 'You already have a list with that name');
    const list = await this.prisma.savedList.create({ data: { userId, name: input.name } });
    return {
      id: list.id,
      name: list.name,
      itemCount: 0,
      createdAt: list.createdAt.toISOString(),
      updatedAt: list.updatedAt.toISOString(),
    };
  }

  async renameList(userId: string, id: string, name: string): Promise<SavedList> {
    await this.requireList(userId, id);
    const list = await this.prisma.savedList.update({
      where: { id },
      data: { name },
      include: { _count: { select: { items: true } } },
    });
    return {
      id: list.id,
      name: list.name,
      itemCount: list._count.items,
      createdAt: list.createdAt.toISOString(),
      updatedAt: list.updatedAt.toISOString(),
    };
  }

  async deleteList(userId: string, id: string): Promise<{ ok: true }> {
    await this.requireList(userId, id);
    await this.prisma.savedList.delete({ where: { id } });
    await this.ensureDefault(userId);
    return { ok: true };
  }

  async detail(userId: string, id: string): Promise<SavedListDetail> {
    const list = await this.requireList(userId, id, true);
    return {
      id: list.id,
      name: list.name,
      itemCount: list.items.length,
      createdAt: list.createdAt.toISOString(),
      updatedAt: list.updatedAt.toISOString(),
      items: list.items.map((item) => ({
        id: item.id,
        listId: item.listId,
        issue: item.issue ? mapGithubIssue(item.issue) : null,
        repoFullName: item.repoFullName ?? item.issue?.repoFullName ?? null,
        repoUrl: item.repoFullName ? `https://github.com/${item.repoFullName}` : item.issue?.url ?? null,
        issueState:
          item.state === 'UNKNOWN' && item.issue
            ? item.issue.state !== 'open'
              ? 'CLOSED'
              : item.issue.assigned
                ? 'TAKEN'
                : 'OPEN'
            : item.state,
        createdAt: item.createdAt.toISOString(),
      })),
    };
  }

  async add(userId: string, input: SaveItem): Promise<SavedItem> {
    const listId = input.listId ?? (await this.ensureDefault(userId)).id;
    await this.requireList(userId, listId);
    let issueId: string | null = null;
    let repoFullName: string | null = input.repoFullName ?? null;
    if (input.issueId) {
      const issue = await this.prisma.githubIssue.findUnique({ where: { id: input.issueId } });
      if (!issue) throw AppError.notFound('That issue is not available');
      issueId = issue.id;
      repoFullName = issue.repoFullName;
    }
    const existing = await this.prisma.savedItem.findFirst({
      where: issueId ? { listId, issueId } : { listId, repoFullName },
      include: { issue: true },
    });
    if (existing) {
      return this.toItem(existing);
    }
    const item = await this.prisma.savedItem.create({
      data: { listId, userId, issueId, repoFullName },
      include: { issue: true },
    });
    return this.toItem(item);
  }

  async move(userId: string, itemId: string, listId: string): Promise<SavedItem> {
    const item = await this.prisma.savedItem.findUnique({ where: { id: itemId }, include: { issue: true } });
    if (!item || item.userId !== userId) throw AppError.notFound('Saved item not found');
    await this.requireList(userId, listId);
    const moved = await this.prisma.savedItem.update({
      where: { id: itemId },
      data: { listId },
      include: { issue: true },
    });
    return this.toItem(moved);
  }

  async remove(userId: string, itemId: string): Promise<{ ok: true }> {
    const item = await this.prisma.savedItem.findUnique({ where: { id: itemId } });
    if (!item || item.userId !== userId) throw AppError.notFound('Saved item not found');
    await this.prisma.savedItem.delete({ where: { id: itemId } });
    return { ok: true };
  }

  async select(userId: string, itemId: string): Promise<Selection> {
    const item = await this.prisma.savedItem.findUnique({ where: { id: itemId } });
    if (!item || item.userId !== userId) throw AppError.notFound('Saved item not found');
    if (!item.issueId) {
      throw AppError.conflict('REPO_ONLY', 'Save the issue itself to start working on it');
    }
    return this.selection.select(userId, { issueId: item.issueId, confirmed: true });
  }

  private async ensureDefault(userId: string) {
    const existing = await this.prisma.savedList.findFirst({
      where: { userId, name: 'Later' },
    });
    if (existing) return existing;
    return this.prisma.savedList.create({ data: { userId, name: 'Later' } });
  }

  private async requireList(
    userId: string,
    id: string,
    withItems = false,
  ): Promise<{
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    items: Array<{
      id: string;
      listId: string;
      issueId: string | null;
      repoFullName: string | null;
      state: 'OPEN' | 'CLOSED' | 'TAKEN' | 'UNKNOWN';
      createdAt: Date;
      issue: Parameters<typeof mapGithubIssue>[0] | null;
    }>;
  }> {
    const list = await this.prisma.savedList.findUnique({
      where: { id },
      include: withItems
        ? { items: { include: { issue: true }, orderBy: { createdAt: 'desc' } } }
        : { items: { select: { id: true, listId: true, issueId: true, repoFullName: true, state: true, createdAt: true } } },
    });
    if (!list || list.userId !== userId) throw AppError.notFound('List not found');
    return list as never;
  }

  private toItem(item: {
    id: string;
    listId: string;
    repoFullName: string | null;
    state: string;
    createdAt: Date;
    issue: Parameters<typeof mapGithubIssue>[0] | null;
  }): SavedItem {
    return {
      id: item.id,
      listId: item.listId,
      issue: item.issue ? mapGithubIssue(item.issue) : null,
      repoFullName: item.repoFullName ?? item.issue?.repoFullName ?? null,
      repoUrl: item.repoFullName
        ? `https://github.com/${item.repoFullName}`
        : item.issue?.url ?? null,
      issueState: item.state as SavedItem['issueState'],
      createdAt: item.createdAt.toISOString(),
    };
  }
}
