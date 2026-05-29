import { SupabaseClient } from '@supabase/supabase-js';
import { Class, CreateClassInput, UpdateClassInput, ServiceResult } from '@/lib/types';
import { sortClassesByDay } from '@/lib/utils/class';

export async function getClasses(
  supabase: SupabaseClient,
  guruId: string
): Promise<ServiceResult<Class[]>> {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('id, nama, jadwal, kapasitas, lokasi, guru_id, created_at')
      .eq('guru_id', guruId)
      .order('nama', { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data: sortClassesByDay(data as Class[]), error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}

export async function getClassById(
  supabase: SupabaseClient,
  id: string
): Promise<ServiceResult<Class>> {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('id, nama, jadwal, kapasitas, lokasi, guru_id, created_at')
      .eq('id', id)
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as Class, error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}

export async function createClass(
  supabase: SupabaseClient,
  guruId: string,
  data: CreateClassInput
): Promise<ServiceResult<Class>> {
  try {
    const { data: createdClass, error } = await supabase
      .from('classes')
      .insert({
        ...data,
        guru_id: guruId,
      })
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: createdClass as Class, error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}

export async function updateClass(
  supabase: SupabaseClient,
  id: string,
  data: UpdateClassInput
): Promise<ServiceResult<Class>> {
  try {
    const { data: updatedClass, error } = await supabase
      .from('classes')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: updatedClass as Class, error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}

export async function deleteClass(supabase: SupabaseClient, id: string): Promise<ServiceResult<null>> {
  try {
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) return { data: null, error: error.message };
    return { data: null, error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}

export async function countClasses(supabase: SupabaseClient, guruId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('classes')
      .select('*', { count: 'exact', head: true })
      .eq('guru_id', guruId);

    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}

export async function getClassWithStudentCount(
  supabase: SupabaseClient,
  guruId: string
): Promise<ServiceResult<(Class & { student_count: number })[]>> {
  try {
    const { data: classesData, error: classesError } = await supabase
      .from('classes')
      .select('id, nama, jadwal, kapasitas, lokasi, guru_id, created_at, students(count)')
      .eq('guru_id', guruId)
      .order('nama', { ascending: true });

    if (classesError) return { data: null, error: classesError.message };

    const result = classesData.map((cls) => {
      const row = cls as Class & { students?: { count: number }[] };
      return {
        ...row,
        students: undefined,
        student_count: row.students?.[0]?.count || 0,
      };
    });

    return { data: sortClassesByDay(result as (Class & { student_count: number })[]), error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}
