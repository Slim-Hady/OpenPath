'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  children,
  title,
  description,
  size = 'md',
}: {
  children: ReactNode;
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const width = size === 'sm' ? 'max-w-[400px]' : size === 'lg' ? 'max-w-[720px]' : 'max-w-[520px]';
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[var(--canvas-overlay)] backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-canvas-subtle p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] focus:outline-none',
          width,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <DialogPrimitive.Title className="text-[18px] font-semibold tracking-[-0.01em] text-fg">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="mt-1 text-[13px] leading-6 text-fg-muted">
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>
          <DialogPrimitive.Close
            className="rounded-sm p-1 text-fg-subtle transition-colors hover:bg-canvas hover:text-fg"
            aria-label="Close"
          >
            <X size={16} strokeWidth={1.75} />
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const Tabs = TabsPrimitive.Root;

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <TabsPrimitive.List
      className={cn('flex items-center gap-1 border-b border-border', className)}
    >
      {children}
    </TabsPrimitive.List>
  );
}

export function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className="relative -mb-px border-b-2 border-transparent px-3 py-2.5 text-[13px] font-medium text-fg-muted transition-colors hover:text-fg data-[state=active]:border-accent data-[state=active]:text-fg"
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({ value, children }: { value: string; children: ReactNode }) {
  return (
    <TabsPrimitive.Content value={value} className="pt-6 focus:outline-none">
      {children}
    </TabsPrimitive.Content>
  );
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-label={label}
      className="relative h-5 w-9 shrink-0 rounded-full border border-border bg-border-muted transition-colors data-[state=checked]:border-accent data-[state=checked]:bg-accent disabled:opacity-50"
    >
      <SwitchPrimitive.Thumb className="block h-3.5 w-3.5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[18px]" />
    </SwitchPrimitive.Root>
  );
}
