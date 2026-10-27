'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { OutreachConversation, OutreachList, OutreachRequest } from '@osh/contracts';
import { MessageSquare, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Avatar, EmptyState, Pill, Skeleton } from '@/components/ui/card';
import { Dialog, DialogContent, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/input';
import { apiFetch, errorMessage } from '@/lib/api-client';
import { relativeTime } from '@/lib/utils';

export default function RequestsPage() {
  const queryClient = useQueryClient();
  const requests = useQuery({
    queryKey: ['outreach'],
    queryFn: () => apiFetch<OutreachList>('/outreach'),
  });
  const [conversation, setConversation] = useState<OutreachRequest | null>(null);

  const respond = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'ACCEPT' | 'DECLINE' | 'BLOCK' }) =>
      apiFetch(`/outreach/${id}`, { method: 'PATCH', body: { action } }),
    onSuccess: () => {
      toast.success('Request updated');
      queryClient.invalidateQueries({ queryKey: ['outreach'] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  if (requests.isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-fg">Requests</h1>
      <p className="mt-1.5 text-[13px] text-fg-muted">
        Mentorship and recruitment requests. Accept, decline or block. Conversations start after acceptance.
      </p>

      <Tabs defaultValue="received" className="mt-6">
        <TabsList>
          <TabsTrigger value="received">Received ({requests.data?.received.length ?? 0})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({requests.data?.sent.length ?? 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="received">
          <RequestList
            items={requests.data?.received ?? []}
            mode="received"
            onRespond={(id, action) => respond.mutate({ id, action })}
            onOpen={setConversation}
          />
        </TabsContent>
        <TabsContent value="sent">
          <RequestList
            items={requests.data?.sent ?? []}
            mode="sent"
            onRespond={() => undefined}
            onOpen={setConversation}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(conversation)} onOpenChange={(open) => !open && setConversation(null)}>
        <DialogContent
          title={conversation ? `Conversation with ${conversation.sender.name === 'you' ? conversation.recipient.name : conversation.sender.name}` : 'Conversation'}
          description="Only participants can read or send messages."
          size="lg"
        >
          {conversation?.conversationId ? (
            <Conversation request={conversation} />
          ) : (
            <p className="text-[12px] text-fg-muted">Accept the request before messaging.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RequestList({
  items,
  mode,
  onRespond,
  onOpen,
}: {
  items: OutreachRequest[];
  mode: 'received' | 'sent';
  onRespond: (id: string, action: 'ACCEPT' | 'DECLINE' | 'BLOCK') => void;
  onOpen: (request: OutreachRequest) => void;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Nothing here"
        description={mode === 'received' ? 'When someone sends you a request it appears here.' : 'Find a contributor in Community and send a request.'}
      />
    );
  }
  return (
    <div className="space-y-2">
      {items.map((request) => {
        const person = mode === 'received' ? request.sender : request.recipient;
        return (
          <article key={request.id} className="rounded-md border border-border bg-canvas-subtle p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Avatar name={person.name} src={person.avatarUrl} size={32} />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-medium text-fg">{person.name}</p>
                    <span className="font-mono text-[10px] text-fg-subtle">@{person.handle ?? 'unknown'}</span>
                    <Pill>{request.type === 'MENTORSHIP' ? 'Mentorship' : 'Recruitment'}</Pill>
                    <StatusPill status={request.status} />
                  </div>
                  <p className="mt-1.5 max-w-[68ch] text-[12px] leading-5 text-fg-muted">{request.message}</p>
                  <p className="mt-1 text-[10px] text-fg-subtle">{relativeTime(request.createdAt)}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {mode === 'received' && request.status === 'PENDING' ? (
                  <>
                    <Button type="button" size="sm" onClick={() => onRespond(request.id, 'ACCEPT')}>
                      Accept
                    </Button>
                    <Button type="button" size="sm" variant="secondary" onClick={() => onRespond(request.id, 'DECLINE')}>
                      Decline
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => onRespond(request.id, 'BLOCK')}>
                      Block
                    </Button>
                  </>
                ) : null}
                {request.status === 'ACCEPTED' && request.conversationId ? (
                  <Button type="button" size="sm" variant="secondary" onClick={() => onOpen(request)}>
                    <MessageSquare size={13} /> Open
                  </Button>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function StatusPill({ status }: { status: OutreachRequest['status'] }) {
  const tone =
    status === 'ACCEPTED' ? 'success' : status === 'DECLINED' || status === 'BLOCKED' ? 'danger' : 'attention';
  return <Pill tone={tone}>{status.toLowerCase()}</Pill>;
}

function Conversation({ request }: { request: OutreachRequest }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const conversation = useQuery({
    queryKey: ['outreach-conversation', request.id],
    queryFn: () => apiFetch<OutreachConversation>(`/outreach/${request.id}/conversation`),
  });
  const send = useMutation({
    mutationFn: () =>
      apiFetch<OutreachConversation>(`/outreach/${request.id}/conversation/messages`, {
        method: 'POST',
        body: { body: draft },
      }),
    onSuccess: (data) => {
      setDraft('');
      queryClient.setQueryData(['outreach-conversation', request.id], data);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <div>
      <div className="max-h-[320px] space-y-3 overflow-y-auto rounded-sm border border-border bg-canvas p-3 scrollbar-thin">
        {conversation.data?.messages.length === 0 ? (
          <p className="text-[11px] text-fg-subtle">No messages yet. Say hello.</p>
        ) : null}
        {(conversation.data?.messages ?? []).map((message) => (
          <div key={message.id} className="rounded-sm border border-border-muted bg-canvas-subtle p-2.5">
            <p className="text-[10px] text-fg-subtle">
              {message.senderName} · {relativeTime(message.createdAt)}
            </p>
            <p className="mt-1 text-[12px] leading-5 text-fg">{message.body}</p>
          </div>
        ))}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (draft.trim()) send.mutate();
        }}
      >
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a message"
          className="min-h-[44px]"
          maxLength={1000}
        />
        <Button type="submit" size="sm" loading={send.isPending} disabled={!draft.trim()}>
          <Send size={13} />
        </Button>
      </form>
    </div>
  );
}
