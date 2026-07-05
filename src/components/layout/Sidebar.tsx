'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { NAV_ITEMS, APP_NAME } from '@/lib/constants';
import { BarChart3, GraduationCap, LayoutDashboard, QrCode, Users, CreditCard, UserPlus, X } from 'lucide-react';
import { useDashboardAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { registrationService } from '@/services';

const NAV_ICONS = {
  LayoutDashboard,
  Users,
  GraduationCap,
  QrCode,
  CreditCard,
  BarChart3,
  UserPlus,
} as const;

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const isDemo = pathname.startsWith('/demo');
  const { user } = useDashboardAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!user?.id || isDemo) return;
    const fetchPending = async () => {
      if (!user?.id) return;
      const res = await registrationService.getPendingRegistrations(supabase, user.id);
      if (res.data) setPendingCount(res.data.length);
    }
    fetchPending();

    const channel = supabase
      .channel('sidebar-registrations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_registrations', filter: `guru_id=eq.${user.id}` },
        () => {
          fetchPending();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, supabase, isDemo]);

  return (
    <>
      {/* Mobile/Tablet Overlay */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-[rgba(0,0,0,0.35)] transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      <aside
        className={cn(
          "flex flex-col gradient-sidebar text-white shrink-0",
          // Desktop mode (>=1024px): static, always visible, w-[280px], no shadow
          "lg:static lg:flex lg:w-[280px] lg:translate-x-0 lg:shadow-none lg:z-auto",
          // Mobile/Tablet Drawer mode (<1024px): fixed, top-0, left-0, bottom-0, z-50, w-[280px], shadow-2xl, transition transform
          "fixed top-0 left-0 bottom-0 z-50 w-[280px] shadow-2xl transition-transform",
          isOpen
            ? "translate-x-0 duration-[250ms] ease-out"
            : "-translate-x-full lg:translate-x-0 duration-[200ms] ease-in"
        )}
      >
        {/* Brand/Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 flex-shrink-0 rounded-full overflow-hidden shadow-sm border border-white/20 bg-white/10">
              <Image src="/icons/logo.png" alt="Logo" fill className="object-cover" />
            </div>
            <span className="font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-200">
              {APP_NAME}
            </span>
          </div>
          {/* Close button for Mobile Drawer mode */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 -mr-2 text-slate-400 hover:text-white transition-colors rounded-lg focus:outline-none"
              title="Tutup Sidebar"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
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
                onClick={() => {
                  if (onClose) onClose();
                }}
                className={cn(
                  'flex items-center justify-between py-3 rounded-xl font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-300 border-l-4 border-cyan-400 pl-3 pr-4 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                    : 'px-4 text-slate-300 hover:bg-white/5 hover:text-white hover:scale-[1.02]'
                )}
              >
                <div className="flex items-center gap-3.5">
                  {Icon && (
                    <Icon
                      className={cn(
                        'h-5 w-5 transition-transform duration-200',
                        isActive ? 'text-cyan-300' : 'text-slate-400 group-hover:text-white group-hover:scale-110'
                      )}
                    />
                  )}
                  <span>{item.label}</span>
                </div>
                {item.href === '/dashboard/registrasi' && pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white animate-pulse shadow-sm">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {isDemo && (
          <div className="p-4 mb-4 mx-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center gap-2 text-yellow-500 font-bold text-xs uppercase tracking-wider shrink-0">
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
