'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDashboardAuth } from '@/hooks/useAuth';
import { useStudents } from '@/hooks/useStudents';
import { useAttendance } from '@/hooks/useAttendance';
import {
  Button,
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
  Input,
  Select,
  Modal,
} from '@/components/ui';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@/lib/supabase/client';
import { getStudentById } from '@/services/student.service';
import { StudentWithClass, AttendanceStatus } from '@/lib/types';
import { ChevronLeft, ChevronRight, Copy, RefreshCw, Calendar, Phone, User, GraduationCap, MessageCircle, Plus, Trash2, CheckCircle2, Activity, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatHariTanggal, formatWaktu, formatBulanTahun } from '@/lib/utils/date';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useDashboardAuth();
  const { regenerateLink, loading: studentActionLoading } = useStudents();
  const { studentAttendances, loading: attendanceLoading, fetchByStudent } = useAttendance();

  const [student, setStudent] = useState<StudentWithClass | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // States baru untuk Perkembangan Murid
  const [activeTab, setActiveTab] = useState<'kehadiran' | 'perkembangan'>('kehadiran');
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [level, setLevel] = useState<'Pemula' | 'Menengah' | 'Mahir'>('Pemula');
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
  const [customTechnique, setCustomTechnique] = useState('');
  const [target, setTarget] = useState('');
  const [catatanProgress, setCatatanProgress] = useState('');
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  // Link token regeneration confirm states
  const [isRegenConfirmOpen, setIsRegenConfirmOpen] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);

  const supabase = createClient();
  const studentId = params.id as string;
  const guruId = user?.id;

  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const loadStudentData = useCallback(async () => {
    if (!studentId) return;
    setLoadingStudent(true);
    const result = await getStudentById(supabase, studentId);
    if (result.data) {
      setStudent(result.data);
    } else {
      toast.error('Data murid tidak ditemukan');
      router.push('/dashboard/murid');
    }
    setLoadingStudent(false);
  }, [studentId, router, supabase]);

  useEffect(() => {
    loadStudentData();
  }, [loadStudentData]);

  useEffect(() => {
    if (studentId) {
      fetchByStudent(studentId, currentMonth, currentYear);
    }
  }, [studentId, currentMonth, currentYear, fetchByStudent]);
  const loadProgressData = useCallback(async () => {
    if (!studentId) return;
    setLoadingProgress(true);
    try {
      const { data } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', studentId)
        .maybeSingle();

      if (data) {
        setLevel(data.level_kemampuan);
        setSelectedTechniques(data.teknik_dikuasai || []);
        setTarget(data.target_latihan || '');
        setCatatanProgress(data.catatan_pelatih || '');
      }
    } catch (err) {
      console.warn('Gagal memuat data progress:', err);
    } finally {
      setLoadingProgress(false);
    }
  }, [studentId, supabase]);

  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  const STANDARD_TECHNIQUES = ['Meluncur', 'Mengapung', 'Gaya Bebas', 'Gaya Dada', 'Gaya Punggung'];

  const handleToggleTechnique = (tech: string) => {
    if (selectedTechniques.includes(tech)) {
      setSelectedTechniques(selectedTechniques.filter((t) => t !== tech));
    } else {
      setSelectedTechniques([...selectedTechniques, tech]);
    }
  };

  const handleAddCustomTechnique = () => {
    const trimmed = customTechnique.trim();
    if (!trimmed) return;
    if (selectedTechniques.includes(trimmed)) {
      toast.error('Teknik tersebut sudah ditambahkan');
      return;
    }
    setSelectedTechniques([...selectedTechniques, trimmed]);
    setCustomTechnique('');
  };

  const handleRemoveTechnique = (tech: string) => {
    setSelectedTechniques(selectedTechniques.filter((t) => t !== tech));
  };

  const handleSaveProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProgress(true);
    try {
      const { error } = await supabase
        .from('student_progress')
        .upsert({
          student_id: studentId,
          level_kemampuan: level,
          teknik_dikuasai: selectedTechniques,
          target_latihan: target.trim(),
          catatan_pelatih: catatanProgress.trim(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'student_id' });

      if (error) {
        toast.error(`Gagal menyimpan: ${error.message}`);
      } else {
        toast.success('Progress perkembangan murid berhasil disimpan!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan koneksi');
    } finally {
      setIsSavingProgress(false);
    }
  };
  const handleCopyLink = () => {
    if (!student) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/murid/${student.link_token}`;
    navigator.clipboard.writeText(url);
    toast.success('Link portal orang tua berhasil disalin!');
  };

  const handleWhatsAppShare = () => {
    if (!student || !student.ortu_hp) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/murid/${student.link_token}`;
    
    let phone = student.ortu_hp.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }
    
    const text = `Halo Bapak/Ibu ${student.ortu_nama || ''},\n\nBerikut adalah link portal presensi untuk memantau kehadiran dan jadwal latihan renang Ananda ${student.nama}:\n\n${url}\n\nTerima kasih.`;
    const waUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleRegenerateLink = async () => {
    if (!student || !guruId) return;
    setRegenLoading(true);
    try {
      const updated = await regenerateLink(guruId, student.id);
      if (updated) {
        setStudent((prev) => (prev ? { ...prev, link_token: updated.link_token } : null));
        setIsRegenConfirmOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRegenLoading(false);
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 2, 1));
  };

  if (loadingStudent || !student) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Memuat detail murid..." />
      </div>
    );
  }

  // Calculate stats for the current filtered month
  const totalSesi = studentAttendances.length;
  const hadirSesi = studentAttendances.filter((att) => att.status === 'hadir').length;
  const izinSesi = studentAttendances.filter((att) => att.status === 'izin').length;
  const sakitSesi = studentAttendances.filter((att) => att.status === 'sakit').length;
  const alphaSesi = studentAttendances.filter((att) => att.status === 'alpha').length;

  const attendancePercentage = totalSesi > 0 ? Math.round((hadirSesi / totalSesi) * 100) : 0;

  const parentPortalUrl = typeof window !== 'undefined' ? `${window.location.origin}/murid/${student.link_token}` : '';

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push('/dashboard/murid')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ChevronLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Kembali ke Daftar Murid
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info Murid & Link Ortu */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card className="border border-border">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="text-lg font-bold">Profil Murid</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary-50 text-primary-500 rounded-xl">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">
                    Nama Murid
                  </p>
                  <p className="text-sm font-bold text-foreground leading-tight">{student.nama}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-50 text-teal-500 rounded-xl">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">
                    Kelas Renang
                  </p>
                  <p className="text-sm font-bold text-foreground leading-tight">
                    {student.classes?.nama || 'Belum di-assign'}
                  </p>
                  {student.classes?.jadwal && (
                    <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                      Jadwal: {student.classes.jadwal}
                    </p>
                  )}
                  {student.classes?.lokasi && (
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-extrabold mt-1 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                      Lokasi: {student.classes.lokasi}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">
                    Usia
                  </p>
                  <p className="text-sm font-bold text-foreground leading-tight">
                    {student.usia ? `${student.usia} tahun` : '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-xl">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">
                    Jenis Kelamin
                  </p>
                  <p className="text-sm font-bold text-foreground leading-tight">
                    {student.jenis_kelamin || '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-50 text-purple-500 rounded-xl">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">
                    Orang Tua & WhatsApp
                  </p>
                  <p className="text-sm font-bold text-foreground leading-tight">
                    {student.ortu_nama || '-'}
                  </p>
                  {student.ortu_hp && (
                    <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                      HP: {student.ortu_hp}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex flex-col gap-2 mt-2">
                <Button
                  onClick={() => router.push(`/dashboard/spp?studentId=${student.id}&action=add`)}
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2 border-primary-200 text-primary-600 hover:bg-primary-50 dark:border-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-950/20"
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Tambah Tagihan SPP
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Link Ortu Card */}
          <Card className="border border-border">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="text-lg font-bold">Link Khusus Orang Tua</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
              <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                Bagikan link atau QR code ini kepada orang tua agar mereka dapat memantau kehadiran anak secara langsung tanpa login.
              </p>

              {/* QR Code */}
              <div className="p-3 bg-white border border-border rounded-xl shadow-sm">
                <QRCodeSVG value={parentPortalUrl} size={150} level="M" />
              </div>

              <div className="w-full space-y-2">
                <div className="w-full text-xs font-mono font-medium text-slate-500 bg-muted px-3 py-2 rounded-lg truncate select-all">
                  {parentPortalUrl}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      size="sm"
                      className="w-full"
                      leftIcon={<Copy className="h-4 w-4" />}
                    >
                      Salin Link
                    </Button>
                    <Button
                      onClick={() => setIsRegenConfirmOpen(true)}
                      variant="ghost"
                      size="sm"
                      className="w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-slate-200 dark:border-slate-800"
                      isLoading={studentActionLoading || regenLoading}
                      leftIcon={<RefreshCw className="h-4 w-4" />}
                    >
                      Ubah Link
                    </Button>
                  </div>
                  {student.ortu_hp && (
                    <Button
                      onClick={handleWhatsAppShare}
                      variant="primary"
                      size="sm"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-md flex items-center justify-center gap-2"
                      leftIcon={<MessageCircle className="h-4 w-4" />}
                    >
                      Kirim Link ke WhatsApp
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Tabbed Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Switcher */}
          <div className="flex border-b border-border gap-2">
            <button
              onClick={() => setActiveTab('kehadiran')}
              className={`pb-2.5 px-4 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'kehadiran'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Riwayat Kehadiran
            </button>
            <button
              onClick={() => setActiveTab('perkembangan')}
              className={`pb-2.5 px-4 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'perkembangan'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Perkembangan Murid (Progress)
            </button>
          </div>

          {activeTab === 'kehadiran' ? (
            <>
              {/* Monthly Stats Summary */}
              <Card className="border border-border">
            <CardContent className="p-6 grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                  Persentase
                </p>
                <p className="text-xl font-black mt-1 text-primary-500">{attendancePercentage}%</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                  Hadir
                </p>
                <p className="text-xl font-black mt-1 text-emerald-500">{hadirSesi}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                  Izin
                </p>
                <p className="text-xl font-black mt-1 text-amber-500">{izinSesi}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                  Sakit
                </p>
                <p className="text-xl font-black mt-1 text-orange-500">{sakitSesi}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 col-span-2 md:col-span-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                  Alpha
                </p>
                <p className="text-xl font-black mt-1 text-red-500">{alphaSesi}</p>
              </div>
            </CardContent>
          </Card>

          {/* Table History */}
          <Card className="border border-border">
            <CardHeader className="pb-4 border-b border-border flex flex-row items-center justify-between gap-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                Riwayat Presensi
              </CardTitle>
              {/* Month Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-1 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-foreground min-w-[100px] text-center">
                  {formatBulanTahun(currentDate)}
                </span>
                <button
                  onClick={nextMonth}
                  className="p-1 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {attendanceLoading ? (
                <div className="p-8 flex items-center justify-center">
                  <LoadingSpinner text="Memuat riwayat kehadiran..." />
                </div>
              ) : studentAttendances.length === 0 ? (
                <EmptyState
                  icon="Calendar"
                  title="Belum Ada Presensi"
                  description="Tidak ada riwayat kehadiran tercatat untuk bulan ini."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hari / Tanggal</TableHead>
                      <TableHead>Waktu Scan</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Catatan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentAttendances.map((att) => (
                      <TableRow key={att.id}>
                        <TableCell className="font-bold">
                          {formatHariTanggal(att.sessions?.tanggal || att.created_at)}
                        </TableCell>
                        <TableCell>{formatWaktu(att.waktu_scan)}</TableCell>
                        <TableCell>
                          <Badge variant={att.metode === 'qr' ? 'primary' : 'secondary'} showDot={false}>
                            {att.metode === 'qr' ? 'QR Code' : 'Manual'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={att.status as AttendanceStatus}>{att.status}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate text-slate-500 font-semibold">
                          {att.catatan || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          </>
          ) : (
            /* Perkembangan Murid Form */
            <Card className="border border-border">
              <CardHeader className="pb-4 border-b border-border">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary-500" />
                  Rapor Kompetensi & Keterampilan Renang
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {loadingProgress ? (
                  <div className="p-8 flex items-center justify-center">
                    <LoadingSpinner text="Memuat rapor perkembangan..." />
                  </div>
                ) : (
                  <form onSubmit={handleSaveProgress} className="space-y-6">
                    {/* Level Select */}
                    <div className="space-y-1.5 max-w-xs">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Level Kemampuan Saat Ini</label>
                      <Select
                        value={level}
                        onChange={(e) => setLevel(e.target.value as 'Pemula' | 'Menengah' | 'Mahir')}
                        className="w-full text-sm font-semibold"
                      >
                        <option value="Pemula">Pemula</option>
                        <option value="Menengah">Menengah</option>
                        <option value="Mahir">Mahir</option>
                      </Select>
                    </div>

                    {/* Standard Techniques Checklist */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Keterampilan yang Dikuasai (Checklist Bawaan)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-border">
                        {STANDARD_TECHNIQUES.map((tech) => {
                          const isChecked = selectedTechniques.includes(tech);
                          return (
                            <label key={tech} className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleTechnique(tech)}
                                className="text-primary-500 focus:ring-primary-500 rounded"
                              />
                              {tech}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Techniques Input */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Keterampilan Kustom Tambahan</label>
                      <div className="flex gap-2 max-w-md">
                        <Input
                          type="text"
                          placeholder="Masukkan teknik kustom baru..."
                          value={customTechnique}
                          onChange={(e) => setCustomTechnique(e.target.value)}
                          className="bg-white dark:bg-slate-950"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddCustomTechnique}
                          leftIcon={<Plus className="h-4 w-4" />}
                        >
                          Tambah
                        </Button>
                      </div>

                      {/* Display Selected Custom Techniques */}
                      {selectedTechniques.filter(t => !STANDARD_TECHNIQUES.includes(t)).length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {selectedTechniques
                            .filter(t => !STANDARD_TECHNIQUES.includes(t))
                            .map((tech) => (
                              <span key={tech} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
                                {tech}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTechnique(tech)}
                                  className="text-red-500 hover:text-red-700 transition-colors focus:outline-none"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Target Latihan */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                          Fokus Target Latihan Selanjutnya
                        </label>
                        <textarea
                          value={target}
                          onChange={(e) => setTarget(e.target.value)}
                          placeholder="Tulis target latihan murid (misal: Menghaluskan tendangan gaya bebas)"
                          rows={3}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-semibold"
                        />
                      </div>

                      {/* Catatan Pelatih */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                          Catatan & Evaluasi Pelatih
                        </label>
                        <textarea
                          value={catatanProgress}
                          onChange={(e) => setCatatanProgress(e.target.value)}
                          placeholder="Tulis catatan perkembangan murid (misal: Luncuran sudah stabil, tinggal melatih daya tahan pernapasan)"
                          rows={3}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-semibold"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-border mt-6">
                      <Button
                        type="submit"
                        isLoading={isSavingProgress}
                        leftIcon={<CheckCircle2 className="h-4 w-4" />}
                      >
                        Simpan Perkembangan
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      {/* Regenerate Link Confirmation Modal */}
      <Modal
        isOpen={isRegenConfirmOpen}
        onClose={() => setIsRegenConfirmOpen(false)}
        title="Perbarui Link Monitoring"
      >
        <div className="space-y-4 animate-scale-in">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
            Apakah Anda yakin ingin memperbarui link monitoring untuk murid <strong className="text-foreground">{student?.nama}</strong>? Link lama tidak akan bisa diakses lagi oleh orang tua.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRegenConfirmOpen(false)}
              disabled={regenLoading}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleRegenerateLink}
              isLoading={regenLoading}
            >
              Perbarui Link
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
