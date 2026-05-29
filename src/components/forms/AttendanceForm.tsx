'use client';

import React, { useState } from 'react';
import { Select, Input, Button } from '../ui';
import { AttendanceStatus } from '@/lib/types';

interface AttendanceFormProps {
  studentName: string;
  onSubmit: (data: { status: AttendanceStatus; catatan: string }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialStatus?: AttendanceStatus;
  initialCatatan?: string;
}

export function AttendanceForm({
  studentName,
  onSubmit,
  onCancel,
  isLoading = false,
  initialStatus = 'hadir',
  initialCatatan = '',
}: AttendanceFormProps) {
  const [status, setStatus] = useState<AttendanceStatus>(initialStatus);
  const [catatan, setCatatan] = useState<string>(initialCatatan);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ status, catatan: catatan.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
      <div>
        <label className="text-xs font-semibold text-muted-foreground tracking-wide block mb-1">
          Nama Murid
        </label>
        <div className="w-full h-10 px-3 py-2 bg-muted/40 border border-border text-foreground font-semibold rounded-lg flex items-center select-none">
          {studentName}
        </div>
      </div>

      <Select
        label="Status Kehadiran"
        name="status"
        value={status}
        onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
      >
        <option value="hadir">Hadir</option>
        <option value="izin">Izin (Ada Keperluan)</option>
        <option value="sakit">Sakit (Kondisi Kurang Fit)</option>
        <option value="alpha">Alpha (Tanpa Keterangan)</option>
      </Select>

      <Input
        label="Catatan Tambahan (Opsional)"
        name="catatan"
        value={catatan}
        onChange={(e) => setCatatan(e.target.value)}
        placeholder="Contoh: Datang terlambat, izin liburan keluarga"
      />

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Simpan Presensi
        </Button>
      </div>
    </form>
  );
}
