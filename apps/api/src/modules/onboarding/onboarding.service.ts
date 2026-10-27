import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import type {
  IssueOnboarding,
  RepositoryOnboarding,
  ResourceLink,
} from '@osh/contracts';
import { PrismaService } from '../../prisma/prisma.service';
import { AppError } from '../../common/errors';
import { GithubService, type RepoContext } from '../github/github.service';
import { AiUsageService } from '../ai/ai-usage.service';
import { GeminiService } from '../ai/gemini.service';
import { GuardrailService } from '../ai/guardrail.service';
import {
  AI_FEATURE,
  ONBOARDING_SYSTEM,
  issuePrompt,
  repositoryPrompt,
} from '../ai/prompts';
import { parseJsonObject } from '../ai/json';

const RepositoryGeneratedSchema = z.object({
  overview: z.string().min(1).max(1200),
  structure: z.string().min(1).max(1000),
  technologies: z.array(z.string().max(60)).max(12),
  firstFiles: z.array(z.object({ path: z.string().max(240), why: z.string().max(240) })).max(6),
  setup: z.array(z.string().max(240)).max(8),
  run: z.array(z.string().max(240)).max(8),
  test: z.array(z.string().max(240)).max(8),
  branchGuidance: z.array(z.string().max(240)).max(8),
  prGuidance: z.array(z.string().max(240)).max(8),
});

const IssueGeneratedSchema = z.object({
  summary: z.string().min(1).max(1600),
  requirements: z.object({
    technologies: z.array(z.string().max(60)).max(10),
    knowledge: z.array(z.string().max(100)).max(10),
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable(),
    prerequisites: z.array(z.string().max(180)).max(8),
  }),
  relatedFiles: z.array(z.object({ path: z.string().max(240), why: z.string().max(240) })).max(6),
  researchTopics: z.array(z.string().max(120)).max(8),
  resources: z
    .array(
      z.object({
        title: z.string().max(120),
        url: z.string().url(),
        kind: z.enum(['documentation', 'guide', 'repository', 'issue', 'video']).optional(),
      }),
    )
    .max(6),
});

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly github: GithubService,
    private readonly aiUsage: AiUsageService,
    private readonly gemini: GeminiService,
    private readonly guardrail: GuardrailService,
  ) {}

  async repository(userId: string, issueId: string): Promise<RepositoryOnboarding> {
    const { issue, selection } = await this.requireSelection(userId, issueId);
    const context = await this.github.repoContext(userId, issue.repoFullName);
    const existing = await this.prisma.repositoryOnboarding.findFirst({
      where: {
        repoFullName: issue.repoFullName,
        ...(context.commitSha ? { commitSha: context.commitSha } : {}),
      },
    });
    if (existing) return this.toRepositoryDto(existing, true);

    let generated: z.infer<typeof RepositoryGeneratedSchema> | null = null;
    try {
      const allowance = await this.aiUsage.assertAllowed(userId, AI_FEATURE.onboarding, 3000);
      const result = await this.gemini.generateJson({
        system: ONBOARDING_SYSTEM,
        prompt: repositoryPrompt({
          repoFullName: issue.repoFullName,
          description: context.description,
          languages: context.languages.join(', '),
          readme: context.readme,
          contributing: context.contributing,
          tree: context.tree.slice(0, 200).join('\n'),
        }),
        temperature: Math.min(allowance.settings.temperature, 0.4),
        maxOutputTokens: 1800,
        timeoutMs: 20_000,
        model: 'gemini-2.5-flash-lite',
        schema: {
          type: 'OBJECT',
          properties: {
            overview: { type: 'STRING' },
            structure: { type: 'STRING' },
            technologies: { type: 'ARRAY', items: { type: 'STRING' } },
            firstFiles: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: { path: { type: 'STRING' }, why: { type: 'STRING' } },
                required: ['path', 'why'],
              },
            },
            setup: { type: 'ARRAY', items: { type: 'STRING' } },
            run: { type: 'ARRAY', items: { type: 'STRING' } },
            test: { type: 'ARRAY', items: { type: 'STRING' } },
            branchGuidance: { type: 'ARRAY', items: { type: 'STRING' } },
            prGuidance: { type: 'ARRAY', items: { type: 'STRING' } },
          },
          required: [
            'overview', 'structure', 'technologies', 'firstFiles', 'setup', 'run',
            'test', 'branchGuidance', 'prGuidance',
          ],
        },
      });
      await this.aiUsage.record({
        userId,
        feature: AI_FEATURE.onboarding,
        model: result.model,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        requestId: selection.id,
      });
      generated = RepositoryGeneratedSchema.parse(parseJsonObject(result.text));
    } catch (error) {
      this.logger.warn(`repository onboarding fallback: ${error instanceof Error ? error.message : 'unknown'}`);
    }

    const safe = generated
      ? {
          overview: this.guardrail.sanitizeField(generated.overview),
          structure: this.guardrail.sanitizeField(generated.structure),
          technologies: generated.technologies.map((item) => this.guardrail.sanitizeField(item)).slice(0, 12),
          firstFiles: generated.firstFiles.map((file) => ({
            path: file.path,
            why: this.guardrail.sanitizeField(file.why),
          })),
          setup: generated.setup.map((item) => this.guardrail.sanitizeField(item)),
          run: generated.run.map((item) => this.guardrail.sanitizeField(item)),
          test: generated.test.map((item) => this.guardrail.sanitizeField(item)),
          branchGuidance: generated.branchGuidance.map((item) => this.guardrail.sanitizeField(item)),
          prGuidance: generated.prGuidance.map((item) => this.guardrail.sanitizeField(item)),
        }
      : fallbackRepository(context, issue);

    const saved = await this.prisma.repositoryOnboarding.create({
      data: {
        repoFullName: issue.repoFullName,
        commitSha: context.commitSha,
        overview: safe.overview,
        structure: safe.structure,
        technologies: safe.technologies,
        firstFiles: safe.firstFiles,
        setup: safe.setup,
        run: safe.run,
        test: safe.test,
        branchGuidance: safe.branchGuidance,
        contributing: context.contributing ? this.guardrail.sanitizeField(context.contributing).slice(0, 6000) : null,
        prGuidance: safe.prGuidance,
        generatedFrom: generated ? `README + tree @ ${context.commitSha ?? 'latest'}` : 'README + tree (rules fallback)',
      },
    });
    return this.toRepositoryDto(saved, false);
  }

  async issueOnboarding(userId: string, issueId: string): Promise<IssueOnboarding> {
    const { issue, selection } = await this.requireSelection(userId, issueId);
    const sourceUpdatedAt = issue.activityAt;
    const existing = await this.prisma.issueOnboarding.findUnique({ where: { issueId } });
    if (
      existing &&
      (!sourceUpdatedAt ||
        !existing.sourceUpdatedAt ||
        existing.sourceUpdatedAt.getTime() === sourceUpdatedAt.getTime())
    ) {
      return this.toIssueDto(existing, true);
    }

    const context = await this.github.repoContext(userId, issue.repoFullName);
    const comments = await this.github
      .issueDetails(userId, issueId)
      .then((details) => details.comments.map((comment) => `${comment.author}: ${comment.body}`).join('\n'))
      .catch(() => '');
    let generated: z.infer<typeof IssueGeneratedSchema> | null = null;
    try {
      const allowance = await this.aiUsage.assertAllowed(userId, AI_FEATURE.onboarding, 3000);
      const result = await this.gemini.generateJson({
        system: ONBOARDING_SYSTEM,
        prompt: issuePrompt({
          issueTitle: issue.title,
          issueBody: (issue.body ?? '').slice(0, 10_000),
          comments: comments.slice(0, 8_000),
          readme: context.readme,
          tree: context.tree.slice(0, 180).join('\n'),
          language: issue.language ?? '',
        }),
        temperature: Math.min(allowance.settings.temperature, 0.4),
        maxOutputTokens: 1600,
        timeoutMs: 20_000,
        model: 'gemini-2.5-flash-lite',
        schema: {
          type: 'OBJECT',
          properties: {
            summary: { type: 'STRING' },
            requirements: {
              type: 'OBJECT',
              properties: {
                technologies: { type: 'ARRAY', items: { type: 'STRING' } },
                knowledge: { type: 'ARRAY', items: { type: 'STRING' } },
                level: { type: 'STRING', enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] },
                prerequisites: { type: 'ARRAY', items: { type: 'STRING' } },
              },
              required: ['technologies', 'knowledge', 'level', 'prerequisites'],
            },
            relatedFiles: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: { path: { type: 'STRING' }, why: { type: 'STRING' } },
                required: ['path', 'why'],
              },
            },
            researchTopics: { type: 'ARRAY', items: { type: 'STRING' } },
            resources: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  title: { type: 'STRING' },
                  url: { type: 'STRING' },
                  kind: { type: 'STRING' },
                },
                required: ['title', 'url'],
              },
            },
          },
          required: ['summary', 'requirements', 'relatedFiles', 'researchTopics', 'resources'],
        },
      });
      await this.aiUsage.record({
        userId,
        feature: AI_FEATURE.onboarding,
        model: result.model,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        requestId: selection.id,
      });
      generated = IssueGeneratedSchema.parse(parseJsonObject(result.text));
    } catch (error) {
      this.logger.warn(`issue onboarding fallback: ${error instanceof Error ? error.message : 'unknown'}`);
    }

    const safe = generated
      ? {
          summary: this.guardrail.sanitizeField(generated.summary),
          requirements: {
            technologies: generated.requirements.technologies
              .map((item) => this.guardrail.sanitizeField(item))
              .slice(0, 10),
            knowledge: generated.requirements.knowledge
              .map((item) => this.guardrail.sanitizeField(item))
              .slice(0, 10),
            level: generated.requirements.level,
            prerequisites: generated.requirements.prerequisites
              .map((item) => this.guardrail.sanitizeField(item))
              .slice(0, 8),
          },
          relatedFiles: generated.relatedFiles.map((file) => ({
            path: file.path,
            why: this.guardrail.sanitizeField(file.why),
          })),
          researchTopics: generated.researchTopics
            .map((topic) => this.guardrail.sanitizeField(topic))
            .slice(0, 8),
          resources: generated.resources.map((resource) => ({
            title: this.guardrail.sanitizeField(resource.title),
            url: resource.url,
            kind: resource.kind ?? 'documentation',
          })),
        }
      : fallbackIssue(issue, context);

    const saved = await this.prisma.issueOnboarding.upsert({
      where: { issueId },
      create: {
        issueId,
        summary: safe.summary,
        requirements: safe.requirements,
        relatedFiles: safe.relatedFiles,
        researchTopics: safe.researchTopics,
        resources: safe.resources,
        generatedFrom: generated ? `Issue + README @ ${context.commitSha ?? 'latest'}` : 'Issue + tree (rules fallback)',
        sourceUpdatedAt,
      },
      update: {
        summary: safe.summary,
        requirements: safe.requirements,
        relatedFiles: safe.relatedFiles,
        researchTopics: safe.researchTopics,
        resources: safe.resources,
        generatedFrom: generated ? `Issue + README @ ${context.commitSha ?? 'latest'}` : 'Issue + tree (rules fallback)',
        sourceUpdatedAt,
      },
    });
    return this.toIssueDto(saved, false);
  }

  private async requireSelection(userId: string, issueId: string) {
    const selection = await this.prisma.selection.findUnique({
      where: { userId_issueId: { userId, issueId } },
      include: { issue: true },
    });
    if (!selection) {
      throw AppError.notFound('Select that issue before opening onboarding');
    }
    return { selection, issue: selection.issue };
  }

  private toRepositoryDto(
    row: {
      repoFullName: string;
      commitSha: string | null;
      overview: string;
      structure: string;
      technologies: string[];
      firstFiles: unknown;
      setup: string[];
      run: string[];
      test: string[];
      branchGuidance: string[];
      contributing: string | null;
      prGuidance: string[];
      generatedFrom: string;
      generatedAt: Date;
      updatedAt: Date;
    },
    cached: boolean,
  ): RepositoryOnboarding {
    return {
      repoFullName: row.repoFullName,
      commitSha: row.commitSha,
      overview: row.overview,
      structure: row.structure,
      technologies: row.technologies,
      firstFiles: (row.firstFiles as Array<{ path: string; why: string }>) ?? [],
      setup: row.setup,
      run: row.run,
      test: row.test,
      branchGuidance: row.branchGuidance,
      contributing: row.contributing,
      prGuidance: row.prGuidance,
      generatedFrom: row.generatedFrom,
      generatedAt: row.generatedAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      cached,
    };
  }

  private toIssueDto(
    row: {
      issueId: string;
      summary: string;
      requirements: unknown;
      relatedFiles: unknown;
      researchTopics: string[];
      resources: unknown;
      generatedFrom: string;
      generatedAt: Date;
      sourceUpdatedAt: Date | null;
    },
    cached: boolean,
  ): IssueOnboarding {
    return {
      issueId: row.issueId,
      summary: row.summary,
      requirements: row.requirements as IssueOnboarding['requirements'],
      relatedFiles: (row.relatedFiles as Array<{ path: string; why: string }>) ?? [],
      researchTopics: row.researchTopics,
      resources: (row.resources as ResourceLink[]) ?? [],
      generatedFrom: row.generatedFrom,
      generatedAt: row.generatedAt.toISOString(),
      sourceUpdatedAt: row.sourceUpdatedAt?.toISOString() ?? null,
      cached,
    };
  }
}

function fallbackRepository(
  context: RepoContext,
  issue: { repoFullName: string; url: string; labels: string[] },
): Pick<RepositoryOnboarding, 'overview' | 'structure' | 'technologies' | 'firstFiles' | 'setup' | 'run' | 'test' | 'branchGuidance' | 'prGuidance'> {
  const topLevel = [...new Set(context.tree.map((path) => path.split('/')[0]).filter(Boolean))].slice(0, 12);
  const files = context.tree.filter((path) =>
    /(^|\/)(README|CONTRIBUTING|package\.json|pyproject\.toml|Cargo\.toml|go\.mod|Makefile|docker-compose)(\.|$)/i.test(path),
  );
  const commands = context.readme
    .split('\n')
    .map((line) => line.replace(/^[$>]\s*/, '').trim())
    .filter((line) => /^(npm|pnpm|yarn|pip|poetry|cargo|go|make|docker)\b/.test(line))
    .slice(0, 6);
  return {
    overview: `${context.description || `${issue.repoFullName} is an open-source repository.`} It is mainly written in ${context.languages.slice(0, 3).join(', ') || 'several languages'}.`,
    structure: `Top-level entries: ${topLevel.join(', ') || 'see the repository tree'}. Start at the README, then follow the directory that owns the behaviour named in the issue.`,
    technologies: context.languages.slice(0, 8),
    firstFiles: files.slice(0, 5).map((path) => ({
      path,
      why: /CONTRIBUTING/i.test(path)
        ? 'Contribution rules and the branch/PR process.'
        : /README/i.test(path)
          ? 'Project purpose, setup and test commands.'
          : 'Build or runtime configuration; confirms how the project runs.',
    })),
    setup: commands.length > 0 ? commands : ['Read the README setup section.', 'Install the runtime named in the repository metadata.'],
    run: commands.length > 0 ? commands : ['Read the README run section.', 'Start the development command listed there.'],
    test: ['Open the test section of the README or CONTRIBUTING.md.', 'Run the smallest test file that covers the area in the issue.'],
    branchGuidance: ['Fork the repository.', 'Create a branch from the default branch.', 'Use a short descriptive branch name.'],
    prGuidance: ['Link the issue in the pull request description.', 'Explain what changed and how you tested it.', 'Keep the pull request scoped to the issue.', `Open it from your fork against ${issue.repoFullName}.`],
  };
}

function fallbackIssue(
  issue: {
    title: string;
    body: string | null;
    labels: string[];
    language: string | null;
    level: string | null;
    repoFullName: string;
    url: string;
  },
  context: RepoContext,
): Pick<IssueOnboarding, 'summary' | 'requirements' | 'relatedFiles' | 'researchTopics' | 'resources'> {
  const words = issue.labels.map((label) => label.toLowerCase());
  const related = context.tree
    .filter((path) => words.some((word) => word.split(' ').some((part) => part.length > 4 && path.toLowerCase().includes(part))))
    .slice(0, 4);
  return {
    summary: (issue.body ?? issue.title).split('\n').filter(Boolean).slice(0, 4).join(' ').slice(0, 900),
    requirements: {
      technologies: [issue.language, ...issue.labels].filter((value): value is string => Boolean(value)).slice(0, 8),
      knowledge: ['Reading an existing test suite', 'Finding the module that owns the behaviour', 'Opening a pull request that links the issue'],
      level: (issue.level as IssueOnboarding['requirements']['level']) ?? 'BEGINNER',
      prerequisites: ['Fork the repository', 'Run the test suite locally', 'Read CONTRIBUTING.md before opening a PR'],
    },
    relatedFiles: (related.length > 0 ? related : context.tree.slice(0, 4)).map((path) => ({
      path,
      why: 'Likely related to the area named in the issue; confirm by reading its tests.',
    })),
    researchTopics: ['How the repository runs its tests', 'The framework used by the affected module', 'Writing a reproduction before the fix'],
    resources: [
      { title: 'Repository README', url: `https://github.com/${issue.repoFullName}#readme`, kind: 'repository' },
      { title: 'Issue discussion', url: issue.url, kind: 'issue' },
      { title: 'How to write a good pull request', url: 'https://docs.github.com/en/pull-requests', kind: 'documentation' },
    ],
  };
}
