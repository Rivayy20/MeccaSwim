'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { APP_NAME } from '@/lib/constants';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { updatePassword, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check if the user has a valid session to update the password
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If there's no session, they might not have a valid token
        // But the hash fragment from the email link might still be processing.
        // We'll let Supabase handle the hash fragment automatically.
      }
    };
    checkSession();
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!password) {
      setErrorMsg('Kata sandi harus diisi');
      return;
    }
    
    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter');
      return;
    }

    const successUpdate = await updatePassword(password);
    if (successUpdate) {
      setSuccess(true);
      // Wait a bit before redirecting
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      setErrorMsg('Gagal memperbarui password. Tautan mungkin kedaluwarsa atau tidak valid.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 water-pattern flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-[20%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[20%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-teal-500/10 blur-3xl pointer-events-none animate-pulse-slow" />

      <div className="w-full max-w-md z-10 animate-scale-in">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="h-20 w-20 relative flex items-center justify-center mb-2 rounded-full overflow-hidden shadow-md border-2 border-white/50 dark:border-slate-800/50 bg-white dark:bg-slate-900">
            <Image src="/icons/logo.png" alt="Mecca Swim Logo" fill className="object-cover" />
          </div>
          <h1 className="font-extrabold text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-500 dark:from-cyan-400 dark:to-teal-300">
            {APP_NAME}
          </h1>
        </div>

        <Card variant="glass" className="border-slate-200/50 dark:border-white/10 shadow-glass-lg backdrop-blur-xl bg-white/80 dark:bg-slate-900/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-slate-900 dark:text-white text-center">
              {success ? 'Password Berhasil Diubah' : 'Buat Password Baru'}
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-center text-xs mt-1">
              {success ? 'Anda akan diarahkan ke halaman login' : 'Silakan masukkan password baru Anda'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="flex flex-col items-center text-center py-4">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 flex items-center justify-center mb-6 text-green-600 dark:text-green-400">
                  <Lock className="h-8 w-8" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Password Anda telah berhasil diperbarui. Mengalihkan ke halaman masuk...
                </p>
              </div>
            ) : (
              <>
                {errorMsg && (
                  <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg mb-4 text-center">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Password Baru *"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    icon={<Lock className="h-4 w-4" />}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                        title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      >
                        {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                      </button>
                    }
                    className="bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    required
                  />

                  <Button type="submit" className="w-full mt-6" isLoading={loading}>
                    Simpan Password Baru
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
