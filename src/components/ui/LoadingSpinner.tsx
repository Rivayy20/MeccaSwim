import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ className, text = 'Memuat...', size = 'md', ...props }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 p-6', className)} {...props}>
      <Loader2 className={cn('animate-spin text-primary-500', sizes[size])} />
      {text && <p className="text-sm font-semibold text-muted-foreground animate-pulse">{text}</p>}
    </div>
  );
}
