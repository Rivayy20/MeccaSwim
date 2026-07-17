'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardTitle,
  Button,
  Badge,
  Modal,
  LoadingSpinner,
  EmptyState,
} from '@/components/ui';
import { ScanSessionData } from '@/lib/types';
import { CheckCircle2, AlertCircle, Calendar, Clock, UserCheck, ChevronRight, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatHariTanggal, formatWaktu } from '@/lib/utils/date';
import { isTokenExpired } from '@/lib/utils/token';

export default function QRScanConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  
  const qrToken = params.token as string;
  
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<ScanSessionData | null>(null);
  const [students, setStudents] = useState<ScanSessionData['students']>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selection states
  const [selectedStudent, setSelectedStudent] = useState<ScanSessionData['students'][0] | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  
  // Success state
  const [isSuccess, setIsSuccess] = useState(false);
  const [successStudentName, setSuccessStudentName] = useState('');
  const [successLinkToken, setSuccessLinkToken] = useState<string | null>(null);

  const loadSessionAndStudents = React.useCallback(async () => {
    if (!qrToken) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(`/api/session?qr_token=${encodeURIComponent(qrToken)}`, {
        cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        setErrorMsg('QR Code tidak valid atau tidak dikenali.');
        setLoading(false);
        return;
      }

      const sess = data as ScanSessionData;
      setSession(sess);

      if (sess.status !== 'active') {
        setErrorMsg('Sesi absensi untuk kelas ini sudah ditutup oleh Guru.');
        setLoading(false);
        return;
      }

      if (isTokenExpired(sess.qr_expires_at)) {
        setErrorMsg('Masa berlaku QR Code telah habis (Expired). Silakan minta Guru untuk me-refresh QR Code.');
        setLoading(false);
        return;
      }

      setStudents(sess.students);

    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal memuat data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [qrToken]);

  useEffect(() => {
    if (qrToken) {
      loadSessionAndStudents();
    }
  }, [qrToken, loadSessionAndStudents]);

  const handleSelectStudent = (student: ScanSessionData['students'][0]) => {
    setSelectedStudent(student);
    setIsConfirmOpen(true);
  };

  const handleConfirmAttendance = async () => {
    if (!selectedStudent || !qrToken) return;
    setConfirmLoading(true);
    try {
      const response = await fetch('/api/attendance/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qr_token: qrToken,
          student_id: selectedStudent.id,
        }),
      });

      const result = await response.json();
      if (!response.ok || result.error) {
        toast.error(result.error || 'Gagal mengirim konfirmasi presensi');
      } else {
        toast.success('Konfirmasi presensi berhasil!');
        setSuccessStudentName(selectedStudent.nama);
        setSuccessLinkToken(result.data?.student?.link_token || selectedStudent.link_token || null);
        setIsSuccess(true);
        setIsConfirmOpen(false);
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan.');
    } finally {
      setConfirmLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-4">
        <LoadingSpinner size="lg" text="Memvalidasi QR Code..." />
      </div>
    );
  }

  // Error State Layout
  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-900 water-pattern flex items-center justify-center p-4">
        <Card variant="glass" className="w-full max-w-md border-white/10 text-center bg-slate-900/60 p-6 space-y-4 animate-scale-in">
          <div className="mx-auto p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full w-fit">
            <AlertCircle className="h-10 w-10" />
          </div>
          <CardTitle className="text-white">Gagal Scan QR</CardTitle>
          <p className="text-sm font-semibold text-slate-300 leading-relaxed">
            {errorMsg}
          </p>
          <Button onClick={() => window.location.reload()} className="w-full mt-4">
            Coba Scan Ulang
          </Button>
        </Card>
      </div>
    );
  }

  // Success State Layout
  if (isSuccess) {
    const portalUrl = successLinkToken ? `/murid/${successLinkToken}` : '/';
    return (
      <div className="min-h-screen bg-slate-900 water-pattern flex items-center justify-center p-4">
        <Card variant="glass" className="w-full max-w-md border-white/10 text-center bg-slate-900/60 p-6 space-y-4 animate-scale-in">
          <div className="mx-auto p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full w-fit animate-bounce">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <CardTitle className="text-white text-xl">Presensi Berhasil! 🎉</CardTitle>
          <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5 space-y-2">
            <p className="text-xs text-slate-400 font-semibold leading-none">Nama Murid</p>
            <p className="text-base font-extrabold text-white leading-tight">{successStudentName}</p>
            <p className="text-xs text-slate-400 font-semibold leading-none mt-2">Kelas</p>
            <p className="text-sm font-bold text-cyan-300 leading-tight">
              {session?.classes?.nama}
            </p>
          </div>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            Kehadiran telah berhasil terekam secara real-time di sistem. Anda dapat langsung melihat riwayat kehadiran, progres latihan, dan pengajuan izin di Dashboard Orang Tua.
          </p>
          <div className="space-y-2 pt-2">
            <Button onClick={() => router.push(portalUrl)} className="w-full font-bold">
              {successLinkToken ? 'Buka Dashboard Orang Tua' : 'Kembali ke Beranda'}
            </Button>
            {successLinkToken && (
              <button
                type="button"
                onClick={() => router.push('/')}
                className="text-xs text-slate-400 hover:text-white transition-colors block w-full py-2 font-semibold"
              >
                Kembali ke Beranda Utama
              </button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 water-pattern py-6 sm:py-10 px-4 flex flex-col justify-between">
      {/* Container */}
      <div className="w-full max-w-md mx-auto space-y-4 sm:space-y-6 flex-1 flex flex-col justify-center animate-fade-in">
        {/* Branding header */}
        <div className="text-center space-y-1">
          <span className="text-3xl" role="img" aria-label="wave">
            🏊
          </span>
          <h2 className="text-lg font-black text-white tracking-wide">Mecca Swim</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            Portal Konfirmasi Kehadiran
          </p>
        </div>

        {/* Session details */}
        <Card variant="glass" className="border-white/10 bg-slate-900/60 p-5">
          <div className="space-y-3">
            <Badge variant="primary" showDot={false}>
              Sesi Latihan Aktif
            </Badge>
            <h3 className="text-base font-extrabold text-white">{session?.classes?.nama}</h3>
            
            <div className="flex flex-col gap-2 pt-2 border-t border-white/5 text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-cyan-400" />
                {session && formatHariTanggal(session.tanggal)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-cyan-400" />
                Mulai latihan: {session && formatWaktu(session.waktu_mulai)} WIB
              </span>
            </div>
          </div>
        </Card>

        {/* Student Checklist Selection */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Pilih Nama Anak Anda:
          </h4>

          {students.length === 0 ? (
            <EmptyState
              icon="Users"
              title="Tidak Ada Murid"
              description="Tidak ada murid aktif terdaftar di bawah pelatih ini."
            />
          ) : (
            <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1">
              {/* Group 1: Murid Kelas Ini */}
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold text-cyan-400 block px-1">
                  🏊 Murid Kelas Ini ({session?.classes?.nama || 'Reguler'})
                </span>
                {students.filter((s) => s.kelas_id === session?.kelas_id).length === 0 ? (
                  <p className="text-xs text-slate-500 italic px-1">Tidak ada murid reguler di kelas ini.</p>
                ) : (
                  students
                    .filter((s) => s.kelas_id === session?.kelas_id)
                    .map((student) => (
                      <div
                        key={student.id}
                        onClick={() => handleSelectStudent(student)}
                        className="p-3.5 sm:p-4 rounded-xl border border-white/10 hover:border-primary-400 bg-slate-800/40 hover:bg-slate-800/80 transition-all flex items-center justify-between gap-4 cursor-pointer group mb-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-cyan-950/40 border border-cyan-800 text-cyan-400 rounded-lg group-hover:scale-105 transition-transform">
                            <UserCheck className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                            {student.nama}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-primary-400 transition-colors" />
                      </div>
                    ))
                )}
              </div>

              {/* Group 2: Murid Kelas Lain (Reschedule) */}
              {students.filter((s) => s.kelas_id !== session?.kelas_id).length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="text-[11px] font-extrabold text-purple-400 block px-1 flex items-center justify-between">
                    <span>🔄 Murid Kelas Lain (Reschedule / Pindah Jadwal)</span>
                  </span>
                  {students
                    .filter((s) => s.kelas_id !== session?.kelas_id)
                    .map((student) => (
                      <div
                        key={student.id}
                        onClick={() => handleSelectStudent(student)}
                        className="p-3.5 sm:p-4 rounded-xl border border-purple-500/20 hover:border-purple-400 bg-purple-950/20 hover:bg-purple-900/40 transition-all flex items-center justify-between gap-4 cursor-pointer group mb-2"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-purple-950/60 border border-purple-800 text-purple-400 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                            <UserCheck className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors block truncate">
                              {student.nama}
                            </span>
                            <span className="text-[10px] text-purple-300 font-semibold block mt-0.5">
                              Kelas Asal: {student.classes?.nama || 'Kelas Lain'}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-purple-400 group-hover:text-purple-300 transition-colors shrink-0" />
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Konfirmasi Kehadiran"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-border text-center">
            <p className="text-xs text-muted-foreground font-semibold">
              Apakah Anda yakin ingin mengonfirmasi kehadiran murid:
            </p>
            <p className="text-lg font-black text-foreground mt-2 leading-none">
              {selectedStudent?.nama}
            </p>
            <p className="text-xs font-semibold text-primary-500 mt-2">
              Pada sesi {session?.classes?.nama} hari ini.
            </p>
            {selectedStudent?.kelas_id !== session?.kelas_id && (
              <div className="mt-3 p-2.5 rounded-lg bg-purple-100 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold text-left space-y-1">
                <p className="flex items-center gap-1.5 font-extrabold text-[11px]">
                  <span>🔄 Presensi Reschedule (Pindah Jadwal)</span>
                </p>
                <p className="text-[10px] font-medium leading-relaxed">
                  Murid berasal dari <b>{selectedStudent?.classes?.nama || 'Kelas Lain'}</b>. Kehadiran akan dicatat otomatis dengan keterangan reschedule.
                </p>
              </div>
            )}
            {session?.classes?.lokasi && (
              <p className="text-[10px] text-primary-600 dark:text-primary-400 font-extrabold flex items-center justify-center gap-1 mt-2">
                <MapPin className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                Lokasi: {session.classes.lokasi}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={confirmLoading}
            >
              Batal
            </Button>
            <Button onClick={handleConfirmAttendance} isLoading={confirmLoading}>
              Ya, Konfirmasi Hadir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
