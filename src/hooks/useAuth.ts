'use client';

import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import * as authService from '@/services/auth.service';
import { Profile } from '@/lib/types';
import { AuthChangeEvent, Session as AuthSession, User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { generateToken } from '@/lib/utils/token';

function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    async function loadProfile(userId: string) {
      const profileResult = await authService.getProfile(supabase, userId);
      if (profileResult.data && isMounted) {
        let prof = profileResult.data;
        if (!prof.link_token) {
          const shortToken = generateToken(6);
          try {
            const { data: updated } = await supabase
              .from('profiles')
              .update({ link_token: shortToken })
              .eq('id', userId)
              .select()
              .single();
            if (updated) {
              prof = updated as Profile;
            } else {
              prof = { ...prof, link_token: shortToken };
            }
          } catch {
            prof = { ...prof, link_token: shortToken };
          }
        }
        setProfile(prof);
      }
    }

    async function getInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) {
          setUser(session.user);
          setLoading(false);
          void loadProfile(session.user.id);
        }
      } catch (err) {
        console.error('Error fetching initial session:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    getInitialSession();

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: AuthSession | null) => {
      if (!isMounted) return;
      void event;

      if (session) {
        setUser(session.user);
        setLoading(false);
        void loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const toastId = toast.loading('Sedang masuk...');
    const result = await authService.signIn(supabase, email, password);
    setLoading(false);

    if (result.error) {
      toast.error(result.error, { id: toastId });
      return false;
    }

    toast.success('Berhasil masuk!', { id: toastId });
    router.push('/dashboard');
    router.refresh();
    return true;
  };

  const signUp = async (email: string, password: string, nama: string) => {
    setLoading(true);
    const toastId = toast.loading('Membuat akun...');
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const redirectTo = `${origin}/auth/callback`;
    const result = await authService.signUp(supabase, email, password, nama, redirectTo);
    setLoading(false);

    if (result.error) {
      toast.error(result.error, { id: toastId });
      return false;
    }

    toast.success('Pendaftaran berhasil! Silakan periksa email Anda.', { id: toastId });
    return true;
  };

  const signOut = async () => {
    setLoading(true);
    const toastId = toast.loading('Sedang keluar...');
    await authService.signOut(supabase);
    setUser(null);
    setProfile(null);
    setLoading(false);
    toast.success('Berhasil keluar!', { id: toastId });
    router.push('/login');
    router.refresh();
  };

  const updateProfile = async (nama: string) => {
    setLoading(true);
    const toastId = toast.loading('Memperbarui profil...');
    const result = await authService.updateProfile(supabase, { nama });
    setLoading(false);

    if (result.error) {
      toast.error(result.error, { id: toastId });
      return false;
    }

    if (result.data) {
      setProfile(result.data);
    }
    toast.success('Profil berhasil diperbarui!', { id: toastId });
    return true;
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    const toastId = toast.loading('Mengirim email reset password...');
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const redirectTo = `${origin}/auth/callback?next=/update-password`;
    const result = await authService.resetPassword(supabase, email, redirectTo);
    setLoading(false);

    if (result.error) {
      toast.error(result.error, { id: toastId });
      return false;
    }

    toast.success('Email reset password berhasil dikirim!', { id: toastId });
    return true;
  };

  const updatePassword = async (password: string) => {
    setLoading(true);
    const toastId = toast.loading('Memperbarui password...');
    const result = await authService.updatePassword(supabase, password);
    setLoading(false);

    if (result.error) {
      toast.error(result.error, { id: toastId });
      return false;
    }

    toast.success('Password berhasil diperbarui!', { id: toastId });
    return true;
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
  };
}

type AuthContextValue = ReturnType<typeof useAuthState>;

const DashboardAuthContext = createContext<AuthContextValue | null>(null);

export function DashboardAuthProvider({
  value,
  children,
}: {
  value: AuthContextValue;
  children: ReactNode;
}) {
  return createElement(DashboardAuthContext.Provider, { value }, children);
}

export function useAuth() {
  return useAuthState();
}

export function useDashboardAuth() {
  const auth = useContext(DashboardAuthContext);
  if (!auth) {
    throw new Error('useDashboardAuth hanya dapat dipakai di dalam dashboard layout');
  }
  return auth;
}
