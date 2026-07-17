'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDashboardAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, LoadingSpinner, EmptyState, Modal } from '@/components/ui';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@/lib/supabase/client';
import { registrationService } from '@/services';
import { StudentRegistration } from '@/lib/types';
import { RegistrationConfirmModal } from '@/components/forms/RegistrationConfirmModal';
import { Copy, Share2, CheckCircle2, Clock, Trash2, MapPin, Phone, User, ExternalLink, Sparkles, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatHariTanggal } from '@/lib/utils/date';
import { generateToken } from '@/lib/utils/token';

export default function RegistrasiDashboardPage() {
  const { user, profile } = useDashboardAuth();
  const [registrations, setRegistrations] = useState<StudentRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal confirm state
  const [selectedReg, setSelectedReg] = useState<StudentRegistration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [rejectingReg, setRejectingReg] = useState<StudentRegistration | null>(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  const [deletingReg, setDeletingReg] = useState<StudentRegistration | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Tab filter
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const supabase = createClient();
  const guruId = user?.id;

  const loadData = useCallback(async (isBackground = false) => {
    if (!guruId) return;
    if (!isBackground) setLoading(true);
    const res = await registrationService.getAllRegistrations(supabase, guruId);
    if (res.data) {
      setRegistrations(res.data);
    } else {
      if (!isBackground) toast.error('Gagal memuat data registrasi');
    }
    if (!isBackground) setLoading(false);
  }, [guruId, supabase]);

  useEffect(() => {
    loadData();

    if (!guruId) return;

    const channel = supabase
      .channel('page-registrations-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_registrations', filter: `guru_id=eq.${guruId}` },
        () => {
          loadData(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData, guruId, supabase]);

  const [localShortToken, setLocalShortToken] = useState<string>('');

  useEffect(() => {
    async function ensureToken() {
      if (profile?.link_token) {
        setLocalShortToken(profile.link_token);
      } else if (guruId) {
        const { data } = await supabase.from('profiles').select('link_token').eq('id', guruId).single();
        if (data?.link_token) {
          setLocalShortToken(data.link_token);
        } else {
          const newToken = generateToken(6);
          try {
            const { data: updated } = await supabase.from('profiles').update({ link_token: newToken }).eq('id', guruId).select('link_token').single();
            if (updated?.link_token) {
              setLocalShortToken(updated.link_token);
            } else {
              setLocalShortToken(newToken);
            }
          } catch {
            setLocalShortToken(newToken);
          }
        }
      }
    }
    ensureToken();
  }, [profile, guruId, supabase]);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://meccaswim.com';
  const shortOrLongId = localShortToken || profile?.link_token || guruId;
  const myRegistrationUrl = shortOrLongId ? `${origin}/daftar/${shortOrLongId}` : '';

  const handleCopyLink = () => {
    if (!myRegistrationUrl) return;
    navigator.clipboard.writeText(myRegistrationUrl);
    toast.success('Link pendaftaran khusus berhasil disalin!');
  };

  const handleShareWA = () => {
    if (!myRegistrationUrl || !profile) return;
    const text = `Halo!

Untuk mendaftar les renang di kelas Coach ${profile.nama} (Mecca Swim), silakan isi form pendaftaran online melalui tautan berikut:

→ ${myRegistrationUrl}

Terima kasih! Kami tunggu kehadirannya di kolam renang.

Salam hangat,
*Mecca Swim Management*`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleRejectConfirm = async () => {
    if (!guruId || !rejectingReg) return;
    setRejectLoading(true);
    const res = await registrationService.rejectRegistration(supabase, rejectingReg.id, guruId);
    setRejectLoading(false);
    if (res.error) {
      toast.error('Gagal menolak: ' + res.error);
    } else {
      toast.success('Pendaftaran telah ditolak');
      setRejectingReg(null);
      loadData();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!guruId || !deletingReg) return;
    setDeleteLoading(true);
    const res = await registrationService.deleteRegistration(supabase, deletingReg.id, guruId);
    setDeleteLoading(false);
    if (res.error) {
      toast.error('Gagal menghapus: ' + res.error);
    } else {
      toast.success('Riwayat pendaftaran dihapus');
      setDeletingReg(null);
      loadData();
    }
  };

  const pendingList = registrations.filter((r) => r.status === 'pending');
  const historyList = registrations.filter((r) => r.status !== 'pending');

  if (loading && !guruId) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Memuat kelola registrasi..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          <span>📝 Registrasi Murid Baru</span>
          {pendingList.length > 0 && (
            <Badge variant="primary" className="text-xs px-2.5 py-0.5 animate-pulse">
              {pendingList.length} Menunggu Konfirmasi
            </Badge>
          )}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Kelola pendaftaran murid baru yang masuk melalui link pendaftaran mandiri atau umum.
        </p>
      </div>

      {/* Generator Link & QR Card */}
      <Card className="border border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card shadow-glass-md overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Sparkles className="h-4 w-4" />
            <span>Link & QR Code Pendaftaran Khusus Anda</span>
          </div>
          <CardTitle className="text-lg font-extrabold text-foreground mt-1">
            Portal Pendaftaran Mandiri Coach {profile?.nama || 'Anda'}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Bagikan link atau unduh QR code ini. Calon murid yang mendaftar menggunakan link ini akan masuk eksklusif ke dashboard Anda.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            {/* QR Code Display */}
            <div className="md:col-span-1 flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-border shadow-sm mx-auto">
              {myRegistrationUrl && <QRCodeSVG value={myRegistrationUrl} size={130} level="M" />}
              <span className="text-[10px] font-bold text-slate-500 mt-2 tracking-wider uppercase">Scan untuk Daftar</span>
            </div>

            {/* Link Box & Buttons */}
            <div className="md:col-span-3 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Alamat URL Pendaftaran Anda:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={myRegistrationUrl}
                    className="w-full h-11 px-3 bg-muted/60 text-xs font-mono font-semibold text-foreground rounded-xl border border-border select-all focus:outline-none"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="h-11 shrink-0 font-bold flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4 text-primary" />
                    Salin
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  onClick={handleShareWA}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 shadow-md flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Bagikan Link via WhatsApp
                </Button>
                <Button
                  onClick={() => window.open(myRegistrationUrl, '_blank')}
                  variant="outline"
                  className="text-xs font-bold h-10 flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Buka Halaman Form
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Switcher */}
      <div className="flex border-b border-border gap-2 pt-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Menunggu Konfirmasi</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-primary/10 text-primary">
            {pendingList.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Riwayat Konfirmasi & Penolakan</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-muted text-muted-foreground">
            {historyList.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <Card className="border border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <LoadingSpinner text="Memuat daftar pendaftaran..." />
            </div>
          ) : activeTab === 'pending' ? (
            pendingList.length === 0 ? (
              <div className="p-12">
                <EmptyState
                  icon="Users"
                  title="Belum Ada Pendaftaran Baru"
                  description="Seluruh pendaftaran murid baru telah dikonfirmasi atau belum ada pendaftaran baru yang masuk hari ini."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Calon Murid</TableHead>
                      <TableHead>Pilihan Kolam</TableHead>
                      <TableHead>Orang Tua & WA</TableHead>
                      <TableHead>Waktu Daftar</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingList.map((reg) => (
                      <TableRow key={reg.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-bold text-foreground text-sm">{reg.nama}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {reg.jenis_kelamin || '-'} • {reg.usia ? `${reg.usia} thn` : '-'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 font-extrabold text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                            <MapPin className="h-3 w-3" />
                            {reg.lokasi}
                          </span>
                        </TableCell>
                        <TableCell>
                          <p className="font-bold text-xs text-foreground">{reg.ortu_nama}</p>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3" />
                            {reg.ortu_hp}
                          </p>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-medium">
                          {formatHariTanggal(reg.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => {
                                setSelectedReg(reg);
                                setIsModalOpen(true);
                              }}
                              className="text-xs font-bold h-9 shadow-glow-cyan bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              ✅ Konfirmasi & Pilih Kelas
                            </Button>
                            <Button
                              onClick={() => setRejectingReg(reg)}
                              variant="outline"
                              className="text-xs font-bold h-9 text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-950/20"
                            >
                              Tolak
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          ) : (
            /* History List */
            historyList.length === 0 ? (
              <div className="p-12">
                <EmptyState
                  icon="Calendar"
                  title="Belum Ada Riwayat"
                  description="Belum ada riwayat pendaftaran yang dikonfirmasi ataupun ditolak."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Murid</TableHead>
                      <TableHead>Pilihan Kolam</TableHead>
                      <TableHead>Orang Tua & WA</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Waktu Daftar</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyList.map((reg) => (
                      <TableRow key={reg.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <p className="font-bold text-foreground text-sm">{reg.nama}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {reg.jenis_kelamin || '-'} • {reg.usia ? `${reg.usia} thn` : '-'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-bold text-foreground">{reg.lokasi}</span>
                        </TableCell>
                        <TableCell>
                          <p className="font-bold text-xs text-foreground">{reg.ortu_nama}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{reg.ortu_hp}</p>
                        </TableCell>
                        <TableCell>
                          {reg.status === 'confirmed' ? (
                            <Badge variant="hadir" className="font-extrabold text-xs">
                              ✅ Diterima
                            </Badge>
                          ) : (
                            <Badge variant="alpha" className="font-extrabold text-xs">
                              ❌ Ditolak
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-medium">
                          {formatHariTanggal(reg.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {reg.status === 'confirmed' && (
                              <Button
                                onClick={() => {
                                  const text = `Halo Bapak/Ibu ${reg.ortu_nama},

Mengingatkan kembali bahwa pendaftaran les renang untuk ananda ${reg.nama} di Mecca Swim telah BERHASIL DIKONFIRMASI. Selamat berlatih!

Salam hangat,
*Mecca Swim Management*`;
                                  window.open(`https://api.whatsapp.com/send?phone=${reg.ortu_hp}&text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                                }}
                                variant="outline"
                                size="sm"
                                className="text-xs font-bold text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900/30 dark:hover:bg-emerald-950/20 flex items-center gap-1.5"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                                WA
                              </Button>
                            )}
                            <button
                              onClick={() => setDeletingReg(reg)}
                              className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-muted transition-colors"
                              title="Hapus riwayat"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* Modal Konfirmasi */}
      <RegistrationConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        registration={selectedReg}
        onSuccess={() => {
          loadData();
        }}
        guruId={guruId || ''}
        guruName={profile?.nama || 'Instruktur'}
      />

      {/* Modal Konfirmasi Tolak Pendaftaran */}
      <Modal
        isOpen={!!rejectingReg}
        onClose={() => setRejectingReg(null)}
        title="Tolak Pendaftaran Murid"
      >
        <div className="space-y-4 animate-scale-in">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
            Apakah Anda yakin ingin menolak pendaftaran atas nama <strong className="text-foreground">{rejectingReg?.nama}</strong>?
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-500 font-bold bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
            ⚠️ Pendaftaran yang ditolak tidak akan dimasukkan ke dalam kelas renang Anda, namun riwayatnya tetap tersimpan di tab Riwayat.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectingReg(null)}
              disabled={rejectLoading}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleRejectConfirm}
              isLoading={rejectLoading}
            >
              Ya, Tolak Pendaftaran
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Konfirmasi Hapus Permanen */}
      <Modal
        isOpen={!!deletingReg}
        onClose={() => setDeletingReg(null)}
        title="Hapus Riwayat Pendaftaran"
      >
        <div className="space-y-4 animate-scale-in">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
            Apakah Anda yakin ingin menghapus permanen riwayat pendaftaran <strong className="text-foreground">{deletingReg?.nama}</strong>?
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">
            🚨 Tindakan ini tidak dapat dibatalkan. Riwayat pendaftaran ini akan dihapus dari database secara permanen.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingReg(null)}
              disabled={deleteLoading}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteConfirm}
              isLoading={deleteLoading}
            >
              Ya, Hapus Permanen
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
