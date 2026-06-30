// ============================================================
// Database type definitions — maps 1:1 dengan Supabase tables
// ============================================================

// --- Enum types ---

export type AttendanceStatus = 'hadir' | 'izin' | 'sakit' | 'alpha';
export type AttendanceMethod = 'qr' | 'manual';
export type SessionStatus = 'active' | 'closed';

// --- Table types ---

export interface Profile {
  id: string;
  email: string;
  nama: string;
  created_at: string;
}

export interface Class {
  id: string;
  nama: string;
  jadwal: string | null;
  kapasitas: number;
  lokasi: string;
  guru_id: string;
  created_at: string;
}

export interface Student {
  id: string;
  nama: string;
  usia: number | null;
  kelas_id: string | null;
  jenis_kelamin: string | null;
  link_token: string;
  ortu_nama: string | null;
  ortu_hp: string | null;
  guru_id: string;
  created_at: string;
}

export interface Session {
  id: string;
  kelas_id: string;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string | null;
  qr_token: string;
  qr_expires_at: string;
  status: SessionStatus;
  guru_id: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  session_id: string;
  student_id: string;
  status: AttendanceStatus;
  waktu_scan: string;
  metode: AttendanceMethod;
  catatan: string | null;
  created_at: string;
}

// --- Types with relations (joins) ---

export interface StudentWithClass extends Student {
  classes: Class | null;
}

export interface SessionWithClass extends Session {
  classes: Class;
}

export interface ScanSessionData extends SessionWithClass {
  students: Pick<Student, 'id' | 'nama' | 'link_token'>[];
}

export interface SessionWithDetails extends Session {
  classes: Class;
  attendances: AttendanceWithStudent[];
}

export interface AttendanceWithStudent extends Attendance {
  students: Student;
}

export interface AttendanceWithSession extends Attendance {
  sessions: SessionWithClass;
}

// --- Form input types (for create/update operations) ---

export interface CreateStudentInput {
  nama: string;
  usia?: number | null;
  kelas_id?: string | null;
  jenis_kelamin?: string | null;
  ortu_nama?: string | null;
  ortu_hp?: string | null;
}

export type UpdateStudentInput = Partial<CreateStudentInput>;

export interface CreateClassInput {
  nama: string;
  jadwal?: string | null;
  kapasitas?: number;
  lokasi?: string;
}

export type UpdateClassInput = Partial<CreateClassInput>;

export interface CreateSessionInput {
  kelas_id: string;
  tanggal?: string;
  duration?: number; // duration in minutes, 0 means unlimited
}

export interface CreateAttendanceInput {
  session_id: string;
  student_id: string;
  status: AttendanceStatus;
  metode: AttendanceMethod;
  catatan?: string | null;
}

export interface UpdateAttendanceInput {
  status?: AttendanceStatus;
  catatan?: string | null;
}

// --- Dashboard statistics ---

export interface DashboardStats {
  totalMurid: number;
  totalKelas: number;
  sesiHariIni: number;
  tingkatKehadiran: number;
}

// --- API response wrapper ---

export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}
