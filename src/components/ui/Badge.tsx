import React from 'react';
import { cn } from '@/lib/utils/cn';
import { STATUS_CONFIG } from '@/lib/constants';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'hadir' | 'izin' | 'sakit' | 'alpha' | 'default' | 'primary' | 'secondary';
  showDot?: boolean;
}

export function Badge({ className, variant = 'default', showDot = true, children, ...props }: BadgeProps) {
  const isStatus = ['hadir', 'izin', 'sakit', 'alpha'].includes(variant);

  let styles = '';
  let dotColor = '';

  if (isStatus) {
    const config = STATUS_CONFIG[variant as keyof typeof STATUS_CONFIG];
    styles = `${config.bg} ${config.text} ${config.border} border`;
    dotColor = config.dot;
  } else {
    const fallbackStyles = {
      default: 'bg-muted text-muted-foreground border border-border',
      primary: 'bg-primary-50 text-primary-700 border border-primary-200 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900',
      secondary: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    };
    styles = fallbackStyles[variant as 'default' | 'primary' | 'secondary'] || fallbackStyles.default;
    dotColor = variant === 'primary' ? 'bg-primary-500' : 'bg-muted-foreground';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold select-none',
        styles,
        className
      )}
      {...props}
    >
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColor)} />}
      <span>{children}</span>
    </span>
  );
}
