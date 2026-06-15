// ============================================================
// Application constants — single source of truth
// ============================================================

export const APP_NAME = 'Mecca Swim';
export const APP_DESCRIPTION = 'Sistem Presensi Digital untuk Les Renang';

// --- QR & Session ---

export const QR_EXPIRY_MINUTES = 15;
export const QR_EXPIRY_SECONDS = QR_EXPIRY_MINUTES * 60;

// --- Attendance status ---

export const ATTENDANCE_STATUS = {
  HADIR: 'hadir',
  IZIN: 'izin',
  SAKIT: 'sakit',
  ALPHA: 'alpha',
} as const;

export const ATTENDANCE_METHOD = {
  QR: 'qr',
  MANUAL: 'manual',
} as const;

export const SESSION_STATUS = {
  ACTIVE: 'active',
  CLOSED: 'closed',
} as const;

// --- Status display config ---

export const STATUS_CONFIG = {
  hadir: {
    label: 'Hadir',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-900',
    dot: 'bg-emerald-500',
    icon: 'CheckCircle2',
  },
  izin: {
    label: 'Izin',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-900',
    dot: 'bg-amber-500',
    icon: 'Clock',
  },
  sakit: {
    label: 'Sakit',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-900',
    dot: 'bg-orange-500',
    icon: 'Thermometer',
  },
  alpha: {
    label: 'Alpha',
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-900',
    dot: 'bg-red-500',
    icon: 'XCircle',
  },
} as const;

// --- Navigation items ---

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Murid', href: '/dashboard/murid', icon: 'Users' },
  { label: 'Kelas', href: '/dashboard/kelas', icon: 'GraduationCap' },
  { label: 'Sesi', href: '/dashboard/sesi', icon: 'QrCode' },
  { label: 'SPP', href: '/dashboard/spp', icon: 'CreditCard' },
  { label: 'Rekap', href: '/dashboard/rekap', icon: 'BarChart3' },
] as const;

// --- Routes ---

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  MURID: '/dashboard/murid',
  KELAS: '/dashboard/kelas',
  SESI: '/dashboard/sesi',
  REKAP: '/dashboard/rekap',
} as const;

export const PUBLIC_ROUTES = ['/', '/login', '/auth/callback'];
export const PROTECTED_ROUTE_PREFIX = '/dashboard';

// --- Fonnte WhatsApp API ---

export const FONNTE_API_URL = 'https://api.fonnte.com/send';
export const FONNTE_COUNTRY_CODE = '62';
