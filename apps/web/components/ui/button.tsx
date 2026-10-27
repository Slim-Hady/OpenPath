import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const buttonStyles = cva(
  'inline-flex items-center justify-center gap-2 rounded-sm text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-white hover:bg-accent-hover',
        secondary: 'border border-border bg-transparent text-fg hover:border-border-strong hover:bg-canvas-subtle',
        ghost: 'text-fg-muted hover:bg-canvas-subtle hover:text-fg',
        danger: 'bg-danger text-white hover:opacity-90',
        subtle: 'bg-accent-subtle text-accent hover:bg-accent/20',
      },
      size: {
        sm: 'h-8 px-3 text-[12px]',
        md: 'h-10 px-4',
        lg: 'h-11 px-5 text-[15px]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonStyles({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent',
        className,
      )}
    />
  );
}
