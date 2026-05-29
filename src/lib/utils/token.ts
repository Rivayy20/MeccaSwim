/**
 * Generate random alphanumeric token using Web Crypto API.
 */
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join('');
}

/**
 * Build full URL untuk QR scan page.
 * Output: `{baseUrl}/scan/{token}`
 */
export function buildScanUrl(baseUrl: string, qrToken: string): string {
  return `${baseUrl}/scan/${qrToken}`;
}

/**
 * Build full URL untuk portal orang tua.
 * Output: `{baseUrl}/murid/{linkToken}`
 */
export function buildPortalUrl(baseUrl: string, linkToken: string): string {
  return `${baseUrl}/murid/${linkToken}`;
}

/**
 * Cek apakah token sudah expired berdasarkan waktu expiry.
 */
export function isTokenExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  const expDate = new Date(expiresAt);
  if (expDate.getFullYear() >= 9000) return false; // Unlimited
  return expDate < new Date();
}

/**
 * Hitung sisa waktu dalam detik dari waktu expiry.
 * Returns -1 jika unlimited, 0 jika sudah expired.
 */
export function getTimeRemaining(expiresAt: string | null): number {
  if (!expiresAt) return -1;
  const expDate = new Date(expiresAt);
  if (expDate.getFullYear() >= 9000) return -1; // Unlimited
  
  const diff = expDate.getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 1000));
}

/**
 * Tentukan warna timer berdasarkan sisa waktu.
 * Hijau (>50% atau unlimited) → Kuning (>20%) → Merah (<=20%)
 */
export function getTimerColor(secondsRemaining: number, totalSeconds: number = 900): 'green' | 'yellow' | 'red' {
  if (secondsRemaining === -1) return 'green';
  const ratio = secondsRemaining / totalSeconds;
  if (ratio > 0.5) return 'green';
  if (ratio > 0.2) return 'yellow';
  return 'red';
}

/**
 * Map timer color ke Tailwind text class.
 */
export function getTimerTextClass(color: 'green' | 'yellow' | 'red'): string {
  const map = {
    green: 'text-emerald-500',
    yellow: 'text-amber-500',
    red: 'text-red-500',
  };
  return map[color];
}

/**
 * Map timer color ke Tailwind background class.
 */
export function getTimerBgClass(color: 'green' | 'yellow' | 'red'): string {
  const map = {
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-red-500',
  };
  return map[color];
}

/**
 * Format detik ke "MM:SS".
 */
export function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
