'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDashboardAuth } from '@/hooks/useAuth';
import { useClasses } from '@/hooks/useClasses';
import {
  Button,
  Card,
  CardContent,
  Input,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  LoadingSpinner,
  EmptyState,
} from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import * as attendanceService from '@/services/attendance.service';
import { MonthlyRecapResult } from '@/services/attendance.service';
import { getSessions } from '@/services/session.service';
import { SessionWithClass } from '@/lib/types';
import { Download, Calendar, Award, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { exportRecapToExcel } from '@/lib/utils';
import toast from 'react-hot-toast';
import { formatTanggalPendek, formatHari } from '@/lib/utils/date';

export default function RecapPage() {
  const { user } = useDashboardAuth();
  const { classes, fetchClasses } = useClasses();

  // Date selection states
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Recap data states
  const [recapData, setRecapData] = useState<MonthlyRecapResult[]>([]);
  const [sessions, setSessions] = useState<SessionWithClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const supabase = createClient();
  const guruId = user?.id;

  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktobers' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  const years = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 4 + i);

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

  const loadData = useCallback(async () => {
    if (!guruId) return;
    setLoading(true);
    try {
      const start = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const nextMonth = selectedMonth === 12
        ? `${selectedYear + 1}-01-01`
        : `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;

      const sessionsResult = await getSessions(supabase, guruId, {
        kelas_id: selectedClassId || undefined,
        from: start,
        to: nextMonth,
      });
      setSessions(sessionsResult.data || []);

      // 2. Fetch Monthly recap details (students + statistics)
      const recapResult = await attendanceService.getMonthlyRecap(
        supabase,
        guruId,
        selectedMonth,
        selectedYear,
        selectedClassId || undefined
      );
      setRecapData(recapResult.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat rekap kehadiran');
    } finally {
      setLoading(false);
    }
  }, [guruId, selectedMonth, selectedYear, selectedClassId, supabase]);

  useEffect(() => {
    if (guruId) {
      loadData();
      fetchClasses(guruId);
    }
  }, [guruId, loadData, fetchClasses]);

  // Compute overall monthly metrics
  const totalSesi = sessions.length;
  
  // Calculate average attendance across students
  const validRecap = recapData.filter((r) => r.summary?.rate !== undefined);
  const averageRate = validRecap.length > 0
    ? Math.round(validRecap.reduce((sum, item) => sum + item.summary.rate, 0) / validRecap.length)
    : 0;

  // Best & worst students
  let bestStudent = '-';
  let worstStudent = '-';
  let maxRate = -1;
  let minRate = 101;

  recapData.forEach((item) => {
    const rate = item.summary?.rate || 0;
    if (rate > maxRate) {
      maxRate = rate;
      bestStudent = item.student.nama;
    }
    if (rate < minRate) {
      minRate = rate;
      worstStudent = item.student.nama;
    }
  });
  const filteredRecapData = recapData.filter((item) =>
    item.student.nama.toLowerCase().includes(studentSearch.trim().toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredRecapData.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const visibleRecapData = filteredRecapData.slice((activePage - 1) * pageSize, activePage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [studentSearch, pageSize, selectedClassId, selectedMonth, selectedYear]);

  const handleExportExcel = async () => {
    if (filteredRecapData.length === 0) {
      toast.error('Tidak ada data rekap untuk diekspor.');
      return;
    }

    setIsExporting(true);
    const toastId = toast.loading('Sedang menyiapkan file Excel...');
    try {
      const monthLabel = months.find((m) => m.value === selectedMonth)?.label || 'Bulan';
      const rawClassName = selectedClassId ? classes.find((c) => c.id === selectedClassId)?.nama || 'Kelas' : 'Semua-Kelas';
      const cleanClassName = rawClassName.replace(/\s+/g, '-');
      const filename = `Rekap-Presensi-${cleanClassName}-${monthLabel}-${selectedYear}`;

      await exportRecapToExcel(
        filteredRecapData,
        sessions,
        selectedClassId ? classes.find((c) => c.id === selectedClassId)?.nama || 'Semua Kelas' : 'Semua Kelas',
        monthLabel,
        selectedYear,
        filename
      );
      toast.success('File Excel (.xlsx) berhasil diunduh!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengekspor file Excel.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Rekap Kehadiran Bulanan</h2>
          <p className="text-xs text-muted-foreground font-semibold">
            Tinjau data kehadiran murid per bulan, performa kehadiran, dan ekspor ke Excel
          </p>
        </div>
        <Button
          onClick={handleExportExcel}
          variant="outline"
          leftIcon={<Download className="h-4 w-4" />}
          disabled={filteredRecapData.length === 0}
          isLoading={isExporting}
        >
          Ekspor Excel
        </Button>
      </div>

      {/* Filter Options */}
      <Card className="border border-border">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Pilih Bulan"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>

          <Select
            label="Pilih Tahun"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>

          <Select
            label="Pilih Kelas"
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
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-[1fr_10rem] gap-4 items-end">
          <Input
            label="Cari Murid"
            placeholder="Cari nama murid pada rekap..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
          <Select
            label="Tampilkan"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={5}>5 data</option>
            <option value={10}>10 data</option>
            <option value={20}>20 data</option>
            <option value={50}>50 data</option>
          </Select>
        </CardContent>
      </Card>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                Total Sesi Latihan
              </p>
              <h4 className="text-2xl font-black">{totalSesi} Sesi</h4>
            </div>
            <div className="p-2.5 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-500 rounded-xl">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                Rerata Kehadiran
              </p>
              <h4 className="text-2xl font-black text-emerald-500">{averageRate}%</h4>
            </div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                Murid Paling Rajin
              </p>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                {bestStudent}
              </h4>
              <p className="text-[10px] text-muted-foreground font-semibold">Tingkat: {maxRate >= 0 ? `${maxRate}%` : '-'}</p>
            </div>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-xl">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                Sering Absen (Min)
              </p>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                {worstStudent}
              </h4>
              <p className="text-[10px] text-muted-foreground font-semibold">Tingkat: {minRate <= 100 ? `${minRate}%` : '-'}</p>
            </div>
            <div className="p-2.5 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recap Table Data */}
      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <LoadingSpinner text="Mengkalkulasi rekap kehadiran..." />
        </div>
      ) : filteredRecapData.length === 0 ? (
        <EmptyState
          icon="BarChart3"
          title="Tidak Ada Data Rekap"
          description={studentSearch ? 'Tidak ada nama murid yang cocok dengan pencarian.' : 'Tidak ada data murid terdaftar untuk kriteria filter ini.'}
        />
      ) : (
        <Card className="border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Nama Murid</TableHead>
                <TableHead className="text-center">Hadir</TableHead>
                <TableHead className="text-center">Izin</TableHead>
                <TableHead className="text-center">Sakit</TableHead>
                <TableHead className="text-center">Alpha</TableHead>
                <TableHead className="text-center">Tingkat</TableHead>
                {/* Dynamically append session dates */}
                {sessions.map((sess) => {
                  const dayName = formatHari(sess.tanggal);
                  const shortDay = dayName.slice(0, 3);
                  const shortDate = formatTanggalPendek(sess.tanggal).slice(0, 5);
                  const className = sess.classes?.nama || '';

                  return (
                    <TableHead key={sess.id} className="text-center p-2 min-w-[95px] border-l border-border/40">
                      <div className="flex flex-col items-center gap-0.5 font-bold">
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{shortDay}</span>
                        <span className="text-sm text-foreground leading-none">{shortDate}</span>
                        {className && (
                          <span className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1 py-0.5 rounded mt-1 max-w-[85px] truncate" title={className}>
                            {className}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRecapData.map((item) => (
                <TableRow key={item.student.id}>
                  <TableCell className="font-bold text-foreground truncate max-w-[200px]">
                    {item.student.nama}
                  </TableCell>
                  <TableCell className="text-center text-emerald-500 font-bold">
                    {item.summary.hadir}
                  </TableCell>
                  <TableCell className="text-center text-amber-500 font-bold">
                    {item.summary.izin}
                  </TableCell>
                  <TableCell className="text-center text-orange-500 font-bold">
                    {item.summary.sakit}
                  </TableCell>
                  <TableCell className="text-center text-red-500 font-bold">
                    {item.summary.alpha}
                  </TableCell>
                  <TableCell className="text-center font-black text-primary-500">
                    {item.summary.rate}%
                  </TableCell>
                  {/* Dynamic Status per Session */}
                  {sessions.map((sess) => {
                    const att = item.attendances[sess.id];
                    let text = '-';
                    let badgeClass = 'bg-slate-100 text-slate-400 border border-slate-200';

                    if (att) {
                      if (att.status === 'hadir') {
                        text = 'H';
                        badgeClass = 'bg-emerald-50 text-emerald-600 border border-emerald-200';
                      } else if (att.status === 'izin') {
                        text = 'I';
                        badgeClass = 'bg-amber-50 text-amber-600 border border-amber-200';
                      } else if (att.status === 'sakit') {
                        text = 'S';
                        badgeClass = 'bg-orange-50 text-orange-600 border border-orange-200';
                      } else if (att.status === 'alpha') {
                        text = 'A';
                        badgeClass = 'bg-red-50 text-red-600 border border-red-200';
                      }
                    }

                    return (
                      <TableCell key={sess.id} className="text-center">
                        <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${badgeClass}`}>
                          {text}
                        </span>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border p-4 text-xs font-semibold text-muted-foreground">
            <span>
              Menampilkan {((activePage - 1) * pageSize) + 1}-{Math.min(activePage * pageSize, filteredRecapData.length)} dari {filteredRecapData.length} murid
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={activePage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Sebelumnya
              </Button>
              <span className="px-2 text-foreground">{activePage} / {totalPages}</span>
              <Button
                size="sm"
                variant="ghost"
                disabled={activePage === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
