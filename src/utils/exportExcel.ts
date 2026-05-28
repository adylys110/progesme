import * as XLSX from 'xlsx';
import { Activity, Project, Task } from '@/types';

// ─── helpers ────────────────────────────────────────────────────────────────

const fmt = (v?: string) => {
  if (!v) return '—';
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

const fmtStatus = (t: Task) => {
  if (t.completed) return 'Selesai ✓';
  if (t.status === 'in-progress') return 'Berlangsung';
  return 'Belum';
};

const fmtPriority = (p?: string) => {
  if (!p) return '—';
  return p === 'high' ? 'Tinggi' : p === 'medium' ? 'Sedang' : 'Rendah';
};

const fmtRecurrence = (r?: string) => {
  if (!r || r === 'none') return '—';
  if (r === 'daily') return 'Harian';
  if (r === 'weekly') return 'Mingguan';
  if (r === 'monthly') return 'Bulanan';
  if (r === 'yearly') return 'Tahunan';
  return r;
};

// ─── colour palettes ─────────────────────────────────────────────────────────

const PROJECT_PALETTE = {
  titleBg:     '1C1C6E',  // deep navy
  titleFg:     'FFFFFF',
  subtitleBg:  '3B3B9B',
  subtitleFg:  'E8E8FF',
  sectionBg:   'EBEBFF',
  sectionFg:   '1C1C6E',
  headerBg:    '4C5FD5',
  headerFg:    'FFFFFF',
  rowABg:      'F4F5FF',
  rowBBg:      'FDFEFF',
  borderClr:   'C5C8E8',
  labelFg:     '5B5FA8',
  valueFg:     '111144',
  completedBg: 'E8FFE8',
  progressBg:  'FFF8E1',
};

const ACTIVITY_PALETTE = {
  titleBg:     '0A4F3A',  // deep emerald
  titleFg:     'FFFFFF',
  subtitleBg:  '1A7A5A',
  subtitleFg:  'D8FFF0',
  sectionBg:   'E8FFF5',
  sectionFg:   '0A4F3A',
  headerBg:    '2ECC9A',
  headerFg:    '003325',
  rowABg:      'F0FFF9',
  rowBBg:      'FAFFFE',
  borderClr:   'AADDC8',
  labelFg:     '1A7A5A',
  valueFg:     '0A3325',
  completedBg: 'D0FFE8',
  progressBg:  'FFFDE0',
};

// ─── border helper ────────────────────────────────────────────────────────────

const border = (clr: string) => ({
  top:    { style: 'thin', color: { rgb: clr } },
  bottom: { style: 'thin', color: { rgb: clr } },
  left:   { style: 'thin', color: { rgb: clr } },
  right:  { style: 'thin', color: { rgb: clr } },
});

// ─── cell setter ─────────────────────────────────────────────────────────────

const setCell = (ws: XLSX.WorkSheet, r: number, c: number, v: string | number, s: any) => {
  const ref = XLSX.utils.encode_cell({ r, c });
  if (!ws[ref]) ws[ref] = { t: typeof v === 'number' ? 'n' : 's', v };
  ws[ref].s = s;
};

const mergeCells = (ws: XLSX.WorkSheet, r1: number, c1: number, r2: number, c2: number) => {
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push({ s: { r: r1, c: c1 }, e: { r: r2, c: c2 } });
};

// ─── download ────────────────────────────────────────────────────────────────

const download = (wb: XLSX.WorkBook, name: string) => {
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

// ─── PROJECT EXPORT ──────────────────────────────────────────────────────────

export function exportProjectReport(project: Project) {
  const P = PROJECT_PALETTE;
  const ws: XLSX.WorkSheet = {};
  const COLS = 8;

  // column widths
  ws['!cols'] = [
    { wch: 5 },   // No
    { wch: 30 },  // Tugas
    { wch: 16 },  // Status
    { wch: 12 },  // Prioritas
    { wch: 18 },  // Tenggat
    { wch: 14 },  // Estimasi
    { wch: 14 },  // Perulangan
    { wch: 22 },  // Label
  ];

  let row = 0;

  // ── Title row ──
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { t: 's', v: '  📋  LAPORAN PROYEK' };
  mergeCells(ws, row, 0, row, COLS - 1);
  for (let c = 0; c < COLS; c++) {
    const ref = XLSX.utils.encode_cell({ r: row, c });
    if (!ws[ref]) ws[ref] = { t: 's', v: '' };
    ws[ref].s = { font: { bold: true, sz: 18, color: { rgb: P.titleFg }, name: 'Calibri' }, fill: { fgColor: { rgb: P.titleBg }, patternType: 'solid' }, alignment: { vertical: 'center', horizontal: 'left', indent: 1 } };
  }
  ws['!rows'] = ws['!rows'] || [];
  ws['!rows'][row] = { hpt: 38 };
  row++;

  // ── Subtitle ──
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { t: 's', v: `  ${project.title}  •  Digenerate: ${fmt(new Date().toISOString())}` };
  mergeCells(ws, row, 0, row, COLS - 1);
  for (let c = 0; c < COLS; c++) {
    const ref = XLSX.utils.encode_cell({ r: row, c });
    if (!ws[ref]) ws[ref] = { t: 's', v: '' };
    ws[ref].s = { font: { sz: 10, color: { rgb: P.subtitleFg }, italic: true, name: 'Calibri' }, fill: { fgColor: { rgb: P.subtitleBg }, patternType: 'solid' }, alignment: { vertical: 'center', horizontal: 'left', indent: 1 } };
  }
  ws['!rows'][row] = { hpt: 22 };
  row++;

  // ── Blank gap ──
  row++;

  // ── Info section header ──
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { t: 's', v: '  INFORMASI PROYEK' };
  mergeCells(ws, row, 0, row, COLS - 1);
  for (let c = 0; c < COLS; c++) {
    const ref = XLSX.utils.encode_cell({ r: row, c });
    if (!ws[ref]) ws[ref] = { t: 's', v: '' };
    ws[ref].s = { font: { bold: true, sz: 11, color: { rgb: P.sectionFg }, name: 'Calibri' }, fill: { fgColor: { rgb: P.sectionBg }, patternType: 'solid' }, alignment: { vertical: 'center', horizontal: 'left', indent: 1 }, border: border(P.borderClr) };
  }
  ws['!rows'][row] = { hpt: 24 };
  row++;

  // ── Info rows (label | value spanning rest) ──
  const labelStyle = (odd: boolean) => ({
    font: { bold: true, sz: 10, color: { rgb: P.labelFg }, name: 'Calibri' },
    fill: { fgColor: { rgb: odd ? P.rowABg : P.rowBBg }, patternType: 'solid' },
    alignment: { vertical: 'center', horizontal: 'left', indent: 1 },
    border: border(P.borderClr),
  });
  const valueStyle = (odd: boolean) => ({
    font: { sz: 10, color: { rgb: P.valueFg }, name: 'Calibri' },
    fill: { fgColor: { rgb: odd ? P.rowABg : P.rowBBg }, patternType: 'solid' },
    alignment: { vertical: 'center', horizontal: 'left' },
    border: border(P.borderClr),
  });

  const infoRows: [string, string][] = [
    ['Nama Proyek',    project.title],
    ['Deskripsi',      project.description || '—'],
    ['Status',         project.status === 'active' ? 'Aktif' : project.status === 'completed' ? 'Selesai' : project.status === 'paused' ? 'Dijeda' : 'Diarsipkan'],
    ['Tanggal Mulai',  fmt(project.startDate)],
    ['Tenggat Waktu',  fmt(project.deadline)],
    ['Target Jam',     project.targetHours ? `${project.targetHours} jam` : '—'],
    ['Total Tugas',    `${project.tasks.length} tugas`],
    ['Sudah Selesai',  `${project.tasks.filter(t => t.completed).length} tugas`],
  ];

  infoRows.forEach(([label, val], i) => {
    const odd = i % 2 === 0;
    setCell(ws, row, 0, label, labelStyle(odd));
    // merge value across cols 1..COLS-1
    ws[XLSX.utils.encode_cell({ r: row, c: 1 })] = { t: 's', v: val };
    ws[XLSX.utils.encode_cell({ r: row, c: 1 })].s = valueStyle(odd);
    mergeCells(ws, row, 1, row, COLS - 1);
    for (let c = 2; c < COLS; c++) {
      const ref = XLSX.utils.encode_cell({ r: row, c });
      if (!ws[ref]) ws[ref] = { t: 's', v: '' };
      ws[ref].s = valueStyle(odd);
    }
    ws['!rows'] = ws['!rows'] || [];
    ws['!rows'][row] = { hpt: 20 };
    row++;
  });

  row++; // gap

  if (project.tasks.length === 0) {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Proyek');
    if (!ws['!ref']) ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: row, c: COLS - 1 } });
    download(wb, `laporan-proyek-${project.title.toLowerCase().replace(/\s+/g, '-')}.xlsx`);
    return;
  }

  // ── Task section header ──
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { t: 's', v: '  RINCIAN TUGAS' };
  mergeCells(ws, row, 0, row, COLS - 1);
  for (let c = 0; c < COLS; c++) {
    const ref = XLSX.utils.encode_cell({ r: row, c });
    if (!ws[ref]) ws[ref] = { t: 's', v: '' };
    ws[ref].s = { font: { bold: true, sz: 11, color: { rgb: P.sectionFg }, name: 'Calibri' }, fill: { fgColor: { rgb: P.sectionBg }, patternType: 'solid' }, alignment: { vertical: 'center', horizontal: 'left', indent: 1 }, border: border(P.borderClr) };
  }
  ws['!rows'][row] = { hpt: 24 };
  row++;

  // ── Table header ──
  const taskHeaders = ['No', 'Nama Tugas', 'Status', 'Prioritas', 'Tenggat', 'Estimasi', 'Perulangan', 'Label'];
  taskHeaders.forEach((h, c) => {
    ws[XLSX.utils.encode_cell({ r: row, c })] = {
      t: 's', v: h,
      s: { font: { bold: true, sz: 10, color: { rgb: P.headerFg }, name: 'Calibri' }, fill: { fgColor: { rgb: P.headerBg }, patternType: 'solid' }, alignment: { vertical: 'center', horizontal: 'center' }, border: border(P.borderClr) },
    };
  });
  ws['!rows'][row] = { hpt: 22 };
  row++;

  // ── Task data rows ──
  project.tasks.forEach((task, i) => {
    const odd = i % 2 === 0;
    const done = task.completed;
    const rowBg = done ? P.completedBg : (odd ? P.rowABg : P.rowBBg);

    const cells: (string | number)[] = [
      i + 1,
      task.title,
      fmtStatus(task),
      fmtPriority(task.priority),
      fmt(task.dueDate),
      task.estimatedMinutes ? `${task.estimatedMinutes} mnt` : '—',
      fmtRecurrence(task.recurrence),
      (task.tags || []).join(', ') || '—',
    ];

    cells.forEach((val, c) => {
      ws[XLSX.utils.encode_cell({ r: row, c })] = {
        t: typeof val === 'number' ? 'n' : 's', v: val,
        s: {
          font: { sz: 9, color: { rgb: P.valueFg }, name: 'Calibri', strike: done },
          fill: { fgColor: { rgb: rowBg }, patternType: 'solid' },
          alignment: { vertical: 'center', horizontal: c === 0 ? 'center' : 'left' },
          border: border(P.borderClr),
        },
      };
    });
    ws['!rows'][row] = { hpt: 18 };
    row++;
  });

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: row, c: COLS - 1 } });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Proyek');
  download(wb, `laporan-proyek-${project.title.toLowerCase().replace(/\s+/g, '-')}.xlsx`);
}

// ─── ACTIVITY EXPORT ─────────────────────────────────────────────────────────

export function exportActivityReport(activity: Activity) {
  const P = ACTIVITY_PALETTE;
  const ws: XLSX.WorkSheet = {};
  const COLS = 8;

  ws['!cols'] = [
    { wch: 5 },   // No
    { wch: 28 },  // Kebiasaan
    { wch: 16 },  // Status
    { wch: 14 },  // Perulangan
    { wch: 16 },  // Target / Due
    { wch: 14 },  // Riwayat Selesai
    { wch: 14 },  // Estimasi
    { wch: 20 },  // Label
  ];

  ws['!rows'] = [];
  let row = 0;

  // ── Title ──
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { t: 's', v: '  🌿  LAPORAN AKTIVITAS KEBIASAAN' };
  mergeCells(ws, row, 0, row, COLS - 1);
  for (let c = 0; c < COLS; c++) {
    const ref = XLSX.utils.encode_cell({ r: row, c });
    if (!ws[ref]) ws[ref] = { t: 's', v: '' };
    ws[ref].s = {
      font: { bold: true, sz: 18, color: { rgb: P.titleFg }, name: 'Calibri' },
      fill: { fgColor: { rgb: P.titleBg }, patternType: 'solid' },
      alignment: { vertical: 'center', horizontal: 'left', indent: 1 },
    };
  }
  ws['!rows'][row] = { hpt: 38 };
  row++;

  // ── Subtitle ──
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = {
    t: 's',
    v: `  ${activity.title}  •  Digenerate: ${fmt(new Date().toISOString())}`,
  };
  mergeCells(ws, row, 0, row, COLS - 1);
  for (let c = 0; c < COLS; c++) {
    const ref = XLSX.utils.encode_cell({ r: row, c });
    if (!ws[ref]) ws[ref] = { t: 's', v: '' };
    ws[ref].s = {
      font: { sz: 10, color: { rgb: P.subtitleFg }, italic: true, name: 'Calibri' },
      fill: { fgColor: { rgb: P.subtitleBg }, patternType: 'solid' },
      alignment: { vertical: 'center', horizontal: 'left', indent: 1 },
    };
  }
  ws['!rows'][row] = { hpt: 22 };
  row++;

  row++; // gap

  // ── Info section header ──
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { t: 's', v: '  INFORMASI AKTIVITAS' };
  mergeCells(ws, row, 0, row, COLS - 1);
  for (let c = 0; c < COLS; c++) {
    const ref = XLSX.utils.encode_cell({ r: row, c });
    if (!ws[ref]) ws[ref] = { t: 's', v: '' };
    ws[ref].s = {
      font: { bold: true, sz: 11, color: { rgb: P.sectionFg }, name: 'Calibri' },
      fill: { fgColor: { rgb: P.sectionBg }, patternType: 'solid' },
      alignment: { vertical: 'center', horizontal: 'left', indent: 1 },
      border: border(P.borderClr),
    };
  }
  ws['!rows'][row] = { hpt: 24 };
  row++;

  const labelStyle = (odd: boolean) => ({
    font: { bold: true, sz: 10, color: { rgb: P.labelFg }, name: 'Calibri' },
    fill: { fgColor: { rgb: odd ? P.rowABg : P.rowBBg }, patternType: 'solid' },
    alignment: { vertical: 'center', horizontal: 'left', indent: 1 },
    border: border(P.borderClr),
  });
  const valueStyle = (odd: boolean) => ({
    font: { sz: 10, color: { rgb: P.valueFg }, name: 'Calibri' },
    fill: { fgColor: { rgb: odd ? P.rowABg : P.rowBBg }, patternType: 'solid' },
    alignment: { vertical: 'center', horizontal: 'left' },
    border: border(P.borderClr),
  });

  const totalHistory = activity.tasks.reduce(
    (sum, t) => sum + (t.completionHistory?.length ?? 0), 0
  );
  const completedCount = activity.tasks.filter(
    (t) => t.completed || (t.completionHistory?.length ?? 0) > 0
  ).length;

  const infoRows: [string, string][] = [
    ['Nama Aktivitas',   activity.title],
    ['Kategori',         activity.category || 'Umum'],
    ['Deskripsi',        activity.description || '—'],
    ['Status',           activity.status === 'active' ? 'Aktif' : activity.status === 'completed' ? 'Selesai' : 'Dijeda'],
    ['Tanggal Mulai',    fmt(activity.startDate)],
    ['Total Kebiasaan',  `${activity.tasks.length} kebiasaan`],
    ['Pernah Selesai',   `${completedCount} kebiasaan`],
    ['Total Checklist',  `${totalHistory} kali`],
  ];

  infoRows.forEach(([label, val], i) => {
    const odd = i % 2 === 0;
    setCell(ws, row, 0, label, labelStyle(odd));
    ws[XLSX.utils.encode_cell({ r: row, c: 1 })] = { t: 's', v: val };
    ws[XLSX.utils.encode_cell({ r: row, c: 1 })].s = valueStyle(odd);
    mergeCells(ws, row, 1, row, COLS - 1);
    for (let c = 2; c < COLS; c++) {
      const ref = XLSX.utils.encode_cell({ r: row, c });
      if (!ws[ref]) ws[ref] = { t: 's', v: '' };
      ws[ref].s = valueStyle(odd);
    }
    ws['!rows'][row] = { hpt: 20 };
    row++;
  });

  row++; // gap

  if (activity.tasks.length === 0) {
    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: row, c: COLS - 1 } });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Aktivitas');
    download(wb, `laporan-aktivitas-${activity.title.toLowerCase().replace(/\s+/g, '-')}.xlsx`);
    return;
  }

  // ── Habit section header ──
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { t: 's', v: '  RINCIAN KEBIASAAN' };
  mergeCells(ws, row, 0, row, COLS - 1);
  for (let c = 0; c < COLS; c++) {
    const ref = XLSX.utils.encode_cell({ r: row, c });
    if (!ws[ref]) ws[ref] = { t: 's', v: '' };
    ws[ref].s = {
      font: { bold: true, sz: 11, color: { rgb: P.sectionFg }, name: 'Calibri' },
      fill: { fgColor: { rgb: P.sectionBg }, patternType: 'solid' },
      alignment: { vertical: 'center', horizontal: 'left', indent: 1 },
      border: border(P.borderClr),
    };
  }
  ws['!rows'][row] = { hpt: 24 };
  row++;

  // ── Table header ──
  const headers = ['No', 'Nama Kebiasaan', 'Status', 'Perulangan', 'Target / Tenggat', 'Riwayat', 'Estimasi', 'Label'];
  headers.forEach((h, c) => {
    ws[XLSX.utils.encode_cell({ r: row, c })] = {
      t: 's', v: h,
      s: {
        font: { bold: true, sz: 10, color: { rgb: P.headerFg }, name: 'Calibri' },
        fill: { fgColor: { rgb: P.headerBg }, patternType: 'solid' },
        alignment: { vertical: 'center', horizontal: 'center' },
        border: border(P.borderClr),
      },
    };
  });
  ws['!rows'][row] = { hpt: 22 };
  row++;

  // ── Habit data rows ──
  activity.tasks.forEach((task, i) => {
    const odd = i % 2 === 0;
    const done = task.completed || (task.completionHistory?.length ?? 0) > 0;
    const rowBg = done ? P.completedBg : (odd ? P.rowABg : P.rowBBg);
    const histCount = task.completionHistory?.length ?? 0;

    const cells: (string | number)[] = [
      i + 1,
      task.title,
      fmtStatus(task),
      fmtRecurrence(task.recurrence),
      fmt(task.dueDate),
      histCount > 0 ? `${histCount}× selesai` : '0× selesai',
      task.estimatedMinutes ? `${task.estimatedMinutes} mnt` : '—',
      (task.tags || []).join(', ') || '—',
    ];

    cells.forEach((val, c) => {
      ws[XLSX.utils.encode_cell({ r: row, c })] = {
        t: typeof val === 'number' ? 'n' : 's', v: val,
        s: {
          font: { sz: 9, color: { rgb: P.valueFg }, name: 'Calibri' },
          fill: { fgColor: { rgb: rowBg }, patternType: 'solid' },
          alignment: { vertical: 'center', horizontal: c === 0 ? 'center' : 'left' },
          border: border(P.borderClr),
        },
      };
    });
    ws['!rows'][row] = { hpt: 18 };
    row++;
  });

  // ── Consistency streak mini-table ──
  row++;
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { t: 's', v: '  RIWAYAT KONSISTENSI (7 HARI TERAKHIR PER KEBIASAAN)' };
  mergeCells(ws, row, 0, row, COLS - 1);
  for (let c = 0; c < COLS; c++) {
    const ref = XLSX.utils.encode_cell({ r: row, c });
    if (!ws[ref]) ws[ref] = { t: 's', v: '' };
    ws[ref].s = {
      font: { bold: true, sz: 11, color: { rgb: P.sectionFg }, name: 'Calibri' },
      fill: { fgColor: { rgb: P.sectionBg }, patternType: 'solid' },
      alignment: { vertical: 'center', horizontal: 'left', indent: 1 },
      border: border(P.borderClr),
    };
  }
  ws['!rows'][row] = { hpt: 24 };
  row++;

  // streak header: Kebiasaan | D-6 | D-5 | D-4 | D-3 | D-2 | D-1 | Hari ini
  const today = new Date();
  const dayLabels = Array.from({ length: 7 }, (_, k) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - k));
    return d.toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short' });
  });

  const streakHeaders = ['Kebiasaan', ...dayLabels, 'Streak'];
  const streakCols = streakHeaders.length;
  ws['!cols'] = [
    { wch: 26 },
    ...Array(7).fill({ wch: 14 }),
    { wch: 10 },
  ];

  streakHeaders.forEach((h, c) => {
    ws[XLSX.utils.encode_cell({ r: row, c })] = {
      t: 's', v: h,
      s: {
        font: { bold: true, sz: 9, color: { rgb: P.headerFg }, name: 'Calibri' },
        fill: { fgColor: { rgb: P.headerBg }, patternType: 'solid' },
        alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
        border: border(P.borderClr),
      },
    };
  });
  ws['!rows'][row] = { hpt: 28 };
  row++;

  activity.tasks.forEach((task, i) => {
    const odd = i % 2 === 0;
    const bg = odd ? P.rowABg : P.rowBBg;
    const history = new Set(task.completionHistory || []);

    // task name cell
    ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = {
      t: 's', v: task.title,
      s: { font: { sz: 9, bold: true, color: { rgb: P.valueFg }, name: 'Calibri' }, fill: { fgColor: { rgb: bg }, patternType: 'solid' }, alignment: { vertical: 'center', horizontal: 'left' }, border: border(P.borderClr) },
    };

    let streak = 0;
    for (let k = 6; k >= 0; k--) {
      const d = new Date(today);
      d.setDate(today.getDate() - k);
      const key = d.toISOString().slice(0, 10);
      const done = history.has(key) || (k === 0 && task.completed);
      const colIdx = 7 - k;
      ws[XLSX.utils.encode_cell({ r: row, c: colIdx })] = {
        t: 's', v: done ? '✓' : '·',
        s: {
          font: { sz: 11, bold: done, color: { rgb: done ? '1A7A5A' : 'AAAAAA' }, name: 'Calibri' },
          fill: { fgColor: { rgb: done ? P.completedBg : bg }, patternType: 'solid' },
          alignment: { vertical: 'center', horizontal: 'center' },
          border: border(P.borderClr),
        },
      };
      if (done) streak++; else if (k > 0) streak = 0;
    }

    // streak count
    ws[XLSX.utils.encode_cell({ r: row, c: 8 })] = {
      t: 'n', v: streak,
      s: {
        font: { sz: 10, bold: true, color: { rgb: streak >= 5 ? '0A4F3A' : P.valueFg }, name: 'Calibri' },
        fill: { fgColor: { rgb: streak >= 5 ? P.completedBg : bg }, patternType: 'solid' },
        alignment: { vertical: 'center', horizontal: 'center' },
        border: border(P.borderClr),
      },
    };

    ws['!rows'][row] = { hpt: 18 };
    row++;
  });

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: row, c: Math.max(COLS, streakCols) - 1 } });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Aktivitas');
  download(wb, `laporan-aktivitas-${activity.title.toLowerCase().replace(/\s+/g, '-')}.xlsx`);
}
