import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import * as attendanceService from '@/services/attendance.service';

export async function POST(request: Request) {
  try {
    const { qr_token, student_id } = await request.json();

    if (!qr_token || !student_id) {
      return NextResponse.json(
        { error: 'Parameter qr_token dan student_id wajib diisi' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Confirm QR Attendance
    const result = await attendanceService.confirmQRAttendance(supabase, qr_token, student_id);

    if (result.error || !result.data) {
      return NextResponse.json({ error: result.error || 'Gagal merekam presensi' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error('Error in API /api/attendance/confirm:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}

