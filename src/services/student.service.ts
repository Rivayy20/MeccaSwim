import { SupabaseClient } from '@supabase/supabase-js';
import { Student, StudentWithClass, CreateStudentInput, UpdateStudentInput, ServiceResult } from '@/lib/types';
import { generateToken } from '@/lib/utils/token';

export async function getStudents(
  supabase: SupabaseClient,
  guruId: string
): Promise<ServiceResult<StudentWithClass[]>> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('id, nama, usia, jenis_kelamin, kelas_id, link_token, ortu_nama, ortu_hp, guru_id, created_at, classes(id, nama, jadwal, kapasitas, lokasi, guru_id, created_at)')
      .eq('guru_id', guruId)
      .order('nama', { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as StudentWithClass[], error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}

export async function getStudentById(
  supabase: SupabaseClient,
  id: string
): Promise<ServiceResult<StudentWithClass>> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('id, nama, usia, jenis_kelamin, kelas_id, link_token, ortu_nama, ortu_hp, guru_id, created_at, classes(id, nama, jadwal, kapasitas, lokasi, guru_id, created_at)')
      .eq('id', id)
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as StudentWithClass, error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}

export async function getStudentByLinkToken(
  supabase: SupabaseClient,
  linkToken: string
): Promise<ServiceResult<StudentWithClass>> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('id, nama, usia, jenis_kelamin, kelas_id, link_token, ortu_nama, ortu_hp, guru_id, created_at, classes(id, nama, jadwal, kapasitas, lokasi, guru_id, created_at)')
      .eq('link_token', linkToken)
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as StudentWithClass, error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}

export async function getStudentsByClassId(
  supabase: SupabaseClient,
  classId: string
): Promise<ServiceResult<Student[]>> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('id, nama, usia, jenis_kelamin, kelas_id, link_token, ortu_nama, ortu_hp, guru_id, created_at')
      .eq('kelas_id', classId)
      .order('nama', { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data: data as Student[], error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}

export async function createStudent(
  supabase: SupabaseClient,
  guruId: string,
  data: CreateStudentInput
): Promise<ServiceResult<Student>> {
  try {
    const token = generateToken(16); // 16 bytes equivalent hex
    const { data: student, error } = await supabase
      .from('students')
      .insert({
        ...data,
        guru_id: guruId,
        link_token: token,
      })
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: student as Student, error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}

export async function updateStudent(
  supabase: SupabaseClient,
  id: string,
  data: UpdateStudentInput
): Promise<ServiceResult<Student>> {
  try {
    const { data: student, error } = await supabase
      .from('students')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: student as Student, error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}

export async function deleteStudent(supabase: SupabaseClient, id: string): Promise<ServiceResult<null>> {
  try {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) return { data: null, error: error.message };
    return { data: null, error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}

export async function regenerateLinkToken(supabase: SupabaseClient, id: string): Promise<ServiceResult<Student>> {
  try {
    const token = generateToken(16);
    const { data: student, error } = await supabase
      .from('students')
      .update({ link_token: token })
      .eq('id', id)
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: student as Student, error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}

export async function countStudents(supabase: SupabaseClient, guruId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('guru_id', guruId);

    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}
