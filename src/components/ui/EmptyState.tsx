import React from 'react';
import { BarChart3, Calendar, GraduationCap, QrCode, Search, Users } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const EMPTY_STATE_ICONS = {
  BarChart3,
  Calendar,
  GraduationCap,
  QrCode,
  Search,
  Users,
} as const;

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: keyof typeof EMPTY_STATE_ICONS;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ className, icon = 'Search', title, description, action, ...props }: EmptyStateProps) {
  const IconComponent = EMPTY_STATE_ICONS[icon];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-2xl bg-card/30 backdrop-blur-sm animate-fade-in my-4',
        className
      )}
      {...props}
    >
      <div className="p-4 rounded-full bg-primary-50 dark:bg-cyan-950/20 text-primary-500 mb-4">
        {IconComponent && <IconComponent className="h-8 w-8" />}
      </div>
      <h3 className="text-base font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {action && <div className="flex items-center justify-center">{action}</div>}
    </div>
  );
}
