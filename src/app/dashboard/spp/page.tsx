'use client';

import React, { useEffect, useState, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDashboardAuth } from '@/hooks/useAuth';
import { useClasses } from '@/hooks/useClasses';
import { useStudents } from '@/hooks/useStudents';
import { createClient } from '@/lib/supabase/client';
import { sppService } from '@/services';
import { SPPPayment } from '@/services/spp.service';
import { Card, CardContent, Button, Modal, Input, Badge, Select, LoadingSpinner, EmptyState } from '@/components/ui';
import { CreditCard, DollarSign, Calendar, Search, Filter, Check, Edit2, AlertCircle, TrendingUp, Plus, Trash2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportSPPToExcel } from '@/lib/utils';

const MONTHS = [
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

const NOMINAL_OPTIONS = [
  50000, 100000, 150000, 200000, 250000, 300000, 350000, 400000, 500000, 750000, 1000000,
];

const formatRupiah = (value: string | number) => {
  if (value === undefined || value === null) return '';
  let cleanStr = value.toString().replace(/\D/g, '');
  cleanStr = cleanStr.replace(/^0+/, '');
  if (!cleanStr) return '';
  return new Intl.NumberFormat('id-ID').format(parseInt(cleanStr));
};

const parseRupiah = (value: string) => {
  const clean = value.replace(/\D/g, '');
  return clean ? parseInt(clean) : 0;
};

function SPPPageContent() {
  const { user } = useDashboardAuth();
  const { classes, fetchClasses } = useClasses();
  const { students, fetchStudents } = useStudents();
  const supabase = createClient();

  const router = useRouter();
  const searchParams = useSearchParams();
  const paramStudentId = searchParams.get('studentId');
  const paramAction = searchParams.get('action');

  const [month, setMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [payments, setPayments] = useState<SPPPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalTagihan: 0, totalTerbayar: 0, totalPiutang: 0 });

  // Pagination states
  const [pageSize, setPageSize] = useState<number | 'all'>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<SPPPayment | null>(null);
  const [payAmountText, setPayAmountText] = useState<string>('150.000');
  const [payStatus, setPayStatus] = useState<'lunas' | 'belum_bayar'>('lunas');
  const [payMethod, setPayMethod] = useState<'transfer' | 'tunai'>('transfer');
  const [payCatatan, setPayCatatan] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Modal Tambah Tagihan State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [newAmountText, setNewAmountText] = useState<string>('');
  const [newStatus, setNewStatus] = useState<'belum_bayar' | 'lunas'>('belum_bayar');
  const [newMethod, setNewMethod] = useState<'transfer' | 'tunai'>('transfer');
  const [newCatatan, setNewCatatan] = useState<string>('');
  const [newMonth, setNewMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [newYear, setNewYear] = useState<string>(new Date().getFullYear().toString());
  const [newTipe, setNewTipe] = useState<'harian' | 'mingguan' | 'bulanan'>('bulanan');
  const [newTanggalTagihan, setNewTanggalTagihan] = useState<string>('');
  const [newMinggu, setNewMinggu] = useState<string>('1');

  // Searchable Student select states
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const guruId = user?.id;

  // Confirm Delete SPP Billing State
  const [sppToDelete, setSppToDelete] = useState<SPPPayment | null>(null);
  const [sppDeleteLoading, setSppDeleteLoading] = useState(false);

  const yearsList = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear - 4; y <= currentYear + 10; y++) {
      years.push(y.toString());
    }
    return years;
  }, []);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStudentDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (paramAction === 'add' && paramStudentId && students.length > 0) {
      const exists = students.some((s) => s.id === paramStudentId);
      if (exists) {
        setSelectedStudentId(paramStudentId);
        setStudentSearchQuery('');
        setIsStudentDropdownOpen(false);
        setNewAmountText('');
        setNewStatus('belum_bayar');
        setNewMethod('transfer');
        setNewCatatan('');
        setNewMonth(month);
        setNewYear(year);
        setNewTipe('bulanan');
        setNewTanggalTagihan('');
        setNewMinggu('1');
        setIsAddModalOpen(true);

        // Clean up URL parameters
        router.replace('/dashboard/spp');
      }
    }
  }, [paramAction, paramStudentId, students, month, year, router]);

  useEffect(() => {
    if (guruId) {
      fetchClasses(guruId);
      fetchStudents(guruId);
    }
  }, [guruId, fetchClasses, fetchStudents]);

  const loadSPPData = React.useCallback(async () => {
    if (!guruId) return;
    setLoading(true);
    try {
      const res = await sppService.getSPPPayments(supabase, guruId, Number(month), Number(year));
      if (res.data) {
        setPayments(res.data);
      }
      
      const sum = await sppService.getFinancialSummary(supabase, guruId, Number(month), Number(year));
      setSummary(sum);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat data keuangan SPP');
    } finally {
      setLoading(false);
    }
  }, [guruId, month, year, supabase]);

  useEffect(() => {
    loadSPPData();
  }, [loadSPPData]);

  const handleOpenPaymentModal = (payment: SPPPayment) => {
    setSelectedPayment(payment);
    setPayAmountText(formatRupiah(payment.jumlah));
    setPayStatus(payment.status);
    setPayMethod(payment.metode_bayar || 'transfer');
    setPayCatatan(payment.catatan || '');
    setIsModalOpen(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    const amount = parseRupiah(payAmountText);
    if (amount <= 0) {
      toast.error('Nominal pembayaran harus lebih besar dari 0.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await sppService.recordSPPPayment(supabase, selectedPayment.id, {
        jumlah: amount,
        status: payStatus,
        metode_bayar: payStatus === 'lunas' ? payMethod : null,
        catatan: payCatatan.trim() || null,
        tanggal_bayar: payStatus === 'lunas' ? new Date().toISOString() : null,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Pembayaran SPP ${selectedPayment.student?.nama} berhasil diperbarui!`);
        setIsModalOpen(false);
        loadSPPData();
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan koneksi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAddModal = () => {
    setSelectedStudentId('');
    setStudentSearchQuery('');
    setIsStudentDropdownOpen(false);
    setNewAmountText('');
    setNewStatus('belum_bayar');
    setNewMethod('transfer');
    setNewCatatan('');
    setNewMonth(month);
    setNewYear(year);
    setNewTipe('bulanan');
    setNewTanggalTagihan('');
    setNewMinggu('1');
    setIsAddModalOpen(true);
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guruId || !selectedStudentId) {
      toast.error('Silakan pilih murid terlebih dahulu.');
      return;
    }

    const amount = parseRupiah(newAmountText);
    if (amount <= 0) {
      toast.error('Nominal tagihan harus lebih besar dari 0.');
      return;
    }

    if (newTipe === 'harian' && !newTanggalTagihan) {
      toast.error('Silakan pilih tanggal untuk tagihan harian.');
      return;
    }

    let finalMonth = Number(newMonth);
    let finalYear = Number(newYear);

    if (newTipe === 'harian') {
      const dateObj = new Date(newTanggalTagihan);
      finalMonth = dateObj.getMonth() + 1;
      finalYear = dateObj.getFullYear();
    }

    setSubmitting(true);
    try {
      const res = await sppService.createSPPPayment(supabase, {
        student_id: selectedStudentId,
        bulan: finalMonth,
        tahun: finalYear,
        jumlah: amount,
        status: newStatus,
        metode_bayar: newStatus === 'lunas' ? newMethod : null,
        catatan: newCatatan.trim() || null,
        guru_id: guruId,
        tanggal_bayar: newStatus === 'lunas' ? (new Date().toISOString()) : null,
        tipe: newTipe,
        tanggal_tagihan: newTipe === 'harian' ? newTanggalTagihan : null,
        minggu: newTipe === 'mingguan' ? Number(newMinggu) : null,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Tagihan SPP baru berhasil disimpan!');
        setIsAddModalOpen(false);
        loadSPPData();
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan koneksi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePaymentConfirm = async () => {
    if (!sppToDelete) return;
    setSppDeleteLoading(true);
    try {
      const res = await sppService.deleteSPPPayment(supabase, sppToDelete.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Tagihan SPP ${sppToDelete.student?.nama || 'murid'} berhasil dihapus!`);
        setSppToDelete(null);
        loadSPPData();
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan koneksi');
    } finally {
      setSppDeleteLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (payments.length === 0) {
      toast.error('Tidak ada data SPP untuk diekspor pada periode ini.');
      return;
    }
    
    const toastId = toast.loading('Sedang menyiapkan file Excel SPP...');
    try {
      const monthObj = MONTHS.find((m) => m.value === month);
      const monthLabel = monthObj ? monthObj.label : 'Bulan';
      const filename = `Laporan_SPP_${monthLabel}_${year}`;
      
      await exportSPPToExcel(
        payments,
        monthLabel,
        Number(year),
        summary,
        filename
      );
      toast.success('Laporan SPP Excel (.xlsx) berhasil diunduh!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengekspor data SPP ke Excel.', { id: toastId });
    }
  };

  // Filter & Search
  const filteredPayments = payments.filter((item) => {
    const matchesClass = selectedClassId === 'all' || item.student?.kelas_id === selectedClassId;
    const matchesSearch = item.student?.nama.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const totalPages = pageSize === 'all' ? 1 : Math.ceil(filteredPayments.length / pageSize);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredPayments.length, pageSize, totalPages, currentPage]);

  const paginatedPayments = pageSize === 'all'
    ? filteredPayments
    : filteredPayments.slice((currentPage - 1) * Number(pageSize), currentPage * Number(pageSize));

  const getPeriodBadge = (item: SPPPayment) => {
    const tipe = item.tipe || 'bulanan';
    if (tipe === 'bulanan') {
      return (
        <Badge variant="primary" showDot={false}>
          Bulanan
        </Badge>
      );
    } else if (tipe === 'mingguan') {
      return (
        <Badge variant="izin" showDot={false}>
          Mingguan (M-{item.minggu})
        </Badge>
      );
    } else {
      const dateStr = item.tanggal_tagihan
        ? new Date(item.tanggal_tagihan).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })
        : '-';
      return (
        <Badge variant="sakit" showDot={false}>
          Harian ({dateStr})
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2 leading-none">
            <CreditCard className="h-5 w-5 text-primary-500" />
            Pembayaran SPP Bulanan
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">
            Kelola tagihan, status bayar, dan rekapitulasi iuran les renang murid.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button
            onClick={handleExportExcel}
            variant="outline"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Ekspor Excel
          </Button>
          <Button
            onClick={handleOpenAddModal}
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Tambah Tagihan SPP
          </Button>
        </div>
      </div>

      {/* Financial Summary Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200 dark:border-emerald-900 shadow-sm relative overflow-hidden group hover:scale-[1.01] transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Total Terbayar</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Rp {summary.totalTerbayar.toLocaleString('id-ID')}</h3>
              <p className="text-[10px] font-semibold text-muted-foreground">Dana iuran yang sudah lunas masuk</p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-950">
              <DollarSign className="h-6 w-6 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-200 dark:border-red-900 shadow-sm relative overflow-hidden group hover:scale-[1.01] transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Total Sisa Piutang</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Rp {summary.totalPiutang.toLocaleString('id-ID')}</h3>
              <p className="text-[10px] font-semibold text-muted-foreground">Tagihan aktif yang belum dilunasi</p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-red-100 dark:border-red-950">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-200 dark:border-cyan-900 shadow-sm relative overflow-hidden group hover:scale-[1.01] transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Total Target Tagihan</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Rp {summary.totalTagihan.toLocaleString('id-ID')}</h3>
              <p className="text-[10px] font-semibold text-muted-foreground">Kalkulasi 100% lunas iuran bulanan</p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-cyan-100 dark:border-cyan-950">
              <TrendingUp className="h-6 w-6 text-cyan-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Area */}
      <Card className="border border-border">
        <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Periode Bulan
            </label>
            <Select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full text-sm font-semibold"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tahun</label>
            <Select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full text-sm font-semibold"
            >
              {yearsList.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              Filter Kelas
            </label>
            <Select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full text-sm font-semibold"
            >
              <option value="all">Semua Kelas</option>
              {groupedClasses.map((group) => (
                <optgroup key={group.label} label={group.label} className="bg-slate-50 dark:bg-slate-900 font-semibold text-primary-700 dark:text-primary-300">
                  {group.classes.map((c) => {
                    const timePart = c.jadwal ? (c.jadwal.split(',')[1]?.trim() || c.jadwal) : '';
                    return (
                      <option key={c.id} value={c.id} className="bg-white dark:bg-slate-950 font-normal text-slate-800 dark:text-slate-200">
                        {c.lokasi} {timePart ? `(${timePart})` : ''}
                      </option>
                    );
                  })}
                </optgroup>
              ))}
            </Select>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari nama murid..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-semibold"
            />
          </div>
        </CardContent>
      </Card>

      {/* Billings Table */}
      <Card className="border border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <LoadingSpinner text="Memuat daftar tagihan SPP..." />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <EmptyState
                icon="Calendar"
                title="Tagihan SPP Belum Tersedia"
                description="Belum ada data tagihan SPP yang diinput secara manual untuk periode ini. Klik 'Tambah Tagihan SPP' untuk mencatat tagihan baru."
              />
            </div>
          ) : (
            <>
              {/* Pagination controls header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Tampilkan</span>
                  <Select
                    value={pageSize.toString()}
                    onChange={(e) => {
                      setPageSize(e.target.value === 'all' ? 'all' : Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-8 py-0 px-2 text-xs font-semibold w-24 bg-white dark:bg-slate-950 border-border"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value="all">Semua</option>
                  </Select>
                  <span className="text-xs font-bold text-slate-500">data</span>
                </div>
                <div className="text-xs font-bold text-muted-foreground">
                  Menampilkan {paginatedPayments.length} dari {filteredPayments.length} tagihan
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-slate-50 dark:bg-slate-900/50">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Murid</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Kelas Latihan</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Jenis SPP</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Nominal Tagihan</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status Pembayaran</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Metode & Waktu</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedPayments.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-500/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">{item.student?.nama}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">{item.student?.classes?.nama || '-'}</td>
                        <td className="px-6 py-4">
                          {getPeriodBadge(item)}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                          Rp {item.jumlah.toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={item.status === 'lunas' ? 'hadir' : 'alpha'}>
                            {item.status === 'lunas' ? 'Lunas' : 'Belum Bayar'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {item.status === 'lunas' ? (
                            <div className="text-xs font-semibold space-y-0.5">
                              <p className="capitalize text-slate-700 dark:text-slate-300">
                                Via {item.metode_bayar || 'tunai'}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {item.tanggal_bayar ? new Date(item.tanggal_bayar).toLocaleDateString('id-ID') : '-'}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground font-semibold">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant={item.status === 'lunas' ? 'outline' : 'primary'}
                              onClick={() => handleOpenPaymentModal(item)}
                              leftIcon={item.status === 'lunas' ? <Edit2 className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                            >
                              {item.status === 'lunas' ? 'Ubah' : 'Bayar'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSppToDelete(item)}
                              className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg flex items-center justify-center border border-transparent hover:border-red-200"
                              title="Hapus Tagihan"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls footer */}
              {pageSize !== 'all' && filteredPayments.length > pageSize && (
                <div className="flex items-center justify-between gap-4 p-4 border-t border-border bg-slate-50/50 dark:bg-slate-900/20">
                  <div className="text-xs text-muted-foreground font-semibold">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                      disabled={currentPage === 1}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Berikutnya
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Record / Edit Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Catat Pembayaran SPP (${
          selectedPayment?.tipe === 'harian'
            ? `Harian - ${selectedPayment.tanggal_tagihan ? new Date(selectedPayment.tanggal_tagihan).toLocaleDateString('id-ID') : '-'}`
            : selectedPayment?.tipe === 'mingguan'
            ? `Mingguan - M-${selectedPayment.minggu}`
            : 'Bulanan'
        }) — ${selectedPayment?.student?.nama}`}
      >
        <form onSubmit={handleSavePayment} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                label="Nominal Pembayaran (Rp) *"
                type="text"
                value={payAmountText}
                onChange={(e) => setPayAmountText(formatRupiah(e.target.value))}
                placeholder="Contoh: 150.000"
                required
                className="bg-white dark:bg-slate-950 font-bold text-slate-900 dark:text-slate-100 border-border"
              />
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Pilih Cepat Nominal (Rp):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {NOMINAL_OPTIONS.map((num) => {
                    const formatted = formatRupiah(num);
                    const isSelected = parseRupiah(payAmountText) === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPayAmountText(formatted)}
                        className={`px-2.5 py-1 text-xs font-extrabold rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-primary-500 text-white border-primary-500 shadow-sm scale-105'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-border hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30'
                        }`}
                      >
                        {formatted}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Status Pembayaran</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-foreground">
                  <input
                    type="radio"
                    name="payStatus"
                    checked={payStatus === 'lunas'}
                    onChange={() => setPayStatus('lunas')}
                    className="text-primary-500 focus:ring-primary-500"
                  />
                  Lunas
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-foreground">
                  <input
                    type="radio"
                    name="payStatus"
                    checked={payStatus === 'belum_bayar'}
                    onChange={() => setPayStatus('belum_bayar')}
                    className="text-primary-500 focus:ring-primary-500"
                  />
                  Belum Bayar
                </label>
              </div>
            </div>

            {payStatus === 'lunas' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Metode Pembayaran</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-foreground">
                    <input
                      type="radio"
                      name="payMethod"
                      checked={payMethod === 'transfer'}
                      onChange={() => setPayMethod('transfer')}
                      className="text-primary-500 focus:ring-primary-500"
                    />
                    Transfer Bank
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-foreground">
                    <input
                      type="radio"
                      name="payMethod"
                      checked={payMethod === 'tunai'}
                      onChange={() => setPayMethod('tunai')}
                      className="text-primary-500 focus:ring-primary-500"
                    />
                    Cash / Tunai
                  </label>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Catatan / Keterangan</label>
              <textarea
                value={payCatatan}
                onChange={(e) => setPayCatatan(e.target.value)}
                placeholder="Misal: Lunas transfer via BCA, cicilan 1, dll."
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end items-center pt-4 border-t border-border mt-6">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                isLoading={submitting}
              >
                Simpan Pembayaran
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Create / Add SPP Payment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Tagihan SPP Murid"
      >
        <form onSubmit={handleCreatePayment} className="space-y-4">
          <div className="space-y-4">
            {/* Student selection with search */}
            <div className="space-y-1.5 relative" ref={dropdownRef}>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Murid *</label>
              <div className="relative">
                {/* Trigger button */}
                <button
                  type="button"
                  onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                  className="w-full h-10 px-3 bg-white dark:bg-slate-950 border border-border text-slate-900 dark:text-slate-100 text-sm rounded-lg transition-all duration-200 focus-ring font-semibold flex items-center justify-between text-left"
                >
                  <span className="truncate">
                    {selectedStudentId
                      ? (students.find((s) => s.id === selectedStudentId)?.nama || '') + 
                        (students.find((s) => s.id === selectedStudentId)?.classes?.nama
                          ? ` (${students.find((s) => s.id === selectedStudentId)?.classes?.nama})`
                          : ' (Tanpa Kelas)')
                      : '-- Pilih Murid --'}
                  </span>
                  <span className="pointer-events-none flex items-center">
                    <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                {/* Dropdown panel */}
                {isStudentDropdownOpen && (
                  <div className="absolute z-[100] mt-1 w-full bg-white dark:bg-slate-950 border border-border rounded-xl shadow-xl overflow-hidden animate-fade-in max-h-60 flex flex-col">
                    {/* Search Input */}
                    <div className="p-2 border-b border-border bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                      <input
                        type="text"
                        placeholder="Cari nama murid..."
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        className="w-full bg-transparent text-xs font-semibold focus:outline-none text-slate-900 dark:text-slate-100"
                        autoFocus
                      />
                      {studentSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setStudentSearchQuery('')}
                          className="text-[10px] font-bold text-muted-foreground hover:text-foreground px-1"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {/* List of students */}
                    <div className="overflow-y-auto max-h-48 divide-y divide-border scrollbar-thin">
                      {students.filter(s => 
                        s.nama.toLowerCase().includes(studentSearchQuery.toLowerCase())
                      ).length === 0 ? (
                        <div className="p-3 text-xs text-muted-foreground text-center font-semibold">
                          Tidak ada murid ditemukan
                        </div>
                      ) : (
                        students
                          .filter(s => s.nama.toLowerCase().includes(studentSearchQuery.toLowerCase()))
                          .map((student) => (
                            <button
                              key={student.id}
                              type="button"
                              onClick={() => {
                                setSelectedStudentId(student.id);
                                setIsStudentDropdownOpen(false);
                                setStudentSearchQuery('');
                              }}
                              className={`w-full text-left px-3 py-2 text-xs font-bold transition-all hover:bg-primary-500/10 hover:text-primary-500 flex items-center justify-between ${
                                selectedStudentId === student.id
                                  ? 'bg-primary-500/10 text-primary-500'
                                  : 'text-foreground'
                              }`}
                            >
                              <span className="truncate font-bold">
                                {student.nama}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-semibold shrink-0 pl-2">
                                {student.classes?.nama || 'Tanpa Kelas'}
                              </span>
                            </button>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Nominal Tagihan */}
            <div className="space-y-2">
              <Input
                label="Nominal Tagihan (Rp) *"
                type="text"
                value={newAmountText}
                onChange={(e) => setNewAmountText(formatRupiah(e.target.value))}
                placeholder="Contoh: 150.000"
                required
                className="bg-white dark:bg-slate-950 font-bold text-slate-900 dark:text-slate-100 border-border"
              />
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Pilih Cepat Nominal (Rp):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {NOMINAL_OPTIONS.map((num) => {
                    const formatted = formatRupiah(num);
                    const isSelected = parseRupiah(newAmountText) === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setNewAmountText(formatted)}
                        className={`px-2.5 py-1 text-xs font-extrabold rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-primary-500 text-white border-primary-500 shadow-sm scale-105'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-border hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30'
                        }`}
                      >
                        {formatted}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tipe Tagihan */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tipe Tagihan *</label>
              <Select
                value={newTipe}
                onChange={(e) => setNewTipe(e.target.value as 'harian' | 'mingguan' | 'bulanan')}
                className="w-full text-sm font-semibold text-slate-900 dark:text-slate-100"
                required
              >
                <option value="bulanan">Bulanan</option>
                <option value="mingguan">Mingguan</option>
                <option value="harian">Harian</option>
              </Select>
            </div>

            {/* Conditionally Render Period Input fields */}
            {newTipe === 'bulanan' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Bulan *</label>
                  <Select
                    value={newMonth}
                    onChange={(e) => setNewMonth(e.target.value)}
                    className="w-full text-sm font-semibold text-slate-900 dark:text-slate-100"
                    required
                  >
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tahun *</label>
                  <Select
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="w-full text-sm font-semibold text-slate-900 dark:text-slate-100"
                    required
                  >
                    {yearsList.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            )}

            {newTipe === 'mingguan' && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Minggu Ke *</label>
                  <Select
                    value={newMinggu}
                    onChange={(e) => setNewMinggu(e.target.value)}
                    className="w-full text-sm font-semibold text-slate-900 dark:text-slate-100"
                    required
                  >
                    <option value="1">Minggu 1</option>
                    <option value="2">Minggu 2</option>
                    <option value="3">Minggu 3</option>
                    <option value="4">Minggu 4</option>
                    <option value="5">Minggu 5</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Bulan *</label>
                  <Select
                    value={newMonth}
                    onChange={(e) => setNewMonth(e.target.value)}
                    className="w-full text-sm font-semibold text-slate-900 dark:text-slate-100"
                    required
                  >
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tahun *</label>
                  <Select
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="w-full text-sm font-semibold text-slate-900 dark:text-slate-100"
                    required
                  >
                    {yearsList.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            )}

            {newTipe === 'harian' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Pilih Tanggal *</label>
                <input
                  type="date"
                  value={newTanggalTagihan}
                  onChange={(e) => setNewTanggalTagihan(e.target.value)}
                  className="w-full h-10 px-3 bg-white dark:bg-slate-950 border border-border text-slate-900 dark:text-slate-100 text-sm rounded-lg transition-all duration-200 focus-ring font-semibold"
                  required
                />
              </div>
            )}

            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Status Pembayaran</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-foreground">
                  <input
                    type="radio"
                    name="newStatus"
                    checked={newStatus === 'lunas'}
                    onChange={() => setNewStatus('lunas')}
                    className="text-primary-500 focus:ring-primary-500"
                  />
                  Lunas
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-foreground">
                  <input
                    type="radio"
                    name="newStatus"
                    checked={newStatus === 'belum_bayar'}
                    onChange={() => setNewStatus('belum_bayar')}
                    className="text-primary-500 focus:ring-primary-500"
                  />
                  Belum Bayar
                </label>
              </div>
            </div>

            {/* Payment Method */}
            {newStatus === 'lunas' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Metode Pembayaran</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-foreground">
                    <input
                      type="radio"
                      name="newMethod"
                      checked={newMethod === 'transfer'}
                      onChange={() => setNewMethod('transfer')}
                      className="text-primary-500 focus:ring-primary-500"
                    />
                    Transfer Bank
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-foreground">
                    <input
                      type="radio"
                      name="newMethod"
                      checked={newMethod === 'tunai'}
                      onChange={() => setNewMethod('tunai')}
                      className="text-primary-500 focus:ring-primary-500"
                    />
                    Cash / Tunai
                  </label>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Catatan / Keterangan</label>
              <textarea
                value={newCatatan}
                onChange={(e) => setNewCatatan(e.target.value)}
                placeholder="Catatan tambahan pembayaran (opsional)"
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              isLoading={submitting}
            >
              Simpan Tagihan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete SPP Confirmation Modal */}
      <Modal
        isOpen={!!sppToDelete}
        onClose={() => setSppToDelete(null)}
        title="Hapus Tagihan SPP"
      >
        <div className="space-y-4 animate-scale-in">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
            Apakah Anda yakin ingin menghapus tagihan SPP untuk murid <strong className="text-foreground">{sppToDelete?.student?.nama}</strong>?
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSppToDelete(null)}
              disabled={sppDeleteLoading}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeletePaymentConfirm}
              isLoading={sppDeleteLoading}
            >
              Hapus Tagihan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function SPPPage() {
  return (
    <Suspense fallback={
      <div className="h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Memuat Halaman SPP..." />
      </div>
    }>
      <SPPPageContent />
    </Suspense>
  );
}
