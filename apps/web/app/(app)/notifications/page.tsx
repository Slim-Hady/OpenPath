'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NotificationDto, NotificationList } from '@osh/contracts';
import { Bell, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { EmptyState, Skeleton } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/dialog';
import { apiFetch, errorMessage } from '@/lib/api-client';
import { NotificationPreferencesPanel } from '@/components/notification-preferences';
import { relativeTime } from '@/lib/utils';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const notifications = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiFetch<NotificationList>('/notifications?perPage=50'),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const markAll = useMutation({
    mutationFn: () => apiFetch('/notifications/read-all', { method: 'POST' }),
    onSuccess: () => {
      toast.success('All notifications marked read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-fg">Notifications</h1>
          <p className="mt-1.5 text-[13px] text-fg-muted">
            In-app is the source of truth. We tell you when your PR moves.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => markAll.mutate()}
          loading={markAll.isPending}
        >
          <CheckCheck size={13} /> Mark all read
        </Button>
      </div>

      <Tabs defaultValue="inbox" className="mt-6">
        <TabsList>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        <TabsContent value="inbox">
          {notifications.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : null}
          {!notifications.isLoading && notifications.data?.items.length === 0 ? (
            <EmptyState
              icon={<Bell size={22} />}
              title="Nothing yet."
              description="We'll tell you when your PR moves or a saved issue changes."
            />
          ) : null}
          <div className="divide-y divide-border-muted rounded-md border border-border">
            {(notifications.data?.items ?? []).map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onRead={() => markRead.mutate(notification.id)}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="preferences">
          <NotificationPreferencesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationRow({
  notification,
  onRead,
}: {
  notification: NotificationDto;
  onRead: () => void;
}) {
  const content = (
    <div className="flex items-start gap-3">
      <span
        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
          notification.read ? 'bg-border-strong' : 'bg-accent'
        }`}
      />
      <div className="min-w-0 flex-1">
        <p className={`text-[13px] ${notification.read ? 'font-normal text-fg-muted' : 'font-medium text-fg'}`}>
          {notification.title}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-fg-subtle">{notification.body}</p>
      </div>
      <span className="shrink-0 text-[10px] text-fg-subtle">{relativeTime(notification.createdAt)}</span>
    </div>
  );

  return (
    <div className="px-4 py-3.5 transition-colors hover:bg-canvas-subtle">
      {notification.link ? (
        <Link
          href={notification.link}
          onClick={() => {
            if (!notification.read) onRead();
          }}
          className="block"
        >
          {content}
        </Link>
      ) : (
        <button type="button" onClick={onRead} className="block w-full text-left">
          {content}
        </button>
      )}
    </div>
  );
}
