'use client';

import React, { useEffect, useState } from 'react';
import { DashboardAuthProvider, useAuth } from '@/hooks/useAuth';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { LoadingSpinner, Input, Button, Modal, Badge } from '@/components/ui';
import { useRouter, usePathname } from 'next/navigation';
import { User, Mail, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { permitService } from '@/services';
import { PermitWithStudent } from '@/services/permit.service';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { user, profile, loading, signOut, updateProfile } = auth;
  const router = useRouter();
  const pathname = usePathname();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [namaGuru, setNamaGuru] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [permits, setPermits] = useState<PermitWithStudent[]>([]);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (!user?.id) return;

    const fetchPermits = async () => {
      try {
        const res = await permitService.getTodayPermits(supabase, user.id);
        if (res.data) setPermits(res.data);
      } catch (err) {
        console.warn('Gagal memuat izin masuk:', err);
      }
    };

    fetchPermits();

    const channel = supabase
      .channel(`realtime-permits-layout-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'permits' },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          console.log('Realtime permit change received:', payload);
          fetchPermits();
        }
      )
      .subscribe((status: string) => {
        console.log(`Realtime permit subscription status for ${user.id}:`, status);
      });

    return () => {
      console.log(`Cleaning up realtime permit subscription for ${user.id}`);
      supabase.removeChannel(channel);
    };
  }, [user?.id, supabase]);

  // Register PWA Service Worker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('PWA Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.error('PWA Service Worker registration failed:', err);
        });
    }
  }, []);

  // Sync profile name to input state when profile loads or modal opens
  useEffect(() => {
    if (profile?.nama) {
      setNamaGuru(profile.nama);
    }
  }, [profile, isProfileModalOpen]);

  // If page is finished loading and there's no user, redirect to login
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Determine current page title based on path
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard Utama';
    if (pathname.startsWith('/dashboard/murid')) return 'Kelola Data Murid';
    if (pathname.startsWith('/dashboard/kelas')) return 'Kelola Kelas Renang';
    if (pathname.startsWith('/dashboard/sesi')) return 'Sesi Presensi QR';
    if (pathname.startsWith('/dashboard/rekap')) return 'Rekap & Laporan';
    return 'Mecca Swim';
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" text="Memverifikasi sesi..." />
      </div>
    );
  }

  const userName = profile?.nama || user.email?.split('@')[0] || 'Guru';

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaGuru.trim()) return;
    setIsSaving(true);
    const success = await updateProfile(namaGuru.trim());
    setIsSaving(false);
    if (success) {
      setIsProfileModalOpen(false);
    }
  };

  return (
    <DashboardAuthProvider value={auth}>
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative pb-16 lg:pb-0">
        {/* Sticky Header */}
        <Header
          title={getPageTitle()}
          userName={userName}
          notificationCount={permits.length}
          onNotificationClick={() => setIsNotificationModalOpen(true)}
          onProfileClick={() => setIsProfileModalOpen(true)}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-3 pb-5 sm:p-6 max-w-7xl w-full mx-auto animate-fade-in focus:outline-none">
          {children}
        </main>

        {/* Bottom Nav Bar (visible on mobile only) */}
        <MobileNav />
      </div>
    </div>

    {/* Profile Settings Modal */}
    <Modal
      isOpen={isProfileModalOpen}
      onClose={() => setIsProfileModalOpen(false)}
      title="Pengaturan Profil Guru"
    >
      <form onSubmit={handleSaveProfile} className="space-y-4">
        <div className="space-y-4">
          <Input
            label="Alamat Email (Tidak dapat diubah)"
            type="email"
            value={user.email || ''}
            disabled
            icon={<Mail className="h-4 w-4" />}
            className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed border-border"
          />
          
          <Input
            label="Nama Lengkap *"
            type="text"
            value={namaGuru}
            onChange={(e) => setNamaGuru(e.target.value)}
            placeholder="Nama Lengkap Guru"
            icon={<User className="h-4 w-4" />}
            className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-border"
            required
          />
        </div>

        <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-border">
          <div className="flex justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsProfileModalOpen(false)}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button
              type="submit"
              isLoading={isSaving}
            >
              Simpan Perubahan
            </Button>
          </div>
          
          <div className="border-t border-border my-2" />
          
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              setIsProfileModalOpen(false);
              void signOut();
            }}
            leftIcon={<LogOut className="h-4 w-4" />}
            className="w-full justify-center"
          >
            Keluar dari Akun
          </Button>
        </div>
      </form>
    </Modal>

    {/* Permits Notification Modal */}
    <Modal
      isOpen={isNotificationModalOpen}
      onClose={() => setIsNotificationModalOpen(false)}
      title="Izin Latihan Masuk Hari Ini"
    >
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
          Daftar murid yang mengajukan izin hari ini melalui portal orang tua. Status ini otomatis tersinkronisasi saat sesi latihan baru dimulai.
        </p>

        {permits.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
            <span className="text-2xl block mb-1">🔔</span>
            <p className="text-xs font-bold text-slate-400">Belum ada pengajuan izin masuk hari ini.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {permits.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-800/30 flex justify-between items-start gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-foreground">
                      {item.student?.nama || 'Murid'}
                    </span>
                    <Badge variant={item.status === 'sakit' ? 'sakit' : 'izin'}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Kelas: {item.student?.class?.nama || '-'}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2">
                    Keterangan: {item.keterangan || '-'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-border mt-4">
          <Button
            variant="outline"
            onClick={() => setIsNotificationModalOpen(false)}
            size="sm"
          >
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
    </DashboardAuthProvider>
  );
}
