'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Attendance, AttendanceWithStudent, Student } from '@/lib/types';

interface AttendanceChangePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: unknown;
  old: unknown;
}

export function useRealtimeAttendance(sessionId: string, students: Student[] = []) {
  const [attendances, setAttendances] = useState<AttendanceWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const supabase = createClient();
  const studentsRef = useRef(new Map<string, Student>());

  useEffect(() => {
    studentsRef.current = new Map(students.map((student) => [student.id, student]));
  }, [students]);

  useEffect(() => {
    if (!sessionId) return;

    let isMounted = true;

    async function fetchInitial() {
      setLoading(true);
      const result = await supabase
        .from('attendances')
        .select('*, students(*)')
        .eq('session_id', sessionId)
        .order('waktu_scan', { ascending: true });

      if (result.data && isMounted) {
        setAttendances(result.data as AttendanceWithStudent[]);
      }
      setLoading(false);
    }

    fetchInitial();

    const channel = supabase
      .channel(`session-attendances-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendances',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload: AttendanceChangePayload) => {
          if (!isMounted) return;

          if (payload.eventType === 'DELETE') {
            const oldRecord = payload.old as Pick<Attendance, 'id'>;
            setAttendances((current) => current.filter((attendance) => attendance.id !== oldRecord.id));
            return;
          }

          const changed = payload.new as Attendance;
          const student = studentsRef.current.get(changed.student_id);
          if (!student) return;

          const joined = { ...changed, students: student } as AttendanceWithStudent;
          setAttendances((current) => {
            const existingIndex = current.findIndex((attendance) => attendance.id === joined.id);
            if (existingIndex < 0) return [...current, joined];
            const next = [...current];
            next[existingIndex] = joined;
            return next;
          });
        }
      )
      .subscribe((status: string) => {
        if (isMounted) {
          setIsConnected(status === 'SUBSCRIBED');
        }
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [sessionId, supabase]);

  return {
    attendances,
    count: attendances.length,
    loading,
    isConnected,
  };
}
