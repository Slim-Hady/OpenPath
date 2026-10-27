import { Injectable } from '@nestjs/common';
import type { Me, Profile, UpdateMe, UpdateProfile } from '@osh/contracts';
import { PrismaService } from '../../prisma/prisma.service';
import { AppError } from '../../common/errors';
import { SchedulerService } from '../../jobs/scheduler.service';

const LANGUAGE_NAMES = new Set([
  'TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Java', 'C#', 'C++', 'C', 'PHP', 'Ruby',
  'Kotlin', 'Swift', 'Dart', 'Elixir', 'Scala', 'HTML', 'CSS', 'SQL', 'Shell', 'R', 'Lua',
]);

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scheduler: SchedulerService,
  ) {}

  async me(userId: string): Promise<Me> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound('User not found');
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      role: user.role,
      github: {
        connected: Boolean(user.githubTokenEnc),
        login: user.githubLogin,
        connectedAt: user.githubConnectedAt?.toISOString() ?? null,
      },
      createdAt: user.createdAt.toISOString(),
      lastSeenAt: user.lastSeenAt?.toISOString() ?? null,
    };
  }

  async updateMe(userId: string, input: UpdateMe): Promise<Me> {
    if (input.username) {
      const existing = await this.prisma.user.findUnique({ where: { username: input.username } });
      if (existing && existing.id !== userId) {
        throw AppError.conflict('USERNAME_TAKEN', 'That username is already in use');
      }
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        username: input.username,
        bio: input.bio,
        avatarUrl: input.avatarUrl,
      },
    });
    return this.me(userId);
  }

  async profile(userId: string): Promise<Profile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        skills: { include: { skill: true } },
        languages: { include: { language: true } },
      },
    });
    if (!user) throw AppError.notFound('User not found');
    const skills = user.skills.map((row) => row.skill.name).sort((a, b) => a.localeCompare(b));
    const languages = user.languages
      .map((row) => row.language.name)
      .sort((a, b) => a.localeCompare(b));
    const experienceLevel = user.profile?.experienceLevel ?? null;
    const completeness = completenessOf({
      experienceLevel,
      languages,
      skills,
      description: user.profile?.description ?? null,
    });
    return {
      description: user.profile?.description ?? null,
      experienceLevel,
      skills,
      languages,
      completeness,
      complete: Boolean(experienceLevel && languages.length > 0),
      updatedAt: user.profile?.updatedAt.toISOString() ?? null,
    };
  }

  async updateProfile(userId: string, input: UpdateProfile): Promise<Profile> {
    if (input.languages) {
      for (const language of input.languages) {
        if (language.length > 40) {
          throw new AppError('INVALID_LANGUAGE', 'Language names are limited to 40 characters');
        }
      }
      if (input.languages.length > 8) {
        throw new AppError('TOO_MANY_LANGUAGES', 'Pick at most 8 languages');
      }
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.developerProfile.upsert({
        where: { userId },
        create: {
          userId,
          description: input.description ?? null,
          experienceLevel: input.experienceLevel ?? null,
        },
        update: {
          description: input.description,
          experienceLevel: input.experienceLevel,
        },
      });
      if (input.skills) {
        await tx.userSkill.deleteMany({ where: { userId } });
        for (const name of input.skills) {
          const cleaned = titleCase(name.trim());
          if (!cleaned) continue;
          const skill = await tx.skill.upsert({
            where: { name: cleaned },
            create: { name: cleaned },
            update: {},
          });
          await tx.userSkill.create({ data: { userId, skillId: skill.id, source: 'manual' } });
        }
      }
      if (input.languages) {
        await tx.userLanguage.deleteMany({ where: { userId } });
        for (const name of input.languages) {
          const cleaned = canonicalLanguage(name.trim());
          if (!cleaned) continue;
          const language = await tx.language.upsert({
            where: { name: cleaned },
            create: { name: cleaned },
            update: {},
          });
          await tx.userLanguage.create({
            data: { userId, languageId: language.id, source: 'manual' },
          });
        }
      }
    });
    await this.prisma.user.update({ where: { id: userId }, data: { lastSeenAt: new Date() } });
    return this.profile(userId);
  }

  async requireComplete(userId: string): Promise<Profile> {
    const profile = await this.profile(userId);
    if (!profile.complete) {
      throw AppError.conflict(
        'PROFILE_INCOMPLETE',
        'Finish your profile to see recommendations. Pick an experience level and at least one language.',
      );
    }
    return profile;
  }

  async history(userId: string) {
    const selections = await this.prisma.selection.findMany({
      where: { userId },
      include: { issue: true, events: { orderBy: { createdAt: 'asc' } } },
      orderBy: { selectedAt: 'desc' },
    });
    const conversations = await this.prisma.chatConversation.findMany({
      where: { userId },
      select: { id: true, issueId: true },
    });
    const conversationByIssue = new Map(conversations.map((row) => [row.issueId, row.id]));
    const ignored = await this.prisma.ignoredIssue.count({ where: { userId } });
    const badges = await this.prisma.userBadge.count({ where: { userId } });
    const stats = {
      selected: selections.length,
      merged: selections.filter((selection) => selection.status === 'MERGED').length,
      ignored,
      prOpen: selections.filter((selection) => selection.status === 'PR_OPEN').length,
      badges,
      chats: conversations.length,
    };
    return {
      items: selections.map((selection) => ({
        selectionId: selection.id,
        issueId: selection.issueId,
        issueTitle: selection.issue.title,
        repoFullName: selection.issue.repoFullName,
        status: selection.status,
        selectedAt: selection.selectedAt.toISOString(),
        conversationId: conversationByIssue.get(selection.issueId) ?? null,
      })),
      stats,
    };
  }

  async requestDeletion(userId: string) {
    const existing = await this.prisma.deletionRequest.findFirst({
      where: { userId, completedAt: null, cancelledAt: null },
    });
    const request =
      existing ??
      (await this.prisma.deletionRequest.create({ data: { userId } }));
    await this.scheduler.enqueueDeletion(request.id);
    return { requested: true as const, requestedAt: new Date().toISOString() };
  }
}

export function completenessOf(input: {
  experienceLevel: string | null;
  languages: string[];
  skills: string[];
  description: string | null;
}): number {
  let score = 0;
  if (input.experienceLevel) score += 40;
  if (input.languages.length > 0) score += 30;
  if (input.skills.length >= 3) score += 20;
  else if (input.skills.length > 0) score += 10;
  if (input.description) score += 10;
  return Math.min(100, score);
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .map((part) => (part.length > 2 ? part[0]?.toUpperCase() + part.slice(1) : part))
    .join(' ')
    .trim();
}

function canonicalLanguage(value: string): string {
  const exact = [...LANGUAGE_NAMES].find((name) => name.toLowerCase() === value.toLowerCase());
  return exact ?? titleCase(value);
}
