'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { NAV_ITEMS, APP_NAME } from '@/lib/constants';
import { BarChart3, GraduationCap, LayoutDashboard, QrCode, Users, CreditCard } from 'lucide-react';

const NAV_ICONS = {
  LayoutDashboard,
  Users,
  GraduationCap,
  QrCode,
  CreditCard,
  BarChart3,
} as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside
        className="hidden lg:flex lg:static shrink-0 flex-col w-[280px] gradient-sidebar text-white"
      >
        {/* Brand/Logo */}
        <div className="flex items-center gap-3 h-16 px-6 border-b border-white/10">
          <span className="text-2xl" role="img" aria-label="wave">
            🏊
          </span>
          <span className="font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-200">
            {APP_NAME}
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = NAV_ICONS[item.icon];
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-l-4 border-cyan-400 pl-3'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-transform duration-200 group-hover:scale-110',
                      isActive ? 'text-cyan-300' : 'text-slate-400 group-hover:text-white'
                    )}
                  />
                )}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
