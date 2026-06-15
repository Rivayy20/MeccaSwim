'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDashboardAuth } from '@/hooks/useAuth';
import { useSessions } from '@/hooks/useSessions';
import {
  Button,
  Card,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  LoadingSpinner,
  EmptyState,
} from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { getClassById, getClasses } from '@/services/class.service';
import { getStudentsByClassId } from '@/services/student.service';
import { getSessions } from '@/services/session.service';
import { Class, Student, SessionWithClass } from '@/lib/types';
import { ChevronLeft, Play, Users, Calendar, Clock, ExternalLink, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatHariTanggal, formatWaktu } from '@/lib/utils/date';
import Link from 'next/link';

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useDashboardAuth();
  const { createSession, loading: sessionActionLoading } = useSessions();

  const [classObj, setClassObj] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<SessionWithClass[]>([]);
  const [sameDayClasses, setSameDayClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();
  const classId = params.id as string;
  const guruId = user?.id;

  const loadData = useCallback(async () => {
    if (!classId || !guruId) return;
    setLoading(true);
    try {
      const [classRes, studentsRes, sessionsRes, allClassesRes] = await Promise.all([
        getClassById(supabase, classId),
        getStudentsByClassId(supabase, classId),
        getSessions(supabase, guruId, { kelas_id: classId }),
        getClasses(supabase, guruId),
      ]);
      if (!classRes.data) {
        toast.error('Kelas tidak ditemukan');
        router.push('/dashboard/kelas');
        return;
      }
      setClassObj(classRes.data);
      setStudents(studentsRes.data || []);
      setSessions(sessionsRes.data || []);

      const sameDay = allClassesRes.data?.filter(c => c.nama === classRes.data?.nama) || [];
      sameDay.sort((a, b) => {
        const getTime = (jadwalStr: string | null) => {
          if (!jadwalStr) return '';
          const parts = jadwalStr.split(',');
          return parts[1]?.trim() || jadwalStr;
        };
        return getTime(a.jadwal).localeCompare(getTime(b.jadwal));
      });
      setSameDayClasses(sameDay);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat data kelas');
    } finally {
      setLoading(false);
    }
  }, [classId, guruId, router, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStartSession = async () => {
    if (!guruId || !classId) return;
    const createdSession = await createSession(guruId, { kelas_id: classId });
    if (createdSession) {
      router.push(`/dashboard/sesi/${createdSession.id}`);
    }
  };

  if (loading || !classObj) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Memuat rincian kelas..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => router.push('/dashboard/kelas')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Kembali ke Daftar Kelas
        </button>

        {sameDayClasses.length > 1 && (
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-900/60 backdrop-blur-md border border-border rounded-xl">
            {sameDayClasses.map((cls) => {
              const isActive = cls.id === classId;
              const timePart = cls.jadwal ? (cls.jadwal.split(',')[1]?.trim() || cls.jadwal) : '';
              return (
                <button
                  key={cls.id}
                  onClick={() => router.push(`/dashboard/kelas/${cls.id}`)}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{cls.lokasi}</span>
                  {timePart && <span className="opacity-85 font-normal text-[10px]">({timePart})</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Class Info & Quick Actions Banner */}
      <Card className="border border-border relative overflow-hidden">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="primary" showDot={false}>
                Kelas Renang
              </Badge>
              <span className="text-xs font-semibold text-muted-foreground">
                Kapasitas: {classObj.kapasitas} Murid
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {classObj.nama}
            </h2>
            <p className="text-sm text-slate-500 font-semibold flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Jadwal: {classObj.jadwal || 'Belum ditentukan'}
            </p>
            {classObj.lokasi && (
              <p className="text-sm text-primary-600 dark:text-primary-400 font-extrabold flex items-center gap-1.5 mt-1">
                <MapPin className="h-4 w-4 text-primary-500 shrink-0" />
                Lokasi: {classObj.lokasi}
              </p>
            )}
          </div>

          <Button
            onClick={handleStartSession}
            isLoading={sessionActionLoading}
            leftIcon={<Play className="h-4 w-4 fill-current" />}
            className="md:w-fit w-full"
          >
            Mulai Sesi Latihan
          </Button>
        </CardContent>
      </Card>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student List in Class (2 cols equivalent on large) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-primary-500" />
            Daftar Murid Terdaftar ({students.length})
          </h3>

          {students.length === 0 ? (
            <EmptyState
              icon="Users"
              title="Belum Ada Murid"
              description="Belum ada murid yang dimasukkan ke dalam kelas ini. Anda dapat memasukkan kelas saat menambah/mengedit murid."
              action={
                <Link href="/dashboard/murid">
                  <Button size="sm">Hubungkan Murid</Button>
                </Link>
              }
            />
          ) : (
            <Card className="border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Murid</TableHead>
                    <TableHead>Usia</TableHead>
                    <TableHead>Nama Orang Tua</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-bold">{student.nama}</TableCell>
                      <TableCell>{student.usia ? `${student.usia} tahun` : '-'}</TableCell>
                      <TableCell>{student.ortu_nama || '-'}</TableCell>
                      <TableCell>{student.ortu_hp || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end">
                          <Link href={`/dashboard/murid/${student.id}`} title="Lihat Profil">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <ExternalLink className="h-4 w-4 text-slate-500" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>

        {/* Right Column: Session History */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary-500" />
            Riwayat Sesi Kelas
          </h3>

          {sessions.length === 0 ? (
            <EmptyState
              icon="Calendar"
              title="Belum Ada Riwayat Sesi"
              description="Riwayat sesi latihan kelas ini akan tampil di sini setelah Anda memulai sesi pertama."
            />
          ) : (
            <div className="space-y-3">
              {sessions.map((sess) => (
                <Link href={`/dashboard/sesi/${sess.id}`} key={sess.id} className="block">
                  <Card hover className="border border-border p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {formatHariTanggal(sess.tanggal)}
                      </span>
                      <Badge variant={sess.status === 'active' ? 'hadir' : 'secondary'}>
                        {sess.status === 'active' ? 'Aktif' : 'Selesai'}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatWaktu(sess.waktu_mulai)}
                        {sess.waktu_selesai && ` - ${formatWaktu(sess.waktu_selesai)}`}
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
