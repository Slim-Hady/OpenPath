import type { ReactNode } from 'react';
import { cn, initials } from '@/lib/utils';
import type { ProgressStatus } from '@osh/contracts';

export function Card({
  children,
  className,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-md border border-border bg-canvas-subtle',
        interactive &&
          'transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-border-strong',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-fg">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border px-6 py-14 text-center">
      {icon ? <div className="mb-4 text-fg-subtle">{icon}</div> : null}
      <h3 className="text-[16px] font-semibold text-fg">{title}</h3>
      <p className="mt-1 max-w-[44ch] text-[13px] leading-6 text-fg-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-sm bg-border-muted', className)} aria-hidden />;
}

const pillStyles = {
  neutral: 'border-border text-fg-muted',
  accent: 'border-accent/30 bg-accent-subtle text-accent',
  success: 'border-success/30 bg-success/10 text-success',
  attention: 'border-attention/30 bg-attention/10 text-attention',
  danger: 'border-danger/30 bg-danger/10 text-danger',
  done: 'border-done/30 bg-done/10 text-done',
};

export function Pill({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof pillStyles;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
        pillStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const statusMap: Record<ProgressStatus, { label: string; tone: keyof typeof pillStyles; dot: string }> = {
  IN_PROGRESS: { label: 'In Progress', tone: 'accent', dot: '●' },
  PR_OPEN: { label: 'PR Open', tone: 'attention', dot: '●' },
  MERGED: { label: 'Merged', tone: 'success', dot: '✓' },
  IGNORED: { label: 'Ignored', tone: 'neutral', dot: '—' },
  PAUSED: { label: 'Paused', tone: 'neutral', dot: 'Ⅱ' },
};

export function StatusPill({ status }: { status: ProgressStatus }) {
  const item = statusMap[status];
  return (
    <Pill tone={item.tone}>
      <span aria-hidden>{item.dot}</span>
      {item.label}
    </Pill>
  );
}

export function Avatar({
  name,
  src,
  size = 32,
}: {
  name: string;
  src?: string | null;
  size?: 24 | 28 | 32 | 40 | 64;
}) {
  const pixels = `${size}px`;
  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full border border-border object-cover"
        style={{ width: pixels, height: pixels }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent-subtle font-medium text-accent"
      style={{ width: pixels, height: pixels, fontSize: Math.max(10, Math.round(size / 2.6)) }}
    >
      {initials(name)}
    </span>
  );
}

export function Meter({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label?: string;
}) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      {label ? (
        <div className="mb-2 flex items-baseline justify-between text-[11px] text-fg-subtle">
          <span>{label}</span>
          <span className="tabular">
            {value.toLocaleString()} / {max.toLocaleString()}
          </span>
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 overflow-hidden rounded-full bg-border-muted"
      >
        <div
          className={cn('h-full rounded-full transition-all duration-300', percent >= 90 ? 'bg-danger' : 'bg-accent')}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
