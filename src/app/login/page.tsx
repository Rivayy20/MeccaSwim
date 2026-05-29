'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { APP_NAME } from '@/lib/constants';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, signUp, loading, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Email dan kata sandi harus diisi');
      return;
    }

    if (activeTab === 'register' && !nama.trim()) {
      setErrorMsg('Nama lengkap harus diisi');
      return;
    }

    try {
      if (activeTab === 'login') {
        const success = await signIn(email, password);
        if (!success) setErrorMsg('Email atau password salah');
      } else {
        const success = await signUp(email, password, nama);
        if (success) {
          setActiveTab('login');
          setNama('');
          setPassword('');
        } else {
          setErrorMsg('Pendaftaran gagal. Silakan coba email lain.');
        }
      }
    } catch {
      setErrorMsg('Terjadi kesalahan koneksi.');
    }
  };

  return (
    <div className="dark min-h-screen bg-slate-900 water-pattern flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated glowing backdrops */}
      <div className="absolute top-[20%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[20%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-teal-500/10 blur-3xl pointer-events-none animate-pulse-slow" />

      <div className="w-full max-w-md z-10 animate-scale-in">
        {/* Brand Label */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg text-white text-2xl select-none">
            🏊
          </div>
          <h1 className="font-extrabold text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
            {APP_NAME}
          </h1>
          <p className="text-xs text-slate-400 font-medium">Sistem Presensi Guru Les Renang</p>
        </div>

        <Card variant="glass" className="border-white/10 shadow-glass-lg backdrop-blur-xl bg-slate-900/60">
          <CardHeader className="pb-4">
            <div className="flex rounded-lg bg-slate-800/80 p-1 mb-4 select-none">
              <button
                onClick={() => {
                  setActiveTab('login');
                  setErrorMsg(null);
                }}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-md transition-all ${
                  activeTab === 'login'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Masuk
              </button>
              <button
                onClick={() => {
                  setActiveTab('register');
                  setErrorMsg(null);
                }}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-md transition-all ${
                  activeTab === 'register'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Daftar
              </button>
            </div>
            <CardTitle className="text-white text-center">
              {activeTab === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Guru'}
            </CardTitle>
            <CardDescription className="text-slate-400 text-center text-xs">
              {activeTab === 'login'
                ? 'Silakan masuk ke dasbor presensi Anda'
                : 'Daftarkan diri Anda sebagai guru les renang'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg mb-4 text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'register' && (
                <Input
                  label="Nama Lengkap *"
                  name="nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama Lengkap Guru"
                  icon={<User className="h-4 w-4" />}
                  className="bg-slate-800/40 border-slate-700 text-white focus:ring-primary-500 focus:border-primary-500 placeholder:text-slate-500"
                  required
                />
              )}

              <Input
                label="Email *"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                icon={<Mail className="h-4 w-4" />}
                className="bg-slate-800/40 border-slate-700 text-white focus:ring-primary-500 focus:border-primary-500 placeholder:text-slate-500"
                required
              />

              <Input
                label="Kata Sandi *"
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
                    className="text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                    title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                }
                className="bg-slate-800/40 border-slate-700 text-white focus:ring-primary-500 focus:border-primary-500 placeholder:text-slate-500"
                required
              />

              <Button type="submit" className="w-full mt-6" isLoading={loading}>
                {activeTab === 'login' ? 'Masuk Sekarang' : 'Daftar & Buat Akun'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
