'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Achievements, PublicProfileSettings } from '@osh/contracts';
import { Copy, Lock, Sparkles, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Pill, Skeleton } from '@/components/ui/card';
import { Switch } from '@/components/ui/dialog';
import { Input, Label } from '@/components/ui/input';
import { apiFetch, errorMessage } from '@/lib/api-client';

export default function AchievementsPage() {
  const queryClient = useQueryClient();
  const achievements = useQuery({
    queryKey: ['achievements'],
    queryFn: () => apiFetch<Achievements>('/achievements'),
  });
  const publicSettings = useQuery({
    queryKey: ['public-profile-settings'],
    queryFn: () => apiFetch<PublicProfileSettings>('/public-profile/settings'),
  });
  const [handle, setHandle] = useState('');
  const [handleInitialized, setHandleInitialized] = useState(false);

  useEffect(() => {
    if (publicSettings.data && !handleInitialized) {
      setHandle(publicSettings.data.handle ?? '');
      setHandleInitialized(true);
    }
  }, [publicSettings.data, handleInitialized]);

  const visibility = useMutation({
    mutationFn: (input: { badgeCode: string; publicVisible: boolean }) =>
      apiFetch('/achievements/visibility', { method: 'PATCH', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['achievements'] }),
    onError: (error) => toast.error(errorMessage(error)),
  });

  const profile = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch<PublicProfileSettings>('/public-profile/settings', { method: 'PUT', body }),
    onSuccess: (data) => {
      queryClient.setQueryData(['public-profile-settings'], data);
      toast.success(data.published ? 'Public profile updated' : 'Profile saved (private)');
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const data = achievements.data;

  return (
    <div>
      <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-fg">Achievements</h1>
      <p className="mt-1.5 text-[13px] text-fg-muted">
        Badges are awarded once. Streaks come from your contribution activity.
      </p>

      {achievements.isLoading ? <Skeleton className="mt-6 h-64 w-full" /> : null}
      {data ? (
        <>
          <div className="mt-6 rounded-md border border-border bg-canvas-subtle p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-subtle text-accent">
                  <Trophy size={18} />
                </span>
                <div>
                  <p className="text-[13px] font-medium text-fg">Contribution streak</p>
                  <p className="text-[11px] text-fg-subtle">Days with a progress event</p>
                </div>
              </div>
              <div className="flex gap-6 text-right">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.08em] text-fg-subtle">Current</p>
                  <p className="tabular text-[22px] font-semibold text-fg">{data.streak.current}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.08em] text-fg-subtle">Longest</p>
                  <p className="tabular text-[22px] font-semibold text-fg">{data.streak.longest}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-1.5">
              {Array.from({ length: 7 }).map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 flex-1 rounded-full ${
                    index < Math.min(7, data.streak.current) ? 'bg-success' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.badges.map((badge) => (
              <div
                key={badge.code}
                className={`rounded-md border border-border bg-canvas-subtle p-5 ${
                  badge.earned ? '' : 'opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      badge.earned ? 'bg-done/10 text-done' : 'bg-border-muted text-fg-subtle'
                    }`}
                  >
                    {badge.earned ? <Sparkles size={16} /> : <Lock size={15} />}
                  </span>
                  {badge.earned ? <Pill tone="success">Earned</Pill> : <Pill>{badge.progress}/{badge.target}</Pill>}
                </div>
                <p className="mt-3 text-[13px] font-medium text-fg">{badge.name}</p>
                <p className="mt-1 min-h-[40px] text-[11px] leading-5 text-fg-muted">
                  {badge.earned ? badge.description : badge.requirement}
                </p>
                {badge.earned ? (
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-border-muted pt-3">
                    <span className="text-[10px] text-fg-subtle">Show on public profile</span>
                    <Switch
                      checked={badge.publicVisible}
                      disabled={!data.profilePublished}
                      onCheckedChange={(checked) =>
                        visibility.mutate({ badgeCode: badge.code, publicVisible: checked })
                      }
                      label={`Show ${badge.name} publicly`}
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </>
      ) : null}

      <section className="mt-10">
        <h2 className="text-[18px] font-semibold text-fg">Public profile</h2>
        <p className="mt-1 text-[12px] text-fg-muted">
          Opt-in. Nothing is public until you publish and choose the sections.
        </p>
        {publicSettings.data ? (
          <div className="mt-4 space-y-4 rounded-md border border-border p-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <div>
                <Label htmlFor="handle">Profile link</Label>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-fg-subtle">/u/</span>
                  <Input
                    id="handle"
                    value={handle}
                    onChange={(event) => setHandle(event.target.value)}
                    maxLength={32}
                  />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => profile.mutate({ handle })}
                  loading={profile.isPending}
                >
                  Save link
                </Button>
                {publicSettings.data.publicUrl ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      void navigator.clipboard.writeText(publicSettings.data.publicUrl!);
                      toast.success('Link copied');
                    }}
                  >
                    <Copy size={14} /> Copy
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="divide-y divide-border-muted rounded-sm border border-border">
              {[
                {
                  key: 'published',
                  label: 'Publish my profile',
                  help: 'A public link that works without signing in.',
                  value: publicSettings.data.published,
                },
                {
                  key: 'mentorOptIn',
                  label: 'Discoverable as a mentor or contributor',
                  help: 'Lets maintainers send a platform outreach request.',
                  value: publicSettings.data.mentorOptIn,
                },
                {
                  key: 'showSkills',
                  label: 'Show skills and languages',
                  help: 'Your selected stack.',
                  value: publicSettings.data.showSkills,
                },
                {
                  key: 'showContributions',
                  label: 'Show merged contributions',
                  help: 'Repository, issue title and merge date.',
                  value: publicSettings.data.showContributions,
                },
                {
                  key: 'showBadges',
                  label: 'Show badges',
                  help: 'Only badges you marked visible appear.',
                  value: publicSettings.data.showBadges,
                },
                {
                  key: 'showStreak',
                  label: 'Show streak',
                  help: 'Current and longest contribution streak.',
                  value: publicSettings.data.showStreak,
                },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4 p-3">
                  <div>
                    <p className="text-[12px] text-fg">{item.label}</p>
                    <p className="text-[10px] text-fg-subtle">{item.help}</p>
                  </div>
                  <Switch
                    checked={item.value}
                    onCheckedChange={(checked) => profile.mutate({ [item.key]: checked })}
                    label={item.label}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Skeleton className="mt-4 h-40 w-full" />
        )}
      </section>
    </div>
  );
}
