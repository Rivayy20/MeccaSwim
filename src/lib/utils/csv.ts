// ============================================================
// CSV generation & download utility
// ============================================================

export interface CSVColumn<T> {
  header: string;
  accessor: (item: T) => string | number;
}

/**
 * Generate CSV string dari array data.
 * Handles escaping values yang mengandung comma, quote, atau newline.
 */
export function generateCSV<T>(data: T[], columns: CSVColumn<T>[]): string {
  const headers = columns.map((col) => escapeCSVValue(col.header)).join(',');

  const rows = data.map((item) =>
    columns.map((col) => escapeCSVValue(String(col.accessor(item)))).join(',')
  );

  return [headers, ...rows].join('\n');
}

/**
 * Escape CSV value: wrap in quotes jika mengandung karakter special.
 */
function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Download CSV string sebagai file.
 * Menambahkan UTF-8 BOM agar kompatibel dengan Excel.
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
