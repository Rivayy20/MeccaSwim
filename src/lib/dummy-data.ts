export const DEMO_STATS = {
  totalMurid: 142,
  kelasAktif: 8,
  persentaseKehadiran: 94,
  pendapatanBulanan: "Rp 8.500.000",
};

export const DEMO_CLASSES = [
  { id: '1', name: "Pemula Anak-Anak (Batch A)", jadwal: "Senin & Rabu, 15:00", lokasi: "Kolam Renang Tirta", muridCount: 15, instruktur: "Instruktur Demo" },
  { id: '2', name: "Gaya Bebas Lanjutan", jadwal: "Selasa & Kamis, 16:30", lokasi: "Kolam Renang Tirta", muridCount: 12, instruktur: "Instruktur Demo" },
  { id: '3', name: "Dewasa Pemula", jadwal: "Sabtu, 08:00", lokasi: "Kolam Olympic", muridCount: 8, instruktur: "Instruktur Demo" },
  { id: '4', name: "Persiapan Kompetisi", jadwal: "Senin - Jumat, 05:30", lokasi: "Kolam Olympic", muridCount: 5, instruktur: "Instruktur Demo" },
  { id: '5', name: "Gaya Punggung Dasar", jadwal: "Jumat, 15:00", lokasi: "Kolam Renang Tirta", muridCount: 10, instruktur: "Instruktur Demo" },
  { id: '6', name: "Penyelamatan Air", jadwal: "Minggu, 09:00", lokasi: "Kolam Olympic", muridCount: 6, instruktur: "Instruktur Demo" },
];

export const DEMO_STUDENTS = [
  { id: '1', name: "Ahmad Rizky", phone: "081234567890", status: "Aktif", joined: "12 Jan 2026", class: "Pemula Anak-Anak (Batch A)", rate: 95 },
  { id: '2', name: "Budi Santoso", phone: "081298765432", status: "Aktif", joined: "15 Feb 2026", class: "Dewasa Pemula", rate: 80 },
  { id: '3', name: "Siti Nurhaliza", phone: "085612345678", status: "Aktif", joined: "01 Mar 2026", class: "Dewasa Pemula", rate: 65 },
  { id: '4', name: "Dina Mariana", phone: "082233445566", status: "Nonaktif", joined: "10 Mar 2026", class: "Gaya Bebas Lanjutan", rate: 40 },
  { id: '5', name: "Rendi Pangalila", phone: "081122334455", status: "Aktif", joined: "05 Apr 2026", class: "Persiapan Kompetisi", rate: 100 },
  { id: '6', name: "Cika Jessica", phone: "089988776655", status: "Aktif", joined: "20 Apr 2026", class: "Pemula Anak-Anak (Batch A)", rate: 90 },
  { id: '7', name: "Deni Sumargo", phone: "087766554433", status: "Aktif", joined: "02 Mei 2026", class: "Penyelamatan Air", rate: 85 },
  { id: '8', name: "Elisa Novita", phone: "088899990000", status: "Aktif", joined: "15 Mei 2026", class: "Gaya Punggung Dasar", rate: 92 },
];

export const DEMO_SESSIONS = [
  { id: 's1', class: "Pemula Anak-Anak (Batch A)", date: "Hari Ini", time: "15:00", status: "active", hadir: 14, izin: 1, alpha: 0 },
  { id: 's2', class: "Persiapan Kompetisi", date: "Hari Ini", time: "05:30", status: "closed", hadir: 5, izin: 0, alpha: 0 },
  { id: 's3', class: "Dewasa Pemula", date: "Kemarin", time: "08:00", status: "closed", hadir: 7, izin: 0, alpha: 1 },
  { id: 's4', class: "Gaya Bebas Lanjutan", date: "2 Hari Lalu", time: "16:30", status: "closed", hadir: 10, izin: 2, alpha: 0 },
  { id: 's5', class: "Gaya Punggung Dasar", date: "3 Hari Lalu", time: "15:00", status: "closed", hadir: 9, izin: 1, alpha: 0 },
];

export const DEMO_SPP = [
  { id: 'p1', studentName: "Ahmad Rizky", class: "Pemula Anak-Anak (Batch A)", month: "Juni 2026", amount: 250000, status: "lunas", date: "02 Jun 2026" },
  { id: 'p2', studentName: "Budi Santoso", class: "Dewasa Pemula", month: "Juni 2026", amount: 300000, status: "belum_bayar", date: "-" },
  { id: 'p3', studentName: "Siti Nurhaliza", class: "Dewasa Pemula", month: "Juni 2026", amount: 300000, status: "lunas", date: "05 Jun 2026" },
  { id: 'p4', studentName: "Cika Jessica", class: "Pemula Anak-Anak (Batch A)", month: "Juni 2026", amount: 250000, status: "lunas", date: "01 Jun 2026" },
  { id: 'p5', studentName: "Rendi Pangalila", class: "Persiapan Kompetisi", month: "Juni 2026", amount: 500000, status: "lunas", date: "10 Jun 2026" },
];
