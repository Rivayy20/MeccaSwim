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
import { ChevronLeft, ChevronRight, Plus, Search, Edit, Trash2, Copy, ExternalLink, MessageCircle } from 'lucide-react';
import { DEMO_STUDENTS, DEMO_CLASSES } from '@/lib/dummy-data';
import { handleDemoAction } from '@/components/DemoAlert';

export default function DemoStudentListPage() {
  const [search, setSearch] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter students based on search and selected class
  const filteredStudents = DEMO_STUDENTS.filter((std) => {
    const matchesSearch = std.name.toLowerCase().includes(search.toLowerCase());
    const matchesClass = selectedClassId === '' || std.class.includes(selectedClassId); // simple mock filter

    return matchesSearch && matchesClass;
  });

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const visibleStudents = filteredStudents.slice((activePage - 1) * pageSize, activePage * pageSize);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Daftar Murid Mecca Swim (Demo)</h2>
          <p className="text-xs text-muted-foreground font-semibold">
            Kelola murid les renang dan dapatkan link unik monitoring orang tua
          </p>
        </div>
        <Button onClick={handleDemoAction} leftIcon={<Plus className="h-4 w-4" />}>
          Tambah Murid
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="border border-border">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-[1fr_16rem_9rem] items-end gap-4">
          <div className="w-full md:flex-1">
            <Input
              label="Cari Murid"
              placeholder="Cari nama murid atau nama orang tua..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="w-full md:w-64">
            <Select
              label="Filter Kelas"
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Semua Kelas</option>
              {DEMO_CLASSES.map((cls) => (
                <option key={cls.id} value={cls.name}>{cls.name}</option>
              ))}
            </Select>
          </div>
          <Select
            label="Tampilkan"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5 data</option>
            <option value={10}>10 data</option>
            <option value={20}>20 data</option>
          </Select>
        </CardContent>
      </Card>

      {/* Table Data */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          icon="Users"
          title="Tidak Ada Murid Ditemukan"
          description={
            search || selectedClassId
              ? 'Coba ganti kata kunci pencarian atau filter kelas Anda.'
              : 'Belum ada data murid terdaftar.'
          }
        />
      ) : (
        <Card className="border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Murid</TableHead>
                <TableHead>Jenis Kelamin</TableHead>
                <TableHead>Tingkat</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Nomor HP</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div onClick={handleDemoAction} className="text-primary-600 hover:text-primary-700 font-bold hover:underline cursor-pointer">
                      {student.name}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700 dark:text-slate-300">
                    Laki-laki
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${student.rate >= 80 ? 'bg-emerald-500' : student.rate >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${student.rate}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold">{student.rate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {student.class}
                    </span>
                  </TableCell>
                  <TableCell>{student.phone || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDemoAction}
                        title="Salin Link Ortu"
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDemoAction}
                        title="Kirim Link ke WhatsApp"
                        className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                      >
                        <MessageCircle className="h-4.5 w-4.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleDemoAction} className="h-8 w-8 p-0" title="Lihat Detail/QR">
                        <ExternalLink className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDemoAction}
                        title="Edit"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4 text-slate-500 hover:text-primary-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDemoAction}
                        title="Hapus"
                        className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border p-4 text-xs font-semibold text-muted-foreground">
            <span>
              Menampilkan {((activePage - 1) * pageSize) + 1}-{Math.min(activePage * pageSize, filteredStudents.length)} dari {filteredStudents.length} murid
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
