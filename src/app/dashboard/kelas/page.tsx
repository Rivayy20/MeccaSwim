'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useDashboardAuth } from '@/hooks/useAuth';
import { useClasses } from '@/hooks/useClasses';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Modal,
  EmptyState,
  LoadingSpinner,
} from '@/components/ui';
import { ClassForm } from '@/components/forms';
import { Class, CreateClassInput } from '@/lib/types';
import { Plus, Edit, Trash2, Users, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ClassListPage() {
  const { user } = useDashboardAuth();
  const router = useRouter();
  const {
    classesWithCount,
    loading,
    fetchClasses,
    createClass,
    updateClass,
    deleteClass,
  } = useClasses();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  // Confirm Delete Class State
  const [classToDelete, setClassToDelete] = useState<{ id: string; nama: string; lokasi: string } | null>(null);
  const [deleteConfirmLoading, setDeleteConfirmLoading] = useState(false);

  const handleDeleteClassConfirm = async () => {
    if (!classToDelete || !guruId) return;
    setDeleteConfirmLoading(true);
    try {
      await deleteClass(guruId, classToDelete.id, true);
      setClassToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirmLoading(false);
    }
  };

  const guruId = user?.id;

  useEffect(() => {
    if (guruId) {
      fetchClasses(guruId, true); // true includes student count
    }
  }, [guruId, fetchClasses]);

  const handleOpenAddModal = () => {
    setEditingClass(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (e: React.MouseEvent, cls: Class) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingClass(cls);
    setIsModalOpen(true);
  };

  const handleDeleteClass = async (e: React.MouseEvent, cls: Class) => {
    e.preventDefault();
    e.stopPropagation();
    setClassToDelete({ id: cls.id, nama: cls.nama, lokasi: cls.lokasi });
  };

  const handleFormSubmit = async (data: CreateClassInput) => {
    if (!guruId) return;
    setFormSubmitLoading(true);
    try {
      if (editingClass) {
        await updateClass(guruId, editingClass.id, data, true);
      } else {
        await createClass(guruId, data, true);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setFormSubmitLoading(false);
    }
  };

  const groupedClasses = useMemo(() => {
    const daysOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    
    const groups: Record<string, typeof classesWithCount> = {};
    classesWithCount.forEach((cls) => {
      const key = cls.nama || 'Kelas Lainnya';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(cls);
    });

    return Object.keys(groups)
      .map((key) => {
        const dayName = key.replace('Kelas ', '').trim();
        const index = daysOrder.indexOf(dayName);
        
        const totalStudentCount = groups[key].reduce((sum, item) => sum + (item.student_count || 0), 0);
        const totalKapasitas = groups[key].reduce((sum, item) => sum + (item.kapasitas || 0), 0);
        
        return {
          dayName: key,
          sortIndex: index === -1 ? 99 : index,
          classes: groups[key],
          totalStudentCount,
          totalKapasitas,
        };
      })
      .sort((a, b) => a.sortIndex - b.sortIndex);
  }, [classesWithCount]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Daftar Kelas Renang</h2>
          <p className="text-xs text-muted-foreground font-semibold">
            Kelola tingkatan kelas renang, jadwal latihan, dan pantau kapasitas murid
          </p>
        </div>
        <Button onClick={handleOpenAddModal} leftIcon={<Plus className="h-4 w-4" />}>
          Tambah Kelas
        </Button>
      </div>

      {/* Grid Content */}
      {loading && classesWithCount.length === 0 ? (
        <div className="h-[40vh] flex items-center justify-center">
          <LoadingSpinner text="Memuat data kelas..." />
        </div>
      ) : classesWithCount.length === 0 ? (
        <EmptyState
          icon="GraduationCap"
          title="Belum Ada Kelas Terdaftar"
          description="Daftarkan kelas latihan renang pertama Anda untuk mengelompokkan murid."
          action={
            <Button size="sm" onClick={handleOpenAddModal} leftIcon={<Plus className="h-4 w-4" />}>
              Tambah Kelas Pertama
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {groupedClasses.map((group, index) => {
            const totalUtilization = Math.min(100, Math.round((group.totalStudentCount / (group.totalKapasitas || 1)) * 100));
            const isFull = group.totalStudentCount >= group.totalKapasitas;

            return (
              <Card
                key={group.dayName}
                className="h-full border border-border flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 shrink-0 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-black">
                      {index + 1}
                    </span>
                    <div>
                      <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">
                        {group.dayName}
                      </CardTitle>
                      <CardDescription className="text-xs font-semibold mt-0.5 text-muted-foreground">
                        {group.classes.length} Lokasi Latihan
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 flex-grow">
                  {/* Cumulative Capacity Info */}
                  <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        Total Okupansi Murid
                      </span>
                      <span className={isFull ? 'text-red-500 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                        {group.totalStudentCount} / {group.totalKapasitas} Murid
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFull ? 'bg-red-500' : 'bg-primary-500'
                        }`}
                        style={{ width: `${totalUtilization}%` }}
                      />
                    </div>
                  </div>

                  {/* Sessions list */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">Jadwal Sesi</p>
                    <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-white dark:bg-slate-950">
                      {group.classes.map((cls) => {
                        const timePart = cls.jadwal ? (cls.jadwal.split(',')[1]?.trim() || cls.jadwal) : 'Jadwal belum ditentukan';
                        const isSessionFull = cls.student_count >= cls.kapasitas;
                        return (
                          <div
                            key={cls.id}
                            onClick={() => router.push(`/dashboard/kelas/${cls.id}`)}
                            className="flex items-center justify-between p-3 hover:bg-primary-50/30 dark:hover:bg-primary-950/10 cursor-pointer transition-colors group/row"
                          >
                            <div className="flex flex-col gap-1 min-w-0 pr-2">
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 truncate group-hover/row:text-primary-500 transition-colors">
                                <MapPin className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                                {cls.lokasi || 'Semilir'}
                              </span>
                              <span className="text-xs text-muted-foreground font-semibold pl-5">
                                {timePart}
                              </span>
                              <span className={`text-[10px] pl-5 font-bold ${isSessionFull ? 'text-red-500' : 'text-slate-500'}`}>
                                {cls.student_count} / {cls.kapasitas} Murid
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => handleOpenEditModal(e, cls)}
                                className="h-8 w-8 p-0"
                                title="Edit Kelas"
                              >
                                <Edit className="h-4 w-4 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => handleDeleteClass(e, cls)}
                                className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950/20"
                                title="Hapus Kelas"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClass ? 'Edit Kelas Renang' : 'Tambah Kelas Baru'}
      >
        <ClassForm
          initialData={editingClass}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={formSubmitLoading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!classToDelete}
        onClose={() => setClassToDelete(null)}
        title="Hapus Kelas Renang"
      >
        <div className="space-y-4 animate-scale-in">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
            Apakah Anda yakin ingin menghapus <strong className="text-foreground">{classToDelete?.nama} ({classToDelete?.lokasi})</strong>?
          </p>
          <p className="text-xs text-amber-500 font-bold bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
            ⚠️ Semua murid di kelas ini akan dilepas dari kelas (tetap terdaftar di data murid) dan riwayat kehadiran murid tidak akan terhapus.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setClassToDelete(null)}
              disabled={deleteConfirmLoading}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteClassConfirm}
              isLoading={deleteConfirmLoading}
            >
              Hapus Kelas
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
