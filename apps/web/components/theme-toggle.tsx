'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className={compact ? 'h-8 w-8' : 'h-8 w-[86px]'} aria-hidden />;
  if (compact) {
    const dark = resolvedTheme === 'dark';
    return (
      <button
        type="button"
        aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
        onClick={() => setTheme(dark ? 'light' : 'dark')}
        className="rounded-sm p-1.5 text-fg-muted transition-colors hover:bg-canvas-subtle hover:text-fg"
      >
        {dark ? <Moon size={18} strokeWidth={1.75} /> : <Sun size={18} strokeWidth={1.75} />}
      </button>
    );
  }
  return (
    <div
      className="inline-flex items-center rounded-sm border border-border p-0.5"
      role="group"
      aria-label="Theme"
    >
      {[
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'system', icon: Monitor, label: 'System' },
        { value: 'dark', icon: Moon, label: 'Dark' },
      ].map((item) => (
        <button
          key={item.value}
          type="button"
          aria-label={item.label}
          aria-pressed={theme === item.value}
          onClick={() => setTheme(item.value)}
          className={cn(
            'rounded-[4px] p-1.5 text-fg-subtle transition-colors hover:text-fg',
            theme === item.value && 'bg-accent-subtle text-accent',
          )}
        >
          <item.icon size={15} strokeWidth={1.75} />
        </button>
      ))}
    </div>
  );
}
