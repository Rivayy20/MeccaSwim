'use client';

import { Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
  userName?: string;
  onProfileClick?: () => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

export function Header({
  title,
  userName = 'Guru',
  onProfileClick,
  notificationCount = 0,
  onNotificationClick,
}: HeaderProps) {
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 w-full h-14 sm:h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-base sm:text-lg lg:text-xl font-bold text-foreground transition-all duration-200 truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notification Bell */}
        <button
          onClick={onNotificationClick}
          className="relative p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none active:scale-95"
          title="Izin Latihan Masuk"
        >
          <Bell className="h-6 w-6" />
          {notificationCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-red-500 text-xs font-extrabold text-white flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse select-none">
              {notificationCount}
            </span>
          )}
        </button>

        {/* User profile avatar and label */}
        <button
          onClick={onProfileClick}
          className="flex items-center gap-3 hover:opacity-85 active:scale-95 transition-all text-left focus:outline-none"
          title="Buka Pengaturan Profil"
        >
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-bold text-foreground leading-tight">{userName}</span>
            <span className="text-xs text-muted-foreground leading-none">Guru Renang</span>
          </div>
          <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-white font-bold border border-cyan-400 select-none shadow-sm">
            {initial}
          </div>
        </button>
      </div>
    </header>
  );
}
