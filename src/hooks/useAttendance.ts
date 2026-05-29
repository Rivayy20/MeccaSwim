'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import * as attendanceService from '@/services/attendance.service';
import { AttendanceWithStudent, AttendanceWithSession, CreateAttendanceInput, UpdateAttendanceInput } from '@/lib/types';
import toast from 'react-hot-toast';

export function useAttendance() {
  const [attendances, setAttendances] = useState<AttendanceWithStudent[]>([]);
  const [studentAttendances, setStudentAttendances] = useState<AttendanceWithSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchBySession = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    const result = await attendanceService.getAttendancesBySession(supabase, sessionId);
    if (result.error) {
      setError(result.error);
    } else {
      setAttendances(result.data || []);
    }
    setLoading(false);
  }, [supabase]);

  const fetchByStudent = useCallback(async (studentId: string, month?: number, year?: number) => {
    setLoading(true);
    setError(null);
    const result = await attendanceService.getAttendancesByStudent(supabase, studentId, { month, year });
    if (result.error) {
      setError(result.error);
    } else {
      setStudentAttendances(result.data || []);
    }
    setLoading(false);
  }, [supabase]);

  const recordAttendance = async (data: CreateAttendanceInput) => {
    setLoading(true);
    const toastId = toast.loading('Pencatatan presensi...');
    const result = await attendanceService.createAttendance(supabase, data);
    setLoading(false);

    if (result.error) {
      toast.error(`Gagal: ${result.error}`, { id: toastId });
      return null;
    }

    toast.success('Presensi berhasil dicatat!', { id: toastId });
    // Refresh for the current session if loaded
    fetchBySession(data.session_id);
    return result.data;
  };

  const updateAttendance = async (sessionId: string, id: string, data: UpdateAttendanceInput) => {
    setLoading(true);
    const toastId = toast.loading('Mengubah data presensi...');
    const result = await attendanceService.updateAttendance(supabase, id, data);
    setLoading(false);

    if (result.error) {
      toast.error(`Gagal: ${result.error}`, { id: toastId });
      return null;
    }

    toast.success('Data presensi berhasil diubah!', { id: toastId });
    // Refresh session attendances
    fetchBySession(sessionId);
    return result.data;
  };

  const deleteAttendance = async (sessionId: string, id: string) => {
    setLoading(true);
    const toastId = toast.loading('Menghapus data presensi...');
    const result = await attendanceService.deleteAttendance(supabase, id);
    setLoading(false);

    if (result.error) {
      toast.error(`Gagal: ${result.error}`, { id: toastId });
      return false;
    }

    toast.success('Data presensi berhasil dihapus!', { id: toastId });
    fetchBySession(sessionId);
    return true;
  };

  return {
    attendances,
    studentAttendances,
    loading,
    error,
    fetchBySession,
    fetchByStudent,
    recordAttendance,
    updateAttendance,
    deleteAttendance,
  };
}
