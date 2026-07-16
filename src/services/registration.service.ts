import { SupabaseClient } from '@supabase/supabase-js';
import {
  StudentRegistration,
  CreateRegistrationInput,
  ServiceResult,
  Profile,
  Student,
} from '@/lib/types';
import { createStudent } from './student.service';

/**
 * Membuat pendaftaran murid baru dari halaman publik
 */
export async function createRegistration(
  supabase: SupabaseClient,
  data: CreateRegistrationInput
): Promise<ServiceResult<StudentRegistration>> {
  try {
    const { error } = await supabase
      .from('student_registrations')
      .insert({
        nama: data.nama,
        usia: data.usia || null,
        jenis_kelamin: data.jenis_kelamin || null,
        lokasi: data.lokasi,
        ortu_nama: data.ortu_nama,
        ortu_hp: data.ortu_hp,
        guru_id: data.guru_id,
        status: 'pending',
      });

    if (error) return { data: null, error: error.message };

    const newReg: StudentRegistration = {
      id: '', // Di-generate oleh database
      nama: data.nama,
      usia: data.usia || null,
      jenis_kelamin: data.jenis_kelamin || null,
      lokasi: data.lokasi,
      ortu_nama: data.ortu_nama,
      ortu_hp: data.ortu_hp,
      guru_id: data.guru_id,
      status: 'pending',
      assigned_class_id: null,
      student_id: null,
      created_at: new Date().toISOString(),
    };

    return { data: newReg, error: null };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengirim pendaftaran';
    return { data: null, error: errorMsg };
  }
}

/**
 * Mengambil daftar pendaftaran berstatus pending untuk guru tertentu
 */
export async function getPendingRegistrations(
  supabase: SupabaseClient,
  guruId: string
): Promise<ServiceResult<StudentRegistration[]>> {
  try {
    const { data, error } = await supabase
      .from('student_registrations')
      .select('*')
      .eq('guru_id', guruId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as StudentRegistration[], error: null };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal mengambil data pendaftaran baru';
    return { data: null, error: errorMsg };
  }
}

/**
 * Mengambil seluruh riwayat pendaftaran untuk guru tertentu
 */
export async function getAllRegistrations(
  supabase: SupabaseClient,
  guruId: string
): Promise<ServiceResult<StudentRegistration[]>> {
  try {
    const { data, error } = await supabase
      .from('student_registrations')
      .select('*')
      .eq('guru_id', guruId)
      .order('created_at', { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as StudentRegistration[], error: null };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal mengambil riwayat pendaftaran';
    return { data: null, error: errorMsg };
  }
}

/**
 * Mengonfirmasi pendaftaran: membuat murid baru di tabel students & mengupdate status registrasi
 */
export async function confirmRegistration(
  supabase: SupabaseClient,
  regId: string,
  classId: string,
  guruId: string
): Promise<ServiceResult<{ registration: StudentRegistration; student: Student }>> {
  try {
    // 1. Ambil data registrasi
    const { data: regData, error: regError } = await supabase
      .from('student_registrations')
      .select('*')
      .eq('id', regId)
      .eq('guru_id', guruId)
      .single();

    if (regError || !regData) {
      return { data: null, error: 'Data pendaftaran tidak ditemukan atau Anda tidak memiliki akses' };
    }

    const reg = regData as StudentRegistration;

    // 2. Buat data murid baru
    const studentRes = await createStudent(supabase, guruId, {
      nama: reg.nama,
      usia: reg.usia,
      jenis_kelamin: reg.jenis_kelamin,
      kelas_id: classId,
      ortu_nama: reg.ortu_nama,
      ortu_hp: reg.ortu_hp,
    });

    if (studentRes.error || !studentRes.data) {
      return { data: null, error: studentRes.error || 'Gagal membuat data murid baru' };
    }

    const newStudent = studentRes.data;

    // 3. Update status pendaftaran menjadi confirmed dan tautkan ke kelas & murid
    const { data: updatedReg, error: updateError } = await supabase
      .from('student_registrations')
      .update({
        status: 'confirmed',
        assigned_class_id: classId,
        student_id: newStudent.id,
      })
      .eq('id', regId)
      .select()
      .single();

    if (updateError) {
      return { data: null, error: updateError.message };
    }

    return {
      data: {
        registration: updatedReg as StudentRegistration,
        student: newStudent,
      },
      error: null,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengonfirmasi pendaftaran';
    return { data: null, error: errorMsg };
  }
}

/**
 * Menolak pendaftaran
 */
export async function rejectRegistration(
  supabase: SupabaseClient,
  regId: string,
  guruId: string
): Promise<ServiceResult<StudentRegistration>> {
  try {
    const { data, error } = await supabase
      .from('student_registrations')
      .update({ status: 'rejected' })
      .eq('id', regId)
      .eq('guru_id', guruId)
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as StudentRegistration, error: null };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal menolak pendaftaran';
    return { data: null, error: errorMsg };
  }
}

/**
 * Menghapus data pendaftaran
 */
export async function deleteRegistration(
  supabase: SupabaseClient,
  regId: string,
  guruId: string
): Promise<ServiceResult<null>> {
  try {
    const { error } = await supabase
      .from('student_registrations')
      .delete()
      .eq('id', regId)
      .eq('guru_id', guruId);

    if (error) return { data: null, error: error.message };
    return { data: null, error: null };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal menghapus data pendaftaran';
    return { data: null, error: errorMsg };
  }
}

/**
 * Mengambil profil guru berdasarkan ID (untuk halaman publik pendaftaran)
 */
export async function getGuruProfileById(
  supabase: SupabaseClient,
  guruId: string
): Promise<ServiceResult<Profile>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', guruId)
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as Profile, error: null };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Instruktur tidak ditemukan';
    return { data: null, error: errorMsg };
  }
}

/**
 * Mengambil daftar seluruh instruktur aktif (untuk dropdown di halaman publik umum /daftar)
 */
export async function getAllActiveGurus(
  supabase: SupabaseClient
): Promise<ServiceResult<Profile[]>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('nama', { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data: data as Profile[], error: null };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal memuat daftar instruktur';
    return { data: null, error: errorMsg };
  }
}
