import React, { useState, useMemo } from 'react';
import { 
  GutterReport, 
  STATUS_CONFIG, 
  GUTTER_TYPE_LABELS, 
  DAMAGE_TYPE_LABELS, 
  URGENCY_LABELS,
  GutterType,
  DamageType,
  UrgencyLevel,
  RepairStatus
} from '../types';
import { 
  PeriodType, 
  filterReportsByPeriod, 
  INDONESIAN_MONTHS, 
  parseReportDate 
} from '../utils/dateHelper';
import { exportReportsToExcel } from '../utils/exportExcel';
import { 
  Calendar, 
  FileSpreadsheet, 
  Printer, 
  TrendingUp, 
  CheckCircle2, 
  Wrench, 
  Clock, 
  AlertTriangle,
  BarChart3,
  Eye,
  Layers,
  Edit2,
  Trash2,
  Check,
  X,
  Save,
  Pencil
} from 'lucide-react';

interface ReportDashboardProps {
  reports: GutterReport[];
  onOpenReportDetail: (report: GutterReport) => void;
  onPrintSingleReport: (report: GutterReport) => void;
  onOpenPrintSummary: (filteredReports: GutterReport[], periodLabel: string) => void;
  onUpdateReport: (updated: GutterReport) => void;
  onDeleteReport: (reportId: string) => void;
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({
  reports,
  onOpenReportDetail,
  onPrintSingleReport,
  onOpenPrintSummary,
  onUpdateReport,
  onDeleteReport,
}) => {
  // Period filter states
  const [periodType, setPeriodType] = useState<PeriodType>('month');

  // Default to today
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  // Inline Editing State
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    title: string;
    location: string;
    gutterType: GutterType;
    damageType: DamageType;
    urgency: UrgencyLevel;
    status: RepairStatus;
    estimatedCost: number;
    reporterName: string;
    reportDate: string; // YYYY-MM-DD
    reportTime: string; // HH:MM
  } | null>(null);

  // Deletion Confirmation Modal State
  const [deletingReport, setDeletingReport] = useState<GutterReport | null>(null);

  // Filtered reports by period
  const filteredReports = useMemo(() => {
    return filterReportsByPeriod(
      reports,
      periodType,
      selectedDate,
      selectedMonth,
      selectedYear
    );
  }, [reports, periodType, selectedDate, selectedMonth, selectedYear]);

  // Dynamic period label
  const periodLabel = useMemo(() => {
    if (periodType === 'day') {
      const parsed = parseReportDate(selectedDate);
      return `${parsed.day} ${INDONESIAN_MONTHS[parsed.month - 1]} ${parsed.year}`;
    }
    if (periodType === 'month') {
      return `${INDONESIAN_MONTHS[selectedMonth - 1]} ${selectedYear}`;
    }
    if (periodType === 'year') {
      return `Tahun ${selectedYear}`;
    }
    return 'Semua Periode';
  }, [periodType, selectedDate, selectedMonth, selectedYear]);

  // Aggregated calculations
  const totalReports = filteredReports.length;
  const totalCost = filteredReports.reduce((sum, r) => sum + (r.estimatedCost || 0), 0);
  const completedCount = filteredReports.filter(r => r.status === 'selesai').length;
  const inProgressCount = filteredReports.filter(r => r.status === 'dikerjakan' || r.status === 'uji_coba').length;
  const pendingCount = filteredReports.filter(r => r.status === 'dilaporkan' || r.status === 'survei').length;
  const emergencyCount = filteredReports.filter(r => r.urgency === 'darurat').length;

  const completionRate = totalReports > 0 ? Math.round((completedCount / totalReports) * 100) : 0;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Grouping by gutter material
  const gutterTypeDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      seng_galvalum: 0,
      pvc: 0,
      beton: 0,
      karpet_plat: 0,
    };
    filteredReports.forEach((r) => {
      counts[r.gutterType] = (counts[r.gutterType] || 0) + 1;
    });
    return counts;
  }, [filteredReports]);

  // Grouping by damage type
  const damageTypeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredReports.forEach((r) => {
      counts[r.damageType] = (counts[r.damageType] || 0) + 1;
    });
    return counts;
  }, [filteredReports]);

  const handleExportExcel = () => {
    exportReportsToExcel(filteredReports, periodLabel);
  };

  const handleExportPDF = () => {
    onOpenPrintSummary(filteredReports, periodLabel);
  };

  // Start editing a row
  const handleStartEdit = (report: GutterReport) => {
    const parsed = parseReportDate(report.createdAt);
    const timeMatch = report.createdAt.match(/(\d{1,2}):(\d{2})/);
    const timeStr = timeMatch ? `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}` : '09:00';

    setEditingReportId(report.id);
    setEditFormData({
      title: report.title,
      location: report.location,
      gutterType: report.gutterType,
      damageType: report.damageType,
      urgency: report.urgency,
      status: report.status,
      estimatedCost: report.estimatedCost,
      reporterName: report.reporterName,
      reportDate: parsed.formattedDate,
      reportTime: timeStr,
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingReportId(null);
    setEditFormData(null);
  };

  // Save changes
  const handleSaveEdit = (originalReport: GutterReport) => {
    if (!editFormData) return;

    let newCreatedAt = originalReport.createdAt;
    if (editFormData.reportDate) {
      try {
        const [yStr, mStr, dStr] = editFormData.reportDate.split('-');
        const [hStr, minStr] = (editFormData.reportTime || '09:00').split(':');
        const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
        const mIdx = Math.max(0, Math.min(11, (Number(mStr) || 1) - 1));
        newCreatedAt = `${Number(dStr) || 1} ${monthNames[mIdx]} ${yStr}, ${hStr || '09'}:${minStr || '00'} WIB`;
      } catch (err) {
        console.error('Failed to parse updated report date', err);
      }
    }

    const newProgress = STATUS_CONFIG[editFormData.status].percentage;
    const now = new Date();
    const timeFormatted = `${now.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][now.getMonth()]} ${now.getFullYear()}, ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} WIB`;

    const updatedReport: GutterReport = {
      ...originalReport,
      createdAt: newCreatedAt,
      title: editFormData.title.trim() || originalReport.title,
      location: editFormData.location.trim() || originalReport.location,
      gutterType: editFormData.gutterType,
      damageType: editFormData.damageType,
      urgency: editFormData.urgency,
      status: editFormData.status,
      progressPercentage: newProgress,
      estimatedCost: Number(editFormData.estimatedCost) || 0,
      reporterName: editFormData.reporterName.trim() || originalReport.reporterName,
      updatedAt: timeFormatted,
      timeline: [
        ...originalReport.timeline,
        {
          id: `t-edit-${Date.now()}`,
          timestamp: timeFormatted,
          status: editFormData.status,
          title: `Data Diedit di Dasbor (${STATUS_CONFIG[editFormData.status].label})`,
          note: `Data laporan & tanggal (${newCreatedAt}) berhasil diperbarui dari Dasbor Rekapitulasi Periode.`,
          actor: 'Pengawas / Administrator',
        },
      ],
    };

    onUpdateReport(updatedReport);
    setEditingReportId(null);
    setEditFormData(null);
  };

  // Confirm delete action
  const handleConfirmDelete = () => {
    if (!deletingReport) return;
    onDeleteReport(deletingReport.id);
    setDeletingReport(null);
  };

  const availableYears = [2026, 2025, 2024, 2023];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Dasbor & Rekapitulasi Laporan
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Rekap Perbaikan Talang Air
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cek riwayat per hari, bulan, dan tahun, edit langsung data baris, serta ekspor dokumen ke Excel (.xlsx) atau cetak PDF.
          </p>
        </div>

        {/* Action Buttons: Export Excel & PDF */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-[0.98]"
            title="Download data rekapitulasi dalam format Microsoft Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-[0.98]"
            title="Cetak atau simpan rekapitulasi sebagai PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Ekspor PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Periode Card (Harian, Bulanan, Tahunan, Semua) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Period Mode Selector Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl max-w-fit">
            <button
              onClick={() => setPeriodType('day')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                periodType === 'day'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Per Hari (Harian)</span>
            </button>

            <button
              onClick={() => setPeriodType('month')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                periodType === 'month'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Per Bulan (Bulanan)</span>
            </button>

            <button
              onClick={() => setPeriodType('year')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                periodType === 'year'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Per Tahun (Tahunan)</span>
            </button>

            <button
              onClick={() => setPeriodType('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                periodType === 'all'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Periode
            </button>
          </div>

          {/* Specific Period Pickers */}
          <div className="flex flex-wrap items-center gap-2">
            {periodType === 'day' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  onClick={() => {
                    const d = new Date();
                    setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
                  }}
                  className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Hari Ini
                </button>
              </div>
            )}

            {periodType === 'month' && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {INDONESIAN_MONTHS.map((m, idx) => (
                    <option key={m} value={idx + 1}>{m}</option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                >
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            )}

            {periodType === 'year' && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                >
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>Tahun {yr}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="px-3 py-2 bg-blue-50 rounded-xl border border-blue-200 text-xs font-bold text-blue-800">
              Periode Terpilih: <strong>{periodLabel}</strong> ({totalReports} Data)
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards for the filtered period */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Titik */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Laporan</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              {totalReports}
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {totalReports} <span className="text-sm font-medium text-slate-500">Titik Talang</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {emergencyCount > 0 ? `${emergencyCount} laporan darurat bocor` : 'Tidak ada laporan darurat'}
          </p>
        </div>

        {/* Card 2: Selesai 100% */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pekerjaan Selesai</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
            {completedCount} <span className="text-sm font-medium text-slate-500">({completionRate}%)</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            Telah diuji coba siram & bergaransi
          </p>
        </div>

        {/* Card 3: Proses & Uji Coba */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Sedang Dikerjakan</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-700 tracking-tight">
            {inProgressCount} <span className="text-sm font-medium text-slate-500">Titik</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            +{pendingCount} titik menunggu survei awal
          </p>
        </div>

        {/* Card 4: Total Biaya */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Estimasi Biaya</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-blue-900 tracking-tight font-mono">
            {formatRupiah(totalCost)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Akumulasi biaya perbaikan periode ini
          </p>
        </div>
      </div>

      {/* Visual Breakdown Cards (Material Talang & Kerusakan) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Breakdown by Material */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            Distribusi Jenis Material Talang
          </h3>
          <div className="space-y-2.5">
            {Object.entries(GUTTER_TYPE_LABELS).map(([k, label]) => {
              const count = gutterTypeDistribution[k] || 0;
              const pct = totalReports > 0 ? Math.round((count / totalReports) * 100) : 0;
              return (
                <div key={k} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-700">{label}</span>
                    <span className="font-bold text-slate-900 font-mono">{count} titik ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breakdown by Damage Type */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Distribusi Bentuk Masalah Kerusakan
          </h3>
          <div className="space-y-2.5">
            {Object.entries(DAMAGE_TYPE_LABELS).map(([k, label]) => {
              const count = damageTypeDistribution[k] || 0;
              const pct = totalReports > 0 ? Math.round((count / totalReports) * 100) : 0;
              return (
                <div key={k} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-700">{label}</span>
                    <span className="font-bold text-slate-900 font-mono">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Data Table With EDIT, SIMPAN, HAPUS Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>Tabel Rekapitulasi & Manajemen Laporan</span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Aksi: Edit, Simpan & Hapus Aktif
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Daftar seluruh laporan talang periode {periodLabel}. Anda dapat mengedit langsung data baris dan menghapus data jika diperlukan.
            </p>
          </div>

          <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            {totalReports} Data Terdaftar
          </div>
        </div>

        {filteredReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3.5 w-10 text-center">No</th>
                  <th className="py-3 px-3.5">Kode</th>
                  <th className="py-3 px-3.5 min-w-[135px]">Tanggal</th>
                  <th className="py-3 px-3.5 min-w-[200px]">Titik & Lokasi Talang</th>
                  <th className="py-3 px-3.5">Material</th>
                  <th className="py-3 px-3.5">Masalah</th>
                  <th className="py-3 px-3.5 text-center">Urgensi</th>
                  <th className="py-3 px-3.5 text-center">Status</th>
                  <th className="py-3 px-3.5 text-right min-w-[120px]">Biaya (Rp)</th>
                  <th className="py-3 px-3.5 text-center min-w-[170px]">Aksi Manajemen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((r, idx) => {
                  const isEditingThis = editingReportId === r.id && editFormData !== null;
                  const statusCfg = STATUS_CONFIG[r.status];
                  const urgencyCfg = URGENCY_LABELS[r.urgency];

                  if (isEditingThis) {
                    return (
                      <tr key={r.id} className="bg-blue-50/50 border-2 border-blue-400">
                        <td className="py-3 px-3 text-center font-bold text-blue-700">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">
                          {r.code}
                        </td>
                        {/* Edit Tanggal & Jam Laporan */}
                        <td className="py-2.5 px-3 min-w-[135px]">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 bg-white border border-blue-400 rounded-md px-1.5 py-1 shadow-2xs">
                              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <input
                                type="date"
                                value={editFormData.reportDate}
                                onChange={(e) => setEditFormData({ ...editFormData, reportDate: e.target.value })}
                                className="w-full text-xs font-bold text-slate-900 focus:outline-none bg-transparent"
                                title="Ubah Tanggal Laporan"
                                required
                              />
                            </div>
                            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-md px-1.5 py-0.5">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <input
                                type="time"
                                value={editFormData.reportTime}
                                onChange={(e) => setEditFormData({ ...editFormData, reportTime: e.target.value })}
                                className="w-full text-[11px] font-mono text-slate-700 focus:outline-none bg-transparent"
                                title="Ubah Jam Kejadian"
                              />
                            </div>
                          </div>
                        </td>
                        {/* Edit Titik & Lokasi */}
                        <td className="py-2.5 px-3 space-y-1">
                          <input
                            type="text"
                            value={editFormData.title}
                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                            placeholder="Judul / Area Talang"
                            className="w-full px-2 py-1 bg-white border border-blue-300 rounded-md font-bold text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            value={editFormData.location}
                            onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                            placeholder="Alamat / Posisi Gedung"
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded-md text-[11px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        {/* Edit Material */}
                        <td className="py-2.5 px-3">
                          <select
                            value={editFormData.gutterType}
                            onChange={(e) => setEditFormData({ ...editFormData, gutterType: e.target.value as GutterType })}
                            className="w-full px-2 py-1 bg-white border border-blue-300 rounded-md text-xs font-semibold text-slate-800 focus:outline-none"
                          >
                            {Object.entries(GUTTER_TYPE_LABELS).map(([k, label]) => (
                              <option key={k} value={k}>{label}</option>
                            ))}
                          </select>
                        </td>
                        {/* Edit Masalah */}
                        <td className="py-2.5 px-3">
                          <select
                            value={editFormData.damageType}
                            onChange={(e) => setEditFormData({ ...editFormData, damageType: e.target.value as DamageType })}
                            className="w-full px-2 py-1 bg-white border border-blue-300 rounded-md text-xs text-slate-800 focus:outline-none"
                          >
                            {Object.entries(DAMAGE_TYPE_LABELS).map(([k, label]) => (
                              <option key={k} value={k}>{label}</option>
                            ))}
                          </select>
                        </td>
                        {/* Edit Urgensi */}
                        <td className="py-2.5 px-3 text-center">
                          <select
                            value={editFormData.urgency}
                            onChange={(e) => setEditFormData({ ...editFormData, urgency: e.target.value as UrgencyLevel })}
                            className="px-2 py-1 bg-white border border-blue-300 rounded-md text-xs font-bold text-slate-800 focus:outline-none"
                          >
                            <option value="darurat">Darurat</option>
                            <option value="sedang">Sedang</option>
                            <option value="ringan">Ringan</option>
                          </select>
                        </td>
                        {/* Edit Status */}
                        <td className="py-2.5 px-3 text-center">
                          <select
                            value={editFormData.status}
                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as RepairStatus })}
                            className="px-2 py-1 bg-white border border-blue-300 rounded-md text-xs font-bold text-blue-800 focus:outline-none"
                          >
                            <option value="dilaporkan">Dilaporkan (15%)</option>
                            <option value="survei">Survei (35%)</option>
                            <option value="dikerjakan">Dikerjakan (65%)</option>
                            <option value="uji_coba">Uji Coba (85%)</option>
                            <option value="selesai">Selesai (100%)</option>
                          </select>
                        </td>
                        {/* Edit Biaya */}
                        <td className="py-2.5 px-3 text-right">
                          <input
                            type="number"
                            value={editFormData.estimatedCost}
                            onChange={(e) => setEditFormData({ ...editFormData, estimatedCost: Number(e.target.value) || 0 })}
                            step="50000"
                            className="w-24 px-2 py-1 bg-white border border-blue-300 rounded-md text-xs font-bold text-right font-mono text-slate-900 focus:outline-none"
                          />
                        </td>
                        {/* Tombol Simpan & Batal */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleSaveEdit(r)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg shadow-xs flex items-center gap-1 transition-all active:scale-95"
                              title="Simpan perubahan data ini"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Simpan</span>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1 transition-colors"
                              title="Batal edit"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Batal</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  // Normal Row View
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors group/row">
                      <td className="py-3 px-3.5 text-center font-medium text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3.5 font-mono font-bold text-slate-800">
                        {r.code}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                        {r.createdAt.split(',')[0]}
                      </td>
                      <td className="py-3 px-3.5">
                        <strong className="text-slate-900 block font-bold text-xs">{r.title}</strong>
                        <span className="text-[11px] text-slate-500 line-clamp-1">{r.location}</span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-700 whitespace-nowrap">
                        {GUTTER_TYPE_LABELS[r.gutterType]}
                      </td>
                      <td className="py-3 px-3.5 text-slate-700 max-w-xs truncate" title={DAMAGE_TYPE_LABELS[r.damageType]}>
                        {DAMAGE_TYPE_LABELS[r.damageType]}
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${urgencyCfg.badgeClass}`}>
                          {urgencyCfg.label.split(' ')[0]}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.badgeClass}`}>
                          {statusCfg.label} ({r.progressPercentage}%)
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                        {formatRupiah(r.estimatedCost)}
                      </td>

                      {/* KOLOM AKSI: EDIT, HAPUS, DETAIL, CETAK */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* Tombol Edit */}
                          <button
                            onClick={() => handleStartEdit(r)}
                            title="Edit data laporan ini langsung"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 flex items-center gap-1 font-semibold text-[11px]"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">Edit</span>
                          </button>

                          {/* Tombol Hapus */}
                          <button
                            onClick={() => setDeletingReport(r)}
                            title="Hapus laporan ini"
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200 flex items-center gap-1 font-semibold text-[11px]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">Hapus</span>
                          </button>

                          {/* Tombol Lihat Detail */}
                          <button
                            onClick={() => onOpenReportDetail(r)}
                            title="Lihat Detail & Progres Real-Time"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Tombol Cetak Dokumen */}
                          <button
                            onClick={() => onPrintSingleReport(r)}
                            title="Cetak Berita Acara PDF"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-200 text-xs font-bold">
                <tr>
                  <td colSpan={8} className="py-3 px-4 text-right uppercase tracking-wider text-slate-600">
                    Total Estimasi Biaya ({totalReports} Titik):
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-extrabold text-blue-900 text-sm">
                    {formatRupiah(totalCost)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">
              Tidak Ada Laporan di Periode {periodLabel}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Silakan ganti tanggal/bulan/tahun di atas atau pilih "Semua Periode".
            </p>
          </div>
        )}
      </div>

      {/* MODAL KONFIRMASI HAPUS */}
      {deletingReport && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Konfirmasi Hapus Laporan
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Kode: {deletingReport.code}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200 text-xs text-rose-800 space-y-1">
              <p className="font-bold">
                Apakah Anda yakin ingin menghapus data laporan ini?
              </p>
              <p className="text-slate-700">
                Titik: <strong>{deletingReport.title}</strong>
              </p>
              <p className="text-slate-500 text-[11px]">
                Lokasi: {deletingReport.location}
              </p>
              <p className="text-[11px] text-rose-600 font-medium pt-1">
                ⚠️ Seluruh riwayat foto dan log timeline laporan ini akan dihapus secara permanen.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingReport(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Laporan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
