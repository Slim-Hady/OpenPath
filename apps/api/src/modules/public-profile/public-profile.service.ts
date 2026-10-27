import { Injectable } from '@nestjs/common';
import type {
  PublicProfile,
  PublicProfileSettings,
  UpdatePublicProfile,
} from '@osh/contracts';
import { PrismaService } from '../../prisma/prisma.service';
import { AppError } from '../../common/errors';
import { getEnv } from '../../config/env';

@Injectable()
export class PublicProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async settings(userId: string): Promise<PublicProfileSettings> {
    let profile = await this.prisma.publicProfile.findUnique({ where: { userId } });
    if (!profile) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw AppError.notFound('User not found');
      profile = await this.prisma.publicProfile.create({
        data: {
          userId,
          handle: await this.uniqueHandle(user.username ?? user.email.split('@')[0] ?? 'developer', user.id),
          published: false,
        },
      });
    }
    return this.toSettings(profile);
  }

  async update(userId: string, input: UpdatePublicProfile): Promise<PublicProfileSettings> {
    const existing = await this.prisma.publicProfile.findUnique({ where: { userId } });
    if (!existing) await this.settings(userId);
    if (input.handle) {
      const taken = await this.prisma.publicProfile.findUnique({ where: { handle: input.handle } });
      if (taken && taken.userId !== userId) {
        throw AppError.conflict('HANDLE_TAKEN', 'That profile link is already in use');
      }
    }
    const updated = await this.prisma.publicProfile.update({
      where: { userId },
      data: {
        handle: input.handle,
        published: input.published,
        mentorOptIn: input.mentorOptIn,
        showSkills: input.showSkills,
        showContributions: input.showContributions,
        showBadges: input.showBadges,
        showStreak: input.showStreak,
      },
    });
    return this.toSettings(updated);
  }

  async public(handle: string): Promise<PublicProfile> {
    const profile = await this.prisma.publicProfile.findUnique({
      where: { handle },
      include: {
        user: {
          include: {
            profile: true,
            skills: { include: { skill: true } },
            languages: { include: { language: true } },
            selections: {
              where: { status: 'MERGED' },
              include: { issue: true },
              orderBy: { updatedAt: 'desc' },
              take: 10,
            },
            badges: { include: { badge: true } },
            streak: true,
          },
        },
      },
    });
    if (!profile || !profile.published) {
      throw AppError.notFound('This profile is private.');
    }
    const [merged, prOpen] = await Promise.all([
      this.prisma.selection.count({ where: { userId: profile.userId, status: 'MERGED' } }),
      this.prisma.selection.count({ where: { userId: profile.userId, status: 'PR_OPEN' } }),
    ]);
    const user = profile.user;
    const badges = user.badges.filter((badge) => badge.publicVisible);
    return {
      handle: profile.handle,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      joinedAt: user.createdAt.toISOString(),
      githubLogin: profile.showContributions ? user.githubLogin : null,
      stats: {
        merged: profile.showContributions ? merged : 0,
        prOpen: profile.showContributions ? prOpen : 0,
        badges: profile.showBadges ? badges.length : 0,
        streak: profile.showStreak ? user.streak?.current ?? 0 : 0,
      },
      skills: profile.showSkills
        ? user.skills.map((row) => row.skill.name)
        : undefined,
      languages: profile.showSkills
        ? user.languages.map((row) => row.language.name)
        : undefined,
      contributions: profile.showContributions
        ? user.selections.map((selection) => ({
            issueTitle: selection.issue.title,
            repoFullName: selection.issue.repoFullName,
            issueUrl: selection.issue.url,
            mergedAt: selection.updatedAt.toISOString(),
          }))
        : undefined,
      badges: profile.showBadges
        ? badges.map((row) => ({
            name: row.badge.name,
            description: row.badge.description,
          }))
        : undefined,
      streak: profile.showStreak
        ? {
            current: user.streak?.current ?? 0,
            longest: user.streak?.longest ?? 0,
          }
        : undefined,
    };
  }

  private toSettings(profile: {
    handle: string;
    published: boolean;
    mentorOptIn: boolean;
    showSkills: boolean;
    showContributions: boolean;
    showBadges: boolean;
    showStreak: boolean;
  }): PublicProfileSettings {
    const base = getEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
    return {
      handle: profile.handle,
      published: profile.published,
      mentorOptIn: profile.mentorOptIn,
      showSkills: profile.showSkills,
      showContributions: profile.showContributions,
      showBadges: profile.showBadges,
      showStreak: profile.showStreak,
      publicUrl: profile.published ? `${base}/u/${profile.handle}` : null,
    };
  }

  private async uniqueHandle(base: string, userId: string): Promise<string> {
    const clean =
      base
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 24) || 'developer';
    const candidate = clean.length >= 3 ? clean : `${clean}-dev`;
    const existing = await this.prisma.publicProfile.findUnique({ where: { handle: candidate } });
    if (!existing) return candidate;
    return `${candidate.slice(0, 26)}-${userId.slice(-4)}`;
  }
}
