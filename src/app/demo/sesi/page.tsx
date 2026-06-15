'use client';

import React, { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Select,
  Badge,
  EmptyState,
} from '@/components/ui';
import { Plus, Play, Calendar, Clock, MapPin } from 'lucide-react';
import { DEMO_SESSIONS, DEMO_CLASSES } from '@/lib/dummy-data';
import { handleDemoAction } from '@/components/DemoAlert';

export default function DemoSessionListPage() {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const filteredSessions = DEMO_SESSIONS.filter((session) => {
    const matchesClass = selectedClassId === '' || session.class === selectedClassId;
    const matchesStatus = selectedStatus === '' || session.status === selectedStatus;
    // For demo purposes, we ignore exact date matching and assume everything matches
    return matchesClass && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Sesi Presensi Latihan (Demo)</h2>
          <p className="text-xs text-muted-foreground font-semibold">
            Buka sesi absensi QR Code untuk merekam kehadiran murid secara real-time
          </p>
        </div>
        <Button onClick={handleDemoAction} leftIcon={<Plus className="h-4 w-4" />}>
          Mulai Sesi Baru
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="border border-border">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Filter Kelas"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            <option value="">Semua Kelas</option>
            {DEMO_CLASSES.map((cls) => (
              <option key={cls.id} value={cls.name}>
                {cls.name} ({cls.jadwal})
              </option>
            ))}
          </Select>

          <Select
            label="Filter Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif (Bisa Scan)</option>
            <option value="closed">Selesai (Ditutup)</option>
          </Select>

          <div>
            <label className="text-xs font-semibold text-foreground tracking-wide block mb-1.5">
              Filter Tanggal
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full h-10 px-3 bg-background text-sm rounded-lg border border-border text-foreground transition-all duration-200 focus-ring"
            />
          </div>
        </CardContent>
      </Card>

      {/* Session list or Empty State */}
      {filteredSessions.length === 0 ? (
        <EmptyState
          icon="QrCode"
          title="Tidak Ada Sesi Ditemukan"
          description={
            selectedClassId || selectedStatus || selectedDate
              ? 'Coba ubah kriteria filter pencarian Anda.'
              : 'Anda belum pernah memulai sesi latihan absensi. Klik Mulai Sesi Baru sekarang!'
          }
          action={
            !selectedClassId && !selectedStatus && !selectedDate ? (
              <Button size="sm" onClick={handleDemoAction} leftIcon={<Plus className="h-4 w-4" />}>
                Mulai Sesi Pertama
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <Card key={session.id} hover className="border border-border flex flex-col justify-between">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant={session.status === 'active' ? 'hadir' : 'secondary'}>
                    {session.status === 'active' ? 'Aktif (Scan QR)' : 'Selesai'}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {session.date}
                  </span>
                </div>
                <CardTitle className="text-base font-extrabold mt-3">
                  {session.class}
                </CardTitle>
                <CardDescription className="text-xs font-semibold mt-1">
                  Jadwal Kelas: {session.time}
                </CardDescription>
                <CardDescription className="text-xs font-bold mt-1 text-primary-500 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                  Lokasi: Kolam Renang
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold border-t border-border/50 pt-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {session.time}
                  </span>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleDemoAction}
                    className="inline-flex items-center justify-center font-bold text-xs h-9 px-4 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors w-full gap-1.5"
                  >
                    <span>{session.status === 'active' ? 'Buka Absensi QR' : 'Lihat Rekap Sesi'}</span>
                    <Play className="h-3 w-3 fill-current" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
