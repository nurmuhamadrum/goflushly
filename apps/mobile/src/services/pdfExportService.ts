import { AppLanguage, Log } from '@go-flushly/shared';
import * as Print from 'expo-print';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { MOBILE_COPY } from '../i18n/translations';

export type PdfPeriodPreset = 'WEEK' | 'LAST_30' | 'MONTH' | 'YEAR' | 'CUSTOM' | 'ALL';
export type PdfTypeFilter = 'ALL' | 'POOP' | 'PEE' | 'COMBO';

export interface PdfExportOptions {
  logs: Log[];
  period: PdfPeriodPreset;
  startDate: Date;
  endDate: Date;
  typeFilter: PdfTypeFilter;
  includeLocationAndNotes: boolean;
  userName: string;
  lang: AppLanguage;
}

/**
 * Filter logs by selected period preset / custom date range and activity type.
 * Returns logs sorted newest-first.
 */
export function filterLogsForPdf(options: Pick<PdfExportOptions, 'logs' | 'period' | 'startDate' | 'endDate' | 'typeFilter'>): Log[] {
  const { logs, period, startDate, endDate, typeFilter } = options;
  const now = new Date();

  const filtered = logs.filter((log) => {
    if (typeFilter !== 'ALL' && log.type !== typeFilter) {
      return false;
    }

    const logDate = new Date(log.loggedAt);
    if (period === 'WEEK') {
      const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      cutoff.setHours(0, 0, 0, 0);
      return logDate >= cutoff;
    }
    if (period === 'LAST_30') {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      cutoff.setHours(0, 0, 0, 0);
      return logDate >= cutoff;
    }
    if (period === 'MONTH') {
      return (
        logDate.getFullYear() === now.getFullYear() &&
        logDate.getMonth() === now.getMonth()
      );
    }
    if (period === 'YEAR') {
      return logDate.getFullYear() === now.getFullYear();
    }
    if (period === 'CUSTOM') {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return logDate >= start && logDate <= end;
    }
    return true; // ALL
  });

  return filtered.sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
}

/**
 * Compute human-readable effective period label for UI preview & PDF header.
 */
export function getEffectivePeriodLabel(
  period: PdfPeriodPreset,
  startDate: Date,
  endDate: Date,
  lang: AppLanguage
): string {
  const locale = lang === 'en' ? 'en-US' : 'id-ID';
  const now = new Date();
  const fmt = (d: Date) =>
    d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });

  if (period === 'WEEK') {
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return `${fmt(start)} – ${fmt(now)}`;
  }
  if (period === 'LAST_30') {
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return `${fmt(start)} – ${fmt(now)}`;
  }
  if (period === 'MONTH') {
    return now.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  }
  if (period === 'YEAR') {
    return `${lang === 'en' ? 'Year' : 'Tahun'} ${now.getFullYear()}`;
  }
  if (period === 'CUSTOM') {
    return `${fmt(startDate)} – ${fmt(endDate)}`;
  }
  return lang === 'en' ? 'All Time' : 'Semua Waktu';
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Inline crisp vector SVG for Bristol Stool Types 1-7 (matches BristolStoolIcons.tsx).
 */
function getBristolSvgHtml(type: number): string {
  switch (type) {
    case 1:
      return `<svg width="36" height="20" viewBox="0 0 54 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="18" r="5" fill="#B85D19"/>
        <circle cx="8.5" cy="16.5" r="1.3" fill="#FFFFFF" opacity="0.5"/>
        <circle cx="18" cy="9" r="3.8" fill="#B85D19"/>
        <circle cx="26" cy="14" r="5.6" fill="#B85D19"/>
        <circle cx="24.2" cy="12.2" r="1.5" fill="#FFFFFF" opacity="0.5"/>
        <circle cx="20" cy="22" r="3.6" fill="#B85D19"/>
        <circle cx="37" cy="19" r="4.2" fill="#B85D19"/>
      </svg>`;
    case 2:
      return `<svg width="36" height="20" viewBox="0 0 54 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="16" r="6" fill="#D97724"/>
        <circle cx="18" cy="17" r="5.8" fill="#D97724"/>
        <circle cx="26" cy="15" r="6.2" fill="#D97724"/>
        <circle cx="34" cy="16" r="5.8" fill="#D97724"/>
        <circle cx="41" cy="17" r="5" fill="#D97724"/>
        <rect x="11" y="11.5" width="30" height="9" rx="4" fill="#D97724"/>
      </svg>`;
    case 3:
      return `<svg width="36" height="20" viewBox="0 0 54 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 10 16 C 18 12, 34 12, 44 16" stroke="#72B02B" stroke-width="9" stroke-linecap="round" fill="none"/>
        <path d="M 19 10 L 21 15" stroke="#3D5A10" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M 27 9.5 L 28 15" stroke="#3D5A10" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M 35 10 L 36 15" stroke="#3D5A10" stroke-width="1.8" stroke-linecap="round"/>
      </svg>`;
    case 4:
      return `<svg width="36" height="20" viewBox="0 0 54 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 10 16 C 15 11, 22 10, 27 14 C 32 18, 38 18, 44 13" stroke="#16A34A" stroke-width="8.5" stroke-linecap="round" fill="none"/>
        <path d="M 14 13 C 17 11, 21 11, 24 13" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" opacity="0.5" fill="none"/>
      </svg>`;
    case 5:
      return `<svg width="36" height="20" viewBox="0 0 54 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="13" cy="18" r="6" fill="#0D9488"/>
        <circle cx="26" cy="14" r="8" fill="#0D9488"/>
        <circle cx="39" cy="18" r="6" fill="#0D9488"/>
        <rect x="13" y="14" width="26" height="8" rx="4" fill="#0D9488"/>
      </svg>`;
    case 6:
      return `<svg width="36" height="20" viewBox="0 0 54 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="18" r="5" fill="#2563EB"/>
        <circle cx="17" cy="13" r="4.2" fill="#2563EB"/>
        <circle cx="23" cy="17" r="5.2" fill="#2563EB"/>
        <circle cx="29" cy="13" r="4.5" fill="#2563EB"/>
        <circle cx="35" cy="18" r="5.2" fill="#2563EB"/>
        <circle cx="42" cy="14" r="4.2" fill="#2563EB"/>
        <rect x="12" y="14" width="28" height="6" rx="3" fill="#2563EB"/>
      </svg>`;
    case 7:
      return `<svg width="36" height="20" viewBox="0 0 54 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="8.5" r="2.2" fill="#6366F1"/>
        <circle cx="38" cy="7" r="1.7" fill="#6366F1"/>
        <path d="M 8 19 C 13 17, 18 20, 23 18 C 28 16, 33 20, 38 18 C 42 16.5, 45 18, 47 17.5 L 45 22.5 C 40 25, 15 25, 8 22.5 Z" fill="#6366F1"/>
      </svg>`;
    default:
      return '';
  }
}

/**
 * Generate a clean, print-ready A4 HTML document for the filtered diary records.
 */
export function buildDiaryReportHtml(options: PdfExportOptions): string {
  const { period, startDate, endDate, includeLocationAndNotes, userName, lang } = options;
  const isEn = lang === 'en';
  const locale = isEn ? 'en-US' : 'id-ID';
  const copy = MOBILE_COPY[lang];
  const filteredLogs = filterLogsForPdf(options);

  const periodLabel = getEffectivePeriodLabel(period, startDate, endDate, lang);
  const generatedAt = new Date().toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const poopCount = filteredLogs.filter((l) => l.type === 'POOP').length;
  const peeCount = filteredLogs.filter((l) => l.type === 'PEE').length;
  const comboCount = filteredLogs.filter((l) => l.type === 'COMBO').length;

  // Bristol statistics
  const bristolLogs = filteredLogs.filter((l) => typeof l.stoolDensity === 'number' && l.stoolDensity >= 1 && l.stoolDensity <= 7);
  const bristolTotal = bristolLogs.length;
  const bristolAvg = bristolTotal > 0
    ? (bristolLogs.reduce((sum, l) => sum + (l.stoolDensity || 0), 0) / bristolTotal).toFixed(1)
    : null;
  const constipationCount = bristolLogs.filter((l) => (l.stoolDensity || 0) <= 2).length;
  const idealCount = bristolLogs.filter((l) => (l.stoolDensity || 0) === 3 || (l.stoolDensity || 0) === 4).length;
  const looseCount = bristolLogs.filter((l) => (l.stoolDensity || 0) >= 5).length;

  const pctConst = bristolTotal > 0 ? Math.round((constipationCount / bristolTotal) * 100) : 0;
  const pctIdeal = bristolTotal > 0 ? Math.round((idealCount / bristolTotal) * 100) : 0;
  const pctLoose = bristolTotal > 0 ? Math.max(0, 100 - pctConst - pctIdeal) : 0;

  const bristolSummaryHtml = bristolTotal > 0
    ? `
      <div class="bristol-summary">
        <div class="bristol-summary-head">
          <div>
            <div class="section-eyebrow">${isEn ? 'BRISTOL STOOL CONSISTENCY OVERVIEW' : 'RINGKASAN KEPADATAN KOTORAN (BRISTOL SCALE)'}</div>
            <div class="bristol-summary-sub">${isEn ? `Based on ${bristolTotal} recorded stool entries` : `Berdasarkan ${bristolTotal} catatan feses pada periode ini`}</div>
          </div>
          <div class="bristol-avg-pill">
            <span>${isEn ? 'Avg Type' : 'Rata-rata Tipe'}</span>
            <strong>${bristolAvg}</strong>
          </div>
        </div>
        <div class="dist-bar">
          ${pctConst > 0 ? `<div class="dist-seg" style="width:${pctConst}%; background:#D97724;"></div>` : ''}
          ${pctIdeal > 0 ? `<div class="dist-seg" style="width:${pctIdeal}%; background:#16A34A;"></div>` : ''}
          ${pctLoose > 0 ? `<div class="dist-seg" style="width:${pctLoose}%; background:#2563EB;"></div>` : ''}
        </div>
        <div class="dist-legend">
          <div class="legend-item">
            <span class="dot" style="background:#D97724;"></span>
            <span>${isEn ? 'Hard / Constipation (1–2)' : 'Keras / Sembelit (1–2)'}: <strong>${constipationCount}</strong> (${pctConst}%)</span>
          </div>
          <div class="legend-item">
            <span class="dot" style="background:#16A34A;"></span>
            <span>${isEn ? 'Normal / Ideal (3–4)' : 'Normal / Ideal (3–4)'}: <strong>${idealCount}</strong> (${pctIdeal}%)</span>
          </div>
          <div class="legend-item">
            <span class="dot" style="background:#2563EB;"></span>
            <span>${isEn ? 'Soft / Diarrhea (5–7)' : 'Lembek / Diare (5–7)'}: <strong>${looseCount}</strong> (${pctLoose}%)</span>
          </div>
        </div>
      </div>
    `
    : '';

  const rowsHtml = filteredLogs
    .map((log, idx) => {
      const dateObj = new Date(log.loggedAt);
      const dateStr = dateObj.toLocaleDateString(locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const timeStr = dateObj.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
      });

      const typeBadge =
        log.type === 'POOP'
          ? `<span class="badge badge-poop">${isEn ? 'Poop (Mr. Plop)' : 'BAB (Mr. Plop)'}</span>`
          : log.type === 'PEE'
          ? `<span class="badge badge-pee">${isEn ? "Pee (Lil' Drip)" : "BAK (Lil' Drip)"}</span>`
          : `<span class="badge badge-combo">${isEn ? 'Combo (Sir Flush)' : 'Kombo (Sir Flush)'}</span>`;

      let bristolCell = '<span class="muted">—</span>';
      if (log.stoolDensity) {
        const dInfo = copy.quickLog.stoolScale.find((s) => s.level === log.stoolDensity);
        if (dInfo) {
          bristolCell = `
            <div class="bristol-cell">
              <div class="bristol-svg-wrap" style="background:${dInfo.color}14; border-color:${dInfo.color}40;">
                ${getBristolSvgHtml(dInfo.level)}
              </div>
              <div>
                <div class="bristol-title" style="color:${dInfo.color};">${isEn ? 'Type' : 'Tipe'} ${dInfo.level} • ${escapeHtml(dInfo.name)}</div>
                <div class="bristol-status">${escapeHtml(dInfo.status)}</div>
              </div>
            </div>
          `;
        }
      }

      const moodStr = escapeHtml(log.mood || (isEn ? 'Relieved' : 'Lega'));
      const locStr = [log.district, log.city].filter(Boolean).join(', ');
      const noteStr = log.note ? `<div class="note-line">"${escapeHtml(log.note)}"</div>` : '';
      const locationNoteCell = includeLocationAndNotes
        ? `
          <td>
            ${locStr ? `<div class="loc-line">${escapeHtml(locStr)}</div>` : '<span class="muted">—</span>'}
            ${noteStr}
          </td>
        `
        : '';

      return `
        <tr>
          <td class="col-num">${idx + 1}</td>
          <td class="col-date">
            <div class="date-main">${escapeHtml(dateStr)}</div>
            <div class="date-time">${escapeHtml(timeStr)}</div>
          </td>
          <td class="col-type">${typeBadge}</td>
          <td class="col-bristol">${bristolCell}</td>
          <td class="col-mood"><span class="mood-tag">${moodStr}</span></td>
          ${locationNoteCell}
        </tr>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <title>GoFlushly Diary Report</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 14mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0C102A;
      background: #FFFFFF;
      font-size: 11px;
      line-height: 1.45;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 14px;
      border-bottom: 2px solid #2447F9;
      margin-bottom: 16px;
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    .brand-dot {
      width: 12px;
      height: 12px;
      border-radius: 4px;
      background: #2447F9;
      display: inline-block;
    }
    .brand-name {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0C102A;
    }
    .brand-name span {
      color: #2447F9;
    }
    .report-subtitle {
      font-size: 11px;
      color: #475569;
      font-weight: 600;
    }
    .meta-box {
      text-align: right;
      font-size: 10px;
      color: #475569;
    }
    .meta-box strong {
      color: #0C102A;
    }
    .privacy-pill {
      display: inline-block;
      margin-top: 5px;
      padding: 2px 8px;
      border-radius: 999px;
      background: #EEF2FF;
      color: #2447F9;
      font-size: 9px;
      font-weight: 800;
      border: 1px solid #C7D7FE;
    }

    /* KPI Summary Grid */
    .kpi-grid {
      display: flex;
      gap: 10px;
      margin-bottom: 14px;
    }
    .kpi-card {
      flex: 1;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 10px 12px;
      background: #F8FAFC;
    }
    .kpi-label {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: #64748B;
      margin-bottom: 3px;
    }
    .kpi-value {
      font-size: 20px;
      font-weight: 900;
      color: #0C102A;
    }

    /* Bristol Summary */
    .bristol-summary {
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 12px 14px;
      background: #FFFFFF;
      margin-bottom: 16px;
      break-inside: avoid;
    }
    .bristol-summary-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .section-eyebrow {
      font-size: 9px;
      font-weight: 900;
      letter-spacing: 0.6px;
      color: #2447F9;
    }
    .bristol-summary-sub {
      font-size: 10px;
      color: #64748B;
      margin-top: 1px;
    }
    .bristol-avg-pill {
      background: #EEF2FF;
      border: 1px solid #C7D7FE;
      border-radius: 8px;
      padding: 4px 10px;
      text-align: center;
    }
    .bristol-avg-pill span {
      display: block;
      font-size: 8px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
    }
    .bristol-avg-pill strong {
      font-size: 14px;
      font-weight: 900;
      color: #2447F9;
    }
    .dist-bar {
      display: flex;
      height: 8px;
      border-radius: 999px;
      overflow: hidden;
      background: #E2E8F0;
      margin-bottom: 8px;
    }
    .dist-seg {
      height: 100%;
    }
    .dist-legend {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      font-size: 9.5px;
      color: #475569;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      display: inline-block;
    }

    /* Table */
    .table-title {
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.6px;
      color: #475569;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      overflow: hidden;
    }
    thead th {
      background: #0C102A;
      color: #FFFFFF;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      text-align: left;
      padding: 8px 8px;
    }
    tbody td {
      padding: 8px 8px;
      border-bottom: 1px solid #E2E8F0;
      vertical-align: middle;
    }
    tbody tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    tbody tr:nth-child(even) {
      background: #F8FAFC;
    }
    .col-num {
      width: 26px;
      color: #94A3B8;
      font-weight: 700;
      font-size: 9.5px;
      text-align: center;
    }
    .col-date {
      width: 105px;
    }
    .date-main {
      font-weight: 800;
      color: #0C102A;
      font-size: 10px;
    }
    .date-time {
      color: #64748B;
      font-size: 9.5px;
      font-weight: 600;
    }
    .col-type {
      width: 105px;
    }
    .badge {
      display: inline-block;
      padding: 3px 7px;
      border-radius: 6px;
      font-size: 9px;
      font-weight: 800;
      white-space: nowrap;
    }
    .badge-poop {
      background: #FAF4EE;
      color: #8B5E3C;
      border: 1px solid #EEDFD3;
    }
    .badge-pee {
      background: #F0F7FF;
      color: #0284C7;
      border: 1px solid #BAE6FD;
    }
    .badge-combo {
      background: #2447F9;
      color: #FFFFFF;
      border: 1px solid #1D4ED8;
    }
    .bristol-cell {
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .bristol-svg-wrap {
      width: 42px;
      height: 24px;
      border-radius: 6px;
      border: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .bristol-title {
      font-weight: 800;
      font-size: 9.5px;
    }
    .bristol-status {
      font-size: 8.5px;
      color: #64748B;
      font-weight: 600;
    }
    .mood-tag {
      display: inline-block;
      background: #EEF2FF;
      color: #2447F9;
      padding: 2px 7px;
      border-radius: 6px;
      font-size: 9px;
      font-weight: 700;
    }
    .loc-line {
      font-size: 9.5px;
      font-weight: 700;
      color: #0C102A;
    }
    .note-line {
      font-size: 9px;
      color: #475569;
      font-style: italic;
      margin-top: 2px;
    }
    .muted {
      color: #94A3B8;
    }
    .footer {
      margin-top: 18px;
      padding-top: 10px;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      font-size: 8.5px;
      color: #94A3B8;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-row">
        <span class="brand-dot"></span>
        <div class="brand-name">Go<span>Flushly</span></div>
      </div>
      <div class="report-subtitle">${isEn ? 'Digestive & Hydration Relief Diary Report' : 'Laporan Buku Harian Pencernaan & Hidrasi'}</div>
      <div class="privacy-pill">${isEn ? '100% LOCAL & PRIVATE EXPORT' : '100% EKSPOR LOKAL & PRIVAT'}</div>
    </div>
    <div class="meta-box">
      <div>${isEn ? 'Profile' : 'Profil'}: <strong>${escapeHtml(userName)}</strong></div>
      <div>${isEn ? 'Period' : 'Periode'}: <strong>${escapeHtml(periodLabel)}</strong></div>
      <div>${isEn ? 'Generated' : 'Dicetak'}: ${escapeHtml(generatedAt)}</div>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">${isEn ? 'Total Records' : 'Total Catatan'}</div>
      <div class="kpi-value" style="color:#2447F9;">${filteredLogs.length}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">${isEn ? 'Poop (Mr. Plop)' : 'BAB (Mr. Plop)'}</div>
      <div class="kpi-value" style="color:#8B5E3C;">${poopCount}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">${isEn ? "Pee (Lil' Drip)" : "BAK (Lil' Drip)"}</div>
      <div class="kpi-value" style="color:#0284C7;">${peeCount}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">${isEn ? 'Combo (Sir Flush)' : 'Kombo (Sir Flush)'}</div>
      <div class="kpi-value" style="color:#2447F9;">${comboCount}</div>
    </div>
  </div>

  ${bristolSummaryHtml}

  <div class="table-title">${isEn ? `Detailed Activity History (${filteredLogs.length} Entries)` : `Rincian Riwayat Aktivitas (${filteredLogs.length} Catatan)`}</div>
  <table>
    <thead>
      <tr>
        <th style="text-align:center;">#</th>
        <th>${isEn ? 'Date & Time' : 'Tanggal & Jam'}</th>
        <th>${isEn ? 'Activity' : 'Aktivitas'}</th>
        <th>${isEn ? 'Bristol Stool Scale' : 'Kepadatan (Bristol)'}</th>
        <th>${isEn ? 'Mood' : 'Mood'}</th>
        ${includeLocationAndNotes ? `<th>${isEn ? 'Location & Notes' : 'Lokasi & Catatan'}</th>` : ''}
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="footer">
    <div>${isEn ? 'Generated offline on your device by GoFlushly. For personal tracking & clinical reference.' : 'Dibuat 100% offline di perangkat Anda oleh GoFlushly. Untuk catatan pribadi & referensi konsultasi medis.'}</div>
    <div>goflushly.app</div>
  </div>
</body>
</html>
  `;
}

function formatFilenameSlug(options: PdfExportOptions): string {
  const { period, startDate, endDate } = options;
  const isoDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const now = new Date();
  if (period === 'CUSTOM') {
    return `GoFlushly-Diary-${isoDate(startDate)}_to_${isoDate(endDate)}.pdf`;
  }
  return `GoFlushly-Diary-${period.toLowerCase()}-${isoDate(now)}.pdf`;
}

/**
 * Generates an A4 PDF file locally and opens the OS Share/Save sheet.
 */
export async function exportDiaryToPdfFile(options: PdfExportOptions): Promise<string> {
  const html = buildDiaryReportHtml(options);
  const { uri } = await Print.printToFileAsync({ html });

  let shareUri = uri;
  try {
    if (Paths?.cache) {
      const filename = formatFilenameSlug(options);
      const sourceFile = new File(uri);
      const targetFile = new File(Paths.cache, filename);
      if (targetFile.exists) {
        targetFile.delete();
      }
      sourceFile.move(targetFile);
      shareUri = targetFile.uri;
    }
  } catch (renameErr) {
    console.warn('PDF rename fallback to original temp uri:', renameErr);
  }

  const isSharingAvailable = await Sharing.isAvailableAsync().catch(() => false);
  if (isSharingAvailable) {
    await Sharing.shareAsync(shareUri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: MOBILE_COPY[options.lang].pdfExport.shareDialogTitle,
    });
  } else {
    // Fallback to direct print sheet if sharing unavailable
    await Print.printAsync({ uri: shareUri });
  }

  return shareUri;
}

/**
 * Opens the native OS print preview / AirPrint / Android Print dialog directly.
 */
export async function printDiaryPdfDirectly(options: PdfExportOptions): Promise<void> {
  const html = buildDiaryReportHtml(options);
  await Print.printAsync({ html });
}
