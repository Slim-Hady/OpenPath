'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import type { ContributorDetail } from '@osh/contracts';
import { ExternalLink, Github, Send } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Avatar, EmptyState, Pill, Skeleton } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Label, Select, Textarea } from '@/components/ui/input';
import { apiFetch, errorMessage } from '@/lib/api-client';

export function ContributorDetailView({ login }: { login: string }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'MENTORSHIP' | 'RECRUITMENT'>('MENTORSHIP');
  const [message, setMessage] = useState('');
  const contributor = useQuery({
    queryKey: ['contributor', login],
    queryFn: () => apiFetch<ContributorDetail>(`/community/contributors/${encodeURIComponent(login)}`),
    retry: false,
  });
  const send = useMutation({
    mutationFn: () =>
      apiFetch('/outreach', { method: 'POST', body: { recipientId: contributor.data?.platformUserId, type, message } }),
    onSuccess: () => {
      setOpen(false);
      setMessage('');
      toast.success('Request sent');
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  if (contributor.isLoading) return <Skeleton className="h-80 w-full" />;
  if (contributor.isError || !contributor.data) {
    return (
      <EmptyState
        title="Contributor not found"
        description={errorMessage(contributor.error)}
        action={<Link href="/community" className="text-[12px] text-accent hover:underline">Back to search</Link>}
      />
    );
  }
  const person = contributor.data;

  return (
    <div>
      <Link href="/community" className="text-[12px] text-fg-muted hover:text-fg">
        ← Community
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={person.name ?? person.login} src={person.avatarUrl} size={64} />
          <div>
            <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-fg">
              {person.name ?? person.login}
            </h1>
            <p className="font-mono text-[11px] text-fg-subtle">@{person.login}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {person.optedIn ? <Pill tone="accent">Open to platform requests</Pill> : <Pill>GitHub contact only</Pill>}
              {person.platformHandle ? (
                <Link href={`/u/${person.platformHandle}`} className="text-[11px] text-accent hover:underline">
                  Platform profile
                </Link>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={person.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border px-3 text-[12px] text-fg hover:border-border-strong"
          >
            <Github size={14} /> GitHub <ExternalLink size={11} />
          </a>
          {person.optedIn && person.platformUserId ? (
            <Button type="button" size="sm" onClick={() => setOpen(true)}>
              <Send size={13} /> Send request
            </Button>
          ) : null}
        </div>
      </div>

      {person.bio ? <p className="mt-5 max-w-[68ch] text-[13px] leading-6 text-fg-muted">{person.bio}</p> : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          ['Merged PRs', person.mergedPullRequests],
          ['Commits', person.commits],
          ['Reviews', person.reviews],
          ['Followers', person.followers],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-md border border-border bg-canvas-subtle p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-fg-subtle">{label}</p>
            <p className="tabular mt-1 text-[24px] font-semibold text-fg">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <section className="rounded-md border border-border p-4">
          <h2 className="text-[14px] font-semibold text-fg">Areas of expertise</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {person.expertise.length > 0 ? (
              person.expertise.map((item) => <Pill key={item}>{item}</Pill>)
            ) : (
              <p className="text-[11px] text-fg-subtle">No public language data.</p>
            )}
          </div>
        </section>
        <section className="rounded-md border border-border p-4">
          <h2 className="text-[14px] font-semibold text-fg">Recent topics</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {person.topics.length > 0 ? (
              person.topics.map((topic) => <Pill key={topic}>{topic}</Pill>)
            ) : (
              <p className="text-[11px] text-fg-subtle">No repository topics.</p>
            )}
          </div>
        </section>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          title={`Send a request to ${person.name ?? person.login}`}
          description="They opted in. They can accept, decline or block. The request is delivered in-app."
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select id="type" value={type} onChange={(event) => setType(event.target.value as typeof type)}>
                <option value="MENTORSHIP">Mentorship</option>
                <option value="RECRUITMENT">Recruitment</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="message" hint={`${message.length}/500`}>Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={500}
                rows={4}
                placeholder="What are you working on, and what would you like help with?"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => send.mutate()}
                loading={send.isPending}
                disabled={message.trim().length < 10}
              >
                Send request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
