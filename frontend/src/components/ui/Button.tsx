import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  children?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[--color-accent] text-[--color-background] hover:bg-[--color-accent-hover] shadow-md hover:shadow-[--shadow-glow] font-semibold',
  secondary:
    'bg-[--color-surface] text-[--color-foreground] hover:bg-[--color-surface-raised] border border-[--color-border]',
  ghost:
    'bg-transparent text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-surface]',
  outline:
    'bg-transparent border border-[--color-accent] text-[--color-accent] hover:bg-[--color-accent-muted]',
  danger:
    'bg-[--color-destructive] text-white hover:opacity-90',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm:  'px-3 py-1.5 text-sm gap-1.5',
  md:  'px-5 py-2.5 text-sm gap-2',
  lg:  'px-7 py-3.5 text-base gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, iconRight, children, className, disabled, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'inline-flex items-center justify-center rounded-[--radius-lg] font-medium cursor-pointer',
        'transition-all duration-[--duration-base] ease-[--ease-expo-out]',
        'focus-visible:outline-2 focus-visible:outline-[--color-accent] focus-visible:outline-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      disabled={disabled || loading}
      {...(props as object)}
    >
      {loading ? (
        <span className="spinner" aria-hidden="true" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </motion.button>
  ),
);

Button.displayName = 'Button';
