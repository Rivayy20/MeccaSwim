'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal, ModalFooter, Button, Select } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { registrationService, classService } from '@/services';
import { StudentRegistration, Student, Class } from '@/lib/types';
import { CheckCircle2, MessageCircle, User, MapPin, Phone, Calendar, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface RegistrationConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: StudentRegistration | null;
  onSuccess: () => void;
  guruId: string;
  guruName: string;
}

export function RegistrationConfirmModal({
  isOpen,
  onClose,
  registration,
  onSuccess,
  guruId,
  guruName,
}: RegistrationConfirmModalProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmedStudent, setConfirmedStudent] = useState<Student | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (isOpen && guruId) {
      setConfirmedStudent(null);
      setSelectedClassId('');
      const fetchClasses = async () => {
        setLoadingClasses(true);
        const res = await classService.getClasses(supabase, guruId);
        if (res.data) {
          setClasses(res.data);
          const matchLoc = res.data.filter(
            (c) => c.lokasi && registration?.lokasi && c.lokasi.toLowerCase().trim() === registration.lokasi.toLowerCase().trim()
          );
          if (matchLoc.length > 0) {
            setSelectedClassId(matchLoc[0].id);
          } else {
            setSelectedClassId('');
          }
        }
        setLoadingClasses(false);
      };
      fetchClasses();
    }
  }, [isOpen, guruId, registration, supabase]);

  const filteredClasses = useMemo(() => {
    return classes.filter(
      (c) => c.lokasi && registration?.lokasi && c.lokasi.toLowerCase().trim() === registration.lokasi.toLowerCase().trim()
    );
  }, [classes, registration]);

  const groupedClasses = useMemo(() => {
    const daysOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    
    const groups: Record<string, Class[]> = {};
    filteredClasses.forEach((cls) => {
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
  }, [filteredClasses]);

  if (!registration) return null;

  const handleConfirm = async () => {
    if (!selectedClassId) {
      toast.error('Silakan pilih kelas terlebih dahulu');
      return;
    }

    setConfirming(true);
    const res = await registrationService.confirmRegistration(
      supabase,
      registration.id,
      selectedClassId,
      guruId
    );
    setConfirming(false);

    if (res.error || !res.data) {
      toast.error('Gagal mengonfirmasi: ' + (res.error || 'Terjadi kesalahan'));
    } else {
      toast.success('Pendaftaran berhasil dikirim ke kelas!');
      setConfirmedStudent(res.data.student);
      onSuccess();
    }
  };

  const handleSendWA = () => {
    if (!confirmedStudent) return;
    const targetClass = classes.find((c) => c.id === selectedClassId);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://meccaswim.com';
    const portalUrl = `${origin}/portal/${confirmedStudent.link_token}`;

    const text = `Halo Bapak/Ibu ${registration.ortu_nama},

Selamat! Pendaftaran les renang untuk ananda telah BERHASIL DIKONFIRMASI oleh pelatih Mecca Swim.

*DETAIL PENDAFTARAN MURID:*
• *Nama Murid:* ${registration.nama}
• *Usia:* ${registration.usia ? `${registration.usia} tahun` : '-'}
• *Jenis Kelamin:* ${registration.jenis_kelamin || '-'}
• *Lokasi Latihan:* ${registration.lokasi}
• *Kelas & Jadwal:* ${targetClass ? `${targetClass.nama} (${targetClass.jadwal || 'Sesuai jadwal kolam'})` : '-'}
• *Pelatih:* ${guruName}

*PORTAL ORANG TUA (Pantau Kehadiran & Izin):*
→ ${portalUrl}

Terima kasih telah bergabung bersama Mecca Swim! Kami tunggu kehadirannya di sesi latihan berikutnya.

Salam hangat,
*Mecca Swim Management*`;

    const waUrl = `https://api.whatsapp.com/send?phone=${registration.ortu_hp}&text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setConfirmedStudent(null);
        onClose();
      }}
      title={confirmedStudent ? '🎉 Konfirmasi Berhasil!' : 'Konfirmasi Pendaftaran Murid'}
    >
      {!confirmedStudent ? (
        <div className="space-y-4">
          {/* Ringkasan Calon Murid */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
            <div className="flex items-center gap-3 border-b border-border/50 pb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-base">{registration.nama}</h4>
                <p className="text-xs text-muted-foreground">
                  {registration.jenis_kelamin || 'Gender tdk diset'} • {registration.usia ? `${registration.usia} tahun` : 'Usia tdk diset'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span>Pilihan Kolam: <strong className="text-foreground">{registration.lokasi}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5 text-emerald-500" />
                <span>WA: <strong className="text-foreground">{registration.ortu_hp}</strong></span>
              </div>
              <div className="sm:col-span-2 flex items-center gap-2 text-muted-foreground">
                <User className="h-3.5 w-3.5 text-blue-500" />
                <span>Ortu/Wali: <strong className="text-foreground">{registration.ortu_nama}</strong></span>
              </div>
            </div>
          </div>

          {/* Pilih Kelas */}
          <div className="space-y-2 pt-2">
            <label className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Tempatkan di Kelas & Jam Jadwal: *
            </label>
            {loadingClasses ? (
              <p className="text-xs text-muted-foreground">Memuat daftar kelas Anda...</p>
            ) : classes.length === 0 ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-lg text-xs font-semibold">
                Anda belum memiliki kelas renang. Silakan buat kelas terlebih dahulu di menu Kelola Kelas.
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-lg text-xs font-semibold space-y-1">
                <p>Anda belum memiliki jadwal kelas untuk lokasi kolam <strong className="underline">{registration.lokasi}</strong>.</p>
                <p className="font-normal text-[11px] text-muted-foreground">
                  Silakan buat kelas baru dengan lokasi tersebut pada menu Kelola Kelas terlebih dahulu.
                </p>
              </div>
            ) : (
              <Select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                helperText={`Menampilkan jadwal kelas yang tersedia khusus di lokasi ${registration.lokasi}.`}
              >
                <option value="">-- Pilih Jam & Jadwal Kelas --</option>
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
            )}
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={onClose} disabled={confirming}>
              Batal
            </Button>
            <Button
              onClick={handleConfirm}
              isLoading={confirming}
              disabled={filteredClasses.length === 0 || !selectedClassId}
              className="shadow-glow-cyan font-bold"
            >
              ✅ Konfirmasi & Masukkan ke Kelas
            </Button>
          </ModalFooter>
        </div>
      ) : (
        <div className="text-center py-4 space-y-6 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="h-8 w-8 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h4 className="text-lg font-bold text-foreground">Murid Resmi Ditambahkan!</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Data <strong className="text-foreground">{registration.nama}</strong> telah berhasil dibuat di database dan dimasukkan ke dalam kelas renang.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-left space-y-2">
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              Langkah Penting Selanjutnya:
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Klik tombol di bawah ini untuk mengirimkan pesan informasi penerimaan kelas beserta <strong>Tautan Portal Orang Tua</strong> langsung melalui WhatsApp ke nomor orang tua.
            </p>
          </div>

          <Button
            onClick={handleSendWA}
            leftIcon={<MessageCircle className="h-5 w-5 shrink-0" />}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-[0_4px_14px_rgba(16,185,129,0.39)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Kirim Pesan Konfirmasi via WhatsApp
          </Button>

          <ModalFooter className="justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmedStudent(null);
                onClose();
              }}
              className="w-full"
            >
              Selesai & Tutup
            </Button>
          </ModalFooter>
        </div>
      )}
    </Modal>
  );
}
