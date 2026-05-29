import ExcelJS from 'exceljs';
import { MonthlyRecapResult } from '@/services/attendance.service';
import { SessionWithClass } from '@/lib/types';
import { formatTanggalPendek, formatHari } from '@/lib/utils/date';
import { SPPPayment } from '@/services/spp.service';

/**
 * Ekspor data rekap presensi bulanan murid ke file Excel (.xlsx) dengan formatting,
 * warna indikator kehadiran (Hadir: Hijau, Izin/Sakit: Orange, Alpha: Merah),
 * layout auto-width, zebra-striping, dan metadata yang rapi.
 */
export async function exportRecapToExcel(
  recapData: MonthlyRecapResult[],
  sessions: SessionWithClass[],
  className: string,
  monthLabel: string,
  year: number,
  filename: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Rekap Presensi');

  // 1. Tambah Judul Rekap di bagian atas
  const endColIndex = 7 + sessions.length; // No (1), Nama (2), H (3), I (4), S (5), A (6), % (7) + Tanggal-tanggal
  const endColName = getExcelColumnName(endColIndex);

  worksheet.mergeCells(`A1:${endColName}1`);
  const titleRow = worksheet.getRow(1);
  titleRow.height = 40;
  
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'REKAPITULASI KEHADIRAN MURID';
  titleCell.font = {
    name: 'Segoe UI',
    family: 4,
    size: 16,
    bold: true,
    color: { argb: 'FFFFFF' },
  };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '0891B2' }, // Mecca Swim Cyan-Teal
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // 2. Tambah Metadata / Info Kelas (Baris 3 dan 4)
  worksheet.getCell('A3').value = 'Kelas Renang :';
  worksheet.getCell('A3').font = { bold: true, name: 'Segoe UI' };
  worksheet.getCell('B3').value = className;
  worksheet.getCell('B3').font = { name: 'Segoe UI' };

  worksheet.getCell('A4').value = 'Periode Latih :';
  worksheet.getCell('A4').font = { bold: true, name: 'Segoe UI' };
  worksheet.getCell('B4').value = `${monthLabel} ${year}`;
  worksheet.getCell('B4').font = { name: 'Segoe UI' };

  worksheet.getCell('D3').value = 'Total Sesi Latihan :';
  worksheet.getCell('D3').font = { bold: true, name: 'Segoe UI' };
  worksheet.getCell('E3').value = `${sessions.length} Sesi`;
  worksheet.getCell('E3').font = { name: 'Segoe UI' };

  // 3. Tambah Tabel Header (Baris 6)
  const headerRowIndex = 6;
  const headers = [
    'No',
    'Nama Murid',
    'Hadir',
    'Izin',
    'Sakit',
    'Alpha',
    'Persentase',
    ...sessions.map((sess) => {
      const day = formatHari(sess.tanggal);
      const shortDay = day.substring(0, 3);
      const dateStr = formatTanggalPendek(sess.tanggal).substring(0, 5);
      const className = sess.classes?.nama ? `\n(${sess.classes.nama})` : '';
      return `${shortDay}, ${dateStr}${className}`;
    }),
  ];

  const headerRow = worksheet.getRow(headerRowIndex);
  headerRow.height = 36;
  headerRow.values = headers;

  // Style Header
  headers.forEach((_, colIdx) => {
    const cell = headerRow.getCell(colIdx + 1);
    cell.font = {
      name: 'Segoe UI',
      bold: true,
      size: 11,
      color: { argb: 'FFFFFF' },
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '06B6D4' }, // Mecca Swim primary Cyan
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: colIdx === 1 ? 'left' : 'center',
      wrapText: true,
    };
    cell.border = {
      top: { style: 'thin', color: { argb: '164E63' } },
      bottom: { style: 'medium', color: { argb: '164E63' } },
      left: { style: 'thin', color: { argb: '164E63' } },
      right: { style: 'thin', color: { argb: '164E63' } },
    };
  });

  // 4. Tambah Baris Data (Mulai Baris 7)
  const startRowData = 7;
  recapData.forEach((row, rowIdx) => {
    const currentIdx = startRowData + rowIdx;
    const dataRow = worksheet.getRow(currentIdx);
    dataRow.height = 22;

    const values = [
      rowIdx + 1, // No
      row.student.nama, // Nama Murid
      row.summary.hadir, // Hadir
      row.summary.izin, // Izin
      row.summary.sakit, // Sakit
      row.summary.alpha, // Alpha
      `${row.summary.rate}%`, // Persentase
      // Status kehadiran per sesi
      ...sessions.map((sess) => {
        const att = row.attendances[sess.id];
        return att ? att.status.toUpperCase() : '-';
      }),
    ];

    dataRow.values = values;

    // Zebra striping background color
    const isEven = rowIdx % 2 === 0;
    const bgRowColor = isEven ? 'FFFFFF' : 'F8FAFC';

    // Style data cell
    values.forEach((val, colIdx) => {
      const cell = dataRow.getCell(colIdx + 1);
      
      // Default Font & Fill
      cell.font = { name: 'Segoe UI', size: 10 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgRowColor },
      };
      
      // Alignment
      cell.alignment = {
        vertical: 'middle',
        horizontal: colIdx === 1 ? 'left' : 'center',
      };

      // Border tipis untuk grid
      cell.border = {
        top: { style: 'thin', color: { argb: 'E2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
        left: { style: 'thin', color: { argb: 'E2E8F0' } },
        right: { style: 'thin', color: { argb: 'E2E8F0' } },
      };

      // Style No & Nama Murid
      if (colIdx === 0) {
        cell.font = { name: 'Segoe UI', size: 10, color: { argb: '64748B' } };
      }
      if (colIdx === 1) {
        cell.font = { name: 'Segoe UI', size: 10, bold: true };
      }

      // Pewarnaan Kolom Rekap (Hadir, Izin, Sakit, Alpha)
      if (colIdx >= 2 && colIdx <= 5) {
        cell.font = { name: 'Segoe UI', size: 10, bold: true };
        const numVal = Number(val);
        if (numVal > 0) {
          if (colIdx === 2) cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '16A34A' } }; // Hijau
          if (colIdx === 3) cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'D97706' } }; // Kuning/Orange
          if (colIdx === 4) cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'EA580C' } }; // Orange Tua
          if (colIdx === 5) cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'DC2626' } }; // Merah
        }
      }

      // Style Persentase Kehadiran
      if (colIdx === 6) {
        const percentageValue = row.summary.rate;
        cell.font = {
          name: 'Segoe UI',
          size: 10,
          bold: true,
          color: percentageValue >= 80 ? { argb: '16A34A' } : { argb: 'DC2626' }, // Merah jika di bawah 80%
        };
      }

      // Pewarnaan Sel Presensi Dinamis per Tanggal
      if (colIdx >= 7) {
        const valStr = String(val).toUpperCase();
        if (valStr === 'HADIR') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'DCFCE7' }, // Light Green background
          };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '15803D' } }; // Dark Green Text
        } else if (valStr === 'IZIN') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FEF3C7' }, // Light Yellow background
          };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'B45309' } }; // Dark Yellow Text
        } else if (valStr === 'SAKIT') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEDD5' }, // Light Orange background
          };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'C2410C' } }; // Dark Orange Text
        } else if (valStr === 'ALPHA') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FEE2E2' }, // Light Red background
          };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'B91C1C' } }; // Dark Red Text
        } else if (valStr === '-') {
          cell.font = { name: 'Segoe UI', size: 10, color: { argb: '94A3B8' } };
        }
      }
    });
  });

  // 5. Auto-fit kolom dengan batas aman
  worksheet.columns.forEach((column) => {
    let maxLen = 0;
    column.eachCell!({ includeEmpty: true }, (cell, rowNum) => {
      // Abaikan baris judul gabungan 1 agar lebar kolom tidak ditarik terlalu lebar
      if (rowNum === 1) return;
      
      const valStr = cell.value ? String(cell.value) : '';
      if (valStr.length > maxLen) {
        maxLen = valStr.length;
      }
    });
    // Set minimal dan tambahan padding
    column.width = Math.max(8, maxLen + 4);
  });

  // Khusus No (Col 1) dan Persentase (Col 7) diringkas lebarnya
  const colNo = worksheet.getColumn(1);
  colNo.width = 6;
  
  const colNama = worksheet.getColumn(2);
  colNama.width = 25; // Lebar standar nama murid

  // 6. Tulis file Excel ke stream dan download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();

  // Clean-up
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Mengonversi indeks kolom angka (1-based) menjadi huruf Excel (e.g. 1 -> A, 27 -> AA).
 */
function getExcelColumnName(colIndex: number): string {
  let name = '';
  let tempIdx = colIndex;
  while (tempIdx > 0) {
    const modulo = (tempIdx - 1) % 26;
    name = String.fromCharCode(65 + modulo) + name;
    tempIdx = Math.floor((tempIdx - modulo) / 26);
  }
  return name;
}

/**
 * Ekspor data pembayaran SPP bulanan ke file Excel (.xlsx) dengan formatting,
 * zebra-striping, dan visualisasi status lunas (hijau) / belum bayar (merah) yang rapi.
 */
export async function exportSPPToExcel(
  paymentsData: SPPPayment[],
  monthLabel: string,
  year: number,
  summary: { totalTagihan: number; totalTerbayar: number; totalPiutang: number },
  filename: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Laporan SPP');

  // 1. Judul Rekap di bagian atas
  worksheet.mergeCells('A1:I1');
  const titleRow = worksheet.getRow(1);
  titleRow.height = 40;
  
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'LAPORAN PEMBAYARAN SPP BULANAN';
  titleCell.font = {
    name: 'Segoe UI',
    family: 4,
    size: 16,
    bold: true,
    color: { argb: 'FFFFFF' },
  };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '0284C7' }, // Sky Blue
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // 2. Metadata / Info SPP (Baris 3 dan 4)
  worksheet.getCell('A3').value = 'Periode :';
  worksheet.getCell('A3').font = { bold: true, name: 'Segoe UI' };
  worksheet.getCell('B3').value = `${monthLabel} ${year}`;
  worksheet.getCell('B3').font = { name: 'Segoe UI' };

  worksheet.getCell('D3').value = 'Total Terbayar :';
  worksheet.getCell('D3').font = { bold: true, name: 'Segoe UI' };
  worksheet.getCell('E3').value = summary.totalTerbayar;
  worksheet.getCell('E3').numFmt = '"Rp"#,##0';
  worksheet.getCell('E3').font = { name: 'Segoe UI', bold: true, color: { argb: '16A34A' } };

  worksheet.getCell('D4').value = 'Sisa Piutang :';
  worksheet.getCell('D4').font = { bold: true, name: 'Segoe UI' };
  worksheet.getCell('E4').value = summary.totalPiutang;
  worksheet.getCell('E4').numFmt = '"Rp"#,##0';
  worksheet.getCell('E4').font = { name: 'Segoe UI', bold: true, color: { argb: 'DC2626' } };

  worksheet.getCell('G3').value = 'Total Target :';
  worksheet.getCell('G3').font = { bold: true, name: 'Segoe UI' };
  worksheet.getCell('H3').value = summary.totalTagihan;
  worksheet.getCell('H3').numFmt = '"Rp"#,##0';
  worksheet.getCell('H3').font = { name: 'Segoe UI', bold: true, color: { argb: '0284C7' } };

  // 3. Tabel Header (Baris 6)
  const headerRowIndex = 6;
  const headers = [
    'No',
    'Nama Murid',
    'Kelas Latihan',
    'Jenis SPP',
    'Nominal Tagihan',
    'Status Pembayaran',
    'Metode Bayar',
    'Tanggal Bayar',
    'Catatan',
  ];

  const headerRow = worksheet.getRow(headerRowIndex);
  headerRow.height = 30;
  headerRow.values = headers;

  headers.forEach((_, colIdx) => {
    const cell = headerRow.getCell(colIdx + 1);
    cell.font = {
      name: 'Segoe UI',
      bold: true,
      size: 11,
      color: { argb: 'FFFFFF' },
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0EA5E9' }, // Mecca Swim primary Sky
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: colIdx === 0 ? 'center' : (colIdx === 1 || colIdx === 2 || colIdx === 3 || colIdx === 8 ? 'left' : 'center'),
    };
    cell.border = {
      top: { style: 'thin', color: { argb: '0369A1' } },
      bottom: { style: 'medium', color: { argb: '0369A1' } },
      left: { style: 'thin', color: { argb: '0369A1' } },
      right: { style: 'thin', color: { argb: '0369A1' } },
    };
  });

  // 4. Baris Data (Mulai Baris 7)
  const startRowData = 7;
  paymentsData.forEach((row, rowIdx) => {
    const currentIdx = startRowData + rowIdx;
    const dataRow = worksheet.getRow(currentIdx);
    dataRow.height = 22;

    let tglBayar = '-';
    if (row.status === 'lunas' && row.tanggal_bayar) {
      tglBayar = new Date(row.tanggal_bayar).toLocaleDateString('id-ID');
    }

    let jenisSpp = 'Bulanan';
    if (row.tipe === 'harian') {
      const dStr = row.tanggal_tagihan 
        ? new Date(row.tanggal_tagihan).toLocaleDateString('id-ID')
        : '-';
      jenisSpp = `Harian (${dStr})`;
    } else if (row.tipe === 'mingguan') {
      jenisSpp = `Mingguan (Minggu ${row.minggu})`;
    }

    const values = [
      rowIdx + 1, // No
      row.student?.nama || '-', // Nama Murid
      row.student?.classes?.nama || '-', // Kelas Latihan
      jenisSpp, // Jenis SPP
      row.jumlah, // Nominal Tagihan
      row.status === 'lunas' ? 'LUNAS' : 'BELUM BAYAR', // Status
      row.metode_bayar ? row.metode_bayar.toUpperCase() : '-', // Metode
      tglBayar, // Tanggal Bayar
      row.catatan || '-', // Catatan
    ];

    dataRow.values = values;

    const isEven = rowIdx % 2 === 0;
    const bgRowColor = isEven ? 'FFFFFF' : 'F8FAFC';

    values.forEach((val, colIdx) => {
      const cell = dataRow.getCell(colIdx + 1);
      
      // Default Font & Fill
      cell.font = { name: 'Segoe UI', size: 10 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgRowColor },
      };
      
      // Alignment
      cell.alignment = {
        vertical: 'middle',
        horizontal: colIdx === 0 ? 'center' : (colIdx === 1 || colIdx === 2 || colIdx === 3 || colIdx === 8 ? 'left' : 'center'),
      };

      // Border tipis
      cell.border = {
        top: { style: 'thin', color: { argb: 'E2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
        left: { style: 'thin', color: { argb: 'E2E8F0' } },
        right: { style: 'thin', color: { argb: 'E2E8F0' } },
      };

      // Style No & Nama Murid
      if (colIdx === 0) {
        cell.font = { name: 'Segoe UI', size: 10, color: { argb: '64748B' } };
      }
      if (colIdx === 1) {
        cell.font = { name: 'Segoe UI', size: 10, bold: true };
      }

      // Format mata uang untuk Nominal
      if (colIdx === 4) {
        cell.numFmt = '"Rp"#,##0';
        cell.font = { name: 'Segoe UI', size: 10, bold: true };
      }

      // Warna Status
      if (colIdx === 5) {
        if (row.status === 'lunas') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'DCFCE7' }, // Hijau muda
          };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '15803D' } };
        } else {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FEE2E2' }, // Merah muda
          };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'B91C1C' } };
        }
      }

      if (val === '-' || val === '') {
        cell.font = { name: 'Segoe UI', size: 10, color: { argb: '94A3B8' } };
      }
    });
  });

  // 5. Auto-fit columns
  worksheet.columns.forEach((column) => {
    let maxLen = 0;
    column.eachCell!({ includeEmpty: true }, (cell, rowNum) => {
      if (rowNum === 1) return;
      const valStr = cell.value ? String(cell.value) : '';
      if (valStr.length > maxLen) {
        maxLen = valStr.length;
      }
    });
    column.width = Math.max(10, maxLen + 4);
  });

  worksheet.getColumn(1).width = 6;  // No
  worksheet.getColumn(2).width = 25; // Nama
  worksheet.getColumn(3).width = 18; // Kelas
  worksheet.getColumn(4).width = 18; // Jenis SPP
  worksheet.getColumn(5).width = 18; // Nominal
  worksheet.getColumn(6).width = 18; // Status
  worksheet.getColumn(7).width = 15; // Metode
  worksheet.getColumn(8).width = 18; // Tanggal
  worksheet.getColumn(9).width = 30; // Catatan

  // 6. Download file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

