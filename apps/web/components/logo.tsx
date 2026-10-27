import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({
  size = 20,
  withWordmark = true,
  className,
}: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <Link href="/" className={cn('inline-flex items-center gap-2.5 text-fg', className)} aria-label="OpenSource-helper home">
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden
        className="text-accent"
      >
        <path
          d="M6.2 5.2 2.6 10l3.6 4.8M13.8 5.2 17.4 10l-3.6 4.8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M11.4 4.6 8.6 15.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {withWordmark ? (
        <span className="text-[15px] font-medium tracking-[-0.02em] text-fg">OpenSource-helper</span>
      ) : null}
    </Link>
  );
}
