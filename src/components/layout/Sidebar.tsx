'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  const isDemo = pathname.startsWith('/demo');

  return (
    <>
      <aside
        className="hidden lg:flex lg:static shrink-0 flex-col w-[280px] gradient-sidebar text-white"
      >
        {/* Brand/Logo */}
        <div className="flex items-center gap-3 h-16 px-6 border-b border-white/10">
          <div className="relative h-10 w-10 flex-shrink-0 rounded-full overflow-hidden shadow-sm border border-white/20 bg-white/10">
            <Image src="/icons/logo.png" alt="Logo" fill className="object-cover" />
          </div>
          <span className="font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-200">
            {APP_NAME}
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = NAV_ICONS[item.icon];
            
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
                  'flex items-center gap-3.5 py-3 rounded-xl font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-300 border-l-4 border-cyan-400 pl-3 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                    : 'px-4 text-slate-300 hover:bg-white/5 hover:text-white hover:scale-[1.02]'
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-transform duration-200',
                      isActive ? 'text-cyan-300' : 'text-slate-400 group-hover:text-white group-hover:scale-110'
                    )}
                  />
                )}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {isDemo && (
          <div className="p-4 mb-4 mx-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center gap-2 text-yellow-500 font-bold text-xs uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
            Preview Version
          </div>
        )}
      </aside>
    </>
  );
}
