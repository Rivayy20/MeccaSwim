'use client';

import React, { useState } from 'react';
import { Input, Select, Button } from '../ui';
import { Class, CreateClassInput } from '@/lib/types';
import { CLASS_DAYS } from '@/lib/utils/class';

interface ClassFormProps {
  initialData?: Class | null;
  onSubmit: (data: CreateClassInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ClassForm({ initialData, onSubmit, onCancel, isLoading = false }: ClassFormProps) {
  const parseJadwal = (jadwalStr?: string | null) => {
    if (!jadwalStr) return { hari: '', jamMulai: '', jamSelesai: '' };
    
    const parts = jadwalStr.split(',');
    const hari = parts[0]?.trim() || '';
    
    let jamMulai = '';
    let jamSelesai = '';
    
    if (parts[1]) {
      const timeParts = parts[1].split('-');
      jamMulai = timeParts[0]?.trim() || '';
      jamSelesai = timeParts[1]?.trim() || '';
    }
    
    return { hari, jamMulai, jamSelesai };
  };

  const initialJadwal = parseJadwal(initialData?.jadwal);
  const [hari, setHari] = useState(initialJadwal.hari);
  const [jamMulai, setJamMulai] = useState(initialJadwal.jamMulai);
  const [jamSelesai, setJamSelesai] = useState(initialJadwal.jamSelesai);

  const [kapasitas, setKapasitas] = useState<number | ''>(initialData?.kapasitas ?? 10);
  const [lokasi, setLokasi] = useState<string>(initialData?.lokasi || 'Semilir');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!hari || !jamMulai || !jamSelesai) {
      newErrors.jadwal = 'Pilih hari serta jam mulai dan selesai';
    } else if (jamSelesai <= jamMulai) {
      newErrors.jadwal = 'Jam selesai harus setelah jam mulai';
    }
    if (kapasitas === '' || kapasitas <= 0) {
      newErrors.kapasitas = 'Kapasitas harus lebih besar dari 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submissionData: CreateClassInput = {
      nama: `Kelas ${hari}`,
      jadwal: `${hari}, ${jamMulai} - ${jamSelesai}`,
      kapasitas: kapasitas === '' ? 0 : kapasitas,
      lokasi: lokasi,
    };

    await onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up">
      <div className="rounded-xl bg-primary-50/70 dark:bg-cyan-950/20 border border-primary-100 dark:border-cyan-900 p-4">
        <p className="text-xs font-bold text-primary-700 dark:text-primary-300">1. Tentukan Jadwal Latihan</p>
        <p className="text-xs text-muted-foreground mt-1">
          Nama kelas otomatis mengikuti hari latihan, misalnya Kelas Senin.
        </p>
      </div>

      <div className="space-y-3 p-4 rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/20">
        
        <Select
          label="Hari Latihan *"
          name="hari"
          value={hari}
          onChange={(e) => {
            setHari(e.target.value);
            if (errors.jadwal) setErrors((prev) => ({ ...prev, jadwal: '' }));
          }}
        >
          <option value="">-- Pilih Hari --</option>
          {CLASS_DAYS.map((day) => <option key={day} value={day}>{day}</option>)}
        </Select>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Jam Mulai *"
            name="jamMulai"
            type="time"
            value={jamMulai}
            onChange={(e) => {
              setJamMulai(e.target.value);
              if (errors.jadwal) setErrors((prev) => ({ ...prev, jadwal: '' }));
            }}
          />
          <Input
            label="Jam Selesai *"
            name="jamSelesai"
            type="time"
            value={jamSelesai}
            onChange={(e) => {
              setJamSelesai(e.target.value);
              if (errors.jadwal) setErrors((prev) => ({ ...prev, jadwal: '' }));
            }}
          />
        </div>
        {errors.jadwal && (
          <p className="text-xs font-semibold text-red-500">{errors.jadwal}</p>
        )}
      </div>

      <Select
        label="2. Lokasi Latihan *"
        name="lokasi"
        value={lokasi}
        onChange={(e) => setLokasi(e.target.value)}
        required
      >
        <option value="Semilir">Semilir</option>
        <option value="Kolam Fatima Utama">Kolam Fatima Utama</option>
        <option value="Tirta Sambara">Tirta Sambara</option>
        <option value="Tirta Rahayu">Tirta Rahayu</option>
      </Select>

      <Input
        label="3. Kapasitas Maksimal Murid *"
        name="kapasitas"
        type="number"
        value={kapasitas}
        onChange={(e) => {
          setKapasitas(e.target.value ? parseInt(e.target.value, 10) : '');
          if (errors.kapasitas) setErrors((prev) => ({ ...prev, kapasitas: '' }));
        }}
        error={errors.kapasitas}
        placeholder="Contoh: 10"
        min="1"
      />

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Simpan Perubahan' : 'Tambah Kelas'}
        </Button>
      </div>
    </form>
  );
}
