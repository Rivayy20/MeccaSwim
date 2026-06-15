'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  LoadingSpinner,
  EmptyState,
  Button,
} from '@/components/ui';
import { StudentWithClass, AttendanceWithSession, AttendanceStatus } from '@/lib/types';
import { ChevronLeft, ChevronRight, Calendar, User, Award, CheckCircle2, Target, FileText, Activity, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatHariTanggal, formatWaktu, formatBulanTahun } from '@/lib/utils/date';
import { Permit } from '@/services/permit.service';

interface StudentProgress {
  id: string;
  student_id: string;
  level_kemampuan: 'Pemula' | 'Menengah' | 'Mahir';
  teknik_dikuasai: string[];
  target_latihan: string | null;
  catatan_pelatih: string | null;
  updated_at: string;
}

export default function ParentPortalPage() {
  const params = useParams();
  const router = useRouter();
  
  const linkToken = params.token as string;

  const [student, setStudent] = useState<StudentWithClass | null>(null);
  const [attendances, setAttendances] = useState<AttendanceWithSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // State baru untuk Izin & Progres
  const [todayPermit, setTodayPermit] = useState<Permit | null>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [permitStatus, setPermitStatus] = useState<'izin' | 'sakit'>('izin');
  const [permitKeterangan, setPermitKeterangan] = useState('');
  const [submittingPermit, setSubmittingPermit] = useState(false);

  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const loadData = React.useCallback(async () => {
    if (!linkToken) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/parent/${encodeURIComponent(linkToken)}?month=${currentMonth}&year=${currentYear}`,
        { cache: 'no-store' }
      );
      const data = await response.json();

      if (!response.ok || data.error) {
        toast.error('Link tidak valid atau murid tidak ditemukan');
        setStudent(null);
        setLoading(false);
        return;
      }

      setStudent(data.student as StudentWithClass);
      setAttendances((data.attendances || []) as AttendanceWithSession[]);
      setTodayPermit(data.todayPermit || null);
      setProgress(data.progress || null);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat data presensi');
    } finally {
      setLoading(false);
    }
  }, [linkToken, currentMonth, currentYear]);

  const handleSubmitPermit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permitKeterangan.trim()) {
      toast.error('Silakan isi alasan/keterangan izin.');
      return;
    }

    setSubmittingPermit(true);
    try {
      const response = await fetch(`/api/parent/${encodeURIComponent(linkToken)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: permitStatus, keterangan: permitKeterangan.trim() }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        toast.error(data.error || 'Gagal mengajukan izin');
      } else {
        toast.success('Izin berhasil diajukan!');
        setTodayPermit(data.data);
        setPermitKeterangan('');
        loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan koneksi');
    } finally {
      setSubmittingPermit(false);
    }
  };

  useEffect(() => {
    if (linkToken) {
      loadData();
    }
  }, [linkToken, loadData]);

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 2, 1));
  };

  if (loading && !student) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <LoadingSpinner size="lg" text="Memuat Portal Orang Tua..." />
      </div>
    );
  }

  // Error state if student not found
  if (!student) {
    return (
      <div className="min-h-screen bg-slate-900 water-pattern flex items-center justify-center p-4">
        <Card variant="glass" className="w-full max-w-md border-white/10 text-center bg-slate-900/60 p-6 space-y-4 animate-scale-in">
          <div className="mx-auto p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full w-fit">
            <Award className="h-10 w-10" />
          </div>
          <CardTitle className="text-white">Portal Tidak Ditemukan</CardTitle>
          <p className="text-sm font-semibold text-slate-300 leading-relaxed">
            Link akses unik yang Anda gunakan tidak valid. Silakan hubungi Guru Les Renang untuk meminta link yang baru.
          </p>
          <Button onClick={() => router.push('/')} className="w-full mt-4">
            Kembali ke Beranda
          </Button>
        </Card>
      </div>
    );
  }

  // Calculate statistics for month
  const totalSesi = attendances.length;
  const hadirSesi = attendances.filter((a) => a.status === 'hadir').length;
  const percentage = totalSesi > 0 ? Math.round((hadirSesi / totalSesi) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">
      {/* Public Header */}
      <header className="w-full gradient-primary text-white py-6 shadow-md">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 select-none">
            <div className="relative h-10 w-10 flex-shrink-0 rounded-full overflow-hidden shadow-sm border border-white/20 bg-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-extrabold text-xl tracking-wider">
              Mecca Swim
            </span>
          </div>
          <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
            Portal Orang Tua
          </span>
        </div>
      </header>

      {/* Main portal contents */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
        {/* Welcome Section */}
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
            Laporan Presensi Murid
          </h2>
          <p className="text-xs text-muted-foreground font-semibold">
            Pantau kehadiran latihan renang anak Anda secara transparan
          </p>
        </div>

        {/* Student card info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-border md:col-span-2">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-primary-500" />
                Informasi Murid
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">
                  Nama Lengkap
                </p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                  {student.nama}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">
                  Kelas Renang
                </p>
                <p className="text-sm font-extrabold text-primary-500 leading-tight">
                  {student.classes?.nama || '-'}
                </p>
                {student.classes?.jadwal && (
                  <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                    {student.classes.jadwal}
                  </p>
                )}
                {student.classes?.lokasi && (
                  <p className="text-[10px] text-primary-600 dark:text-primary-400 font-extrabold mt-1.5 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                    {student.classes.lokasi}
                  </p>
                )}
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">
                  Usia
                </p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-tight">
                  {student.usia ? `${student.usia} tahun` : '-'}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">
                  Orang Tua / Wali
                </p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-tight">
                  {student.ortu_nama || '-'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Stats percentage */}
          <Card className="border border-border flex flex-col justify-between items-center text-center p-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                Kehadiran {formatBulanTahun(currentDate)}
              </p>
              <h3 className="text-4xl font-black mt-2 text-primary-500">{percentage}%</h3>
            </div>
            
            <div className="w-full flex items-center justify-between text-xs text-muted-foreground font-semibold border-t border-border pt-4 mt-4">
              <span>Hadir: {hadirSesi} kali</span>
              <span>Total Sesi: {totalSesi} kali</span>
            </div>
          </Card>
        </div>

        {/* Progres Perkembangan Murid */}
        {progress && (
          <Card className="border border-border">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-primary-500" />
                Kompetensi & Progres Renang Murid
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-dashed border-border">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Level Kompetensi Saat Ini</span>
                  <Badge variant={progress.level_kemampuan === 'Mahir' ? 'hadir' : (progress.level_kemampuan === 'Menengah' ? 'izin' : 'secondary')}>
                    {progress.level_kemampuan || 'Pemula'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground font-semibold">
                  Pembaruan Terakhir: {new Date(progress.updated_at).toLocaleDateString('id-ID')}
                </div>
              </div>

              {/* Teknik yang dikuasai */}
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Keterampilan yang Dikuasai</span>
                {progress.teknik_dikuasai && progress.teknik_dikuasai.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {progress.teknik_dikuasai.map((tech: string, idx: number) => (
                      <span key={idx} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Belum ada teknik renang yang dicatat dikuasai.</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Target Latihan */}
                <div className="p-4 rounded-xl border border-border bg-slate-50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4.5 w-4.5 text-red-500" />
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Fokus Target Latihan</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                    {progress.target_latihan || 'Melatih teknik dasar pernapasan dan luncuran.'}
                  </p>
                </div>

                {/* Catatan Pelatih */}
                <div className="p-4 rounded-xl border border-border bg-slate-50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4.5 w-4.5 text-blue-500" />
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Catatan Pelatih</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                    {progress.catatan_pelatih || 'Menunjukkan minat yang tinggi, terus dorong konsistensi latihan.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pengajuan Izin Latihan */}
        <Card className="border border-border">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <span className="text-lg">📝</span>
              Pengajuan Izin Latihan Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {todayPermit ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                <p className="text-sm font-bold flex items-center gap-2">
                  <span>✅</span> Izin Hari Ini Berhasil Diajukan
                </p>
                <div className="mt-2 text-xs font-semibold space-y-1">
                  <p>Jenis Izin: <span className="uppercase font-bold">{todayPermit.status}</span></p>
                  <p>Keterangan: {todayPermit.keterangan || '-'}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Diajukan pada {formatWaktu(todayPermit.created_at)} WIB. Status ini akan otomatis disinkronkan menjadi kehadiran saat guru membuka kelas latihan hari ini.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitPermit} className="space-y-4 max-w-lg">
                <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                  Jika anak Anda berhalangan hadir latihan hari ini, silakan ajukan izin/sakit melalui formulir di bawah.
                </p>
                
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-foreground">
                    <input
                      type="radio"
                      name="permitStatus"
                      checked={permitStatus === 'izin'}
                      onChange={() => setPermitStatus('izin')}
                      className="text-primary-500 focus:ring-primary-500"
                    />
                    Izin (Berhalangan)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-foreground">
                    <input
                      type="radio"
                      name="permitStatus"
                      checked={permitStatus === 'sakit'}
                      onChange={() => setPermitStatus('sakit')}
                      className="text-primary-500 focus:ring-primary-500"
                    />
                    Sakit
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Alasan / Keterangan *
                  </label>
                  <textarea
                    required
                    value={permitKeterangan}
                    onChange={(e) => setPermitKeterangan(e.target.value)}
                    placeholder="Contoh: Sedang demam, ada acara keluarga, dll."
                    rows={3}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-semibold text-foreground"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submittingPermit}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  {submittingPermit ? 'Mengirim...' : 'Kirim Pengajuan Izin'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* History of sessions */}
        <Card className="border border-border">
          <CardHeader className="pb-4 border-b border-border flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-primary-500" />
              Detail Riwayat Latihan
            </CardTitle>

            {/* Month Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-1 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground bg-white dark:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[100px] text-center select-none">
                {formatBulanTahun(currentDate)}
              </span>
              <button
                onClick={nextMonth}
                className="p-1 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground bg-white dark:bg-slate-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="p-8 flex items-center justify-center">
                <LoadingSpinner text="Memuat riwayat kehadiran..." />
              </div>
            ) : attendances.length === 0 ? (
              <EmptyState
                icon="Calendar"
                title="Tidak Ada Latihan"
                description="Belum ada catatan presensi latihan renang yang terekam pada bulan ini."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hari / Tanggal</TableHead>
                    <TableHead>Waktu Masuk</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Catatan Guru</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendances.map((att) => (
                    <TableRow key={att.id}>
                      <TableCell className="font-bold text-foreground">
                        {formatHariTanggal(att.sessions?.tanggal || att.created_at)}
                      </TableCell>
                      <TableCell>{formatWaktu(att.waktu_scan)} WIB</TableCell>
                      <TableCell>
                        <Badge variant={att.metode === 'qr' ? 'primary' : 'secondary'} showDot={false}>
                          {att.metode === 'qr' ? 'QR Code' : 'Manual'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={att.status as AttendanceStatus}>{att.status}</Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400 font-semibold max-w-[200px] truncate">
                        {att.catatan || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
