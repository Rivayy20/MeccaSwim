import { SupabaseClient } from '@supabase/supabase-js';
import { ServiceResult } from '@/lib/types';

export interface Permit {
  id: string;
  student_id: string;
  tanggal: string;
  status: 'izin' | 'sakit';
  keterangan: string;
  created_at: string;
}

export interface PermitWithStudent {
  id: string;
  student_id: string;
  tanggal: string;
  status: 'izin' | 'sakit';
  keterangan: string;
  created_at: string;
  student: {
    id: string;
    nama: string;
    kelas_id: string;
    class?: {
      id: string;
      nama: string;
    };
  };
}

/**
 * Mengajukan izin baru dari portal orang tua
 */
export async function submitPermit(
  supabase: SupabaseClient,
  studentId: string,
  data: { status: 'izin' | 'sakit'; keterangan: string }
): Promise<ServiceResult<Permit>> {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const { data: permit, error } = await supabase
      .from('permits')
      .upsert({
        student_id: studentId,
        tanggal: todayStr,
        status: data.status,
        keterangan: data.keterangan,
        created_at: new Date().toISOString(),
      }, { onConflict: 'student_id,tanggal' })
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: permit as Permit, error: null };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengajukan izin';
    return { data: null, error: errorMsg };
  }
}

/**
 * Mengambil daftar izin hari ini untuk siswa milik guru tertentu
 */
export async function getTodayPermits(
  supabase: SupabaseClient,
  guruId: string
): Promise<ServiceResult<PermitWithStudent[]>> {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('permits')
      .select('id, student_id, tanggal, status, keterangan, created_at, student:students!inner(id, nama, kelas_id, class:classes(id, nama))')
      .eq('tanggal', todayStr)
      .eq('students.guru_id', guruId)
      .order('created_at', { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as PermitWithStudent[], error: null };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal mengambil data izin masuk';
    return { data: null, error: errorMsg };
  }
}
