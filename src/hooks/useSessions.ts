'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import * as sessionService from '@/services/session.service';
import { SessionWithClass, CreateSessionInput } from '@/lib/types';
import toast from 'react-hot-toast';

export function useSessions() {
  const [sessions, setSessions] = useState<SessionWithClass[]>([]);
  const [todaySessions, setTodaySessions] = useState<SessionWithClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchSessions = useCallback(
    async (guruId: string, filters?: { kelas_id?: string; status?: 'active' | 'closed'; tanggal?: string }) => {
      setLoading(true);
      setError(null);
      const result = await sessionService.getSessions(supabase, guruId, filters);
      if (result.error) {
        setError(result.error);
      } else {
        setSessions(result.data || []);
      }
      setLoading(false);
    },
    [supabase]
  );

  const fetchTodaySessions = useCallback(async (guruId: string) => {
    setLoading(true);
    setError(null);
    const result = await sessionService.getTodaySessions(supabase, guruId);
    if (result.error) {
      setError(result.error);
    } else {
      setTodaySessions(result.data || []);
    }
    setLoading(false);
  }, [supabase]);

  const createSession = async (guruId: string, data: CreateSessionInput) => {
    setLoading(true);
    const toastId = toast.loading('Memulai sesi presensi baru...');
    const result = await sessionService.createSession(supabase, guruId, data);
    setLoading(false);

    if (result.error) {
      toast.error(`Gagal: ${result.error}`, { id: toastId });
      return null;
    }

    toast.success('Sesi presensi aktif dimulai!', { id: toastId });
    return result.data;
  };

  const refreshQR = async (sessionId: string) => {
    setLoading(true);
    const toastId = toast.loading('Memperbarui QR Code...');
    const result = await sessionService.refreshQRToken(supabase, sessionId);
    setLoading(false);

    if (result.error) {
      toast.error(`Gagal: ${result.error}`, { id: toastId });
      return null;
    }

    toast.success('QR Code berhasil di-refresh!', { id: toastId });
    return result.data;
  };

  const closeSession = async (sessionId: string) => {
    setLoading(true);
    const toastId = toast.loading('Menutup sesi presensi...');
    const result = await sessionService.closeSession(supabase, sessionId);
    setLoading(false);

    if (result.error) {
      toast.error(`Gagal: ${result.error}`, { id: toastId });
      return null;
    }

    toast.success('Sesi absensi berhasil ditutup!', { id: toastId });
    return result.data;
  };

  return {
    sessions,
    todaySessions,
    loading,
    error,
    fetchSessions,
    fetchTodaySessions,
    createSession,
    refreshQR,
    closeSession,
  };
}
