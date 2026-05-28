import XLSXStyle from 'xlsx-js-style';
import { Activity, Project, Task } from '@/types';

// ─── date & label helpers ────────────────────────────────────────────────────

const fmt = (v?: string) => {
  if (!v) return '—';
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

const fmtStatus = (t: Task) => {
  if (t.completed) return '✅ Selesai';
  if (t.status === 'in-progress') return '🔄 Berlangsung';
  return '⬜ Belum';
};

const fmtPriority = (p?: string) => {
  if (!p) return '—';
  return p === 'high' ? '🔴 Tinggi' : p === 'medium' ? '🟡 Sedang' : '🟢 Rendah';
};

const fmtRecurrence = (r?: string) => {
  const map: Record<string, string> = { daily: '🔁 Harian', weekly: '📅 Mingguan', monthly: '🗓 Bulanan', yearly: '🎯 Tahunan', none: '—' };
  return (r && map[r]) ? map[r] : '—';
};

// ─── style builders ──────────────────────────────────────────────────────────

type Align = 'left' | 'center' | 'right';

const s = (
  bgHex: string,
  fgHex: string,
  bold = false,
  sz = 10,
  align: Align = 'left',
  italic = false,
  border = true,
  wrapText = false,
) => ({
  font: { name: 'Calibri', sz, bold, italic, color: { rgb: fgHex } },
  fill: { fgColor: { rgb: bgHex }, patternType: 'solid' as const },
  alignment: { horizontal: align, vertical: 'center' as const, wrapText },
  border: border ? {
    top:    { style: 'thin', color: { rgb: 'C8C8C8' } },
    bottom: { style: 'thin', color: { rgb: 'C8C8C8' } },
    left:   { style: 'thin', color: { rgb: 'C8C8C8' } },
    right:  { style: 'thin', color: { rgb: 'C8C8C8' } },
  } : {},
});

const noBorder = (bgHex: string, fgHex: string, bold = false, sz = 10, align: Align = 'left') =>
  s(bgHex, fgHex, bold, sz, align, false, false);

// ─── worksheet builder helpers ───────────────────────────────────────────────

const cell = (v: string | number, style: object): XLSXStyle.CellObject => ({
  v,
  t: typeof v === 'number' ? 'n' : 's',
  s: style,
});

const empty = (style: object): XLSXStyle.CellObject => ({ v: '', t: 's', s: style });

type SheetRow = XLSXStyle.CellObject[];

const merge = (r1: number, c1: number, r2: number, c2: number): XLSXStyle.Range => ({
  s: { r: r1, c: c1 },
  e: { r: r2, c: c2 },
});

// ─── download ────────────────────────────────────────────────────────────────

const download = (wb: XLSXStyle.WorkBook, name: string) => {
  const buf = XLSXStyle.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

// ─── progress bar (text) ─────────────────────────────────────────────────────

const progressBar = (pct: number, len = 20) => {
  const filled = Math.round((pct / 100) * len);
  return '█'.repeat(filled) + '░'.repeat(len - filled) + `  ${pct}%`;
};

// ════════════════════════════════════════════════════════════════════════════
//  PROJECT EXPORT
// ════════════════════════════════════════════════════════════════════════════

export function exportProjectReport(project: Project) {
  // Colour palette — deep navy theme
  const C = {
    navyDark:  '0D1B4B',
    navy:      '1A3A8F',
    navyMid:   '2D5BE3',
    navyLight: 'E8EEFF',
    navyPale:  'F4F6FF',
    white:     'FFFFFF',
    gold:      'F5C842',
    green:     '1AAF5D',
    greenBg:   'E6F9EE',
    red:       'E53E3E',
    redBg:     'FFF0F0',
    amber:     'D97706',
    amberBg:   'FFFBEB',
    gray1:     '374151',
    gray2:     '6B7280',
    gray3:     'F9FAFB',
    border:    'CBD5E1',
  };

  const total   = project.tasks.length;
  const done    = project.tasks.filter(t => t.completed).length;
  const inProg  = project.tasks.filter(t => !t.completed && t.status === 'in-progress').length;
  const todo    = total - done - inProg;
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0;
  const high    = project.tasks.filter(t => t.priority === 'high' && !t.completed).length;

  const rows: SheetRow[] = [];
  const merges: XLSXStyle.Range[] = [];
  let r = 0;

  const addMerge = (r1: number, c1: number, r2: number, c2: number) => merges.push(merge(r1, c1, r2, c2));

  // ── Row 0: Main title banner ──
  rows.push([
    cell(`  📋  LAPORAN PROYEK  —  ${project.title.toUpperCase()}`, s(C.navyDark, C.white, true, 20, 'left', false, true)),
    ...Array(7).fill(empty(s(C.navyDark, C.white))),
  ]);
  addMerge(r, 0, r, 7); r++;

  // ── Row 1: Subtitle ──
  rows.push([
    cell(`  Digenerate pada ${fmt(new Date().toISOString())}  •  Progesme Project Manager`, s(C.navy, 'AABFFF', false, 9, 'left', true)),
    ...Array(7).fill(empty(s(C.navy, C.white))),
  ]);
  addMerge(r, 0, r, 7); r++;

  // ── Row 2: Blank ──
  rows.push(Array(8).fill(empty(noBorder(C.white, C.white)))); r++;

  // ── Row 3: Section label "INFO PROYEK" ──
  rows.push([
    cell('  ℹ️  INFORMASI PROYEK', s(C.navyLight, C.navyDark, true, 11, 'left')),
    ...Array(7).fill(empty(s(C.navyLight, C.navyDark))),
  ]);
  addMerge(r, 0, r, 7); r++;

  // Info grid: left col = label, right col = value (2 cols wide), 2 blocks side by side
  const infoLeft: [string, string][] = [
    ['Nama Proyek',   project.title],
    ['Deskripsi',     project.description || '—'],
    ['Tanggal Mulai', fmt(project.startDate)],
    ['Tenggat Waktu', fmt(project.deadline)],
  ];
  const infoRight: [string, string][] = [
    ['Status',        project.status === 'active' ? '🟢 Aktif' : project.status === 'completed' ? '✅ Selesai' : '⏸ Dijeda'],
    ['Target Jam',    project.targetHours ? `${project.targetHours} jam` : '—'],
    ['Total Tugas',   `${total} tugas`],
    ['Prioritas ⚠️',  high > 0 ? `${high} tugas prioritas tinggi` : 'Tidak ada'],
  ];

  for (let i = 0; i < 4; i++) {
    const odd = i % 2 === 0;
    const bg = odd ? C.navyPale : C.white;
    rows.push([
      cell(`  ${infoLeft[i][0]}`,  s(bg, C.navy,  true,  10, 'left')),
      cell(`  ${infoLeft[i][1]}`,  s(bg, C.gray1, false, 10, 'left')),
      empty(s(bg, C.gray1)),
      empty(s(bg, C.gray1)),
      cell(`  ${infoRight[i][0]}`, s(bg, C.navy,  true,  10, 'left')),
      cell(`  ${infoRight[i][1]}`, s(bg, C.gray1, false, 10, 'left')),
      empty(s(bg, C.gray1)),
      empty(s(bg, C.gray1)),
    ]);
    // merge value cols
    addMerge(r, 1, r, 3);
    addMerge(r, 5, r, 7);
    r++;
  }

  // ── Blank ──
  rows.push(Array(8).fill(empty(noBorder(C.white, C.white)))); r++;

  // ── Progress Summary Section ──
  rows.push([
    cell('  📊  RINGKASAN PROGRES', s(C.navyLight, C.navyDark, true, 11, 'left')),
    ...Array(7).fill(empty(s(C.navyLight, C.navyDark))),
  ]);
  addMerge(r, 0, r, 7); r++;

  // Progress bar row
  rows.push([
    cell(`  Progress Penyelesaian`, s(C.navyPale, C.navy, true, 9, 'left')),
    cell(progressBar(pct), s(C.navyPale, pct >= 80 ? C.green : pct >= 40 ? C.amber : C.red, true, 9, 'left')),
    ...Array(6).fill(empty(s(C.navyPale, C.gray1))),
  ]);
  addMerge(r, 1, r, 7); r++;

  // Stats row: 4 stat boxes
  const statBgs  = [C.greenBg, C.navyPale, C.amberBg, C.redBg];
  const statFgs  = [C.green,   C.navyMid,  C.amber,   C.red];
  const statNums = [done, todo, inProg, high];
  const statLbls = ['✅ Selesai', '⬜ Belum', '🔄 Proses', '🔴 Prioritas Tinggi'];

  // Label row
  rows.push([
    ...statLbls.flatMap((lbl, i) => [
      cell(`  ${lbl}`, s(statBgs[i], statFgs[i], true, 9, 'left')),
      empty(s(statBgs[i], statFgs[i])),
    ]),
  ]);
  statLbls.forEach((_, i) => addMerge(r, i * 2, r, i * 2 + 1));
  r++;

  // Number row
  rows.push([
    ...statNums.flatMap((num, i) => [
      cell(num, s(statBgs[i], statFgs[i], true, 22, 'center')),
      empty(s(statBgs[i], statFgs[i])),
    ]),
  ]);
  statNums.forEach((_, i) => addMerge(r, i * 2, r, i * 2 + 1));
  r++;

  // ── Blank ──
  rows.push(Array(8).fill(empty(noBorder(C.white, C.white)))); r++;

  // ── Task Table ──
  if (total > 0) {
    rows.push([
      cell('  📝  RINCIAN TUGAS', s(C.navyLight, C.navyDark, true, 11, 'left')),
      ...Array(7).fill(empty(s(C.navyLight, C.navyDark))),
    ]);
    addMerge(r, 0, r, 7); r++;

    // Table header
    const headers = ['No', 'Nama Tugas', 'Status', 'Prioritas', 'Tenggat', 'Estimasi', 'Perulangan', 'Label'];
    rows.push(headers.map(h => cell(`  ${h}`, s(C.navyMid, C.white, true, 11, 'center'))));
    r++;

    // Task rows
    project.tasks.forEach((task, i) => {
      const isDone = task.completed;
      const isHigh = task.priority === 'high' && !isDone;
      const bg = isDone ? C.greenBg : isHigh ? C.redBg : i % 2 === 0 ? C.navyPale : C.white;
      const fg = isDone ? C.green : isHigh ? C.red : C.gray1;
      rows.push([
        cell(i + 1,                                                                    s(bg, C.gray2, true,  10, 'center')),
        cell(`  ${task.title}`,                                                        s(bg, fg,      isDone, 10, 'left')),
        cell(`  ${fmtStatus(task)}`,                                                   s(bg, fg,      false,  10, 'left')),
        cell(`  ${fmtPriority(task.priority)}`,                                        s(bg, fg,      false,  10, 'left')),
        cell(`  ${fmt(task.dueDate)}`,                                                 s(bg, fg,      false,  10, 'left')),
        cell(`  ${task.estimatedMinutes ? task.estimatedMinutes + ' mnt' : '—'}`,     s(bg, fg,      false,  10, 'center')),
        cell(`  ${fmtRecurrence(task.recurrence)}`,                                    s(bg, fg,      false,  10, 'left')),
        cell(`  ${(task.tags || []).join(', ') || '—'}`,                              s(bg, fg,      false,  10, 'left')),
      ]);
      r++;
    });

    // Footer total row
    rows.push([
      empty(s(C.navyDark, C.white)),
      cell(`  Total: ${total} tugas`, s(C.navyDark, C.white, true, 9, 'left')),
      cell(`  ${done} selesai`,       s(C.navyDark, C.gold,  true, 9, 'center')),
      cell(`  ${pct}%`,               s(C.navyDark, C.gold,  true, 9, 'center')),
      empty(s(C.navyDark, C.white)),
      empty(s(C.navyDark, C.white)),
      empty(s(C.navyDark, C.white)),
      empty(s(C.navyDark, C.white)),
    ]);
    r++;
  }

  // ── Footer note ──
  rows.push(Array(8).fill(empty(noBorder(C.white, C.white)))); r++;
  rows.push([
    cell('  Catatan: Dokumen ini digenerate otomatis oleh Progesme. Data berdasarkan input pengguna.', noBorder(C.gray3, C.gray2, false, 8, 'left')),
    ...Array(7).fill(empty(noBorder(C.gray3, C.gray2))),
  ]);
  addMerge(r, 0, r, 7); r++;

  // ── Build worksheet ──
  const ws: XLSXStyle.WorkSheet = XLSXStyle.utils.aoa_to_sheet(rows as any[][]);
  ws['!merges'] = merges;
  // Lebar kolom diperbesar agar terbaca di HP (satuan karakter)
  ws['!cols'] = [
    { wch: 6  },  // No
    { wch: 36 },  // Nama Tugas / label kiri
    { wch: 20 },  // Status / value kiri col2
    { wch: 20 },  // value kiri col3
    { wch: 20 },  // Prioritas / label kanan
    { wch: 30 },  // Tenggat / value kanan
    { wch: 18 },  // Estimasi / value kanan col2
    { wch: 24 },  // Perulangan / Label
  ];
  // Tinggi baris lebih besar agar tidak sakit mata di HP
  ws['!rows'] = rows.map((_, i) => ({
    hpt: i === 0 ? 44 : i === 1 ? 22 : i === 3 ? 28 : 24,
  }));

  const wb = XLSXStyle.utils.book_new();
  XLSXStyle.utils.book_append_sheet(wb, ws, 'Laporan Proyek');
  download(wb, `laporan-proyek-${project.title.toLowerCase().replace(/\s+/g, '-')}.xlsx`);
}
