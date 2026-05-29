import { AttendanceStatus, ServiceResult } from '@/lib/types';
import { FONNTE_API_URL, FONNTE_COUNTRY_CODE } from '@/lib/constants';

export async function sendWhatsAppNotification(
  phoneNumber: string,
  message: string
): Promise<ServiceResult<null>> {
  try {
    const token = process.env.FONNTE_TOKEN;
    if (!token) {
      console.warn('Fonnte WhatsApp Token (FONNTE_TOKEN) belum dikonfigurasi di environment. Notifikasi dilewati.');
      return { data: null, error: null }; // Skip silently
    }

    // Format phone number to clean string
    let formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith('62') && !formattedPhone.startsWith('6')) {
      formattedPhone = '62' + formattedPhone;
    }

    const response = await fetch(FONNTE_API_URL, {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: formattedPhone,
        message,
        countryCode: FONNTE_COUNTRY_CODE,
      }),
    });

    const result = await response.json();
    if (!response.ok || !result.status) {
      return { data: null, error: result.reason || 'Gagal mengirim pesan WhatsApp' };
    }

    return { data: null, error: null };
  } catch (err) {
    console.error('Error sending WhatsApp notification:', err);
    return { data: null, error: 'Terjadi kesalahan saat mengirim notifikasi' };
  }
}

export function buildAttendanceMessage(
  studentName: string,
  className: string,
  date: string,
  time: string,
  status: AttendanceStatus
): string {
  const emojiMap = {
    hadir: '✅',
    izin: '📋',
    sakit: '🤒',
    alpha: '❌',
  };

  const statusTextMap = {
    hadir: 'Hadir latihan renang',
    izin: 'Izin tidak latihan renang (Ada Keperluan)',
    sakit: 'Izin Sakit (Tidak bisa latihan renang)',
    alpha: 'Absen tanpa keterangan (Alpha)',
  };

  const emoji = emojiMap[status] || '📋';
  const statusText = statusTextMap[status] || status;

  return `*MECCA SWIM — LAPORAN PRESENSI* 🏊

Halo Bapak/Ibu Orang Tua dari *${studentName}*,

Berikut adalah laporan kehadiran anak Anda pada:
📅 Hari/Tanggal: *${date}*
⏰ Waktu Scan: *${time}*
🏫 Kelas: *${className}*
Status: *${emoji} ${statusText}*

Terima kasih atas perhatiannya. Tetap semangat latihan! 🏊‍♂️✨`;
}

export function buildMonthlyRecapMessage(
  studentName: string,
  monthName: string,
  totalSessions: number,
  hadirCount: number,
  percentage: number
): string {
  const statusEmoji = percentage >= 80 ? '🌟' : percentage >= 50 ? '📈' : '⚠️';

  return `*MECCA SWIM — REKAP BULANAN* 🏊

Halo Bapak/Ibu Orang Tua dari *${studentName}*,

Berikut adalah rekap presensi renang untuk bulan *${monthName}*:
📊 Total Sesi Kelas: *${totalSessions}* kali
✅ Jumlah Kehadiran: *${hadirCount}* kali
📉 Persentase Kehadiran: *${percentage}%*

Evaluasi: ${statusEmoji} *${
    percentage >= 80
      ? 'Sangat Baik! Pertahankan prestasinya.'
      : percentage >= 50
      ? 'Cukup Baik. Yuk lebih rajin lagi latihannya!'
      : 'Perlu Ditingkatkan. Diusahakan untuk tidak absen ya.'
  }*

Terima kasih atas kerja samanya.
Mecca Swim. 🏊‍♂️✨`;
}
