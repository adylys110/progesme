import * as XLSX from 'xlsx';
import { Activity, Project, Task } from '@/types';

const FONT_NAME = 'Times New Roman';

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatStatus = (task: Task) => {
  if (task.completed) return 'Selesai';
  return task.status === 'in-progress' ? 'Sedang Dikerjakan' : 'Belum Dikerjakan';
};

const styleCell = (cell: XLSX.CellObject | undefined, style: any) => {
  if (cell) cell.s = style;
};

const applyBorder = (range: string, ws: XLSX.WorkSheet) => {
  const r = XLSX.utils.decode_range(range);
  for (let R = r.s.r; R <= r.e.r; ++R) {
    for (let C = r.s.c; C <= r.e.c; ++C) {
      const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
      if (!cell) continue;
      cell.s = {
        ...(cell.s || {}),
        border: {
          top: { style: 'thin', color: { rgb: 'D0D7DE' } },
          bottom: { style: 'thin', color: { rgb: 'D0D7DE' } },
          left: { style: 'thin', color: { rgb: 'D0D7DE' } },
          right: { style: 'thin', color: { rgb: 'D0D7DE' } },
        },
      };
    }
  }
};

const makeWorkbook = (title: string, subtitle: string, summaryRows: (string | number)[][], tableRows?: (string | number)[][]) => {
  const ws = XLSX.utils.aoa_to_sheet([]);
  const rows = [...summaryRows, ...(tableRows || [])];
  XLSX.utils.sheet_add_aoa(ws, rows, { origin: 'A1' });

  ws['!cols'] = [
    { wch: 6 },
    { wch: 32 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 24 },
  ];
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
  ];

  const baseStyle = { font: { name: FONT_NAME, sz: 10, color: { rgb: '23395D' } } };
  const titleStyle = { font: { name: FONT_NAME, bold: true, sz: 16, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '2F6FED' }, patternType: 'solid' }, alignment: { vertical: 'center', horizontal: 'left' } };
  const subtitleStyle = { font: { name: FONT_NAME, sz: 10, color: { rgb: '23395D' } }, fill: { fgColor: { rgb: 'EEF4FF' }, patternType: 'solid' }, alignment: { vertical: 'center', horizontal: 'left' } };
  const headerStyle = { font: { name: FONT_NAME, bold: true, sz: 10, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '4C6FFF' }, patternType: 'solid' }, alignment: { horizontal: 'center', vertical: 'center' }, border: { top: { style: 'thin', color: { rgb: 'D0D7DE' } }, bottom: { style: 'thin', color: { rgb: 'D0D7DE' } }, left: { style: 'thin', color: { rgb: 'D0D7DE' } }, right: { style: 'thin', color: { rgb: 'D0D7DE' } } } };
  const dataStyle = { font: { name: FONT_NAME, sz: 9, color: { rgb: '23395D' } }, alignment: { vertical: 'center', horizontal: 'left' }, border: { top: { style: 'thin', color: { rgb: 'E5EAF2' } }, bottom: { style: 'thin', color: { rgb: 'E5EAF2' } }, left: { style: 'thin', color: { rgb: 'E5EAF2' } }, right: { style: 'thin', color: { rgb: 'E5EAF2' } } } };

  for (let r = 0; r < rows.length; r += 1) {
    for (let c = 0; c < 7; c += 1) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      const cell = ws[cellRef];
      if (!cell) continue;
      cell.s = { ...(cell.s || {}), ...baseStyle };
      if (r === 0) cell.s = { ...cell.s, ...titleStyle };
      if (r === 1) cell.s = { ...cell.s, ...subtitleStyle };
      if (r >= 3 && tableRows && r >= 3 && r < 3 + (tableRows.length) && c < 7) cell.s = { ...cell.s, ...dataStyle };
    }
  }

  if (tableRows && tableRows.length > 0) {
    const headerRow = summaryRows.length + 1;
    for (let c = 0; c < 7; c += 1) {
      const cell = ws[XLSX.utils.encode_cell({ r: headerRow - 1, c })];
      styleCell(cell, headerStyle);
    }
    const dataStart = summaryRows.length + 2;
    const dataEnd = dataStart + tableRows.length - 2;
    for (let r = dataStart; r <= dataEnd; r += 1) {
      for (let c = 0; c < 7; c += 1) {
        const cell = ws[XLSX.utils.encode_cell({ r, c })];
        styleCell(cell, dataStyle);
      }
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
  return wb;
};

const downloadWorkbook = (workbook: XLSX.WorkBook, fileName: string) => {
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export function exportProjectReport(project: Project) {
  const taskRows = project.tasks.map((task, index) => [
    index + 1,
    task.title,
    formatStatus(task),
    task.priority?.toUpperCase() || '-',
    formatDate(task.dueDate),
    task.estimatedMinutes ? `${task.estimatedMinutes} menit` : '-',
    (task.tags || []).join(', ') || '-',
  ]);

  const summaryRows = [
    ['LAPORAN PROYEK'],
    [project.title],
    ['Deskripsi', project.description || '-'],
    ['Tanggal Mulai', formatDate(project.startDate)],
    ['Tenggat', formatDate(project.deadline)],
    ['Status', project.status],
    ['Target Jam', project.targetHours ? `${project.targetHours} jam` : '-'],
  ];

  const tableRows = taskRows.length > 0
    ? [['No', 'Tugas', 'Status', 'Prioritas', 'Tanggal', 'Estimasi', 'Label'], ...taskRows]
    : undefined;

  const workbook = makeWorkbook('LAPORAN PROYEK', `${project.title} • ${project.tasks.length} tugas`, summaryRows, tableRows);
  downloadWorkbook(workbook, `laporan-proyek-${project.title.toLowerCase().replace(/\s+/g, '-')}.xlsx`);
}

export function exportActivityReport(activity: Activity) {
  const taskRows = activity.tasks.map((task, index) => [
    index + 1,
    task.title,
    formatStatus(task),
    task.recurrence ? task.recurrence.toUpperCase() : '-',
    formatDate(task.dueDate),
    task.completionHistory?.length ? `${task.completionHistory.length} kali` : '0 kali',
    task.tags?.join(', ') || '-',
  ]);

  const summaryRows = [
    ['LAPORAN AKTIVITAS'],
    [activity.title],
    ['Kategori', activity.category || 'Umum'],
    ['Deskripsi', activity.description || '-'],
    ['Jumlah Kebiasaan', activity.tasks.length],
    ['Total Selesai', activity.tasks.filter((t) => t.completed || t.completionHistory?.length).length],
  ];

  const tableRows = taskRows.length > 0
    ? [['No', 'Kebiasaan', 'Status', 'Perulangan', 'Target', 'Riwayat', 'Label'], ...taskRows]
    : undefined;

  const workbook = makeWorkbook('LAPORAN AKTIVITAS', `${activity.title} • ${activity.tasks.length} kebiasaan`, summaryRows, tableRows);
  downloadWorkbook(workbook, `laporan-aktivitas-${activity.title.toLowerCase().replace(/\s+/g, '-')}.xlsx`);
}
