'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import { Users, GraduationCap, QrCode, BarChart3, Plus, ArrowRight, Calendar, Waves, TrendingUp, AlertTriangle, Send, MapPin } from 'lucide-react';
import { DEMO_STATS } from '@/lib/dummy-data';
import { handleDemoAction } from '@/components/DemoAlert';

export default function DemoDashboardHome() {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    setCurrentDate(new Date().toLocaleDateString('id-ID', options));
  }, []);

  const statCards = [
    {
      title: 'Total Murid',
      value: DEMO_STATS.totalMurid,
      label: 'Murid Terdaftar',
      icon: Users,
      color: 'from-cyan-500/10 to-blue-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900',
    },
    {
      title: 'Total Kelas',
      value: DEMO_STATS.kelasAktif,
      label: 'Kelas Latihan',
      icon: GraduationCap,
      color: 'from-teal-500/10 to-emerald-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900',
    },
    {
      title: 'Sesi Hari Ini',
      value: 2,
      label: 'Sesi Presensi',
      icon: QrCode,
      color: 'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    },
    {
      title: 'Tingkat Kehadiran',
      value: `${DEMO_STATS.persentaseKehadiran}%`,
      label: 'Bulan Ini',
      icon: BarChart3,
      color: 'from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900',
    },
  ];

  const trendData = [
    { monthLabel: 'Jan', rate: 82 },
    { monthLabel: 'Feb', rate: 85 },
    { monthLabel: 'Mar', rate: 80 },
    { monthLabel: 'Apr', rate: 88 },
    { monthLabel: 'Mei', rate: DEMO_STATS.persentaseKehadiran },
  ];

  const classComparisons = [
    { id: '1', name: 'Pemula Anak-Anak', avg: 96 },
    { id: '2', name: 'Dewasa Pemula', avg: 85 },
    { id: '3', name: 'Persiapan Kompetisi', avg: 100 },
  ];

  const lowAttendanceStudents = [
    { id: '1', nama: 'Siti Nurhaliza', ortu_hp: '085612345678', rate: 65, class_name: 'Dewasa Pemula' },
  ];

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 select-none pointer-events-none flex items-center pr-6">
          <Waves className="h-44 w-44" />
        </div>
        <div className="space-y-2 max-w-xl z-10">
          <h2 className="text-2xl font-black">Selamat datang, Instruktur Demo! 👋</h2>
          <p className="text-sm font-medium text-cyan-100 leading-relaxed">
            Ini adalah tampilan demonstrasi interaktif. Jelajahi fitur-fitur yang ada, namun modifikasi data tidak akan tersimpan secara permanen.
          </p>
        </div>
        {currentDate && (
          <div className="z-10 shrink-0 self-start md:self-center px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex flex-col shadow-sm">
            <span className="text-[10px] font-bold text-cyan-200 uppercase tracking-wider">Hari & Tanggal</span>
            <span className="text-sm font-black text-white">{currentDate}</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card
              key={idx}
              className={`bg-gradient-to-br ${card.color} border shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {card.title}
                    </p>
                    <h3 className="text-3xl font-black tracking-tight">{card.value}</h3>
                    <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                  </div>
                  <div className="hidden sm:block p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                    <Icon className="h-6 w-6 text-current" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Grid: Sessions & Quick Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Sessions */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary-500" />
            Sesi Presensi Hari Ini (Demo)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card hover className="border border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="hadir">Aktif</Badge>
                  <span className="text-xs font-semibold text-muted-foreground">15:00</span>
                </div>
                <CardTitle className="text-base font-bold mt-2">Pemula Anak-Anak</CardTitle>
                <p className="text-xs text-muted-foreground font-semibold">Jadwal: Senin & Rabu</p>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-extrabold flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 text-primary-500 shrink-0" /> Kolam Renang Tirta
                </p>
              </CardHeader>
              <CardContent className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Sesi presensi latihan</span>
                <Button size="sm" variant="primary" onClick={handleDemoAction}>Buka Sesi</Button>
              </CardContent>
            </Card>
            
            <Card hover className="border border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Ditutup</Badge>
                  <span className="text-xs font-semibold text-muted-foreground">05:30</span>
                </div>
                <CardTitle className="text-base font-bold mt-2">Persiapan Kompetisi</CardTitle>
                <p className="text-xs text-muted-foreground font-semibold">Jadwal: Senin - Jumat</p>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-extrabold flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 text-primary-500 shrink-0" /> Kolam Olympic
                </p>
              </CardHeader>
              <CardContent className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Sesi presensi latihan</span>
                <Button size="sm" variant="outline" onClick={handleDemoAction}>Lihat Rekap</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Action Column */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-foreground">Aksi Cepat</h3>
          <Card className="border border-border">
            <CardContent className="p-6 space-y-4">
              <div onClick={handleDemoAction} className="p-4 rounded-xl border border-border hover:border-primary-400 bg-background/50 hover:bg-primary-500/5 transition-all flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary-50 dark:bg-cyan-950/20 text-primary-500 rounded-lg">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground leading-tight">Mulai Sesi Baru</p>
                    <p className="text-xs text-muted-foreground">Generate QR code absensi</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
              </div>

              <div onClick={handleDemoAction} className="p-4 rounded-xl border border-border hover:border-primary-400 bg-background/50 hover:bg-primary-500/5 transition-all flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary-50 dark:bg-cyan-950/20 text-primary-500 rounded-lg">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground leading-tight">Tambah Murid</p>
                    <p className="text-xs text-muted-foreground">Daftarkan murid baru</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
              </div>

              <div onClick={handleDemoAction} className="p-4 rounded-xl border border-border hover:border-primary-400 bg-background/50 hover:bg-primary-500/5 transition-all flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary-50 dark:bg-cyan-950/20 text-primary-500 rounded-lg">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground leading-tight">Lihat Rekap</p>
                    <p className="text-xs text-muted-foreground">Ekspor laporan & data Excel</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Advanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Kehadiran Bulanan */}
        <Card className="border border-border lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-primary-500" />
              Tren Kehadiran Bulanan
            </CardTitle>
            <p className="text-xs text-muted-foreground font-semibold">Tingkat kehadiran 5 bulan terakhir</p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="relative">
              <svg viewBox="0 0 500 150" className="w-full h-40 overflow-visible">
                <line x1="40" y1="25" x2="460" y2="25" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />
                <line x1="40" y1="62.5" x2="460" y2="62.5" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />
                <line x1="40" y1="100" x2="460" y2="100" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />
                <line x1="40" y1="137.5" x2="460" y2="137.5" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />
                
                {(() => {
                  const width = 500;
                  const height = 150;
                  const paddingX = 40;
                  const paddingY = 25;
                  const chartWidth = width - paddingX * 2;
                  const chartHeight = height - paddingY * 2;

                  const points = trendData.map((d, i) => {
                    const x = paddingX + (i * chartWidth) / (trendData.length - 1 || 1);
                    const y = height - paddingY - (d.rate / 100) * chartHeight;
                    return { x, y, label: d.monthLabel, rate: d.rate };
                  });

                  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  const areaPath = points.length > 0 
                    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
                    : '';

                  return (
                    <>
                      {areaPath && (
                        <path d={areaPath} fill="url(#trend-gradient)" opacity="0.2" />
                      )}
                      <defs>
                        <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {linePath && (
                        <path d={linePath} fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      )}

                      {points.map((p, idx) => (
                        <g key={idx} className="group/dot cursor-pointer">
                          <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#06b6d4" strokeWidth="2.5" />
                          <circle cx={p.x} cy={p.y} r="8" fill="#06b6d4" opacity="0" className="hover:opacity-20 transition-all" />
                          <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[9px] font-black fill-slate-700 dark:fill-slate-300">
                            {p.rate}%
                          </text>
                          <text x={p.x} y={height - 5} textAnchor="middle" className="text-[10px] font-bold fill-slate-400 dark:fill-slate-500">
                            {p.label}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Kehadiran Kelas & Alert */}
        <div className="space-y-6">
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Rata-rata Kehadiran Kelas</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-4">
              {classComparisons.map((cls) => (
                <div key={cls.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-foreground leading-none">
                    <span className="truncate max-w-[150px]">{cls.name}</span>
                    <span>{cls.avg}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500" 
                      style={{ width: `${cls.avg}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-red-500">
                <AlertTriangle className="h-4 w-4" />
                Siswa Perlu Perhatian (&lt;70%)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2 max-h-[200px] overflow-y-auto space-y-3">
              {lowAttendanceStudents.map((std) => (
                <div key={std.id} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-red-500/5 border border-red-500/10">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{std.nama}</p>
                    <p className="text-[9px] text-muted-foreground font-bold truncate">{std.class_name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="alpha" className="text-[10px] py-0.5 px-1.5 font-black">{std.rate}%</Badge>
                    <div onClick={handleDemoAction} className="p-1 cursor-pointer rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all" title="Hubungi Orang Tua">
                      <Send className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
