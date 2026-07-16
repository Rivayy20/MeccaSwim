-- ============================================================
-- MECCA SWIM — Sistem Presensi Les Renang
-- Database Migration: Student Registrations (V2 - Per Instruktur)
-- Paste ke Supabase SQL Editor untuk menjalankan migrasi ini
-- ============================================================

-- 1. Tabel: student_registrations (data calon murid)
-- ============================================================
CREATE TABLE IF NOT EXISTS student_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  usia INTEGER,
  jenis_kelamin TEXT CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
  lokasi TEXT NOT NULL CHECK (lokasi IN ('Kolam Fatima Utama', 'Tirta Sambara', 'Tirta Rahayu', 'Semilir')),
  ortu_nama TEXT NOT NULL,
  ortu_hp TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  assigned_class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  guru_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes untuk performa query
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_student_registrations_guru_id ON student_registrations(guru_id);
CREATE INDEX IF NOT EXISTS idx_student_registrations_status ON student_registrations(status);
CREATE INDEX IF NOT EXISTS idx_student_registrations_created_at ON student_registrations(created_at DESC);

-- 3. Row Level Security (RLS)
-- ============================================================
ALTER TABLE student_registrations ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: student_registrations & profiles
-- ============================================================
-- Publik: Bisa melihat profil guru (PENTING untuk membuka form pendaftaran di mobile/tanpa login)
DROP POLICY IF EXISTS "Publik bisa lihat profil guru" ON profiles;
CREATE POLICY "Publik bisa lihat profil guru"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (true);

-- Publik & User Login: Bisa melakukan insert pendaftaran (tanpa login maupun saat login)
DROP POLICY IF EXISTS "Publik bisa insert pendaftaran" ON student_registrations;
CREATE POLICY "Publik bisa insert pendaftaran"
  ON student_registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Guru: Hanya bisa lihat pendaftaran yang ditujukan kepadanya (guru_id = auth.uid())
DROP POLICY IF EXISTS "Guru bisa lihat pendaftaran miliknya" ON student_registrations;
CREATE POLICY "Guru bisa lihat pendaftaran miliknya"
  ON student_registrations FOR SELECT
  TO authenticated
  USING (auth.uid() = guru_id);

-- Guru: Hanya bisa update pendaftaran miliknya
DROP POLICY IF EXISTS "Guru bisa update pendaftaran miliknya" ON student_registrations;
CREATE POLICY "Guru bisa update pendaftaran miliknya"
  ON student_registrations FOR UPDATE
  TO authenticated
  USING (auth.uid() = guru_id);

-- Guru: Hanya bisa delete pendaftaran miliknya
DROP POLICY IF EXISTS "Guru bisa delete pendaftaran miliknya" ON student_registrations;
CREATE POLICY "Guru bisa delete pendaftaran miliknya"
  ON student_registrations FOR DELETE
  TO authenticated
  USING (auth.uid() = guru_id);

-- 5. Enable Realtime untuk tabel student_registrations (Aman & Kondisional)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'student_registrations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE student_registrations;
  END IF;
END $$;
