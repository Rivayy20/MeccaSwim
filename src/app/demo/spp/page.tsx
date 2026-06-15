'use client';

import React, { useState } from 'react';
import { Card, CardContent, Button, Badge, Select, EmptyState } from '@/components/ui';
import { CreditCard, DollarSign, Calendar, Search, Filter, Check, Edit2, AlertCircle, TrendingUp, Plus, Trash2, Download } from 'lucide-react';
import { DEMO_CLASSES, DEMO_SPP } from '@/lib/dummy-data';
import { handleDemoAction } from '@/components/DemoAlert';

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

interface SPPItem {
  id: string;
  studentName: string;
  class: string;
  amount: number;
  status: string;
}

export default function DemoSPPPage() {
  const [month, setMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const summary = { totalTagihan: 5000000, totalTerbayar: 3500000, totalPiutang: 1500000 };

  const filteredPayments = DEMO_SPP.filter((item: SPPItem) => {
    const matchesClass = selectedClassId === 'all' || item.class === selectedClassId;
    const matchesSearch = item.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2 leading-none">
            <CreditCard className="h-5 w-5 text-primary-500" />
            Pembayaran SPP Bulanan (Demo)
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">
            Kelola tagihan, status bayar, dan rekapitulasi iuran les renang murid.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button
            onClick={handleDemoAction}
            variant="outline"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Ekspor Excel
          </Button>
          <Button
            onClick={handleDemoAction}
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
              <option value="2026">2026</option>
              <option value="2025">2025</option>
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
              {DEMO_CLASSES.map((c) => (
                 <option key={c.id} value={c.name}>{c.name}</option>
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
          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <EmptyState
                icon="Calendar"
                title="Tagihan SPP Belum Tersedia"
                description="Belum ada data tagihan SPP yang diinput secara manual untuk periode ini. Klik 'Tambah Tagihan SPP' untuk mencatat tagihan baru."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-slate-50 dark:bg-slate-900/50">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Murid</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Kelas Latihan</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Jenis SPP</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Nominal Tagihan</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status Pembayaran</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPayments.map((item: SPPItem) => (
                    <tr key={item.id} className="hover:bg-slate-500/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">{item.studentName}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">{item.class}</td>
                      <td className="px-6 py-4">
                        <Badge variant="primary" showDot={false}>Bulanan</Badge>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                        Rp {item.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={item.status === 'lunas' ? 'hadir' : 'alpha'}>
                          {item.status === 'lunas' ? 'Lunas' : 'Belum Bayar'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant={item.status === 'lunas' ? 'outline' : 'primary'}
                            onClick={handleDemoAction}
                            leftIcon={item.status === 'lunas' ? <Edit2 className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                          >
                            {item.status === 'lunas' ? 'Ubah' : 'Bayar'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleDemoAction}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
