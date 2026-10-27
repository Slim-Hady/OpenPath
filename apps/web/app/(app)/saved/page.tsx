'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SavedItem, SavedList, SavedListDetail } from '@osh/contracts';
import { Bookmark, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { EmptyState, Pill, Skeleton } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiFetch, errorMessage } from '@/lib/api-client';
import { relativeTime } from '@/lib/utils';

export default function SavedPage() {
  const queryClient = useQueryClient();
  const [active, setActive] = useState<string | null>(null);
  const [name, setName] = useState('');
  const lists = useQuery({
    queryKey: ['saved-lists'],
    queryFn: () => apiFetch<SavedList[]>('/saved/lists'),
  });
  const selectedId = active ?? lists.data?.[0]?.id ?? null;
  const detail = useQuery({
    queryKey: ['saved-list', selectedId],
    queryFn: () => apiFetch<SavedListDetail>(`/saved/lists/${selectedId}`),
    enabled: Boolean(selectedId),
  });

  const create = useMutation({
    mutationFn: () => apiFetch<SavedList>('/saved/lists', { method: 'POST', body: { name } }),
    onSuccess: (list) => {
      setName('');
      setActive(list.id);
      toast.success('List created');
      queryClient.invalidateQueries({ queryKey: ['saved-lists'] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const removeItem = useMutation({
    mutationFn: (id: string) => apiFetch(`/saved/items/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Removed');
      queryClient.invalidateQueries({ queryKey: ['saved-lists'] });
      queryClient.invalidateQueries({ queryKey: ['saved-list', selectedId] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const selectIssue = useMutation({
    mutationFn: (itemId: string) => apiFetch(`/saved/items/${itemId}/select`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('Issue selected. It is In Progress.');
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <div>
      <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-fg">Saved</h1>
      <p className="mt-1.5 text-[13px] text-fg-muted">Bookmarks and named lists. Only you can see them.</p>

      <div className="mt-6 grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
        <aside>
          {lists.isLoading ? <Skeleton className="h-32 w-full" /> : null}
          <ul className="space-y-1">
            {(lists.data ?? []).map((list) => (
              <li key={list.id}>
                <button
                  type="button"
                  onClick={() => setActive(list.id)}
                  className={`flex w-full items-center justify-between rounded-sm px-2.5 py-2 text-[12px] ${
                    selectedId === list.id
                      ? 'bg-accent-subtle text-accent'
                      : 'text-fg-muted hover:bg-canvas-subtle hover:text-fg'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Bookmark size={13} /> {list.name}
                  </span>
                  <span className="font-mono text-[10px]">{list.itemCount}</span>
                </button>
              </li>
            ))}
          </ul>
          <form
            className="mt-4 flex gap-1.5"
            onSubmit={(event) => {
              event.preventDefault();
              if (name.trim()) create.mutate();
            }}
          >
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="New list"
              aria-label="New list name"
              className="h-8 text-[12px]"
              maxLength={60}
            />
            <Button type="submit" size="sm" aria-label="Create list" loading={create.isPending}>
              <Plus size={13} />
            </Button>
          </form>
        </aside>

        <section>
          {detail.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : null}
          {!detail.isLoading && detail.data && detail.data.items.length === 0 ? (
            <EmptyState
              icon={<Bookmark size={22} />}
              title="Nothing saved"
              description="Save an issue from Discover or an issue page and it will appear here."
              action={
                <Link href="/discover" className="text-[12px] text-accent hover:underline">
                  Browse issues
                </Link>
              }
            />
          ) : null}
          <div className="space-y-2">
            {(detail.data?.items ?? []).map((item) => (
              <SavedRow
                key={item.id}
                item={item}
                onRemove={() => removeItem.mutate(item.id)}
                onSelect={() => selectIssue.mutate(item.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SavedRow({
  item,
  onRemove,
  onSelect,
}: {
  item: SavedItem;
  onRemove: () => void;
  onSelect: () => void;
}) {
  return (
    <article className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-border bg-canvas-subtle p-4">
      <div className="min-w-0">
        <p className="font-mono text-[10px] text-fg-subtle">{item.repoFullName}</p>
        {item.issue ? (
          <Link
            href={`/issues/${encodeURIComponent(item.issue.id)}`}
            className="mt-1 block text-[13px] font-medium leading-5 text-fg hover:text-accent"
          >
            {item.issue.title}
          </Link>
        ) : (
          <a
            href={item.repoUrl ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block text-[13px] font-medium text-fg hover:text-accent"
          >
            Repository bookmark
          </a>
        )}
        <div className="mt-2 flex items-center gap-2">
          <Pill
            tone={
              item.issueState === 'OPEN'
                ? 'success'
                : item.issueState === 'UNKNOWN'
                  ? 'neutral'
                  : 'attention'
            }
          >
            {item.issueState === 'OPEN'
              ? 'Open'
              : item.issueState === 'TAKEN'
                ? 'Taken'
                : item.issueState === 'CLOSED'
                  ? 'Closed'
                  : 'State unknown'}
          </Pill>
          <span className="text-[10px] text-fg-subtle">saved {relativeTime(item.createdAt)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {item.issue && item.issueState === 'OPEN' ? (
          <Button type="button" size="sm" onClick={onSelect}>
            Select
          </Button>
        ) : null}
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove saved item"
          className="rounded-sm p-1.5 text-fg-subtle hover:bg-canvas hover:text-danger"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </article>
  );
}
