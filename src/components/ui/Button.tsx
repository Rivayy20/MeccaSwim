'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-200 focus-ring disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

    const variants = {
      primary: 'gradient-primary text-white shadow-md hover:shadow-lg hover:brightness-105',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-slate-200 dark:hover:bg-slate-700',
      outline: 'border-2 border-primary-500 text-primary-600 dark:text-primary-400 bg-transparent hover:bg-primary-50 dark:hover:bg-cyan-950/30',
      danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-md',
      ghost: 'bg-transparent text-foreground hover:bg-muted',
    };

    const sizes = {
      sm: 'h-9 px-3 text-xs gap-1.5 rounded-md',
      md: 'h-10 px-5 text-sm gap-2 rounded-lg',
      lg: 'h-12 px-7 text-base gap-2.5 rounded-xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
        {!isLoading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
