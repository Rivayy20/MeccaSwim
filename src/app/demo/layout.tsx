'use client';

import React, { useState } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { Modal, Button } from '@/components/ui';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { DemoAlertWrapper } from '@/components/DemoAlert';

// We mock the AuthProvider context so Sidebar/Header don't crash
import { DashboardAuthProvider } from '@/hooks/useAuth';

const mockAuthContext = {
  user: { id: 'demo-user-123', email: 'instruktur@demo.com' },
  profile: { nama: 'Instruktur Demo' },
  loading: false,
  signIn: async () => true,
  signUp: async () => true,
  signOut: async () => {},
  updateProfile: async () => true,
  resetPassword: async () => true,
  updatePassword: async () => true,
  session: null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  const getPageTitle = () => {
    if (pathname === '/demo/dashboard') return 'Dashboard Utama (Demo)';
    return 'Mecca Swim (Demo)';
  };

  return (
    <DashboardAuthProvider value={mockAuthContext}>
      {/* Demo Banner */}
      <div className="bg-yellow-500 text-yellow-950 px-4 py-2 text-center text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-2 z-50 relative shadow-md">
        <div className="flex items-center gap-2">
          <span>🚨</span>
          <span>LIVE DEMO MODE (READ-ONLY) - Fitur perubahan data dinonaktifkan</span>
          <span>🚨</span>
        </div>
        <Link 
          href="/" 
          className="mt-2 sm:mt-0 sm:ml-4 px-3 py-1 bg-yellow-950 text-yellow-500 rounded-full text-[10px] sm:text-xs font-black hover:bg-yellow-900 transition-colors inline-flex items-center gap-1"
        >
          ← Kembali ke Website
        </Link>
      </div>

      <div className="min-h-[calc(100vh-40px)] flex bg-background text-foreground overflow-hidden">
        {/* Sidebar no longer wrapped globally so flexbox doesn't break */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative pb-16 lg:pb-0">
          <Header
            title={getPageTitle()}
            userName="Instruktur Demo"
            notificationCount={1}
            onNotificationClick={() => setIsNotificationModalOpen(true)}
            onProfileClick={() => setIsProfileModalOpen(true)}
          />

          {/* Content Body */}
          <main className="flex-1 overflow-y-auto p-3 pb-5 sm:p-6 max-w-7xl w-full mx-auto animate-fade-in focus:outline-none relative">
            <DemoAlertWrapper>
              {children}
            </DemoAlertWrapper>
          </main>

          <MobileNav />
        </div>
      </div>

      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Pengaturan Profil (Demo)"
      >
        <div className="text-center p-6 text-slate-500">
          <p>Pengaturan profil tidak tersedia di Mode Demo.</p>
          <Button className="mt-4" onClick={() => setIsProfileModalOpen(false)}>Tutup</Button>
        </div>
      </Modal>

      <Modal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        title="Izin Masuk (Demo)"
      >
        <div className="text-center p-6 text-slate-500">
          <p>Notifikasi izin pura-pura untuk demonstrasi.</p>
          <Button className="mt-4" onClick={() => setIsNotificationModalOpen(false)}>Tutup</Button>
        </div>
      </Modal>
    </DashboardAuthProvider>
  );
}
