'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { NAV_ITEMS } from '@/lib/constants';
import { BarChart3, GraduationCap, LayoutDashboard, QrCode, Users, CreditCard, UserPlus } from 'lucide-react';

const NAV_ICONS = {
  LayoutDashboard,
  Users,
  GraduationCap,
  QrCode,
  CreditCard,
  BarChart3,
  UserPlus,
} as const;

export function MobileNav() {
  const pathname = usePathname();
  const isDemo = pathname.startsWith('/demo');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-[calc(4rem+env(safe-area-inset-bottom))] bg-background/95 backdrop-blur-md border-t border-border lg:hidden flex justify-around items-start pt-1.5 px-1 pb-[env(safe-area-inset-bottom)] shadow-lg">
      {NAV_ITEMS.map((item) => {
        const Icon = NAV_ICONS[item.icon as keyof typeof NAV_ICONS];
        
        // Rewrite href if in demo mode
        const targetHref = isDemo 
          ? (item.href === '/dashboard' ? '/demo/dashboard' : item.href.replace('/dashboard', '/demo')) 
          : item.href;
        
        const isActive = targetHref === (isDemo ? '/demo/dashboard' : '/dashboard')
          ? pathname === targetHref
          : pathname === targetHref || pathname.startsWith(`${targetHref}/`);

        return (
          <Link
            key={targetHref}
            href={targetHref}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-12 rounded-xl gap-1 text-[10px] font-semibold transition-colors duration-200',
              isActive
                ? 'text-primary-600 bg-primary-500/10'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  'h-5 w-5 transition-transform duration-200',
                  isActive ? 'text-primary-500' : 'text-muted-foreground'
                )}
              />
            )}
            <span className="truncate max-w-[60px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
