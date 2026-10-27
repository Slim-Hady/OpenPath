'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NotificationPreferences, NotificationType } from '@osh/contracts';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/card';
import { apiFetch, errorMessage } from '@/lib/api-client';

const TYPES: Array<{ key: NotificationType; label: string; help: string }> = [
  { key: 'NEW_MATCH', label: 'New matching issues', help: 'When a fresh set of recommendations is ready.' },
  { key: 'PR_ACTIVITY', label: 'Pull request activity', help: 'When a PR is detected, reviewed or merged.' },
  { key: 'SAVED_ISSUE_CLOSED', label: 'Saved issue changed', help: 'When a saved issue is closed or taken.' },
  { key: 'BADGE_EARNED', label: 'Badges', help: 'When you earn a milestone badge.' },
  { key: 'OUTREACH_REQUEST', label: 'Outreach requests', help: 'When someone asks to mentor or recruit you.' },
  { key: 'OUTREACH_ACCEPTED', label: 'Outreach status', help: 'When a request is accepted or declined.' },
  { key: 'OUTREACH_MESSAGE', label: 'Outreach messages', help: 'When an accepted conversation gets a message.' },
  { key: 'SYSTEM', label: 'Platform updates', help: 'Selection changes and other system notices.' },
];

export function NotificationPreferencesPanel() {
  const queryClient = useQueryClient();
  const [savedFlash, setSavedFlash] = useState(false);
  const preferences = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => apiFetch<NotificationPreferences>('/notifications/preferences'),
  });

  const update = useMutation({
    mutationFn: (body: Partial<NotificationPreferences>) =>
      apiFetch<NotificationPreferences>('/notifications/preferences', { method: 'PUT', body }),
    onSuccess: (data) => {
      queryClient.setQueryData(['notification-preferences'], data);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1200);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  if (preferences.isLoading || !preferences.data) {
    return <Skeleton className="h-64 w-full" />;
  }

  const data = preferences.data;
  const email = data.channels.includes('EMAIL');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-fg">Channels and frequency</h2>
          <p className="mt-0.5 text-[12px] text-fg-muted">In-app is the source of truth. Email is best-effort.</p>
        </div>
        <span className={`text-[11px] text-success transition-opacity ${savedFlash ? 'opacity-100' : 'opacity-0'}`}>
          Saved
        </span>
      </div>
      <div className="divide-y divide-border-muted rounded-md border border-border">
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-[13px] text-fg">In-app notifications</p>
            <p className="text-[11px] text-fg-subtle">Always on. This is the record you can read later.</p>
          </div>
          <Switch checked onCheckedChange={() => undefined} label="In-app notifications" disabled />
        </div>
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-[13px] text-fg">Email notifications</p>
            <p className="text-[11px] text-fg-subtle">Requires a verified email. Delivery may lag.</p>
          </div>
          <Switch
            checked={email}
            onCheckedChange={(checked) =>
              update.mutate({ channels: checked ? ['IN_APP', 'EMAIL'] : ['IN_APP'] })
            }
            label="Email notifications"
          />
        </div>
        <div className="p-4">
          <p className="text-[13px] text-fg">Frequency</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(['INSTANT', 'DAILY', 'WEEKLY'] as const).map((frequency) => (
              <button
                key={frequency}
                type="button"
                onClick={() => update.mutate({ frequency })}
                className={`rounded-full border px-3 py-1 text-[11px] ${
                  data.frequency === frequency
                    ? 'border-accent bg-accent-subtle text-accent'
                    : 'border-border text-fg-muted hover:text-fg'
                }`}
              >
                {frequency[0] + frequency.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-[16px] font-semibold text-fg">Event types</h2>
        <p className="mt-0.5 text-[12px] text-fg-muted">Turn off anything you do not need. It saves immediately.</p>
        <div className="mt-3 divide-y divide-border-muted rounded-md border border-border">
          {TYPES.map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-4 p-3.5">
              <div>
                <p className="text-[12px] text-fg">{item.label}</p>
                <p className="text-[10px] text-fg-subtle">{item.help}</p>
              </div>
              <Switch
                checked={data.eventTypes[item.key] !== false}
                onCheckedChange={(checked) =>
                  update.mutate({ eventTypes: { ...data.eventTypes, [item.key]: checked } })
                }
                label={item.label}
              />
            </div>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-fg-subtle">
        <Link href="/notifications" className="text-accent hover:underline">
          Open your notification inbox
        </Link>
      </p>
    </div>
  );
}
