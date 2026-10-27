'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AiSettings, AiUsageSummary } from '@osh/contracts';
import { Settings2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { EmptyState, Meter, Skeleton } from '@/components/ui/card';
import { FieldError, Input, Label } from '@/components/ui/input';
import { apiFetch, ApiError, errorMessage } from '@/lib/api-client';

export default function AdminAiPage() {
  const queryClient = useQueryClient();
  const settings = useQuery({
    queryKey: ['admin-ai-settings'],
    queryFn: () => apiFetch<AiSettings>('/admin/ai-settings'),
    retry: false,
  });
  const usage = useQuery({
    queryKey: ['admin-ai-usage-month'],
    queryFn: () => apiFetch<{ settings: AiSettings; usage: AiUsageSummary }>('/admin/ai-settings/usage'),
    retry: false,
  });
  const [maxTokens, setMaxTokens] = useState(20000);
  const [temperature, setTemperature] = useState(0.4);
  const [limit, setLimit] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!settings.data || initialized) return;
    setMaxTokens(settings.data.maxTokensPerUser);
    setTemperature(settings.data.temperature);
    setLimit(settings.data.usageLimitUsd);
    setInitialized(true);
  }, [settings.data, initialized]);

  const save = useMutation({
    mutationFn: () =>
      apiFetch<AiSettings>('/admin/ai-settings', {
        method: 'PUT',
        body: { maxTokensPerUser: maxTokens, temperature, usageLimitUsd: limit },
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['admin-ai-settings'], data);
      setError(null);
      toast.success('AI settings saved. They apply from the next request.');
    },
    onError: (caught) => setError(errorMessage(caught)),
  });

  if (settings.isError) {
    const forbidden = settings.error instanceof ApiError && settings.error.status === 403;
    return (
      <EmptyState
        title={forbidden ? 'You don’t have access to this.' : 'Could not load AI settings'}
        description={forbidden ? 'Only an Admin can change AI limits.' : errorMessage(settings.error)}
        action={<Link href="/discover" className="text-[12px] text-accent hover:underline">Back to Discover</Link>}
      />
    );
  }
  if (settings.isLoading || !settings.data) return <Skeleton className="h-80 w-full" />;

  const monthUsage = usage.data?.usage;

  return (
    <div className="max-w-[820px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-fg">AI settings</h1>
          <p className="mt-1.5 text-[13px] text-fg-muted">
            Limits are enforced server-side before every provider call.
          </p>
        </div>
        <Link href="/admin" className="text-[12px] text-accent hover:underline">
          Back to dashboard
        </Link>
      </div>

      {monthUsage ? (
        <div className="mt-6 rounded-md border border-border bg-canvas-subtle p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-medium text-fg">This month against the platform limit</p>
              <p className="mt-0.5 text-[10px] text-fg-subtle">
                {monthUsage.totalTokens.toLocaleString()} tokens · ${monthUsage.costUsd.toFixed(2)} of $
                {monthUsage.usageLimitUsd.toFixed(2)}
              </p>
            </div>
            <span className="tabular text-[20px] font-semibold text-fg">{monthUsage.percentOfLimit}%</span>
          </div>
          <div className="mt-3">
            <Meter value={monthUsage.costUsd} max={monthUsage.usageLimitUsd} />
          </div>
          <div className="mt-3 grid gap-1 sm:grid-cols-2">
            {monthUsage.byFeature.map((feature) => (
              <p key={feature.feature} className="flex justify-between text-[10px] text-fg-subtle">
                <span>{feature.feature.replaceAll('_', ' ').toLowerCase()}</span>
                <span className="tabular">{feature.totalTokens.toLocaleString()}</span>
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <form
        className="mt-6 space-y-6 rounded-md border border-border p-5"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
      >
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Label htmlFor="maxTokens">Maximum tokens per user, per month</Label>
              <p className="text-[11px] text-fg-subtle">Applies across CV, matching, onboarding and the guide.</p>
            </div>
            <span className="tabular rounded-sm border border-border px-2 py-1 text-[11px] text-fg">
              {maxTokens.toLocaleString()}
            </span>
          </div>
          <input
            id="maxTokens"
            type="range"
            min={2000}
            max={100000}
            step={1000}
            value={maxTokens}
            onChange={(event) => setMaxTokens(Number(event.target.value))}
            className="mt-3 w-full accent-[var(--accent)]"
          />
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Label htmlFor="temperature">Temperature</Label>
              <p className="text-[11px] text-fg-subtle">
                At 0.4 answers are focused. At 0.9 they are more creative and less predictable.
              </p>
            </div>
            <span className="tabular rounded-sm border border-border px-2 py-1 text-[11px] text-fg">
              {temperature.toFixed(1)}
            </span>
          </div>
          <input
            id="temperature"
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={temperature}
            onChange={(event) => setTemperature(Number(event.target.value))}
            className="mt-3 w-full accent-[var(--accent)]"
          />
          <p className="mt-1 text-[11px] text-fg-subtle">
            {temperature <= 0.4
              ? 'Focused and consistent. Recommended for onboarding.'
              : temperature <= 0.7
                ? 'Balanced. Good for the guide.'
                : 'Creative and less predictable. Test the guardrail after changing this.'}
          </p>
        </div>

        <div>
          <Label htmlFor="limit">Platform usage limit per month (USD)</Label>
          <Input
            id="limit"
            type="number"
            min={0}
            max={10000}
            step={0.5}
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
            className="max-w-[180px]"
          />
          <p className="mt-1 text-[11px] text-fg-subtle">
            When the limit is reached, every AI feature is blocked and the user is told why.
          </p>
        </div>

        {error ? <FieldError>{error}</FieldError> : null}
        <div className="flex items-center gap-3">
          <Button type="submit" loading={save.isPending}>
            Save settings
          </Button>
          <span className="flex items-center gap-1 text-[10px] text-fg-subtle">
            <Settings2 size={11} /> Changes apply from the next AI request.
          </span>
        </div>
      </form>
    </div>
  );
}
