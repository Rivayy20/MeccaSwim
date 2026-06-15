'use client';

import React from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  EmptyState,
} from '@/components/ui';
import { Plus, Edit, Trash2, Users, MapPin } from 'lucide-react';
import { DEMO_CLASSES } from '@/lib/dummy-data';
import { handleDemoAction } from '@/components/DemoAlert';

export default function DemoClassListPage() {
  const groupedClasses = [
    {
      dayName: 'Senin',
      sortIndex: 0,
      classes: DEMO_CLASSES.filter(c => c.jadwal.startsWith('Senin')),
      totalStudentCount: 20,
      totalKapasitas: 25,
    },
    {
      dayName: 'Selasa',
      sortIndex: 1,
      classes: DEMO_CLASSES.filter(c => c.jadwal.startsWith('Selasa')),
      totalStudentCount: 12,
      totalKapasitas: 15,
    },
    {
      dayName: 'Jumat',
      sortIndex: 4,
      classes: DEMO_CLASSES.filter(c => c.jadwal.startsWith('Jumat')),
      totalStudentCount: 10,
      totalKapasitas: 15,
    },
    {
      dayName: 'Sabtu',
      sortIndex: 5,
      classes: DEMO_CLASSES.filter(c => c.jadwal.startsWith('Sabtu')),
      totalStudentCount: 8,
      totalKapasitas: 10,
    },
    {
      dayName: 'Minggu',
      sortIndex: 6,
      classes: DEMO_CLASSES.filter(c => c.jadwal.startsWith('Minggu')),
      totalStudentCount: 6,
      totalKapasitas: 10,
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Daftar Kelas Renang (Demo)</h2>
          <p className="text-xs text-muted-foreground font-semibold">
            Kelola tingkatan kelas renang, jadwal latihan, dan pantau kapasitas murid
          </p>
        </div>
        <Button onClick={handleDemoAction} leftIcon={<Plus className="h-4 w-4" />}>
          Tambah Kelas
        </Button>
      </div>

      {/* Grid Content */}
      {DEMO_CLASSES.length === 0 ? (
        <EmptyState
          icon="GraduationCap"
          title="Belum Ada Kelas Terdaftar"
          description="Daftarkan kelas latihan renang pertama Anda untuk mengelompokkan murid."
          action={
            <Button size="sm" onClick={handleDemoAction} leftIcon={<Plus className="h-4 w-4" />}>
              Tambah Kelas Pertama
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        const timePart = cls.jadwal.split(',')[1]?.trim() || cls.jadwal;
                        const isSessionFull = cls.muridCount >= 15; // mock condition
                        return (
                          <div
                            key={cls.id}
                            onClick={handleDemoAction}
                            className="flex items-center justify-between p-3 hover:bg-primary-50/30 dark:hover:bg-primary-950/10 cursor-pointer transition-colors group/row"
                          >
                            <div className="flex flex-col gap-1 min-w-0 pr-2">
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 truncate group-hover/row:text-primary-500 transition-colors">
                                <MapPin className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                                {cls.lokasi || 'Kolam Renang'}
                              </span>
                              <span className="text-xs text-muted-foreground font-semibold pl-5">
                                {timePart} - {cls.name}
                              </span>
                              <span className={`text-[10px] pl-5 font-bold ${isSessionFull ? 'text-red-500' : 'text-slate-500'}`}>
                                {cls.muridCount} Murid Terdaftar
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); handleDemoAction(); }}
                                className="h-8 w-8 p-0"
                                title="Edit Kelas"
                              >
                                <Edit className="h-4 w-4 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); handleDemoAction(); }}
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
    </div>
  );
}
