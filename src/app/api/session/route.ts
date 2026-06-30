import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import * as sessionService from '@/services/session.service';

// GET: Fetch session by QR token (public) or all sessions (requires auth)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const qrToken = searchParams.get('qr_token');
    const sessionId = searchParams.get('session_id');

    // Public QR token validation menggunakan Admin Client agar tidak bergantung RLS publik
    if (qrToken) {
      const adminSupabase = createAdminClient();
      const result = await sessionService.getScanSessionData(adminSupabase, qrToken);
      if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
      return NextResponse.json(result.data);
    }

    const supabase = createClient();

    // Auth required from here on
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Tidak diizinkan, harap login terlebih dahulu' }, { status: 401 });
    }

    if (sessionId) {
      const result = await sessionService.getSessionById(supabase, sessionId);
      if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
      return NextResponse.json(result.data);
    }

    const classId = searchParams.get('kelas_id');
    const status = searchParams.get('status') as 'active' | 'closed' | undefined;
    const tanggal = searchParams.get('tanggal');

    const result = await sessionService.getSessions(supabase, user.id, {
      kelas_id: classId || undefined,
      status: status || undefined,
      tanggal: tanggal || undefined,
    });

    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}

// POST: Create a new session (requires auth)
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Tidak diizinkan, harap login terlebih dahulu' }, { status: 401 });
    }

    const body = await request.json();
    const { kelas_id, tanggal } = body;

    if (!kelas_id) {
      return NextResponse.json({ error: 'Parameter kelas_id wajib diisi' }, { status: 400 });
    }

    const result = await sessionService.createSession(supabase, user.id, { kelas_id, tanggal });
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}

// PATCH: Close session or Refresh QR Code (requires auth)
export async function PATCH(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Tidak diizinkan, harap login terlebih dahulu' }, { status: 401 });
    }

    const body = await request.json();
    const { session_id, action } = body; // action: 'close' | 'refresh'

    if (!session_id || !action) {
      return NextResponse.json({ error: 'Parameter session_id dan action wajib diisi' }, { status: 400 });
    }

    if (action === 'close') {
      const result = await sessionService.closeSession(supabase, session_id);
      if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
      return NextResponse.json(result.data);
    }

    if (action === 'refresh') {
      const result = await sessionService.refreshQRToken(supabase, session_id);
      if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
      return NextResponse.json(result.data);
    }

    return NextResponse.json({ error: 'Aksi tidak dikenal' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
