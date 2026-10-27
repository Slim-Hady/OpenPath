import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { PrismaClient, type Role } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const rootEnv = resolve(__dirname, '../../../.env');
if (existsSync(rootEnv)) config({ path: rootEnv });

const prisma = new PrismaClient();
const PASSWORD = process.env.SEED_PASSWORD ?? 'OpenSource!2026';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.STORAGE_BUCKET ?? 'cvs';

if (!supabaseUrl || !serviceRole) {
  throw new Error('Supabase URL and service role key are required to seed auth users');
}

const admin = createClient(supabaseUrl, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface SeedUser {
  email: string;
  name: string;
  username: string;
  role: Role;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  languages: string[];
  skills: string[];
  description: string;
  mentor?: boolean;
  published?: boolean;
  githubLogin?: string;
}

const USERS: SeedUser[] = [
  {
    email: 'dev@osh.dev',
    name: 'Amina Developer',
    username: 'amina',
    role: 'DEVELOPER',
    level: 'BEGINNER',
    languages: ['TypeScript', 'Python'],
    skills: ['React', 'Node.js', 'Tailwind', 'Git'],
    description: 'Front-end developer learning open source. I have shipped small UI fixes and want my first merged PR.',
    published: true,
  },
  {
    email: 'maintainer@osh.dev',
    name: 'Youssef Maintainer',
    username: 'youssef',
    role: 'MAINTAINER',
    level: 'ADVANCED',
    languages: ['TypeScript', 'Go', 'Rust'],
    skills: ['Next.js', 'NestJS', 'PostgreSQL', 'Docker'],
    description: 'Maintainer of two TypeScript projects. Happy to mentor first-time contributors.',
    mentor: true,
    published: true,
    githubLogin: 'octocat',
  },
  {
    email: 'admin@osh.dev',
    name: 'Admin Operator',
    username: 'admin',
    role: 'ADMIN',
    level: 'INTERMEDIATE',
    languages: ['TypeScript'],
    skills: ['Operations'],
    description: 'Platform administrator.',
  },
  {
    email: 'sam@osh.dev',
    name: 'Sam Contributor',
    username: 'sam',
    role: 'DEVELOPER',
    level: 'INTERMEDIATE',
    languages: ['Python', 'Go'],
    skills: ['FastAPI', 'PostgreSQL', 'Docker', 'Testing'],
    description: 'Backend contributor who enjoys testing and developer tooling.',
    mentor: true,
    published: true,
    githubLogin: 'defunkt',
  },
];

async function ensureAuthUser(user: SeedUser): Promise<string> {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw new Error(`Could not list Supabase users: ${error.message}`);
  const existing = data.users.find((candidate) => candidate.email === user.email);
  if (existing) {
    const { error: updateError } = await admin.auth.admin.updateUserById(existing.id, {
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: user.name, user_name: user.username },
    });
    if (updateError) throw new Error(`Could not update ${user.email}: ${updateError.message}`);
    return existing.id;
  }
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: user.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: user.name, user_name: user.username },
  });
  if (createError || !created.user) {
    throw new Error(`Could not create ${user.email}: ${createError?.message}`);
  }
  return created.user.id;
}

async function ensureBucket(): Promise<void> {
  const response = await fetch(`${supabaseUrl!.replace(/\/$/, '')}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      apikey: serviceRole!,
      Authorization: `Bearer ${serviceRole!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: bucket, name: bucket, public: false, file_size_limit: 5_242_880 }),
  });
  if (!response.ok && response.status !== 409) {
    const text = await response.text();
    if (!text.includes('already exists')) {
      console.warn(`storage bucket: ${response.status} ${text.slice(0, 120)}`);
    }
  }
}

const LEARNING = [
  {
    slug: 'git-basics',
    title: 'Git basics for your first contribution',
    topic: 'Git basics',
    summary: 'Clone, branch, commit and push without guessing.',
    readingMinutes: 6,
    body: `Git records snapshots of your work. A contribution is a small, reviewable change on a branch, not a pile of unrelated edits.\n\nStart by forking the repository on GitHub, then clone your fork. Create a branch named after the change. Commit in small steps with messages that say what changed and why. Push the branch to your fork.\n\nBefore you push, run git status and git diff. You should be able to explain every changed line. If an unrelated file changed, revert it instead of committing it.`,
  },
  {
    slug: 'branches-and-forks',
    title: 'Branches, forks and staying up to date',
    topic: 'Branches',
    summary: 'Keep your branch focused and current without rewriting someone else’s history.',
    readingMinutes: 5,
    body: `A fork is your copy of the repository. A branch is a named line of work inside a copy. Keep one branch per pull request.\n\nIf the default branch moves while you work, fetch it and merge it into your branch. Resolve conflicts by understanding both sides; never accept one side blindly.\n\nDo not force-push a branch that a maintainer is reviewing unless they ask. A clean history matters less than a reviewable change.`,
  },
  {
    slug: 'pull-requests',
    title: 'Open a pull request a maintainer can review',
    topic: 'Pull requests',
    summary: 'A good PR explains the problem, the change and the test evidence.',
    readingMinutes: 7,
    body: `Open a pull request against the repository's default branch from your fork. Link the issue in the description so the discussion stays in one place.\n\nUse a short title. In the body, say what was broken, what you changed and how you verified it. Include the exact test command you ran. Add screenshots for visible UI changes, never for secrets or personal data.\n\nKeep the diff small. If you discover a second problem, open a second issue or PR. Reviewers can help with a focused change; they cannot review a rewrite.`,
  },
  {
    slug: 'run-the-tests',
    title: 'Run the right tests before you push',
    topic: 'Tests',
    summary: 'Find the smallest test that proves your change and make it fail first.',
    readingMinutes: 5,
    body: `Read CONTRIBUTING.md and the test section of the README before running anything. Start with the smallest test file that covers the area you changed.\n\nWhen you fix a bug, write a failing test first. Run it, confirm the failure, then change the code until it passes. This proves the test is connected to the behaviour.\n\nBefore opening the pull request, run the project's lint and type-check commands as well. Paste the commands and their result into the PR body.`,
  },
  {
    slug: 'contribution-etiquette',
    title: 'Contribution etiquette',
    topic: 'Etiquette',
    summary: 'How to ask, wait, disagree and follow up without burning goodwill.',
    readingMinutes: 4,
    body: `Say what you are trying to do and what you already checked. Maintainers are volunteers; a precise question is a gift, a demand is not.\n\nClaim an issue in a comment and wait for a reply before doing large work. If you cannot continue, say so early so someone else can pick it up.\n\nWhen a reviewer requests a change, reply with what you changed and where. If you disagree, explain the trade-off with evidence. Never argue about tone in a code comment.`,
  },
  {
    slug: 'code-review',
    title: 'Reviewing your own diff first',
    topic: 'Reviews',
    summary: 'A five-minute self-review catches most review comments.',
    readingMinutes: 4,
    body: `Open the diff in your browser and read it as if someone else wrote it. Remove debug logs, commented-out code and unrelated formatting.\n\nCheck the edge cases named in the issue: empty input, permission denied, slow network and a repeated action. Confirm the tests cover the behaviour rather than the implementation.\n\nWrite the PR description for a reviewer who has not read the issue. Link the evidence, not just the conclusion.`,
  },
];

const BADGES = [
  {
    code: 'FIRST_PR',
    name: 'First pull request',
    description: 'You opened your first pull request for an open-source issue.',
    requirement: 'Open a pull request on a selected issue',
    target: 1,
  },
  {
    code: 'FIRST_MERGE',
    name: 'First merge',
    description: 'Your first contribution was merged.',
    requirement: 'Get one pull request merged',
    target: 1,
  },
  {
    code: 'FIVE_CONTRIBUTIONS',
    name: 'Five contributions',
    description: 'Five merged contributions. You are no longer a beginner.',
    requirement: 'Get five pull requests merged',
    target: 5,
  },
];

async function main(): Promise<void> {
  await ensureBucket();
  for (const badge of BADGES) {
    await prisma.badge.upsert({ where: { code: badge.code }, create: badge, update: badge });
  }
  for (const resource of LEARNING) {
    await prisma.learningResource.upsert({
      where: { slug: resource.slug },
      create: { ...resource, kind: 'GUIDE' },
      update: { ...resource, kind: 'GUIDE' },
    });
  }

  for (const user of USERS) {
    const authId = await ensureAuthUser(user);
    const saved = await prisma.user.upsert({
      where: { authId },
      create: {
        authId,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        bio: user.description,
        githubLogin: user.githubLogin ?? null,
        avatarUrl: null,
        lastSeenAt: new Date(),
        profile: {
          create: { description: user.description, experienceLevel: user.level },
        },
        notificationPrefs: {
          create: { channels: ['IN_APP'], frequency: 'INSTANT', eventTypes: {} },
        },
      },
      update: {
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        bio: user.description,
        githubLogin: user.githubLogin ?? null,
        profile: {
          upsert: {
            create: { description: user.description, experienceLevel: user.level },
            update: { description: user.description, experienceLevel: user.level },
          },
        },
      },
    });

    await prisma.userSkill.deleteMany({ where: { userId: saved.id } });
    for (const skillName of user.skills) {
      const skill = await prisma.skill.upsert({
        where: { name: skillName },
        create: { name: skillName },
        update: {},
      });
      await prisma.userSkill.create({
        data: { userId: saved.id, skillId: skill.id, source: 'profile' },
      });
    }
    await prisma.userLanguage.deleteMany({ where: { userId: saved.id } });
    for (const languageName of user.languages) {
      const language = await prisma.language.upsert({
        where: { name: languageName },
        create: { name: languageName },
        update: {},
      });
      await prisma.userLanguage.create({
        data: { userId: saved.id, languageId: language.id, source: 'profile' },
      });
    }

    await prisma.publicProfile.upsert({
      where: { userId: saved.id },
      create: {
        userId: saved.id,
        handle: user.username,
        published: Boolean(user.published),
        mentorOptIn: Boolean(user.mentor),
      },
      update: {
        handle: user.username,
        published: Boolean(user.published),
        mentorOptIn: Boolean(user.mentor),
      },
    });

    if (user.email === 'dev@osh.dev') {
      await prisma.notification.upsert({
        where: { userId_dedupeKey: { userId: saved.id, dedupeKey: 'welcome' } },
        create: {
          userId: saved.id,
          type: 'SYSTEM',
          title: 'Welcome to OpenSource-helper',
          body: 'Finish your profile, then find three issues that fit your stack.',
          link: '/onboarding',
          dedupeKey: 'welcome',
        },
        update: {},
      });
    }
    console.log(`seed: ${user.email} (${user.role})`);
  }

  await prisma.aiSetting.upsert({
    where: { id: 'global' },
    create: {
      id: 'global',
      maxTokensPerUser: Number(process.env.AI_MAX_TOKENS_PER_USER ?? 20000),
      temperature: Number(process.env.AI_TEMPERATURE ?? 0.4),
      usageLimitUsd: Number(process.env.AI_USAGE_LIMIT_USD ?? 5),
    },
    update: {},
  });

  console.log('\nSeed complete.');
  console.log(`Users: dev@osh.dev, maintainer@osh.dev, admin@osh.dev, sam@osh.dev`);
  console.log(`Password for all seeded users: ${PASSWORD}`);
  console.log('Change SEED_PASSWORD before seeding anything non-local.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
