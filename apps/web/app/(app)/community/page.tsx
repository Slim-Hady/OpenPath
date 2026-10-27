'use client';

import { useQuery } from '@tanstack/react-query';
import type { Contributor, ContributorSearchResponse } from '@osh/contracts';
import { Search, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, EmptyState, Pill, Skeleton } from '@/components/ui/card';
import { Input, Label, Select } from '@/components/ui/input';
import { apiFetch, errorMessage } from '@/lib/api-client';
import { LANGUAGES } from '@/lib/constants';

export default function CommunityPage() {
  const [scope, setScope] = useState('');
  const [language, setLanguage] = useState('');
  const [topic, setTopic] = useState('');
  const [applied, setApplied] = useState<{ scope: string; language: string; topic: string } | null>(null);

  const results = useQuery({
    queryKey: ['contributors', applied],
    queryFn: () => {
      const params = new URLSearchParams();
      if (applied!.scope.includes('/')) params.set('repo', applied!.scope);
      else params.set('org', applied!.scope);
      if (applied!.language) params.set('language', applied!.language);
      if (applied!.topic) params.set('topic', applied!.topic);
      return apiFetch<ContributorSearchResponse>(`/community/contributors?${params.toString()}`);
    },
    enabled: Boolean(applied?.scope),
    retry: false,
  });

  return (
    <div>
      <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-fg">Community</h1>
      <p className="mt-1.5 max-w-[68ch] text-[13px] leading-6 text-fg-muted">
        Find active contributors in an organization or repository from public GitHub data. Platform
        outreach is only available to people who opted in.
      </p>

      <form
        className="mt-6 grid gap-3 rounded-md border border-border bg-canvas-subtle p-4 sm:grid-cols-[1fr_150px_150px_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          if (scope.trim()) setApplied({ scope: scope.trim(), language, topic });
        }}
      >
        <div>
          <Label htmlFor="scope">Organization or owner/repo</Label>
          <Input
            id="scope"
            value={scope}
            onChange={(event) => setScope(event.target.value)}
            placeholder="vercel or vercel/next.js"
          />
        </div>
        <div>
          <Label htmlFor="language">Language</Label>
          <Select id="language" value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option value="">Any</option>
            {LANGUAGES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="topic">Topic</Label>
          <Input id="topic" value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="testing" />
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full" loading={results.isFetching}>
            <Search size={14} /> Search
          </Button>
        </div>
      </form>

      {results.isLoading ? (
        <div className="mt-6 space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : null}

      {results.isError ? (
        <div className="mt-6 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-[12px] text-danger">
          {errorMessage(results.error)}
        </div>
      ) : null}

      {!results.isLoading && applied && results.data && results.data.items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<Users size={22} />}
            title="No contributors"
            description="The repository may be empty, or the language/topic filter removed everyone. Try a broader scope."
          />
        </div>
      ) : null}

      {results.data && results.data.items.length > 0 ? (
        <div className="mt-6 divide-y divide-border-muted rounded-md border border-border">
          {results.data.items.map((contributor) => (
            <ContributorRow key={contributor.login} contributor={contributor} />
          ))}
        </div>
      ) : null}

      {!applied ? (
        <div className="mt-6">
          <EmptyState
            icon={<Users size={22} />}
            title="Search a repository or organization"
            description="Start with a repository you already contribute to. Results are ranked by contributions and cached for 15 minutes."
          />
        </div>
      ) : null}

      {results.data ? (
        <p className="mt-4 flex items-center gap-2 text-[10px] text-fg-subtle">
          <Pill>Public GitHub data</Pill> fetched {new Date(results.data.fetchedAt).toLocaleTimeString()}
        </p>
      ) : null}
    </div>
  );
}

function ContributorRow({ contributor }: { contributor: Contributor }) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4">
      <Avatar name={contributor.name ?? contributor.login} src={contributor.avatarUrl} size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[13px] font-medium text-fg">{contributor.name ?? contributor.login}</p>
          <span className="font-mono text-[10px] text-fg-subtle">@{contributor.login}</span>
          {contributor.optedIn ? <Pill tone="accent">Mentor opt-in</Pill> : null}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {contributor.languages.slice(0, 3).map((language) => (
            <Pill key={language}>{language}</Pill>
          ))}
          <span className="text-[10px] text-fg-subtle">{contributor.contributions} contributions</span>
        </div>
      </div>
      <div className="hidden items-end gap-0.5 sm:flex" aria-hidden>
        {contributor.activity.map((value, index) => (
          <span
            key={index}
            className="w-1 rounded-sm bg-accent/50"
            style={{ height: `${Math.max(2, Math.min(24, value / 3))}px` }}
          />
        ))}
      </div>
      <Link
        href={`/community/${contributor.login}`}
        className="text-[12px] text-accent hover:underline"
      >
        View
      </Link>
    </div>
  );
}
