import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAttendancesByStudent } from '@/services/attendance.service';
import { getStudentByLinkToken } from '@/services/student.service';
import { submitPermit } from '@/services/permit.service';

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  const { searchParams } = new URL(request.url);
  const now = new Date();
  const month = Number(searchParams.get('month') || now.getMonth() + 1);
  const year = Number(searchParams.get('year') || now.getFullYear());

  if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year)) {
    return NextResponse.json({ error: 'Periode tidak valid.' }, { status: 400 });
  }

  const supabase = createClient();
  const studentResult = await getStudentByLinkToken(supabase, params.token);

  if (studentResult.error || !studentResult.data) {
    return NextResponse.json({ error: 'Link tidak valid atau murid tidak ditemukan.' }, { status: 404 });
  }

  const attendanceResult = await getAttendancesByStudent(supabase, studentResult.data.id, {
    month,
    year,
  });

  if (attendanceResult.error) {
    return NextResponse.json({ error: attendanceResult.error }, { status: 500 });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const { data: todayPermit } = await supabase
    .from('permits')
    .select('*')
    .eq('student_id', studentResult.data.id)
    .eq('tanggal', todayStr)
    .maybeSingle();

  const { data: progress } = await supabase
    .from('student_progress')
    .select('*')
    .eq('student_id', studentResult.data.id)
    .maybeSingle();

  return NextResponse.json({
    student: studentResult.data,
    attendances: attendanceResult.data || [],
    todayPermit: todayPermit || null,
    progress: progress || null,
  });
}

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const body = await request.json();
    const { status, keterangan } = body;

    if (!status || !['izin', 'sakit'].includes(status)) {
      return NextResponse.json({ error: 'Status izin tidak valid.' }, { status: 400 });
    }

    const supabase = createClient();
    const studentResult = await getStudentByLinkToken(supabase, params.token);

    if (studentResult.error || !studentResult.data) {
      return NextResponse.json({ error: 'Link tidak valid atau murid tidak ditemukan.' }, { status: 404 });
    }

    const permitResult = await submitPermit(supabase, studentResult.data.id, {
      status: status as 'izin' | 'sakit',
      keterangan: keterangan || '',
    });

    if (permitResult.error) {
      return NextResponse.json({ error: permitResult.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: permitResult.data });
  } catch (err) {
    console.error('Error in POST /api/parent/[token]:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server.' }, { status: 500 });
  }
}

