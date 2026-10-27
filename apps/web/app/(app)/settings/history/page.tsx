'use client';

import { useQuery } from '@tanstack/react-query';
import type { AccountHistory, ProgressStatus } from '@osh/contracts';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { EmptyState, Skeleton, StatusPill } from '@/components/ui/card';
import { apiFetch } from '@/lib/api-client';
import { relativeTime } from '@/lib/utils';

export default function HistoryPage() {
  const history = useQuery({
    queryKey: ['account-history'],
    queryFn: () => apiFetch<AccountHistory>('/me/history'),
  });

  if (history.isLoading || !history.data) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const { stats, items } = history.data;

  return (
    <div className="max-w-[820px]">
      <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-fg">History and statistics</h1>
      <p className="mt-1 text-[12px] text-fg-muted">
        Every selected issue, its status and the guide chat attached to it. Only you can see this.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ['Selected', stats.selected],
          ['Merged', stats.merged],
          ['Ignored', stats.ignored],
          ['PR Open', stats.prOpen],
          ['Badges', stats.badges],
          ['Chats', stats.chats],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-md border border-border bg-canvas-subtle p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-fg-subtle">{label}</p>
            <p className="tabular mt-1 text-[22px] font-semibold text-fg">{value}</p>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No history yet"
            description="Select an issue and it appears here with its status and guide chat."
            action={<Link href="/discover" className="text-[12px] text-accent hover:underline">Find an issue</Link>}
          />
        </div>
      ) : (
        <div className="mt-6 divide-y divide-border-muted rounded-md border border-border">
          {items.map((item) => (
            <div key={item.selectionId} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-mono text-[10px] text-fg-subtle">{item.repoFullName}</p>
                <Link
                  href={`/issues/${encodeURIComponent(item.issueId)}`}
                  className="mt-1 block text-[13px] font-medium text-fg hover:text-accent"
                >
                  {item.issueTitle}
                </Link>
                <p className="mt-1 text-[10px] text-fg-subtle">
                  selected {relativeTime(item.selectedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={item.status as ProgressStatus} />
                {item.conversationId ? (
                  <Link
                    href={`/issues/${encodeURIComponent(item.issueId)}?tab=guide`}
                    className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline"
                  >
                    <MessageSquare size={11} /> Chat
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
