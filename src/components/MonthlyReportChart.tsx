import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { GutterReport } from '../types';
import { parseReportDate, INDONESIAN_MONTHS, INDONESIAN_MONTHS_SHORT } from '../utils/dateHelper';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Layers, 
  Info,
  ArrowUpRight
} from 'lucide-react';

interface MonthlyReportChartProps {
  reports: GutterReport[];
  initialYear?: number;
}

interface MonthlyDataPoint {
  monthIndex: number; // 0 - 11
  monthName: string;
  monthShort: string;
  laporanMasuk: number;
  laporanSelesai: number;
  dalamProses: number;
  tingkatPenyelesaian: number; // percentage
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: MonthlyDataPoint;
    value: number;
    name: string;
    color?: string;
  }>;
  label?: string;
}

// Custom Tooltip for recharts
const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-xl border border-slate-700/80 text-xs backdrop-blur-md min-w-[210px]">
        <div className="flex items-center justify-between border-b border-slate-700/70 pb-2 mb-2.5">
          <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            {data.monthName}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            {data.tingkatPenyelesaian}% Tuntas
          </span>
        </div>

        <div className="space-y-1.5 font-medium">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 inline-block" />
              Laporan Masuk:
            </span>
            <span className="font-bold text-white font-mono">{data.laporanMasuk} tiket</span>
          </div>

          <div className="flex items-center justify-between text-emerald-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
              Laporan Selesai:
            </span>
            <span className="font-bold text-emerald-300 font-mono">{data.laporanSelesai} tiket</span>
          </div>

          <div className="flex items-center justify-between text-amber-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 inline-block" />
              Masih Berjalan:
            </span>
            <span className="font-bold text-amber-200 font-mono">{data.dalamProses} tiket</span>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-700/70 text-[10px] text-slate-400">
          Perbandingan efektivitas penanganan kerusakan talang air
        </div>
      </div>
    );
  }
  return null;
};

export const MonthlyReportChart: React.FC<MonthlyReportChartProps> = ({ reports, initialYear }) => {
  // Extract all available years from reports
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    const currentYear = new Date().getFullYear();
    yearsSet.add(currentYear);
    yearsSet.add(2026); // Guarantee 2026 is available

    reports.forEach((r) => {
      const parsed = parseReportDate(r.createdAt);
      if (parsed.year) yearsSet.add(parsed.year);
    });

    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [reports]);

  const [selectedYear, setSelectedYear] = useState<number>(() => {
    if (initialYear && availableYears.includes(initialYear)) return initialYear;
    return availableYears[0] || new Date().getFullYear();
  });

  const [displayMode, setDisplayMode] = useState<'all_12' | 'active_only'>('all_12');

  // Compute monthly data for the selected year
  const monthlyData = useMemo(() => {
    // Initialize 12 months
    const months: MonthlyDataPoint[] = Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i,
      monthName: `${INDONESIAN_MONTHS[i]} ${selectedYear}`,
      monthShort: INDONESIAN_MONTHS_SHORT[i],
      laporanMasuk: 0,
      laporanSelesai: 0,
      dalamProses: 0,
      tingkatPenyelesaian: 0,
    }));

    reports.forEach((report) => {
      const parsed = parseReportDate(report.createdAt);
      if (parsed.year === selectedYear && parsed.month >= 1 && parsed.month <= 12) {
        const mIdx = parsed.month - 1;
        months[mIdx].laporanMasuk += 1;

        if (report.status === 'selesai') {
          months[mIdx].laporanSelesai += 1;
        } else {
          months[mIdx].dalamProses += 1;
        }
      }
    });

    // Calculate completion rate percentage
    months.forEach((m) => {
      m.tingkatPenyelesaian = m.laporanMasuk > 0 ? Math.round((m.laporanSelesai / m.laporanMasuk) * 100) : 0;
    });

    if (displayMode === 'active_only') {
      const activeMonths = months.filter((m) => m.laporanMasuk > 0 || m.laporanSelesai > 0);
      return activeMonths.length > 0 ? activeMonths : months;
    }

    return months;
  }, [reports, selectedYear, displayMode]);

  // Aggregate stats for the selected year
  const yearStats = useMemo(() => {
    const totalMasuk = monthlyData.reduce((acc, curr) => acc + curr.laporanMasuk, 0);
    const totalSelesai = monthlyData.reduce((acc, curr) => acc + curr.laporanSelesai, 0);
    const completionRate = totalMasuk > 0 ? Math.round((totalSelesai / totalMasuk) * 100) : 0;

    let peakMonth = '-';
    let maxCount = -1;
    monthlyData.forEach((m) => {
      if (m.laporanMasuk > maxCount && m.laporanMasuk > 0) {
        maxCount = m.laporanMasuk;
        peakMonth = m.monthShort;
      }
    });

    return {
      totalMasuk,
      totalSelesai,
      completionRate,
      peakMonth: maxCount > 0 ? `${peakMonth} (${maxCount})` : 'Belum Ada',
    };
  }, [monthlyData]);

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Visualisasi Data Real-Time (Recharts)
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            Grafik Perbandingan Laporan Masuk & Laporan Selesai
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Komparasi volume tiket laporan kerusakan masuk vs pekerjaan talang yang tuntas diselesaikan setiap bulannya.
          </p>
        </div>

        {/* Filter Controls: Year selector & mode toggle */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Display Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-xs">
            <button
              onClick={() => setDisplayMode('all_12')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                displayMode === 'all_12'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              12 Bulan
            </button>
            <button
              onClick={() => setDisplayMode('active_only')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                displayMode === 'active_only'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bulan Aktif
            </button>
          </div>

          {/* Year Select */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              aria-label="Pilih tahun grafik rekap"
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Tahun {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mini KPI Summary Cards for This Year */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-4">
        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
          <div className="text-[11px] font-semibold text-blue-700 mb-0.5 flex items-center justify-between">
            <span>Total Masuk ({selectedYear})</span>
            <span className="w-2 h-2 rounded-full bg-blue-600" />
          </div>
          <div className="text-xl font-extrabold text-blue-950 font-mono">
            {yearStats.totalMasuk} <span className="text-xs font-semibold text-blue-700">tiket</span>
          </div>
        </div>

        <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
          <div className="text-[11px] font-semibold text-emerald-700 mb-0.5 flex items-center justify-between">
            <span>Total Selesai ({selectedYear})</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-950 font-mono">
            {yearStats.totalSelesai} <span className="text-xs font-semibold text-emerald-700">tiket</span>
          </div>
        </div>

        <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
          <div className="text-[11px] font-semibold text-indigo-700 mb-0.5 flex items-center justify-between">
            <span>Tingkat Penyelesaian</span>
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-extrabold text-indigo-950 font-mono">
            {yearStats.completionRate}%
          </div>
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl">
          <div className="text-[11px] font-semibold text-amber-700 mb-0.5 flex items-center justify-between">
            <span>Puncak Laporan</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-extrabold text-amber-950 font-mono">
            {yearStats.peakMonth}
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart Container */}
      <div className="mt-2 w-full h-[280px] sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={monthlyData}
            margin={{ top: 20, right: 15, left: -15, bottom: 5 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="monthShort"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
              dy={5}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomChartTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '16px', fontSize: '12px', fontWeight: 600 }}
              formatter={(value) => {
                if (value === 'laporanMasuk') return <span className="text-slate-700">Laporan Masuk</span>;
                if (value === 'laporanSelesai') return <span className="text-slate-700">Laporan Selesai</span>;
                return value;
              }}
            />
            {/* Bar 1: Laporan Masuk */}
            <Bar
              dataKey="laporanMasuk"
              name="laporanMasuk"
              fill="#3b82f6"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />
            {/* Bar 2: Laporan Selesai */}
            <Bar
              dataKey="laporanSelesai"
              name="laporanSelesai"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer with explanatory badge */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>Data terintegrasi real-time dari Firebase Firestore. Bar biru menunjukkan tiket baru, bar hijau menunjukkan tiket berstatus selesai.</span>
        </div>
        <div className="flex items-center gap-3 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Laporan Masuk
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Laporan Selesai
          </span>
        </div>
      </div>
    </div>
  );
};
