import { SupabaseClient } from '@supabase/supabase-js';
import { Session, SessionWithClass, ScanSessionData, CreateSessionInput, ServiceResult } from '@/lib/types';
import { generateToken } from '@/lib/utils/token';

const SESSION_FIELDS = 'id, kelas_id, tanggal, waktu_mulai, waktu_selesai, qr_token, qr_expires_at, status, guru_id, created_at';
const CLASS_FIELDS = 'id, nama, jadwal, kapasitas, lokasi, guru_id, created_at';

export async function getSessions(
  supabase: SupabaseClient,
  guruId: string,
  filters?: { kelas_id?: string; status?: 'active' | 'closed'; tanggal?: string; from?: string; to?: string }
): Promise<ServiceResult<SessionWithClass[]>> {
  try {
    let query = supabase
      .from('sessions')
      .select(`${SESSION_FIELDS}, classes(${CLASS_FIELDS})`)
      .eq('guru_id', guruId);

    if (filters?.kelas_id) {
      query = query.eq('kelas_id', filters.kelas_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.tanggal) {
      query = query.eq('tanggal', filters.tanggal);
    }
    if (filters?.from) {
      query = query.gte('tanggal', filters.from);
    }
    if (filters?.to) {
      query = query.lt('tanggal', filters.to);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as SessionWithClass[], error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}

export async function getSessionById(
  supabase: SupabaseClient,
  id: string
): Promise<ServiceResult<SessionWithClass>> {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select(`${SESSION_FIELDS}, classes(${CLASS_FIELDS})`)
      .eq('id', id)
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as SessionWithClass, error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}

export async function getSessionByQRToken(
  supabase: SupabaseClient,
  qrToken: string
): Promise<ServiceResult<SessionWithClass>> {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select(`${SESSION_FIELDS}, classes(${CLASS_FIELDS})`)
      .eq('qr_token', qrToken)
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as SessionWithClass, error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}

export async function getScanSessionData(
  supabase: SupabaseClient,
  qrToken: string
): Promise<ServiceResult<ScanSessionData>> {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select(`${SESSION_FIELDS}, classes(${CLASS_FIELDS}, students(id, nama, link_token))`)
      .eq('qr_token', qrToken)
      .single();

    if (error || !data) return { data: null, error: error?.message || 'Sesi tidak ditemukan' };

    const sessionData = data as unknown as SessionWithClass & { classes: SessionWithClass['classes'] & { students?: ScanSessionData['students'] } };
    return {
      data: {
        ...sessionData,
        students: sessionData.classes?.students || [],
      },
      error: null,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak terduga';
    return { data: null, error: errorMsg };
  }
}

export async function createSession(
  supabase: SupabaseClient,
  guruId: string,
  data: CreateSessionInput
): Promise<ServiceResult<Session>> {
  try {
    const qrToken = generateToken(32);
    
    // Default to 15 minutes, 0 means unlimited
    const duration = data.duration !== undefined ? data.duration : 15;
    const expiresAt = duration === 0
      ? new Date('9999-12-31T23:59:59Z').toISOString()
      : new Date(Date.now() + duration * 60 * 1000).toISOString();

    const localDate = data.tanggal || new Date().toLocaleDateString('sv-SE');

    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        kelas_id: data.kelas_id,
        tanggal: localDate,
        waktu_mulai: new Date().toISOString(),
        qr_token: qrToken,
        qr_expires_at: expiresAt,
        status: 'active',
        guru_id: guruId,
      })
      .select()
      .single();

    if (error) return { data: null, error: error.message };

    // Auto-sync permits untuk tanggal sesi ini
    try {
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('kelas_id', data.kelas_id);

      if (students && students.length > 0) {
        const studentIds = students.map((s) => s.id);
        const { data: activePermits } = await supabase
          .from('permits')
          .select('student_id, status, keterangan')
          .in('student_id', studentIds)
          .eq('tanggal', localDate);

        if (activePermits && activePermits.length > 0) {
          const attendancesToInsert = activePermits.map((permit) => ({
            session_id: session.id,
            student_id: permit.student_id,
            status: permit.status,
            metode: 'manual',
            catatan: permit.keterangan || 'Izin via Portal Orang Tua',
            waktu_scan: new Date().toISOString(),
          }));

          await supabase.from('attendances').insert(attendancesToInsert);
        }
      }
    } catch (e) {
      console.warn('Gagal sinkronisasi izin otomatis:', e);
    }

    return { data: session as Session, error: null };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak terduga';
    return { data: null, error: errorMsg };
  }
}

export async function refreshQRToken(
  supabase: SupabaseClient,
  sessionId: string
): Promise<ServiceResult<Session>> {
  try {
    const { data: currentSession } = await supabase
      .from('sessions')
      .select('qr_expires_at')
      .eq('id', sessionId)
      .single();

    const isUnlimited = currentSession && new Date(currentSession.qr_expires_at).getFullYear() >= 9000;

    const qrToken = generateToken(32);
    const expiresAt = isUnlimited
      ? new Date('9999-12-31T23:59:59Z').toISOString()
      : new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { data: session, error } = await supabase
      .from('sessions')
      .update({
        qr_token: qrToken,
        qr_expires_at: expiresAt,
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: session as Session, error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}

export async function closeSession(
  supabase: SupabaseClient,
  sessionId: string
): Promise<ServiceResult<Session>> {
  try {
    const { data: session, error } = await supabase
      .from('sessions')
      .update({
        status: 'closed',
        waktu_selesai: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: session as Session, error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga' };
  }
}

export async function getTodaySessions(
  supabase: SupabaseClient,
  guruId: string
): Promise<ServiceResult<SessionWithClass[]>> {
  const todayStr = new Date().toLocaleDateString('sv-SE');
  return getSessions(supabase, guruId, { tanggal: todayStr });
}

export async function countTodaySessions(supabase: SupabaseClient, guruId: string): Promise<number> {
  try {
    const todayStr = new Date().toLocaleDateString('sv-SE');
    const { count, error } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('guru_id', guruId)
      .eq('tanggal', todayStr);

    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}
