'use client';

import React, { useState } from 'react';
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
  EmptyState,
} from '@/components/ui';
import { Download, Calendar, Award, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { DEMO_CLASSES, DEMO_STUDENTS } from '@/lib/dummy-data';
import { handleDemoAction } from '@/components/DemoAlert';

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
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
];

const years = [2026, 2025];

const mockSessions = [
  { id: '1', date: '01/06', day: 'SEN' },
  { id: '2', date: '08/06', day: 'SEN' },
  { id: '3', date: '15/06', day: 'SEN' },
  { id: '4', date: '22/06', day: 'SEN' },
];

export default function DemoRecapPage() {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = DEMO_STUDENTS.filter((item) =>
    item.name.toLowerCase().includes(studentSearch.trim().toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const visibleData = filteredData.slice((activePage - 1) * pageSize, activePage * pageSize);

  const totalSesi = mockSessions.length;
  const averageRate = 85;
  const bestStudent = "Budi Santoso";
  const worstStudent = "Andi Wijaya";
  const maxRate = 100;
  const minRate = 40;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Rekap Kehadiran Bulanan (Demo)</h2>
          <p className="text-xs text-muted-foreground font-semibold">
            Tinjau data kehadiran murid per bulan, performa kehadiran, dan ekspor ke Excel
          </p>
        </div>
        <Button
          onClick={handleDemoAction}
          variant="outline"
          leftIcon={<Download className="h-4 w-4" />}
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
            {DEMO_CLASSES.map((cls) => (
              <option key={cls.id} value={cls.name}>{cls.name}</option>
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
              <p className="text-[10px] text-muted-foreground font-semibold">Tingkat: {maxRate}%</p>
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
              <p className="text-[10px] text-muted-foreground font-semibold">Tingkat: {minRate}%</p>
            </div>
            <div className="p-2.5 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recap Table Data */}
      {filteredData.length === 0 ? (
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
                {/* Dynamically append mock session dates */}
                {mockSessions.map((sess) => (
                  <TableHead key={sess.id} className="text-center p-2 min-w-[95px] border-l border-border/40">
                    <div className="flex flex-col items-center gap-0.5 font-bold">
                      <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{sess.day}</span>
                      <span className="text-sm text-foreground leading-none">{sess.date}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-bold text-foreground truncate max-w-[200px]">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-center text-emerald-500 font-bold">
                    {Math.floor(item.rate / 25)}
                  </TableCell>
                  <TableCell className="text-center text-amber-500 font-bold">0</TableCell>
                  <TableCell className="text-center text-orange-500 font-bold">0</TableCell>
                  <TableCell className="text-center text-red-500 font-bold">
                     {4 - Math.floor(item.rate / 25)}
                  </TableCell>
                  <TableCell className="text-center font-black text-primary-500">
                    {item.rate}%
                  </TableCell>
                  {mockSessions.map((sess, i) => {
                    // Randomly assign present or absent based on rate for demo
                    const isPresent = i < Math.floor(item.rate / 25);
                    const text = isPresent ? 'H' : 'A';
                    const badgeClass = isPresent 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-red-50 text-red-600 border border-red-200';

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
              Menampilkan {((activePage - 1) * pageSize) + 1}-{Math.min(activePage * pageSize, filteredData.length)} dari {filteredData.length} murid
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
