'use client';

import React, { useMemo, useState } from 'react';
import { Input, Select, Button } from '../ui';
import { Student, Class, CreateStudentInput } from '@/lib/types';


interface StudentFormProps {
  initialData?: Student | null;
  classes: Class[];
  onSubmit: (data: CreateStudentInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function StudentForm({ initialData, classes, onSubmit, onCancel, isLoading = false }: StudentFormProps) {
  const groupedClasses = useMemo(() => {
    const daysOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    
    const groups: Record<string, Class[]> = {};
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
  const [formData, setFormData] = useState<CreateStudentInput>({
    nama: initialData?.nama || '',
    usia: initialData?.usia || null,
    jenis_kelamin: initialData?.jenis_kelamin || '',
    kelas_id: initialData?.kelas_id || '',
    ortu_nama: initialData?.ortu_nama || '',
    ortu_hp: initialData?.ortu_hp || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama murid wajib diisi';
    }
    if (!formData.jenis_kelamin) {
      newErrors.jenis_kelamin = 'Jenis kelamin wajib dipilih';
    }
    if (typeof formData.usia === 'number' && (formData.usia < 0 || formData.usia > 100)) {
      newErrors.usia = 'Usia tidak valid';
    }
    if (formData.ortu_hp && !/^\+?[0-9]{8,15}$/.test(formData.ortu_hp)) {
      newErrors.ortu_hp = 'Nomor HP tidak valid (contoh: 08123456789)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'usia' ? (value ? parseInt(value, 10) : null) : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Normalize empty fields to null for database compatibility
    const submissionData: CreateStudentInput = {
      nama: formData.nama.trim(),
      usia: formData.usia || null,
      jenis_kelamin: formData.jenis_kelamin || null,
      kelas_id: formData.kelas_id || null,
      ortu_nama: formData.ortu_nama?.trim() || null,
      ortu_hp: formData.ortu_hp?.trim() || null,
    };

    await onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Nama Murid *"
          name="nama"
          value={formData.nama}
          onChange={handleChange}
          error={errors.nama}
          placeholder="Nama Lengkap Murid"
          required
        />
        <Input
          label="Usia (Tahun)"
          name="usia"
          type="number"
          value={formData.usia === null ? '' : formData.usia}
          onChange={handleChange}
          error={errors.usia}
          placeholder="Contoh: 8"
          min="1"
          max="99"
        />
        <Select
          label="Jenis Kelamin *"
          name="jenis_kelamin"
          value={formData.jenis_kelamin || ''}
          onChange={handleChange}
          error={errors.jenis_kelamin}
          required
        >
          <option value="">-- Pilih Jenis Kelamin --</option>
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </Select>
      </div>

      <Select
        label="Kelas Renang"
        name="kelas_id"
        value={formData.kelas_id || ''}
        onChange={handleChange}
        error={errors.kelas_id}
      >
        <option value="">-- Pilih Kelas --</option>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nama Orang Tua"
          name="ortu_nama"
          value={formData.ortu_nama || ''}
          onChange={handleChange}
          placeholder="Nama Ibu / Ayah"
        />
        <Input
          label="Nomor WhatsApp Orang Tua"
          name="ortu_hp"
          value={formData.ortu_hp || ''}
          onChange={handleChange}
          error={errors.ortu_hp}
          placeholder="Contoh: 08123456789"
          helperText="Digunakan untuk kirim laporan presensi via WhatsApp"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Simpan Perubahan' : 'Tambah Murid'}
        </Button>
      </div>
    </form>
  );
}
