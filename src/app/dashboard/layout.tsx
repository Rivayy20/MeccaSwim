'use client';

import React, { useEffect, useState } from 'react';
import { DashboardAuthProvider, useAuth } from '@/hooks/useAuth';
import { Sidebar, Header } from '@/components/layout';
import { LoadingSpinner, Input, Button, Modal, Badge } from '@/components/ui';
import { useRouter, usePathname } from 'next/navigation';
import { User, Mail, LogOut, Clock, UserPlus, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { permitService, registrationService } from '@/services';
import { PermitWithStudent } from '@/services/permit.service';
import { StudentRegistration } from '@/lib/types';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { user, profile, loading, signOut, updateProfile } = auth;
  const router = useRouter();
  const pathname = usePathname();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [namaGuru, setNamaGuru] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [permits, setPermits] = useState<PermitWithStudent[]>([]);
  const [pendingRegistrations, setPendingRegistrations] = useState<StudentRegistration[]>([]);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<'permits' | 'registrations'>('permits');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    const fetchRegistrations = async () => {
      try {
        const res = await registrationService.getPendingRegistrations(supabase, user.id);
        if (res.data) setPendingRegistrations(res.data);
      } catch (err) {
        console.warn('Gagal memuat pendaftaran pending:', err);
      }
    };

    fetchPermits();
    fetchRegistrations();

    const channelPermits = supabase
      .channel(`realtime-permits-layout-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'permits' },
        () => {
          fetchPermits();
        }
      )
      .subscribe();

    const channelRegs = supabase
      .channel(`realtime-regs-layout-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_registrations', filter: `guru_id=eq.${user.id}` },
        () => {
          fetchRegistrations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelPermits);
      supabase.removeChannel(channelRegs);
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
    if (pathname.startsWith('/dashboard/registrasi')) return 'Kelola Registrasi Murid';
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
  const totalNotifications = permits.length + pendingRegistrations.length;

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
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Sticky Header */}
          <Header
            title={getPageTitle()}
            userName={userName}
            notificationCount={totalNotifications}
            onNotificationClick={() => {
              if (pendingRegistrations.length > 0 && permits.length === 0) {
                setNotifTab('registrations');
              } else {
                setNotifTab('permits');
              }
              setIsNotificationModalOpen(true);
            }}
            onProfileClick={() => setIsProfileModalOpen(true)}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          {/* Content Body */}
          <main className="flex-1 overflow-y-auto p-3 pb-5 sm:p-6 max-w-7xl w-full mx-auto animate-fade-in focus:outline-none">
            {children}
          </main>
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

      {/* Integrated Notification Modal */}
      <Modal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        title="Pusat Notifikasi Instruktur"
      >
        <div className="space-y-4">
          {/* Tab Switcher */}
          <div className="flex border-b border-border gap-2">
            <button
              onClick={() => setNotifTab('permits')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                notifTab === 'permits'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Izin Hari Ini</span>
              <span className="px-1.5 py-0.2 rounded-full bg-muted text-[10px] font-extrabold">
                {permits.length}
              </span>
            </button>
            <button
              onClick={() => setNotifTab('registrations')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                notifTab === 'registrations'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Pendaftaran Baru</span>
              {pendingRegistrations.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-extrabold animate-pulse">
                  {pendingRegistrations.length}
                </span>
              )}
            </button>
          </div>

          {notifTab === 'permits' ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                Daftar murid yang mengajukan izin hari ini melalui portal orang tua.
              </p>

              {permits.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
                  <span className="text-2xl block mb-1">🔔</span>
                  <p className="text-xs font-bold text-slate-400">Belum ada pengajuan izin masuk hari ini.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
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
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                Calon murid yang mendaftar secara online dan menunggu konfirmasi penempatan jam kelas Anda.
              </p>

              {pendingRegistrations.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
                  <span className="text-2xl block mb-1">📝</span>
                  <p className="text-xs font-bold text-slate-400">Belum ada pendaftaran murid baru yang menunggu konfirmasi.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {pendingRegistrations.map((reg) => (
                    <div
                      key={reg.id}
                      className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-foreground">{reg.nama}</span>
                        <span className="text-[10px] font-extrabold text-primary px-2 py-0.5 rounded-full bg-primary/10">
                          {reg.lokasi}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Ortu: <strong className="text-foreground">{reg.ortu_nama}</strong> ({reg.ortu_hp})
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2">
                <Button
                  onClick={() => {
                    setIsNotificationModalOpen(false);
                    router.push('/dashboard/registrasi');
                  }}
                  rightIcon={<ArrowRight className="h-3.5 w-3.5 shrink-0" />}
                  className="w-full font-bold text-xs shadow-glow-cyan"
                >
                  Buka Kelola Registrasi Murid
                </Button>
              </div>
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
