'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { useSessions } from '@/hooks/useSessions';
import { useAttendance } from '@/hooks/useAttendance';
import { useRealtimeAttendance } from '@/hooks/useRealtimeAttendance';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Modal,
  LoadingSpinner,
  EmptyState,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';
import { AttendanceForm } from '@/components/forms';
import { createClient } from '@/lib/supabase/client';
import { getSessionById } from '@/services/session.service';
import { getStudentsByClassId } from '@/services/student.service';
import { SessionWithClass, Student, AttendanceStatus, AttendanceWithStudent } from '@/lib/types';
import { QRCodeSVG } from 'qrcode.react';
import {
  RefreshCw,
  X,
  Clock,
  Calendar,
  CheckCircle2,
  Users,
  Check,
  AlertTriangle,
  UserPlus,
  ChevronLeft,
  MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatHariTanggal, formatWaktu } from '@/lib/utils/date';
import {
  getTimeRemaining,
  getTimerColor,
  getTimerTextClass,
  getTimerBgClass,
  formatCountdown,
} from '@/lib/utils/token';

export default function ActiveSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { refreshQR, closeSession } = useSessions();
  const { recordAttendance } = useAttendance();

  const sessionId = params.id as string;

  const [session, setSession] = useState<SessionWithClass | null>(null);
  const [studentsInClass, setStudentsInClass] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Manual Attendance Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetStudent, setTargetStudent] = useState<Student | null>(null);
  const [manualLoading, setManualLoading] = useState(false);

  // Close Session Confirm States
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
  const [closeLoading, setCloseLoading] = useState(false);

  const supabase = createClient();

  interface PendingAttendance {
    id: string;
    session_id: string;
    student_id: string;
    status: string;
    metode: string;
    catatan: string;
    waktu_scan: string;
    studentName: string;
  }

  const [isOnline, setIsOnline] = useState(true);
  const [offlineAttendances, setOfflineAttendances] = useState<AttendanceWithStudent[]>([]);

  // Sync pending attendances
  const syncPendingAttendances = React.useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.onLine) return;
    const queueStr = localStorage.getItem('pending_sync_attendances');
    if (!queueStr) return;
    try {
      const queue: PendingAttendance[] = JSON.parse(queueStr);
      if (queue.length === 0) return;
      
      const toastId = toast.loading(`Menyinkronkan ${queue.length} presensi offline...`);
      
      let successCount = 0;
      const remainingQueue: PendingAttendance[] = [];
      
      for (const item of queue) {
        try {
          const { error } = await supabase
            .from('attendances')
            .insert({
              session_id: item.session_id,
              student_id: item.student_id,
              status: item.status,
              metode: item.metode,
              catatan: item.catatan,
              waktu_scan: item.waktu_scan
            });
          if (error && error.code !== '23505') {
            console.error('Failed to sync item:', error);
            remainingQueue.push(item);
          } else {
            successCount++;
          }
        } catch {
          remainingQueue.push(item);
        }
      }
      
      localStorage.setItem('pending_sync_attendances', JSON.stringify(remainingQueue));
      
      if (successCount > 0) {
        toast.success(`${successCount} presensi offline disinkronkan!`, { id: toastId });
        setOfflineAttendances((prev) => prev.filter((off) => remainingQueue.some((rem) => rem.id === off.id)));
        // Reload data
        const res = await getSessionById(supabase, sessionId);
        if (res.data) setSession(res.data);
      } else {
        toast.dismiss(toastId);
      }
    } catch (err) {
      console.error('Sync error:', err);
    }
  }, [sessionId, supabase]);

  // Load offline data from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const queueStr = localStorage.getItem('pending_sync_attendances');
    if (queueStr) {
      try {
        const parsed: PendingAttendance[] = JSON.parse(queueStr);
        const forThisSession = parsed
          .filter((item) => item.session_id === sessionId)
          .map((item) => {
            const fallbackStudent: Student = {
              id: item.student_id,
              nama: item.studentName || 'Murid',
              kelas_id: '',
              usia: null,
              jenis_kelamin: null,
              ortu_nama: null,
              ortu_hp: null,
              link_token: '',
              guru_id: '',
              created_at: '',
            };
            return {
              id: item.id,
              session_id: item.session_id,
              student_id: item.student_id,
              status: item.status,
              metode: item.metode,
              catatan: item.catatan,
              waktu_scan: item.waktu_scan,
              students: studentsInClass.find((s) => s.id === item.student_id) || fallbackStudent,
              created_at: item.waktu_scan,
            } as AttendanceWithStudent;
          });
        setOfflineAttendances(forThisSession);
      } catch (e) {
        console.error(e);
      }
    }
  }, [sessionId, studentsInClass]);

  // Online / Offline Listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Koneksi internet kembali online! Mensinkronkan...');
      syncPendingAttendances();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Koneksi internet terputus. Mode Offline Aktif.');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if (navigator.onLine) {
      syncPendingAttendances();
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPendingAttendances]);

  // Load session info & class students
  const loadData = React.useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await getSessionById(supabase, sessionId);
      if (res.error || !res.data) {
        toast.error('Sesi tidak ditemukan');
        router.push('/dashboard/sesi');
        return;
      }

      setSession(res.data);

      const studentsRes = await getStudentsByClassId(supabase, res.data.kelas_id);
      setStudentsInClass(studentsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sessionId, router, supabase]);

  useEffect(() => {
    if (sessionId) {
      loadData();
    }
  }, [sessionId, loadData]);

  // Hook into Realtime Attendance updates
  const { attendances: serverPresentStudents, loading: realtimeLoading } = useRealtimeAttendance(sessionId, studentsInClass);

  // Combine server and offline attendances
  const presentStudents = React.useMemo(() => {
    const combined = [...serverPresentStudents];
    offlineAttendances.forEach((off) => {
      if (!combined.some((srv) => srv.student_id === off.student_id)) {
        combined.push(off);
      }
    });
    return combined;
  }, [serverPresentStudents, offlineAttendances]);

  // Countdown timer effect
  useEffect(() => {
    if (!session || session.status !== 'active') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const updateTimer = () => {
      const remaining = getTimeRemaining(session.qr_expires_at);
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };

    updateTimer(); // Initial call
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session]);

  const handleRefreshQR = async () => {
    if (!sessionId) return;
    const updated = await refreshQR(sessionId);
    if (updated) {
      setSession((prev) => (prev ? { ...prev, qr_token: updated.qr_token, qr_expires_at: updated.qr_expires_at } : null));
    }
  };

  const handleCloseSession = async () => {
    if (!sessionId) return;
    setCloseLoading(true);
    try {
      const updated = await closeSession(sessionId);
      if (updated) {
        setSession((prev) => (prev ? { ...prev, status: updated.status, waktu_selesai: updated.waktu_selesai } : null));
        setIsCloseConfirmOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCloseLoading(false);
    }
  };

  const handleOpenManualModal = (student: Student) => {
    setTargetStudent(student);
    setIsModalOpen(true);
  };

  const handleRecordManual = async (data: { status: AttendanceStatus; catatan: string }) => {
    if (!targetStudent || !sessionId) return;
    
    if (!isOnline) {
      const mockId = `offline-${Date.now()}-${Math.random()}`;
      const newOfflineItem: AttendanceWithStudent = {
        id: mockId,
        session_id: sessionId,
        student_id: targetStudent.id,
        status: data.status,
        metode: 'manual',
        catatan: data.catatan,
        waktu_scan: new Date().toISOString(),
        created_at: new Date().toISOString(),
        students: targetStudent
      };
      
      setOfflineAttendances((prev) => [...prev, newOfflineItem]);
      
      if (typeof window !== 'undefined') {
        const queueStr = localStorage.getItem('pending_sync_attendances');
        const queue = queueStr ? JSON.parse(queueStr) : [];
        queue.push({
          id: mockId,
          session_id: sessionId,
          student_id: targetStudent.id,
          status: data.status,
          metode: 'manual',
          catatan: data.catatan,
          waktu_scan: newOfflineItem.waktu_scan,
          studentName: targetStudent.nama
        });
        localStorage.setItem('pending_sync_attendances', JSON.stringify(queue));
      }
      
      toast.success('Presensi disimpan secara lokal (Offline)');
      setIsModalOpen(false);
      return;
    }

    setManualLoading(true);
    try {
      await recordAttendance({
        session_id: sessionId,
        student_id: targetStudent.id,
        status: data.status,
        metode: 'manual',
        catatan: data.catatan,
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setManualLoading(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Memuat data sesi..." />
      </div>
    );
  }

  // Calculate missing students
  const absentStudents = studentsInClass.filter(
    (std) => !presentStudents.some((att) => att.student_id === std.id)
  );

  const qrUrl = typeof window !== 'undefined' ? `${window.location.origin}/scan/${session.qr_token}` : '';
  
  // Timer color configurations
  const timerColor = getTimerColor(timeLeft, 900);
  const textClass = getTimerTextClass(timerColor);
  const bgClass = getTimerBgClass(timerColor);
  const isExpired = timeLeft !== -1 && timeLeft <= 0;
  const isSessionClosed = session.status === 'closed';

  return (
    <div className="space-y-6">
      {/* Offline Mode Banner */}
      {!isOnline && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl flex items-center gap-3 animate-pulse">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <div className="text-xs font-semibold">
            <p className="font-bold text-sm">Mode Offline Aktif</p>
            <p className="mt-0.5">Koneksi internet terputus. Anda masih dapat melakukan absensi manual di bawah. Presensi akan disinkronkan secara otomatis ketika koneksi internet terhubung kembali.</p>
          </div>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => router.push('/dashboard/sesi')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ChevronLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Kembali ke Daftar Sesi
      </button>

      {/* Sesi info banner */}
      <Card className="border border-border">
        <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={isSessionClosed ? 'secondary' : 'hadir'}>
                {isSessionClosed ? 'Selesai / Ditutup' : 'Aktif / Sedang Berjalan'}
              </Badge>
              <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatHariTanggal(session.tanggal)}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {session.classes?.nama || 'Kelas Renang'}
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-1">
              <p className="text-xs text-muted-foreground font-semibold">
                Dimulai: {formatWaktu(session.waktu_mulai)}
                {session.waktu_selesai && ` - Selesai: ${formatWaktu(session.waktu_selesai)}`}
              </p>
              {session.classes?.lokasi && (
                <p className="text-xs text-primary-600 dark:text-primary-400 font-bold flex items-center gap-1">
                  <span className="hidden sm:inline text-muted-foreground font-semibold mr-1">•</span>
                  <MapPin className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                  {session.classes.lokasi}
                </p>
              )}
            </div>
          </div>

          {!isSessionClosed && (
            <Button
              onClick={() => setIsCloseConfirmOpen(true)}
              variant="danger"
              leftIcon={<X className="h-4 w-4" />}
            >
              Tutup Sesi Presensi
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: QR Code & Status */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {!isSessionClosed ? (
            <Card className="border border-border flex flex-col items-center justify-center p-4 sm:p-6 text-center">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Tunjukkan QR Code ini ke Orang Tua</h3>

              {isExpired ? (
                <div className="h-[min(250px,70vw)] w-[min(250px,70vw)] bg-slate-100 dark:bg-slate-800 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-3 p-4">
                  <AlertTriangle className="h-10 w-10 text-amber-500" />
                  <p className="text-xs font-bold text-foreground">QR Code Telah Expired</p>
                  <p className="text-[10px] text-muted-foreground max-w-[180px]">
                    Sesi QR code habis setelah 15 menit. Silakan refresh.
                  </p>
                </div>
              ) : (
                <div className="p-3 sm:p-4 bg-white border border-border rounded-2xl shadow-sm mb-4 w-full max-w-[282px]">
                  <QRCodeSVG value={qrUrl} size={250} level="M" className="w-full h-auto" />
                </div>
              )}

              {/* Timer info */}
              {!isExpired && (
                <div className="w-full space-y-2 mt-2">
                  <div className="flex items-center justify-center gap-2 text-sm font-extrabold select-none">
                    <Clock className={`h-4 w-4 ${textClass} animate-pulse`} />
                    <span className={textClass}>
                      Sisa waktu QR: {timeLeft === -1 ? 'Aktif (Tanpa Batas)' : formatCountdown(timeLeft)}
                    </span>
                  </div>
                  {/* Timer Progress Bar */}
                  <div className="w-full max-w-[280px] mx-auto bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${bgClass}`}
                      style={{ width: timeLeft === -1 ? '100%' : `${(timeLeft / 900) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action button */}
              <Button
                onClick={handleRefreshQR}
                variant="outline"
                className="mt-6 w-full max-w-[280px]"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                disabled={!isOnline}
              >
                {!isOnline ? 'Refresh QR (Offline)' : 'Refresh QR Code'}
              </Button>
            </Card>
          ) : (
            <Card className="border border-border p-6 flex flex-col items-center justify-center text-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-500 rounded-full">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Sesi Absensi Selesai</h3>
              <p className="text-xs text-muted-foreground font-semibold leading-relaxed max-w-[250px]">
                Sesi presensi untuk kelas ini telah ditutup oleh Anda. Riwayat presensi tersimpan permanen di basis data.
              </p>
            </Card>
          )}
        </div>

        {/* Right Column: Attendance Monitor list */}
        <div className="lg:col-span-7 space-y-6">
          {/* Counter card */}
          <Card className="border border-border">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary-500" />
                Daftar Kehadiran Murid
              </span>
              <span className="text-sm font-black text-primary-500">
                {presentStudents.length} / {studentsInClass.length} Hadir
              </span>
            </CardContent>
          </Card>

          {/* Real-time Presence list */}
          <Card className="border border-border">
            <CardHeader className="pb-2 border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                Murid Sudah Hadir ({presentStudents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {realtimeLoading ? (
                <div className="p-8 flex items-center justify-center">
                  <LoadingSpinner text="Memuat kehadiran realtime..." />
                </div>
              ) : presentStudents.length === 0 ? (
                <EmptyState
                  icon="QrCode"
                  title="Belum Ada Murid Hadir"
                  description="Scan QR code atau klik tombol 'Input Manual' pada daftar murid belum hadir di bawah."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {presentStudents.map((att) => (
                      <TableRow key={att.id}>
                        <TableCell className="font-bold">{att.students?.nama}</TableCell>
                        <TableCell>{formatWaktu(att.waktu_scan)}</TableCell>
                        <TableCell>
                          <Badge variant={att.metode === 'qr' ? 'primary' : 'secondary'} showDot={false}>
                            {att.metode === 'qr' ? 'QR Code' : 'Manual'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={att.status as AttendanceStatus}>{att.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Not Attended list */}
          <Card className="border border-border">
            <CardHeader className="pb-2 border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-amber-500" />
                Murid Belum Hadir ({absentStudents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {absentStudents.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <p className="text-xs font-bold text-emerald-600">Semua murid telah hadir! 🎉</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {absentStudents.map((student) => (
                    <div
                      key={student.id}
                      className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-muted/10 transition-colors"
                    >
                      <span className="text-sm font-bold text-foreground">{student.nama}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<UserPlus className="h-3.5 w-3.5" />}
                        onClick={() => handleOpenManualModal(student)}
                      >
                        <span className="hidden sm:inline">Input </span>Manual
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Manual Input Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Input Presensi Manual"
      >
        {targetStudent && (
          <AttendanceForm
            studentName={targetStudent.nama}
            onSubmit={handleRecordManual}
            onCancel={() => setIsModalOpen(false)}
            isLoading={manualLoading}
          />
        )}
      </Modal>

      {/* Close Session Confirmation Modal */}
      <Modal
        isOpen={isCloseConfirmOpen}
        onClose={() => setIsCloseConfirmOpen(false)}
        title="Tutup Sesi Presensi Latihan"
      >
        <div className="space-y-4 animate-scale-in">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
            Apakah Anda yakin ingin menutup sesi absensi untuk kelas <strong className="text-foreground">{session?.classes?.nama}</strong>?
          </p>
          <p className="text-xs text-amber-500 font-bold bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
            ⚠️ Setelah ditutup, orang tua tidak dapat melakukan pemindaian QR Code lagi untuk sesi ini.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCloseConfirmOpen(false)}
              disabled={closeLoading}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleCloseSession}
              isLoading={closeLoading}
            >
              Tutup Sesi
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
