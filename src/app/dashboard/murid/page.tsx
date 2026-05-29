'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useDashboardAuth } from '@/hooks/useAuth';
import { useStudents } from '@/hooks/useStudents';
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
  Modal,
  EmptyState,
  LoadingSpinner,
} from '@/components/ui';
import { StudentForm } from '@/components/forms';
import { StudentWithClass, CreateStudentInput } from '@/lib/types';
import { ChevronLeft, ChevronRight, Plus, Search, Edit, Trash2, Copy, ExternalLink, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function StudentListPage() {
  const { user } = useDashboardAuth();
  const {
    students,
    loading: studentsLoading,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
  } = useStudents();
  
  const { classes, fetchClasses, loading: classesLoading } = useClasses();

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

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentWithClass | null>(null);
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  // Confirm Delete Student State
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; nama: string } | null>(null);
  const [deleteConfirmLoading, setDeleteConfirmLoading] = useState(false);

  const handleDeleteStudentConfirm = async () => {
    if (!studentToDelete || !guruId) return;
    setDeleteConfirmLoading(true);
    try {
      await deleteStudent(guruId, studentToDelete.id);
      setStudentToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirmLoading(false);
    }
  };

  const guruId = user?.id;

  useEffect(() => {
    if (guruId) {
      fetchStudents(guruId);
      fetchClasses(guruId);
    }
  }, [guruId, fetchStudents, fetchClasses]);

  const handleCopyLink = (linkToken: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/murid/${linkToken}`;
    navigator.clipboard.writeText(url);
    toast.success('Link portal orang tua berhasil disalin ke clipboard!');
  };

  const handleWhatsAppShare = (student: StudentWithClass) => {
    if (!student.ortu_hp) {
      toast.error('Nomor HP orang tua tidak tersedia');
      return;
    }
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

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: StudentWithClass) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: CreateStudentInput) => {
    if (!guruId) return;
    setFormSubmitLoading(true);
    try {
      if (editingStudent) {
        await updateStudent(guruId, editingStudent.id, data);
      } else {
        await createStudent(guruId, data);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setFormSubmitLoading(false);
    }
  };

  // Filter students based on search and selected class
  const filteredStudents = students.filter((std) => {
    const matchesSearch = std.nama.toLowerCase().includes(search.toLowerCase()) || 
      (std.ortu_nama && std.ortu_nama.toLowerCase().includes(search.toLowerCase()));
    
    const matchesClass = selectedClassId === '' || std.kelas_id === selectedClassId;

    return matchesSearch && matchesClass;
  });
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const visibleStudents = filteredStudents.slice((activePage - 1) * pageSize, activePage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedClassId, pageSize]);

  const isLoading = studentsLoading || classesLoading;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Daftar Murid Mecca Swim</h2>
          <p className="text-xs text-muted-foreground font-semibold">
            Kelola murid les renang dan dapatkan link unik monitoring orang tua
          </p>
        </div>
        <Button onClick={handleOpenAddModal} leftIcon={<Plus className="h-4 w-4" />}>
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
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="w-full md:w-64">
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
          </div>
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

      {/* Table Data */}
      {isLoading && students.length === 0 ? (
        <div className="h-[40vh] flex items-center justify-center">
          <LoadingSpinner text="Memuat data murid..." />
        </div>
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          icon="Users"
          title="Tidak Ada Murid Ditemukan"
          description={
            search || selectedClassId
              ? 'Coba ganti kata kunci pencarian atau filter kelas Anda.'
              : 'Belum ada data murid terdaftar. Klik tombol Tambah Murid untuk memulai.'
          }
          action={
            !search && !selectedClassId ? (
              <Button size="sm" onClick={handleOpenAddModal} leftIcon={<Plus className="h-4 w-4" />}>
                Tambah Murid Pertama
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card className="border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Murid</TableHead>
                <TableHead>Jenis Kelamin</TableHead>
                <TableHead>Usia</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Orang Tua</TableHead>
                <TableHead>Nomor HP</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/murid/${student.id}`}
                      className="text-primary-600 hover:text-primary-700 font-bold hover:underline"
                    >
                      {student.nama}
                    </Link>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700 dark:text-slate-300">
                    {student.jenis_kelamin || '-'}
                  </TableCell>
                  <TableCell>{student.usia ? `${student.usia} tahun` : '-'}</TableCell>
                  <TableCell>
                    {student.classes ? (
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {student.classes.nama}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Belum pilih kelas</span>
                    )}
                  </TableCell>
                  <TableCell>{student.ortu_nama || '-'}</TableCell>
                  <TableCell>{student.ortu_hp || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyLink(student.link_token)}
                        title="Salin Link Ortu"
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4 text-slate-500" />
                      </Button>
                      {student.ortu_hp && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleWhatsAppShare(student)}
                          title="Kirim Link ke WhatsApp"
                          className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                        >
                          <MessageCircle className="h-4.5 w-4.5" />
                        </Button>
                      )}
                      <Link href={`/dashboard/murid/${student.id}`} title="Lihat Detail/QR">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <ExternalLink className="h-4 w-4 text-slate-500" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEditModal(student)}
                        title="Edit"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4 text-slate-500 hover:text-primary-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setStudentToDelete({ id: student.id, nama: student.nama })}
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

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Data Murid' : 'Tambah Murid Baru'}
      >
        <StudentForm
          initialData={editingStudent}
          classes={classes}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={formSubmitLoading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        title="Hapus Data Murid"
      >
        <div className="space-y-4 animate-scale-in">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
            Apakah Anda yakin ingin menghapus data murid <strong className="text-foreground">{studentToDelete?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStudentToDelete(null)}
              disabled={deleteConfirmLoading}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteStudentConfirm}
              isLoading={deleteConfirmLoading}
            >
              Hapus Murid
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
