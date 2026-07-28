import React from 'react';
import { cn } from './Button';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'border-transparent bg-[var(--color-slate-900)] text-white hover:bg-[var(--color-slate-700)]',
    secondary: 'border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100',
    outline: 'text-[var(--color-foreground)]',
    success: 'border-transparent bg-green-500/15 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    warning: 'border-transparent bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    danger: 'border-transparent bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-gold-500)] focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
