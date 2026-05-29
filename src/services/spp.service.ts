import { SupabaseClient } from '@supabase/supabase-js';
import { ServiceResult } from '@/lib/types';

export interface SPPPayment {
  id: string;
  student_id: string;
  bulan: number;
  tahun: number;
  jumlah: number;
  status: 'belum_bayar' | 'lunas';
  tanggal_bayar: string | null;
  metode_bayar: 'transfer' | 'tunai' | null;
  catatan: string | null;
  guru_id: string;
  created_at: string;
  tipe?: 'harian' | 'mingguan' | 'bulanan';
  tanggal_tagihan?: string | null;
  minggu?: number | null;
  student?: {
    id: string;
    nama: string;
    kelas_id: string;
    classes?: {
      id: string;
      nama: string;
    };
  };
}

/**
 * Mengambil daftar pembayaran SPP bulanan.
 */
export async function getSPPPayments(
  supabase: SupabaseClient,
  guruId: string,
  bulan: number,
  tahun: number
): Promise<ServiceResult<SPPPayment[]>> {
  try {
    const { data: existingPayments, error: paymentsErr } = await supabase
      .from('spp_payments')
      .select('*, student:students(id, nama, kelas_id, classes(id, nama))')
      .eq('guru_id', guruId)
      .eq('bulan', bulan)
      .eq('tahun', tahun);

    if (paymentsErr) return { data: null, error: paymentsErr.message };
    return { data: (existingPayments || []) as unknown as SPPPayment[], error: null };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan pada data SPP';
    return { data: null, error: errorMsg };
  }
}

/**
 * Membuat tagihan SPP baru secara manual
 */
export async function createSPPPayment(
  supabase: SupabaseClient,
  data: {
    student_id: string;
    bulan: number;
    tahun: number;
    jumlah: number;
    status: 'belum_bayar' | 'lunas';
    metode_bayar: 'transfer' | 'tunai' | null;
    catatan: string | null;
    guru_id: string;
    tanggal_bayar: string | null;
    tipe: 'harian' | 'mingguan' | 'bulanan';
    tanggal_tagihan: string | null;
    minggu: number | null;
  }
): Promise<ServiceResult<SPPPayment>> {
  try {
    const { data: inserted, error } = await supabase
      .from('spp_payments')
      .insert({
        student_id: data.student_id,
        bulan: data.bulan,
        tahun: data.tahun,
        jumlah: data.jumlah,
        status: data.status,
        metode_bayar: data.status === 'lunas' ? data.metode_bayar : null,
        catatan: data.catatan,
        guru_id: data.guru_id,
        tanggal_bayar: data.status === 'lunas' ? (data.tanggal_bayar || new Date().toISOString()) : null,
        tipe: data.tipe,
        tanggal_tagihan: data.tipe === 'harian' ? data.tanggal_tagihan : null,
        minggu: data.tipe === 'mingguan' ? data.minggu : null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { data: null, error: 'Tagihan SPP murid ini untuk periode terpilih sudah ada.' };
      }
      return { data: null, error: error.message };
    }
    return { data: inserted as SPPPayment, error: null };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal membuat tagihan SPP';
    return { data: null, error: errorMsg };
  }
}

/**
 * Menghapus tagihan SPP
 */
export async function deleteSPPPayment(
  supabase: SupabaseClient,
  paymentId: string
): Promise<ServiceResult<boolean>> {
  try {
    const { error } = await supabase
      .from('spp_payments')
      .delete()
      .eq('id', paymentId);

    if (error) return { data: false, error: error.message };
    return { data: true, error: null };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal menghapus tagihan SPP';
    return { data: false, error: errorMsg };
  }
}

/**
 * Mencatat pembayaran SPP murid
 */
export async function recordSPPPayment(
  supabase: SupabaseClient,
  paymentId: string,
  data: {
    jumlah: number;
    status: 'belum_bayar' | 'lunas';
    metode_bayar: 'transfer' | 'tunai' | null;
    catatan: string | null;
    tanggal_bayar: string | null;
  }
): Promise<ServiceResult<SPPPayment>> {
  try {
    const { data: updated, error } = await supabase
      .from('spp_payments')
      .update({
        jumlah: data.jumlah,
        status: data.status,
        metode_bayar: data.metode_bayar,
        catatan: data.catatan,
        tanggal_bayar: data.status === 'lunas' ? (data.tanggal_bayar || new Date().toISOString()) : null,
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: updated as SPPPayment, error: null };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal mencatat pembayaran SPP';
    return { data: null, error: errorMsg };
  }
}

/**
 * Mengambil ringkasan laporan keuangan SPP
 */
export async function getFinancialSummary(
  supabase: SupabaseClient,
  guruId: string,
  bulan: number,
  tahun: number
): Promise<{ totalTagihan: number; totalTerbayar: number; totalPiutang: number }> {
  try {
    const { data, error } = await supabase
      .from('spp_payments')
      .select('jumlah, status')
      .eq('guru_id', guruId)
      .eq('bulan', bulan)
      .eq('tahun', tahun);

    if (error || !data) return { totalTagihan: 0, totalTerbayar: 0, totalPiutang: 0 };

    let totalTagihan = 0;
    let totalTerbayar = 0;

    for (const item of data) {
      totalTagihan += Number(item.jumlah);
      if (item.status === 'lunas') {
        totalTerbayar += Number(item.jumlah);
      }
    }

    return {
      totalTagihan,
      totalTerbayar,
      totalPiutang: totalTagihan - totalTerbayar,
    };
  } catch {
    return { totalTagihan: 0, totalTerbayar: 0, totalPiutang: 0 };
  }
}
