import type { LearningResource } from '@osh/contracts';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Pill } from '@/components/ui/card';
import { publicApi, ServerApiError } from '@/lib/server-api';

export const dynamic = 'force-dynamic';

export default async function LearnArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let resource: LearningResource | null = null;
  try {
    resource = await publicApi<LearningResource>(`/learning/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <main className="min-h-screen bg-canvas">
      <header className="mx-auto flex h-16 w-full max-w-public items-center justify-between px-6">
        <Logo />
        <ThemeToggle compact />
      </header>
      <article className="mx-auto w-full max-w-[720px] px-6 pb-24">
        <Link href="/learn" className="text-[12px] text-fg-muted hover:text-fg">
          ← Learning hub
        </Link>
        <div className="mt-6 flex items-center gap-2">
          <Pill>{resource.topic}</Pill>
          <span className="text-[10px] text-fg-subtle">{resource.readingMinutes} min read</span>
        </div>
        <h1 className="mt-3 text-[38px] font-semibold leading-[1.1] tracking-[-0.04em] text-fg">
          {resource.title}
        </h1>
        <p className="mt-3 max-w-[68ch] text-[15px] leading-7 text-fg-muted">{resource.summary}</p>
        <div className="mt-8 max-w-[68ch] space-y-4">
          {resource.body.split('\n').map((line, index) => {
            const trimmed = line.trim();
            if (!trimmed) return null;
            if (trimmed.startsWith('## ')) {
              return (
                <h2 key={index} className="pt-4 text-[20px] font-semibold text-fg">
                  {trimmed.slice(3)}
                </h2>
              );
            }
            if (trimmed.startsWith('# ')) {
              return (
                <h2 key={index} className="pt-4 text-[22px] font-semibold text-fg">
                  {trimmed.slice(2)}
                </h2>
              );
            }
            if (trimmed.startsWith('- ')) {
              return (
                <p key={index} className="pl-4 text-[14px] leading-7 text-fg-muted">
                  · {trimmed.slice(2)}
                </p>
              );
            }
            return (
              <p key={index} className="text-[14px] leading-7 text-fg-muted">
                {trimmed}
              </p>
            );
          })}
        </div>
        {resource.externalUrl ? (
          <a
            href={resource.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block text-[12px] text-accent hover:underline"
          >
            Read the official documentation
          </a>
        ) : null}
        <div className="mt-10 border-t border-border pt-5 text-[12px] text-fg-muted">
          Was this helpful?{' '}
          <Link href="/learn" className="text-accent hover:underline">
            Browse another topic
          </Link>
          .
        </div>
      </article>
    </main>
  );
}
