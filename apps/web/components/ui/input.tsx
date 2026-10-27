import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const base =
  'w-full rounded-sm border border-border bg-canvas px-3 text-[14px] text-fg placeholder:text-fg-subtle transition-colors hover:border-border-strong focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-60';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(base, 'h-10', className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(base, 'min-h-[96px] py-2.5 leading-6', className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(base, 'h-10 appearance-none pr-8', className)} {...props}>
      {children}
    </select>
  );
}

export function Label({
  htmlFor,
  children,
  hint,
  className,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn('mb-1.5 flex items-baseline justify-between gap-3', className)}>
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-fg">
        {children}
      </label>
      {hint ? <span className="text-[11px] text-fg-subtle">{hint}</span> : null}
    </div>
  );
}

export function Helper({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-[12px] leading-5 text-fg-subtle">{children}</p>;
}

export function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-1.5 text-[12px] leading-5 text-danger">
      {children}
    </p>
  );
}
