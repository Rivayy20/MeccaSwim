import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format tanggal: "27 Mei 2026"
 */
export function formatTanggal(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'd MMMM yyyy', { locale: id });
}

/**
 * Format waktu: "09:00"
 */
export function formatWaktu(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm', { locale: id });
}

/**
 * Format tanggal + waktu: "27 Mei 2026, 09:00"
 */
export function formatTanggalWaktu(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'd MMMM yyyy, HH:mm', { locale: id });
}

/**
 * Format hari + tanggal: "Selasa, 27 Mei 2026"
 */
export function formatHariTanggal(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEEE, d MMMM yyyy', { locale: id });
}

/**
 * Format relatif: "Hari ini, 09:00" / "Kemarin, 14:30" / "3 hari yang lalu"
 */
export function formatRelatif(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return `Hari ini, ${format(d, 'HH:mm')}`;
  if (isYesterday(d)) return `Kemarin, ${format(d, 'HH:mm')}`;
  return formatDistanceToNow(d, { addSuffix: true, locale: id });
}

/**
 * Format bulan + tahun: "Mei 2026"
 */
export function formatBulanTahun(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMMM yyyy', { locale: id });
}

/**
 * Format tanggal pendek: "27/05/2026"
 */
export function formatTanggalPendek(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd/MM/yyyy');
}

/**
 * Format ISO date string: "2026-05-27"
 */
export function formatISO(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Hari pertama bulan ini
 */
export function getFirstDayOfMonth(date?: Date): Date {
  const d = date || new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * Hari terakhir bulan ini
 */
export function getLastDayOfMonth(date?: Date): Date {
  const d = date || new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

/**
 * Format hari: "Senin"
 */
export function formatHari(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEEE', { locale: id });
}
