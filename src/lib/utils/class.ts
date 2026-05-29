import { Class } from '@/lib/types';

export const CLASS_DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] as const;

function getClassDayIndex(schedule: string | null) {
  if (!schedule) return CLASS_DAYS.length;
  const normalized = schedule.toLowerCase();
  const index = CLASS_DAYS.findIndex((day) => normalized.includes(day.toLowerCase()));
  return index < 0 ? CLASS_DAYS.length : index;
}

export function sortClassesByDay<T extends Pick<Class, 'nama' | 'jadwal'>>(classes: T[]): T[] {
  return [...classes].sort((left, right) => {
    const dayOrder = getClassDayIndex(left.jadwal) - getClassDayIndex(right.jadwal);
    if (dayOrder !== 0) return dayOrder;
    return left.nama.localeCompare(right.nama, 'id');
  });
}
