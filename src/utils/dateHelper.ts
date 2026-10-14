import { GutterReport } from '../types';

export const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const INDONESIAN_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

/**
 * Extracts a standard Date or { year, month (1-12), day (1-31) } from various createdAt strings:
 * Examples: "2026-10-13 09:30", "13 Okt 2026, 09:30 WIB", "2026-10-13"
 */
export function parseReportDate(dateStr: string): { year: number; month: number; day: number; formattedDate: string } {
  const current = new Date();
  let y = current.getFullYear();
  let m = current.getMonth() + 1; // 1-12
  let d = current.getDate();

  if (!dateStr) {
    return {
      year: y,
      month: m,
      day: d,
      formattedDate: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    };
  }

  // Check ISO format YYYY-MM-DD
  const isoMatch = dateStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    y = parseInt(isoMatch[1], 10);
    m = parseInt(isoMatch[2], 10);
    d = parseInt(isoMatch[3], 10);
  } else {
    // Check "13 Okt 2026" or "13 Oktober 2026"
    const textMatch = dateStr.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    if (textMatch) {
      d = parseInt(textMatch[1], 10);
      const monthText = textMatch[2].toLowerCase();
      y = parseInt(textMatch[3], 10);

      const foundIdx = INDONESIAN_MONTHS_SHORT.findIndex(
        (sm) => sm.toLowerCase() === monthText.slice(0, 3).toLowerCase()
      );
      if (foundIdx !== -1) {
        m = foundIdx + 1;
      }
    }
  }

  const formattedDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  return { year: y, month: m, day: d, formattedDate };
}

export type PeriodType = 'day' | 'month' | 'year' | 'all';

export function filterReportsByPeriod(
  reports: GutterReport[],
  periodType: PeriodType,
  selectedDate: string, // "YYYY-MM-DD"
  selectedMonth: number, // 1-12
  selectedYear: number // e.g. 2026
): GutterReport[] {
  if (periodType === 'all') {
    return reports;
  }

  return reports.filter((r) => {
    const parsed = parseReportDate(r.createdAt);

    if (periodType === 'day') {
      return parsed.formattedDate === selectedDate;
    }

    if (periodType === 'month') {
      return parsed.year === selectedYear && parsed.month === selectedMonth;
    }

    if (periodType === 'year') {
      return parsed.year === selectedYear;
    }

    return true;
  });
}
