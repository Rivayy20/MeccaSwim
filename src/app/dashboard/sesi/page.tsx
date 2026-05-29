'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDashboardAuth } from '@/hooks/useAuth';
import { useClasses } from '@/hooks/useClasses';
import { useSessions } from '@/hooks/useSessions';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Modal,
  Select,
  Badge,
  EmptyState,
  LoadingSpinner,
} from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { getSessions } from '@/services/session.service';
import { SessionWithClass, SessionStatus } from '@/lib/types';
import { Plus, Play, Calendar, Clock, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { formatHariTanggal, formatWaktu } from '@/lib/utils/date';

export default function SessionListPage() {
  const router = useRouter();
  const { user } = useDashboardAuth();
  const { classes, fetchClasses } = useClasses();
  const { createSession, loading: sessionActionLoading } = useSessions();

  const [sessions, setSessions] = useState<SessionWithClass[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetClassId, setTargetClassId] = useState('');
  const [duration, setDuration] = useState(15);

  const groupedClasses = useMemo(() => {
    const daysOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    
    const groups: Record<string, typeof classes> = {};
    classes.forEach((cls) => {
      const key = cls.nama || 'Lainnya';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(cls);
    });

    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => {
        const getTime = (jadwalStr: string | null) => {
          if (!jadwalStr) return '';
          const parts = jadwalStr.split(',');
          return parts[1]?.trim() || jadwalStr;
        };
        return getTime(a.jadwal).localeCompare(getTime(b.jadwal));
      });
    });

    return Object.keys(groups)
      .map((key) => {
        const dayName = key.replace('Kelas ', '').trim();
        const index = daysOrder.indexOf(dayName);
        return {
          label: key,
          index: index === -1 ? 99 : index,
          classes: groups[key]
        };
      })
      .sort((a, b) => a.index - b.index);
  }, [classes]);

  const supabase = createClient();
  const guruId = user?.id;

  const loadSessions = useCallback(async () => {
    if (!guruId) return;
    setLoading(true);
    const result = await getSessions(supabase, guruId, {
      kelas_id: selectedClassId || undefined,
      status: (selectedStatus as SessionStatus) || undefined,
      tanggal: selectedDate || undefined,
    });
    if (result.data) {
      setSessions(result.data);
    }
    setLoading(false);
  }, [guruId, selectedClassId, selectedStatus, selectedDate, supabase]);

  useEffect(() => {
    if (guruId) {
      loadSessions();
      fetchClasses(guruId);
    }
  }, [guruId, loadSessions, fetchClasses]);

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guruId || !targetClassId) {
      toast.error('Harap pilih kelas terlebih dahulu');
      return;
    }

    const created = await createSession(guruId, { kelas_id: targetClassId, duration });
    if (created) {
      setIsModalOpen(false);
      router.push(`/dashboard/sesi/${created.id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Sesi Presensi Latihan</h2>
          <p className="text-xs text-muted-foreground font-semibold">
            Buka sesi absensi QR Code untuk merekam kehadiran murid secara real-time
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
          Mulai Sesi Baru
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="border border-border">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Filter Kelas"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            <option value="">Semua Kelas</option>
            {groupedClasses.map((group) => (
              <optgroup key={group.label} label={group.label} className="bg-slate-50 dark:bg-slate-900 font-semibold text-primary-700 dark:text-primary-300">
                {group.classes.map((cls) => {
                  const timePart = cls.jadwal ? (cls.jadwal.split(',')[1]?.trim() || cls.jadwal) : '';
                  return (
                    <option key={cls.id} value={cls.id} className="bg-white dark:bg-slate-950 font-normal text-slate-800 dark:text-slate-200">
                      {cls.lokasi} {timePart ? `(${timePart})` : ''}
                    </option>
                  );
                })}
              </optgroup>
            ))}
          </Select>

          <Select
            label="Filter Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif (Bisa Scan)</option>
            <option value="closed">Selesai (Ditutup)</option>
          </Select>

          <div>
            <label className="text-xs font-semibold text-foreground tracking-wide block mb-1.5">
              Filter Tanggal
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full h-10 px-3 bg-background text-sm rounded-lg border border-border text-foreground transition-all duration-200 focus-ring"
            />
          </div>
        </CardContent>
      </Card>

      {/* Session list or Empty State */}
      {loading && sessions.length === 0 ? (
        <div className="h-[40vh] flex items-center justify-center">
          <LoadingSpinner text="Memuat daftar sesi..." />
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon="QrCode"
          title="Tidak Ada Sesi Ditemukan"
          description={
            selectedClassId || selectedStatus || selectedDate
              ? 'Coba ubah kriteria filter pencarian Anda.'
              : 'Anda belum pernah memulai sesi latihan absensi. Klik Mulai Sesi Baru sekarang!'
          }
          action={
            !selectedClassId && !selectedStatus && !selectedDate ? (
              <Button size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
                Mulai Sesi Pertama
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <Card key={session.id} hover className="border border-border flex flex-col justify-between">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant={session.status === 'active' ? 'hadir' : 'secondary'}>
                    {session.status === 'active' ? 'Aktif (Scan QR)' : 'Selesai'}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatHariTanggal(session.tanggal)}
                  </span>
                </div>
                <CardTitle className="text-base font-extrabold mt-3">
                  {session.classes?.nama || 'Kelas Renang'}
                </CardTitle>
                <CardDescription className="text-xs font-semibold mt-1">
                  Jadwal Kelas: {session.classes?.jadwal || '-'}
                </CardDescription>
                {session.classes?.lokasi && (
                  <CardDescription className="text-xs font-bold mt-1 text-primary-500 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                    Lokasi: {session.classes.lokasi}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold border-t border-border/50 pt-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatWaktu(session.waktu_mulai)}
                    {session.waktu_selesai && ` - ${formatWaktu(session.waktu_selesai)}`}
                  </span>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => router.push(`/dashboard/sesi/${session.id}`)}
                    className="inline-flex items-center justify-center font-bold text-xs h-9 px-4 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors w-full gap-1.5"
                  >
                    <span>{session.status === 'active' ? 'Buka Absensi QR' : 'Lihat Rekap Sesi'}</span>
                    <Play className="h-3 w-3 fill-current" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Start Session Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Mulai Sesi Presensi Baru"
      >
        <form onSubmit={handleStartSession} className="space-y-4">
          <Select
            label="Pilih Kelas Latihan *"
            value={targetClassId}
            onChange={(e) => setTargetClassId(e.target.value)}
            required
          >
            <option value="">-- Pilih Kelas --</option>
            {groupedClasses.map((group) => (
              <optgroup key={group.label} label={group.label} className="bg-slate-50 dark:bg-slate-900 font-semibold text-primary-700 dark:text-primary-300">
                {group.classes.map((cls) => {
                  const timePart = cls.jadwal ? (cls.jadwal.split(',')[1]?.trim() || cls.jadwal) : '';
                  return (
                    <option key={cls.id} value={cls.id} className="bg-white dark:bg-slate-950 font-normal text-slate-800 dark:text-slate-200">
                      {cls.lokasi} {timePart ? `(${timePart})` : ''}
                    </option>
                  );
                })}
              </optgroup>
            ))}
          </Select>
          
          <Select
            label="Masa Berlaku QR Code *"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            required
          >
            <option value={15}>15 Menit (Rekomendasi Keamanan)</option>
            <option value={30}>30 Menit</option>
            <option value={60}>60 Menit (1 Jam)</option>
            <option value={0}>Selama Sesi Aktif (Tanpa Batas Waktu / Unlimited)</option>
          </Select>

          <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
            {duration === 0 
              ? 'QR Code akan aktif terus tanpa batas waktu hingga Anda menutup sesi presensi kelas ini secara manual.'
              : `QR Code akan otomatis tidak berlaku setelah ${duration} menit. Anda dapat me-refresh QR code sebelum waktu habis jika diperlukan.`}
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={sessionActionLoading}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={sessionActionLoading}>
              Mulai Sesi QR
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
