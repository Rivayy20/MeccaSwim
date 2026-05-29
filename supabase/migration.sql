-- ============================================================
-- MECCA SWIM — Sistem Presensi Les Renang
-- Database Migration (paste ke Supabase SQL Editor)
-- ============================================================

-- 1. Enable extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabel: profiles (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nama TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel: classes (data kelas)
-- ============================================================
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  jadwal TEXT,
  kapasitas INTEGER DEFAULT 10,
  guru_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel: students (data murid)
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  usia INTEGER,
  jenis_kelamin TEXT CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
  kelas_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  link_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  ortu_nama TEXT,
  ortu_hp TEXT,
  guru_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel: sessions (sesi latihan)
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kelas_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  waktu_mulai TIMESTAMPTZ DEFAULT NOW(),
  waktu_selesai TIMESTAMPTZ,
  qr_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  qr_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 minutes'),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  guru_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel: attendances (data presensi)
-- ============================================================
CREATE TABLE IF NOT EXISTS attendances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'hadir' CHECK (status IN ('hadir', 'izin', 'sakit', 'alpha')),
  waktu_scan TIMESTAMPTZ DEFAULT NOW(),
  metode TEXT NOT NULL DEFAULT 'manual' CHECK (metode IN ('qr', 'manual')),
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);

-- 7. Indexes untuk performa query
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_students_kelas_id ON students(kelas_id);
CREATE INDEX IF NOT EXISTS idx_students_guru_id ON students(guru_id);
CREATE INDEX IF NOT EXISTS idx_students_link_token ON students(link_token);
CREATE INDEX IF NOT EXISTS idx_classes_guru_id ON classes(guru_id);
CREATE INDEX IF NOT EXISTS idx_sessions_kelas_id ON sessions(kelas_id);
CREATE INDEX IF NOT EXISTS idx_sessions_guru_id ON sessions(guru_id);
CREATE INDEX IF NOT EXISTS idx_sessions_qr_token ON sessions(qr_token);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_guru_tanggal ON sessions(guru_id, tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_kelas_created ON sessions(kelas_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attendances_session_id ON attendances(session_id);
CREATE INDEX IF NOT EXISTS idx_attendances_student_id ON attendances(student_id);
CREATE INDEX IF NOT EXISTS idx_attendances_student_created ON attendances(student_id, created_at DESC);

-- 8. Row Level Security (RLS)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies: profiles
-- ============================================================
DROP POLICY IF EXISTS "Guru bisa lihat profil sendiri" ON profiles;
CREATE POLICY "Guru bisa lihat profil sendiri"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Guru bisa update profil sendiri" ON profiles;
CREATE POLICY "Guru bisa update profil sendiri"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Guru bisa insert profil sendiri" ON profiles;
CREATE POLICY "Guru bisa insert profil sendiri"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 10. RLS Policies: classes
-- ============================================================
DROP POLICY IF EXISTS "Guru bisa kelola kelas sendiri" ON classes;
CREATE POLICY "Guru bisa kelola kelas sendiri"
  ON classes FOR ALL
  USING (auth.uid() = guru_id);

-- 11. RLS Policies: students
-- ============================================================
-- Guru: full CRUD pada murid miliknya
DROP POLICY IF EXISTS "Guru bisa insert murid" ON students;
CREATE POLICY "Guru bisa insert murid"
  ON students FOR INSERT
  WITH CHECK (auth.uid() = guru_id);

DROP POLICY IF EXISTS "Guru bisa update murid sendiri" ON students;
CREATE POLICY "Guru bisa update murid sendiri"
  ON students FOR UPDATE
  USING (auth.uid() = guru_id);

DROP POLICY IF EXISTS "Guru bisa delete murid sendiri" ON students;
CREATE POLICY "Guru bisa delete murid sendiri"
  ON students FOR DELETE
  USING (auth.uid() = guru_id);

-- Publik: baca semua murid (untuk portal orang tua via link_token)
DROP POLICY IF EXISTS "Publik bisa lihat data murid" ON students;
CREATE POLICY "Publik bisa lihat data murid"
  ON students FOR SELECT
  USING (true);

-- 12. RLS Policies: sessions
-- ============================================================
-- Guru: full CRUD pada sesi miliknya
DROP POLICY IF EXISTS "Guru bisa insert sesi" ON sessions;
CREATE POLICY "Guru bisa insert sesi"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = guru_id);

DROP POLICY IF EXISTS "Guru bisa update sesi sendiri" ON sessions;
CREATE POLICY "Guru bisa update sesi sendiri"
  ON sessions FOR UPDATE
  USING (auth.uid() = guru_id);

DROP POLICY IF EXISTS "Guru bisa delete sesi sendiri" ON sessions;
CREATE POLICY "Guru bisa delete sesi sendiri"
  ON sessions FOR DELETE
  USING (auth.uid() = guru_id);

-- Publik: baca sesi (untuk validasi QR scan)
DROP POLICY IF EXISTS "Publik bisa lihat sesi" ON sessions;
CREATE POLICY "Publik bisa lihat sesi"
  ON sessions FOR SELECT
  USING (true);

-- 13. RLS Policies: attendances
-- ============================================================
-- Guru: full access pada attendance yang terhubung ke sesinya
DROP POLICY IF EXISTS "Guru bisa kelola attendance" ON attendances;
CREATE POLICY "Guru bisa kelola attendance"
  ON attendances FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = attendances.session_id
      AND s.guru_id = auth.uid()
    )
  );

-- Publik: bisa insert attendance (QR scan dari orang tua)
DROP POLICY IF EXISTS "Publik bisa insert attendance via QR" ON attendances;
CREATE POLICY "Publik bisa insert attendance via QR"
  ON attendances FOR INSERT
  WITH CHECK (true);

-- Publik: bisa lihat attendance (portal orang tua)
DROP POLICY IF EXISTS "Publik bisa lihat attendance" ON attendances;
CREATE POLICY "Publik bisa lihat attendance"
  ON attendances FOR SELECT
  USING (true);

-- 14. Trigger: Auto-create profile saat user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nama)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nama', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger jika sudah ada, lalu buat ulang
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 15. Enable Realtime untuk tabel attendances (Aman & Kondisional)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'attendances'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE attendances;
  END IF;
END $$;

-- 16. Tabel Baru: permits (Pengajuan izin dari portal ortu)
-- ============================================================
CREATE TABLE IF NOT EXISTS permits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('izin', 'sakit')),
  keterangan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, tanggal)
);

CREATE INDEX IF NOT EXISTS idx_permits_student_id ON permits(student_id);
CREATE INDEX IF NOT EXISTS idx_permits_tanggal ON permits(tanggal);

ALTER TABLE permits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Guru bisa kelola permits muridnya" ON permits;
CREATE POLICY "Guru bisa kelola permits muridnya" ON permits FOR ALL USING (
  EXISTS (SELECT 1 FROM students s WHERE s.id = permits.student_id AND s.guru_id = auth.uid())
);

DROP POLICY IF EXISTS "Publik bisa buat permit" ON permits;
CREATE POLICY "Publik bisa buat permit" ON permits FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Publik bisa lihat permit miliknya" ON permits;
CREATE POLICY "Publik bisa lihat permit miliknya" ON permits FOR SELECT USING (true);


-- 17. Tabel Baru: spp_payments (Pembayaran SPP murid)
-- ============================================================
CREATE TABLE IF NOT EXISTS spp_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  bulan INTEGER NOT NULL CHECK (bulan BETWEEN 1 AND 12),
  tahun INTEGER NOT NULL,
  jumlah NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'belum_bayar' CHECK (status IN ('belum_bayar', 'lunas')),
  tanggal_bayar TIMESTAMPTZ,
  metode_bayar TEXT CHECK (metode_bayar IN ('transfer', 'tunai')),
  catatan TEXT,
  guru_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, bulan, tahun)
);

CREATE INDEX IF NOT EXISTS idx_spp_payments_guru_bulan ON spp_payments(guru_id, bulan, tahun);
CREATE INDEX IF NOT EXISTS idx_spp_payments_student_id ON spp_payments(student_id);

ALTER TABLE spp_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Guru bisa kelola SPP sendiri" ON spp_payments;
CREATE POLICY "Guru bisa kelola SPP sendiri" ON spp_payments FOR ALL USING (auth.uid() = guru_id);


-- 18. Tabel Baru: student_progress (Perkembangan renang murid)
-- ============================================================
CREATE TABLE IF NOT EXISTS student_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  level_kemampuan TEXT NOT NULL DEFAULT 'Pemula' CHECK (level_kemampuan IN ('Pemula', 'Menengah', 'Mahir')),
  teknik_dikuasai TEXT[] DEFAULT '{}',
  target_latihan TEXT,
  catatan_pelatih TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id)
);

CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON student_progress(student_id);

ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Guru bisa kelola progress muridnya" ON student_progress;
CREATE POLICY "Guru bisa kelola progress muridnya" ON student_progress FOR ALL USING (
  EXISTS (SELECT 1 FROM students s WHERE s.id = student_progress.student_id AND s.guru_id = auth.uid())
);

DROP POLICY IF EXISTS "Publik bisa lihat progress murid" ON student_progress;
CREATE POLICY "Publik bisa lihat progress murid" ON student_progress FOR SELECT USING (true);

-- 19. Enable Realtime untuk tabel permits (Aman & Kondisional)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'permits'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE permits;
  END IF;
END $$;

-- ============================================================
-- SELESAI! Jalankan SQL ini di Supabase SQL Editor.
-- ============================================================

-- ============================================================
-- 20. UPDATE V4.2: SPP Payments Daily, Weekly, Monthly Options
-- ============================================================
-- Hapus unique constraint lama yang membatasi 1 tagihan per bulan per murid
ALTER TABLE spp_payments DROP CONSTRAINT IF EXISTS spp_payments_student_id_bulan_tahun_key;

-- Tambah kolom tipe, tanggal_tagihan, dan minggu secara aman
ALTER TABLE spp_payments ADD COLUMN IF NOT EXISTS tipe TEXT DEFAULT 'bulanan' CHECK (tipe IN ('harian', 'mingguan', 'bulanan'));
ALTER TABLE spp_payments ADD COLUMN IF NOT EXISTS tanggal_tagihan DATE;
ALTER TABLE spp_payments ADD COLUMN IF NOT EXISTS minggu INTEGER CHECK (minggu BETWEEN 1 AND 5);

-- Tambah partial unique indexes untuk masing-masing tipe tagihan
CREATE UNIQUE INDEX IF NOT EXISTS idx_spp_payments_unique_bulanan 
  ON spp_payments(student_id, bulan, tahun) 
  WHERE tipe = 'bulanan';

CREATE UNIQUE INDEX IF NOT EXISTS idx_spp_payments_unique_mingguan 
  ON spp_payments(student_id, minggu, bulan, tahun) 
  WHERE tipe = 'mingguan';

CREATE UNIQUE INDEX IF NOT EXISTS idx_spp_payments_unique_harian 
  ON spp_payments(student_id, tanggal_tagihan) 
  WHERE tipe = 'harian';


-- ============================================================
-- 21. UPDATE V4.4: Class Locations (Fatima Utama, Tirta Sambara, Tirta Rahayu, Semilir)
-- ============================================================
ALTER TABLE classes 
  ADD COLUMN IF NOT EXISTS lokasi TEXT DEFAULT 'Semilir' 
  CHECK (lokasi IN ('Kolam Fatima Utama', 'Tirta Sambara', 'Tirta Rahayu', 'Semilir'));

