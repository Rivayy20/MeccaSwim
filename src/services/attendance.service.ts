import { SupabaseClient } from '@supabase/supabase-js';
import {
  Attendance,
  AttendanceWithStudent,
  AttendanceWithSession,
  CreateAttendanceInput,
  UpdateAttendanceInput,
  ServiceResult,
  StudentWithClass,
} from '@/lib/types';

export interface QRAttendanceResult extends Attendance {
  student: {
    nama: string;
    ortu_hp: string | null;
    class_name: string;
  };
}

export async function getAttendancesBySession(
  supabase: SupabaseClient,
  sessionId: string
): Promise<ServiceResult<AttendanceWithStudent[]>> {
  try {
    const { data, error } = await supabase
      .from('attendances')
      .select('*, students(*)')
      .eq('session_id', sessionId)
      .order('waktu_scan', { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data: data as AttendanceWithStudent[], error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}

export async function getAttendancesByStudent(
  supabase: SupabaseClient,
  studentId: string,
  filters?: { month?: number; year?: number }
): Promise<ServiceResult<AttendanceWithSession[]>> {
  try {
    let query = supabase
      .from('attendances')
      .select('id, session_id, student_id, status, waktu_scan, metode, catatan, created_at, sessions!inner(id, kelas_id, tanggal, waktu_mulai, waktu_selesai, qr_token, qr_expires_at, status, guru_id, created_at, classes(id, nama, jadwal, kapasitas, lokasi, guru_id, created_at))')
      .eq('student_id', studentId);

    if (filters?.month !== undefined && filters?.year !== undefined) {
      const start = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`;
      const nextMonth = filters.month === 12
        ? `${filters.year + 1}-01-01`
        : `${filters.year}-${String(filters.month + 1).padStart(2, '0')}-01`;
      query = query.gte('sessions.tanggal', start).lt('sessions.tanggal', nextMonth);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as AttendanceWithSession[], error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}

export async function createAttendance(
  supabase: SupabaseClient,
  data: CreateAttendanceInput
): Promise<ServiceResult<Attendance>> {
  try {
    const { data: attendance, error } = await supabase
      .from('attendances')
      .upsert(
        {
          session_id: data.session_id,
          student_id: data.student_id,
          status: data.status,
          metode: data.metode,
          catatan: data.catatan || null,
          waktu_scan: new Date().toISOString(),
        },
        { onConflict: 'session_id,student_id' }
      )
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: attendance as Attendance, error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}

export async function updateAttendance(
  supabase: SupabaseClient,
  id: string,
  data: UpdateAttendanceInput
): Promise<ServiceResult<Attendance>> {
  try {
    const { data: attendance, error } = await supabase
      .from('attendances')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: attendance as Attendance, error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}

export async function deleteAttendance(supabase: SupabaseClient, id: string): Promise<ServiceResult<null>> {
  try {
    const { error } = await supabase.from('attendances').delete().eq('id', id);
    if (error) return { data: null, error: error.message };
    return { data: null, error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}

export async function confirmQRAttendance(
  supabase: SupabaseClient,
  qrToken: string,
  studentId: string
): Promise<ServiceResult<QRAttendanceResult>> {
  try {
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, kelas_id, qr_expires_at, status')
      .eq('qr_token', qrToken)
      .single();

    if (sessionError || !session) {
      return { data: null, error: 'QR Code tidak valid atau sesi tidak ditemukan.' };
    }

    if (session.status !== 'active') {
      return { data: null, error: 'Sesi absensi sudah ditutup.' };
    }

    const expiresAt = new Date(session.qr_expires_at).getTime();
    if (expiresAt < Date.now()) {
      return { data: null, error: 'QR Code sudah expired. Silakan minta guru untuk refresh.' };
    }

    const { data: student } = await supabase
      .from('students')
      .select('id, nama, ortu_hp, classes(nama)')
      .eq('id', studentId)
      .eq('kelas_id', session.kelas_id)
      .maybeSingle();

    if (!student) {
      return { data: null, error: 'Murid tidak terdaftar pada kelas sesi ini.' };
    }

    const { data: attendance, error: insertError } = await supabase
      .from('attendances')
      .insert({
        session_id: session.id,
        student_id: studentId,
        status: 'hadir',
        metode: 'qr',
        waktu_scan: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return { data: null, error: 'Murid sudah terabsen di sesi ini.' };
      }
      return { data: null, error: insertError.message };
    }

    const studentData = student as unknown as { nama: string; ortu_hp: string | null; classes: { nama: string } | null };
    return {
      data: {
        ...(attendance as Attendance),
        student: {
          nama: studentData.nama,
          ortu_hp: studentData.ortu_hp,
          class_name: studentData.classes?.nama || 'Kelas Renang',
        },
      },
      error: null,
    };
  } catch {
    return { data: null, error: 'Terjadi kesalahan internal saat memproses presensi.' };
  }
}

export async function getAttendanceStats(
  supabase: SupabaseClient,
  guruId: string,
  month = new Date().getMonth() + 1,
  year = new Date().getFullYear()
): Promise<number> {
  try {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id')
      .eq('guru_id', guruId)
      .gte('tanggal', start)
      .lt('tanggal', nextMonth);
    if (sessionsError || !sessions || sessions.length === 0) return 0;

    const sessionIds = sessions.map((s) => s.id);

    // Fetch all attendances for these sessions
    const { data: attendances, error: attendancesError } = await supabase
      .from('attendances')
      .select('status')
      .in('session_id', sessionIds);

    if (attendancesError || !attendances || attendances.length === 0) return 0;

    const totalCount = attendances.length;
    const hadirCount = attendances.filter((a) => a.status === 'hadir').length;

    return Math.round((hadirCount / totalCount) * 100);
  } catch {
    return 0;
  }
}

export interface MonthlyRecapResult {
  student: StudentWithClass;
  summary: {
    hadir: number;
    izin: number;
    sakit: number;
    alpha: number;
    rate: number;
  };
  attendances: Record<string, Attendance>;
}

export async function getMonthlyRecap(
  supabase: SupabaseClient,
  guruId: string,
  month: number,
  year: number,
  kelasId?: string
): Promise<ServiceResult<MonthlyRecapResult[]>> {
  try {
    // 1. Fetch students
    let studentsQuery = supabase.from('students').select('*, classes(*)').eq('guru_id', guruId);
    if (kelasId) {
      studentsQuery = studentsQuery.eq('kelas_id', kelasId);
    }
    const { data: students, error: studentsError } = await studentsQuery;
    if (studentsError) return { data: null, error: studentsError.message };

    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;

    let sessionsQuery = supabase
      .from('sessions')
      .select('*')
      .eq('guru_id', guruId)
      .gte('tanggal', start)
      .lt('tanggal', nextMonth)
      .order('tanggal', { ascending: true });
    
    if (kelasId) {
      sessionsQuery = sessionsQuery.eq('kelas_id', kelasId);
    }
    
    const { data: sessions, error: sessionsError } = await sessionsQuery;
    if (sessionsError) return { data: null, error: sessionsError.message };

    const filteredSessions = sessions;

    if (filteredSessions.length === 0) {
      return {
        data: students.map((std) => ({
          student: std,
          summary: { hadir: 0, izin: 0, sakit: 0, alpha: 0, rate: 0 },
          attendances: {},
        })),
        error: null,
      };
    }

    const sessionIds = filteredSessions.map((s) => s.id);

    // 3. Fetch all attendances for these sessions
    const { data: attendances, error: attendancesError } = await supabase
      .from('attendances')
      .select('*')
      .in('session_id', sessionIds);

    if (attendancesError) return { data: null, error: attendancesError.message };

    const attendanceMap = new Map(
      attendances.map((attendance) => [`${attendance.session_id}:${attendance.student_id}`, attendance])
    );

    const result = students.map((std) => {
      const stdAttendances: Record<string, Attendance> = {};
      const stats = { hadir: 0, izin: 0, sakit: 0, alpha: 0 };

      filteredSessions.forEach((sess) => {
        const att = attendanceMap.get(`${sess.id}:${std.id}`);
        if (att) {
          stdAttendances[sess.id] = att;
          stats[att.status as keyof typeof stats]++;
        } else {
          // If no record exists, default to alpha (absent) or mark as '-' if session doesn't belong to their class.
          // In Mecca Swim, sessions are per-class, so if the student is in that class, we can treat missing as alpha.
          if (std.kelas_id === sess.kelas_id) {
            stats.alpha++;
          }
        }
      });

      const totalActiveSessionsForStudent = filteredSessions.filter(s => s.kelas_id === std.kelas_id).length;
      const rate = totalActiveSessionsForStudent > 0 
        ? Math.round((stats.hadir / totalActiveSessionsForStudent) * 100)
        : 0;

      return {
        student: std,
        summary: {
          ...stats,
          rate,
        },
        attendances: stdAttendances, // keyed by session_id
      };
    });

    return { data: result, error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}
