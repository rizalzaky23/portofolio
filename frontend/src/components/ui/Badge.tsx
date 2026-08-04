import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'outline';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:  'bg-[--color-surface] text-[--color-muted] border border-[--color-border]',
  accent:   'bg-[--color-accent-muted] text-[--color-accent] border border-[--color-accent]/20',
  success:  'bg-green-500/10 text-green-400 border border-green-500/20',
  warning:  'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  danger:   'bg-red-500/10 text-red-400 border border-red-500/20',
  outline:  'bg-transparent text-[--color-muted] border border-[--color-border]',
};

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variantStyles[variant],
      className,
    )}
  >
    {children}
  </span>
);
