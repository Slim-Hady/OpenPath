'use client';

import { useQuery } from '@tanstack/react-query';
import type { AdminMetrics, AiUsageSummary } from '@osh/contracts';
import { Activity, RefreshCw, Settings2, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { EmptyState, Pill, Skeleton } from '@/components/ui/card';
import { apiFetch, ApiError, errorMessage } from '@/lib/api-client';
import { formatNumber, relativeTime } from '@/lib/utils';

const PERIODS = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
];

export default function AdminPage() {
  const [days, setDays] = useState(30);
  const end = new Date();
  const start = new Date(end.getTime() - days * 86_400_000);
  const metrics = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => apiFetch<AdminMetrics>('/admin/metrics'),
    retry: false,
  });
  const usage = useQuery({
    queryKey: ['admin-usage', days],
    queryFn: () =>
      apiFetch<AiUsageSummary>(
        `/admin/ai-usage?start=${start.toISOString()}&end=${end.toISOString()}`,
      ),
    retry: false,
  });

  if (metrics.isError) {
    const forbidden = metrics.error instanceof ApiError && metrics.error.status === 403;
    return (
      <EmptyState
        title={forbidden ? 'You don’t have access to this.' : 'Could not load metrics'}
        description={forbidden ? 'Only an Admin can open the dashboard.' : errorMessage(metrics.error)}
        action={<Link href="/discover" className="text-[12px] text-accent hover:underline">Back to Discover</Link>}
      />
    );
  }

  const data = metrics.data;
  const totalStatus = data
    ? data.statusCounts.inProgress + data.statusCounts.prOpen + data.statusCounts.merged
    : 0;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-fg">Admin dashboard</h1>
          <p className="mt-1.5 text-[13px] text-fg-muted">
            Usage, contribution status and AI consumption. Figures are at most five minutes old.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Pill tone={data?.fresh ? 'success' : 'attention'}>
            <RefreshCw size={10} /> updated {relativeTime(data?.capturedAt)}
          </Pill>
          <Link
            href="/admin/ai"
            className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border px-3 text-[12px] text-fg hover:border-border-strong"
          >
            <Settings2 size={14} /> AI settings
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Registered users', value: data?.registeredUsers, icon: Users },
          { label: 'Logged in (30d)', value: data?.loggedInUsers, icon: Activity },
          { label: 'Issues suggested', value: data?.issuesSuggested, icon: Activity },
          { label: 'Regenerated', value: data?.issuesRegenerated, icon: RefreshCw },
        ].map((card) => (
          <div key={card.label} className="rounded-md border border-border bg-canvas-subtle p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-fg-subtle">{card.label}</p>
              <card.icon size={14} className="text-fg-subtle" />
            </div>
            {card.value === undefined ? (
              <Skeleton className="mt-2 h-8 w-16" />
            ) : (
              <p className="tabular mt-1 text-[28px] font-semibold text-fg">{formatNumber(card.value)}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-md border border-border p-4">
          <h2 className="text-[14px] font-semibold text-fg">Issue status</h2>
          {!data ? (
            <Skeleton className="mt-3 h-16 w-full" />
          ) : totalStatus === 0 ? (
            <p className="mt-2 text-[11px] text-fg-subtle">No selected issues yet.</p>
          ) : (
            <>
              <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-border-muted">
                <span
                  className="bg-accent"
                  style={{ width: `${(data.statusCounts.inProgress / totalStatus) * 100}%` }}
                />
                <span
                  className="bg-attention"
                  style={{ width: `${(data.statusCounts.prOpen / totalStatus) * 100}%` }}
                />
                <span
                  className="bg-success"
                  style={{ width: `${(data.statusCounts.merged / totalStatus) * 100}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-fg-muted">
                <span>In Progress {data.statusCounts.inProgress}</span>
                <span>PR Open {data.statusCounts.prOpen}</span>
                <span>Merged {data.statusCounts.merged}</span>
                <span>Ignored {data.statusCounts.ignored}</span>
              </div>
            </>
          )}
        </section>

        <section className="rounded-md border border-border p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[14px] font-semibold text-fg">AI usage</h2>
            <div className="flex gap-1">
              {PERIODS.map((period) => (
                <button
                  key={period.days}
                  type="button"
                  onClick={() => setDays(period.days)}
                  className={`rounded-full border px-2 py-0.5 text-[10px] ${
                    days === period.days
                      ? 'border-accent bg-accent-subtle text-accent'
                      : 'border-border text-fg-subtle'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
          {usage.isLoading || !usage.data ? (
            <Skeleton className="mt-3 h-16 w-full" />
          ) : (
            <>
              <div className="mt-3 flex items-end justify-between">
                <p className="tabular text-[24px] font-semibold text-fg">
                  {formatNumber(usage.data.totalTokens)}
                  <span className="ml-1 text-[10px] font-normal text-fg-subtle">tokens</span>
                </p>
                <p className="text-[11px] text-fg-subtle">${usage.data.costUsd.toFixed(2)}</p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border-muted">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${usage.data.percentOfLimit}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-fg-subtle">
                {usage.data.percentOfLimit}% of the ${usage.data.usageLimitUsd} platform budget
              </p>
              <div className="mt-3 divide-y divide-border-muted">
                {usage.data.byFeature.map((feature) => (
                  <div key={feature.feature} className="flex items-center justify-between py-1.5 text-[11px]">
                    <span className="text-fg-muted">{feature.feature.replaceAll('_', ' ').toLowerCase()}</span>
                    <span className="tabular text-fg">{formatNumber(feature.totalTokens)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
