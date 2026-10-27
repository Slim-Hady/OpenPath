'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProgressStatus, ProgressSummary, Selection } from '@osh/contracts';
import { GitPullRequest, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { EmptyState, Pill, Skeleton, StatusPill } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input, Label, Select } from '@/components/ui/input';
import { apiFetch, errorMessage } from '@/lib/api-client';
import { relativeTime } from '@/lib/utils';

const COLUMNS: Array<{ status: ProgressStatus; title: string }> = [
  { status: 'IN_PROGRESS', title: 'In Progress' },
  { status: 'PR_OPEN', title: 'PR Open' },
  { status: 'MERGED', title: 'Merged' },
];

export default function ProgressPage() {
  const queryClient = useQueryClient();
  const progress = useQuery({
    queryKey: ['progress'],
    queryFn: () => apiFetch<ProgressSummary>('/progress'),
  });
  const [editing, setEditing] = useState<Selection | null>(null);
  const [status, setStatus] = useState<ProgressStatus>('IN_PROGRESS');
  const [prUrl, setPrUrl] = useState('');

  const update = useMutation({
    mutationFn: () =>
      apiFetch(`/progress/${editing!.id}`, {
        method: 'PATCH',
        body: { status, prUrl: prUrl || null },
      }),
    onSuccess: () => {
      setEditing(null);
      toast.success('Progress updated');
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const sync = useMutation({
    mutationFn: () => apiFetch<{ ok: true }>('/progress/sync', { method: 'POST' }),
    onSuccess: () => toast.success('Sync queued. It runs in the background.'),
    onError: (error) => toast.error(errorMessage(error)),
  });

  const data = progress.data;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-fg">Your contributions</h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[11px] text-fg-muted">
            {data ? (
              <>
                <span>{data.counts.inProgress} In Progress</span>
                <span>·</span>
                <span>{data.counts.prOpen} PR Open</span>
                <span>·</span>
                <span>{data.counts.merged} Merged</span>
              </>
            ) : (
              <Skeleton className="h-3 w-52" />
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-fg-subtle">
            updated {relativeTime(data?.lastSyncedAt)}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => sync.mutate()}
            loading={sync.isPending}
          >
            <RefreshCw size={13} /> Sync now
          </Button>
        </div>
      </div>

      {progress.isLoading ? (
        <div className="mt-7 grid gap-3 lg:grid-cols-3">
          {[0, 1, 2].map((column) => (
            <div key={column} className="space-y-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </div>
      ) : null}

      {!progress.isLoading && data && data.items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Nothing here yet."
            description="Pick an issue, confirm it, and it will appear here as In Progress."
            action={
              <Link href="/discover" className="text-[12px] text-accent hover:underline">
                Find an issue
              </Link>
            }
          />
        </div>
      ) : null}

      {data && data.items.length > 0 ? (
        <div className="mt-7 grid gap-5 lg:grid-cols-3">
          {COLUMNS.map((column) => {
            const items = data.items.filter((item) => item.status === column.status);
            return (
              <section key={column.status}>
                <div className="mb-3 flex items-center justify-between border-t-2 border-border pt-2">
                  <h2 className="text-[12px] font-medium text-fg">{column.title}</h2>
                  <span className="font-mono text-[10px] text-fg-subtle">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.length === 0 ? (
                    <p className="rounded-sm border border-dashed border-border px-3 py-5 text-center text-[11px] text-fg-subtle">
                      {column.status === 'IN_PROGRESS' ? (
                        <Link href="/discover" className="text-accent hover:underline">
                          Find an issue
                        </Link>
                      ) : (
                        'Nothing here yet.'
                      )}
                    </p>
                  ) : null}
                  {items.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-md border border-border bg-canvas-subtle p-4 transition-colors hover:border-border-strong"
                    >
                      <p className="truncate font-mono text-[10px] text-fg-subtle">{item.issue.repoFullName}</p>
                      <Link
                        href={`/issues/${encodeURIComponent(item.issue.id)}?tab=progress`}
                        className="mt-1.5 line-clamp-2 text-[13px] font-medium leading-5 text-fg hover:text-accent"
                      >
                        {item.issue.title}
                      </Link>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <StatusPill status={item.status} />
                        {item.prUrl ? (
                          <a
                            href={item.prUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-accent hover:underline"
                          >
                            <GitPullRequest size={10} /> Pull request
                          </a>
                        ) : null}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <p className="text-[10px] text-fg-subtle">
                          Selected {item.daysSinceSelected}d ago · synced {relativeTime(item.lastSyncedAt)}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(item);
                            setStatus(item.status);
                            setPrUrl(item.prUrl ?? '');
                          }}
                          className="text-[10px] text-fg-muted hover:text-fg"
                        >
                          Update
                        </button>
                      </div>
                      {item.status === 'MERGED' ? (
                        <div className="mt-3 border-l-2 border-success pl-2 text-[10px] text-success">
                          Merged contribution
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : null}

      {data && data.counts.ignored > 0 ? (
        <p className="mt-8 text-[11px] text-fg-subtle">
          <Pill>{data.counts.ignored} ignored</Pill> Ignored issues never appear in recommendations.
        </p>
      ) : null}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent
          title="Update progress"
          description="GitHub sync will correct this within five minutes."
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="progress-status">Status</Label>
              <Select
                id="progress-status"
                value={status}
                onChange={(event) => setStatus(event.target.value as ProgressStatus)}
              >
                <option value="IN_PROGRESS">In Progress</option>
                <option value="PR_OPEN">PR Open</option>
                <option value="MERGED">Merged</option>
                <option value="PAUSED">Paused</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="progress-pr">Pull request URL</Label>
              <Input
                id="progress-pr"
                placeholder="https://github.com/owner/repo/pull/123"
                value={prUrl}
                onChange={(event) => setPrUrl(event.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => update.mutate()} loading={update.isPending}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
