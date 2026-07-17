'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button, Select } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { registrationService } from '@/services';
import { Profile } from '@/lib/types';
import { APP_NAME } from '@/lib/constants';
import { UserCheck, Phone, User, Calendar, CheckCircle2, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GuruRegistrationPage() {
  const params = useParams();
  const guruId = typeof params.guruId === 'string' ? params.guruId : '';

  const [guru, setGuru] = useState<Profile | null>(null);
  const [loadingGuru, setLoadingGuru] = useState(true);
  const [errorGuru, setErrorGuru] = useState<string | null>(null);

  // Form State
  const [nama, setNama] = useState('');
  const [usia, setUsia] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'Laki-laki' | 'Perempuan' | ''>('');
  const [lokasi, setLokasi] = useState<'Kolam Fatima Utama' | 'Tirta Sambara' | 'Tirta Rahayu' | 'Semilir'>('Semilir');
  const [ortuNama, setOrtuNama] = useState('');
  const [ortuHp, setOrtuHp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchGuru() {
      if (!guruId) {
        setErrorGuru('Tautan pendaftaran tidak valid.');
        setLoadingGuru(false);
        return;
      }
      const res = await registrationService.getGuruProfileById(supabase, guruId);
      if (res.error || !res.data) {
        setErrorGuru('Instruktur tidak ditemukan atau tautan telah kedaluwarsa.');
      } else {
        setGuru(res.data);
      }
      setLoadingGuru(false);
    }
    fetchGuru();
  }, [guruId, supabase]);

  const formatPhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    } else if (cleaned.startsWith('8')) {
      cleaned = '628' + cleaned.slice(1);
    }
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !ortuNama.trim() || !ortuHp.trim() || !lokasi || !guru) {
      toast.error('Mohon lengkapi seluruh kolom yang wajib diisi (*) atau pastikan data instruktur valid');
      return;
    }

    setSubmitting(true);
    const formattedHp = formatPhoneNumber(ortuHp);

    const res = await registrationService.createRegistration(supabase, {
      nama: nama.trim(),
      usia: usia ? parseInt(usia, 10) : null,
      jenis_kelamin: jenisKelamin || null,
      lokasi: lokasi,
      ortu_nama: ortuNama.trim(),
      ortu_hp: formattedHp,
      guru_id: guru.id,
    });

    setSubmitting(false);

    if (res.error) {
      toast.error('Gagal mengirim pendaftaran: ' + res.error);
    } else {
      toast.success('Pendaftaran berhasil dikirim!');
      setIsSuccess(true);
    }
  };

  if (loadingGuru) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-muted-foreground">Memuat form pendaftaran...</p>
        </div>
      </div>
    );
  }

  if (errorGuru || !guru) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <Card variant="glass" className="max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Tautan Tidak Valid</h2>
          <p className="text-sm text-muted-foreground mb-6">{errorGuru}</p>
          <div className="flex flex-col gap-2">
            <Link href="/daftar">
              <Button className="w-full">Lihat Daftar Instruktur Lainnya</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">Kembali ke Beranda</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 water-pattern flex items-center justify-center p-4 md:p-8 relative overflow-hidden transition-colors duration-300">
      {/* Glow Effects */}
      <div className="absolute top-[10%] left-[15%] w-[35vw] h-[35vw] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[10%] right-[15%] w-[35vw] h-[35vw] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none animate-pulse-slow" />

      <div className="w-full max-w-lg z-10 animate-scale-in my-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <Link href="/" className="flex items-center gap-3 select-none group">
            <div className="h-14 w-14 relative flex items-center justify-center rounded-2xl overflow-hidden shadow-md border-2 border-white/50 dark:border-slate-800/50 bg-white dark:bg-slate-900">
              <Image src="/icons/logo.png" alt="Mecca Swim Logo" fill className="object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-500 dark:from-cyan-400 dark:to-teal-300">
                {APP_NAME}
              </span>
              <span className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase">Form Pendaftaran Murid</span>
            </div>
          </Link>
        </div>

        <Card variant="glass" className="border-slate-200/50 dark:border-white/10 shadow-glass-lg backdrop-blur-xl bg-white/90 dark:bg-slate-900/80 p-2 md:p-4">
          <CardHeader className="pb-4 border-b border-border/50 text-center">
            {!isSuccess ? (
              <>
                <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mx-auto mb-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Instruktur Pilihan Anda</span>
                </div>
                <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">
                  {guru.nama}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  Silakan isi data calon murid di bawah ini untuk mendaftar ke kelas instruktur {guru.nama}.
                </CardDescription>
              </>
            ) : (
              <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">
                Pendaftaran Berhasil! 🥳
              </CardTitle>
            )}
          </CardHeader>

          <CardContent className="pt-6">
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nama Murid */}
                <Input
                  label="Nama Lengkap Murid *"
                  name="nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Muhammad Rafi"
                  icon={<User className="h-4 w-4" />}
                  required
                />

                {/* Usia & Gender Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Usia (Tahun)"
                    name="usia"
                    type="number"
                    min="1"
                    max="80"
                    value={usia}
                    onChange={(e) => setUsia(e.target.value)}
                    placeholder="Contoh: 8"
                    icon={<Calendar className="h-4 w-4" />}
                  />

                  <Select
                    label="Jenis Kelamin"
                    name="jenisKelamin"
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value as 'Laki-laki' | 'Perempuan' | '')}
                  >
                    <option value="">Pilih Gender...</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </Select>
                </div>

                {/* Lokasi Latihan */}
                <Select
                  label="Pilihan Lokasi Latihan *"
                  name="lokasi"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value as 'Kolam Fatima Utama' | 'Tirta Sambara' | 'Tirta Rahayu' | 'Semilir')}
                  helperText="Anda cukup memilih lokasi kolam. Jam kelas akan ditentukan oleh instruktur saat konfirmasi."
                  required
                >
                  <option value="Kolam Fatima Utama">Kolam Fatima Utama</option>
                  <option value="Tirta Sambara">Tirta Sambara</option>
                  <option value="Tirta Rahayu">Tirta Rahayu</option>
                  <option value="Semilir">Semilir</option>
                </Select>

                <div className="pt-2 border-t border-border/50">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    Data Orang Tua / Wali
                  </h4>
                </div>

                {/* Nama Ortu */}
                <Input
                  label="Nama Orang Tua / Wali *"
                  name="ortuNama"
                  value={ortuNama}
                  onChange={(e) => setOrtuNama(e.target.value)}
                  placeholder="Contoh: Bpk. Ahmad / Ibu Siti"
                  icon={<UserCheck className="h-4 w-4" />}
                  required
                />

                {/* No WA Ortu */}
                <Input
                  label="Nomor WhatsApp Orang Tua *"
                  name="ortuHp"
                  type="tel"
                  value={ortuHp}
                  onChange={(e) => setOrtuHp(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  icon={<Phone className="h-4 w-4" />}
                  helperText="Instruktur akan mengirimkan konfirmasi jam jadwal & link pantau kehadiran via WhatsApp ke nomor ini."
                  required
                />

                <Button type="submit" className="w-full h-12 text-base font-bold shadow-glow-cyan mt-6" isLoading={submitting}>
                  Kirim Pendaftaran Sekarang 🚀
                </Button>
              </form>
            ) : (
              <div className="flex flex-col items-center text-center py-6 animate-scale-in space-y-6">
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="h-10 w-10 animate-bounce" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">Data Berhasil Diterima Sistem!</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                    Pendaftaran ananda <strong className="text-foreground">{nama}</strong> telah masuk secara langsung ke dalam antrean konfirmasi instruktur <strong className="text-primary">{guru.nama}</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/50 border border-border/50 text-left w-full space-y-2 text-xs text-muted-foreground">
                  <p className="font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Langkah Selanjutnya:
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-1">
                    <li>Instruktur akan meninjau jadwal kelas yang kosong di lokasi <strong>{lokasi}</strong>.</li>
                    <li>Instruktur akan mengirimkan pesan konfirmasi langsung ke WhatsApp Anda (<strong>{ortuHp}</strong>).</li>
                    <li>Anda akan menerima tautan khusus Portal Orang Tua untuk memantau kehadiran anak.</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setNama('');
                      setUsia('');
                      setJenisKelamin('');
                      setOrtuNama('');
                      setOrtuHp('');
                      setIsSuccess(false);
                    }}
                  >
                    Daftarkan Murid Lainnya
                  </Button>
                  <Link href="/" className="flex-1">
                    <Button className="w-full">Kembali ke Beranda</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
