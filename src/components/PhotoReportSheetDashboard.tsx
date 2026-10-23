import React, { useState, useMemo } from 'react';
import { 
  GutterReport, 
  STATUS_CONFIG, 
  URGENCY_LABELS, 
  GUTTER_TYPE_LABELS, 
  DAMAGE_TYPE_LABELS, 
  SystemSettings, 
  DEFAULT_SETTINGS,
  getGutterTypeLabel,
  getDamageTypeLabel
} from '../types';
import { 
  PeriodType, 
  filterReportsByPeriod, 
  INDONESIAN_MONTHS, 
  parseReportDate 
} from '../utils/dateHelper';
import { exportPhotoReportToExcel } from '../utils/exportExcel';
import { 
  FileSpreadsheet, 
  Printer, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Eye, 
  Maximize2, 
  Download, 
  FileDown, 
  Search, 
  Sliders, 
  Table, 
  FileText, 
  MapPin, 
  User, 
  Clock, 
  X, 
  Check, 
  ChevronRight,
  Filter,
  Layers,
  ArrowRight
} from 'lucide-react';

interface PhotoReportSheetDashboardProps {
  reports: GutterReport[];
  settings?: SystemSettings;
  onOpenReportDetail: (report: GutterReport) => void;
  onPrintSingleReport: (report: GutterReport) => void;
}

export const PhotoReportSheetDashboard: React.FC<PhotoReportSheetDashboardProps> = ({
  reports,
  settings = DEFAULT_SETTINGS,
  onOpenReportDetail,
  onPrintSingleReport,
}) => {
  // Format Layout Mode: 'excel' (Spreadsheet Grid) | 'pdf' (Printable A4 Sheet Cards)
  const [formatLayout, setFormatLayout] = useState<'excel' | 'pdf'>('excel');

  // Filter States
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [photoFilter, setPhotoFilter] = useState<'all' | 'has_both' | 'before_only'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Lightbox Modal for Photo Inspection
  const [previewPhoto, setPreviewPhoto] = useState<{
    url: string;
    title: string;
    type: 'before' | 'after';
    report: GutterReport;
  } | null>(null);

  const availableYears = [2026, 2025, 2024, 2023];

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

  // Filtered reports by period and secondary filters
  const filteredReports = useMemo(() => {
    const periodFiltered = filterReportsByPeriod(
      reports,
      periodType,
      selectedDate,
      selectedMonth,
      selectedYear
    );

    return periodFiltered.filter((r) => {
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'selesai' && r.status !== 'selesai') return false;
        if (statusFilter === 'proses' && r.status !== 'dikerjakan' && r.status !== 'uji_coba') return false;
        if (statusFilter === 'menunggu' && r.status !== 'dilaporkan' && r.status !== 'survei') return false;
      }

      // Photo filter
      if (photoFilter === 'has_both' && !r.repairPhotoUrl) return false;
      if (photoFilter === 'before_only' && r.repairPhotoUrl) return false;

      // Text query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const match = 
          r.code.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.technicianName.toLowerCase().includes(q) ||
          r.reporterName.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [reports, periodType, selectedDate, selectedMonth, selectedYear, statusFilter, photoFilter, searchQuery]);

  const totalCompletedWithPhotos = filteredReports.filter(r => r.repairPhotoUrl).length;
  const totalCost = filteredReports.reduce((sum, r) => sum + (r.estimatedCost || 0), 0);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleExportExcel = () => {
    exportPhotoReportToExcel(filteredReports, periodLabel);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Toolbar (Hidden during browser print) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <Camera className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Dasbor Laporan Foto Dokumentasi
            </span>
            <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
              Format Excel / PDF
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Lembar Dokumentasi Foto Sebelum & Sesudah Perbaikan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Katalog dan tabel perbandingan foto fisik talang air lapangan yang dirancang sesuai format lembar kerja Excel & berita acara PDF.
          </p>
        </div>

        {/* View Switcher & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Format Layout Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setFormatLayout('excel')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                formatLayout === 'excel'
                  ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Format Excel Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setFormatLayout('pdf')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                formatLayout === 'pdf'
                  ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Format Katalog PDF</span>
            </button>
          </div>

          {/* Export Excel Button */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-[0.98]"
            title="Unduh tabel foto dalam format file Microsoft Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          {/* Cetak / Unduh PDF Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-[0.98]"
            title="Cetak lembar laporan foto atau simpan langsung ke file PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Unduh PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar Card (Hidden during print) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Period Mode Selector */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl max-w-fit">
            <button
              onClick={() => setPeriodType('day')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                periodType === 'day' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Harian</span>
            </button>
            <button
              onClick={() => setPeriodType('month')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                periodType === 'month' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Bulanan</span>
            </button>
            <button
              onClick={() => setPeriodType('year')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                periodType === 'year' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Tahunan</span>
            </button>
            <button
              onClick={() => setPeriodType('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                periodType === 'all' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Semua</span>
            </button>
          </div>

          {/* Period Details Selectors */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {periodType === 'day' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none"
              />
            )}

            {periodType === 'month' && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none"
                >
                  {INDONESIAN_MONTHS.map((m, idx) => (
                    <option key={m} value={idx + 1}>{m}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none font-mono"
                >
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            )}

            {periodType === 'year' && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none font-mono"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>Tahun {yr}</option>
                ))}
              </select>
            )}

            <div className="px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200 font-bold text-emerald-800">
              Periode: <strong>{periodLabel}</strong> ({filteredReports.length} Laporan)
            </div>
          </div>
        </div>

        {/* Secondary Filter Row: Search & Photo status */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1 max-w-lg">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kode tiket, lokasi, teknisi..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={photoFilter}
              onChange={(e) => setPhotoFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">Semua Foto Dokumentasi</option>
              <option value="has_both">Foto Lengkap (Sebelum & Sesudah)</option>
              <option value="before_only">Foto Sebelum Saja</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">Semua Status Pengerjaan</option>
              <option value="selesai">Selesai 100%</option>
              <option value="proses">Sedang Pengerjaan / Uji Coba</option>
              <option value="menunggu">Laporan Baru / Survei</option>
            </select>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <span>
              Lengkap Sesudah: <strong className="text-emerald-600">{totalCompletedWithPhotos}</strong>/{filteredReports.length}
            </span>
            <span>•</span>
            <span>
              Total Nilai: <strong className="text-slate-800 font-mono">{formatRupiah(totalCost)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* FORMAL PRINTABLE HEADER (Only visible during print or in PDF mode preview header) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-700 text-white rounded-xl flex items-center justify-center font-extrabold text-xl">
              ST
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                {settings.companyName || 'SISTEM MANAJEMEN TALANG AIR INDONESIA'}
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                {settings.tagline || 'Layanan Inspeksi, Perbaikan & Uji Siram Talang Bergaransi'}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {settings.address} • Telp: {settings.phone} • Email: {settings.email}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 block mb-1">
              DOKUMEN BERITA ACARA FOTO
            </span>
            <span className="text-xs font-bold text-slate-800">
              Periode: {periodLabel}
            </span>
            <span className="text-[10px] text-slate-500 block">
              Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* TAMPILAN 1: FORMAT LEMBAR KERJA EXCEL GRID (SPREADSHEET PHOTO MATRIX) */}
      {formatLayout === 'excel' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden print:border-none print:shadow-none">
          {/* Excel Workbook Green Header Bar (Hidden during print) */}
          <div className="p-3 sm:p-4 bg-emerald-800 text-white flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-sm text-white shadow-2xs">
                X
              </div>
              <div>
                <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                  Lembar Kerja Excel: Dokumentasi_Foto_Talang_{periodLabel.replace(/\s+/g, '_')}.xlsx
                </span>
                <span className="text-[11px] text-emerald-200 block">
                  Matriks baris & kolom dengan perbandingan foto kondisi sebelum rusak vs hasil pengerjaan
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportExcel}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 border border-emerald-500"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .xlsx</span>
              </button>
            </div>
          </div>

          {filteredReports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/90 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b-2 border-slate-300">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center border-r border-slate-200">No</th>
                    <th className="py-3 px-3 w-28 border-r border-slate-200">Kode Tiket</th>
                    <th className="py-3 px-3 min-w-[140px] border-r border-slate-200">Tanggal & Lokasi</th>
                    <th className="py-3 px-3 min-w-[130px] border-r border-slate-200">Spesifikasi Material</th>
                    <th className="py-3 px-3 min-w-[200px] text-center bg-red-50/60 text-red-900 border-r border-slate-200">
                      Foto Sebelum (Rusak)
                    </th>
                    <th className="py-3 px-3 min-w-[200px] text-center bg-emerald-50/60 text-emerald-900 border-r border-slate-200">
                      Foto Sesudah (Hasil)
                    </th>
                    <th className="py-3 px-3 min-w-[170px] border-r border-slate-200">Deskripsi & Tindakan</th>
                    <th className="py-3 px-3 min-w-[110px] text-center border-r border-slate-200">Status</th>
                    <th className="py-3 px-3 min-w-[110px] text-right border-r border-slate-200">Biaya (Rp)</th>
                    <th className="py-3 px-3 w-24 text-center print:hidden">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredReports.map((report, idx) => {
                    const statusCfg = STATUS_CONFIG[report.status];
                    const urgencyCfg = URGENCY_LABELS[report.urgency];

                    return (
                      <tr 
                        key={report.id} 
                        className={`hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                      >
                        {/* No */}
                        <td className="py-3 px-3 text-center font-bold text-slate-500 border-r border-slate-200 align-top">
                          {idx + 1}
                        </td>

                        {/* Kode Tiket */}
                        <td className="py-3 px-3 font-mono font-bold text-blue-700 border-r border-slate-200 align-top whitespace-nowrap">
                          {report.code}
                          <span className={`block mt-1 text-[10px] font-semibold px-1.5 py-0.2 rounded-md border text-center ${urgencyCfg.badgeClass}`}>
                            {urgencyCfg.label.split(' ')[0]}
                          </span>
                        </td>

                        {/* Tanggal & Lokasi */}
                        <td className="py-3 px-3 border-r border-slate-200 align-top">
                          <strong className="text-slate-900 font-bold block text-xs">
                            {report.title}
                          </strong>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {report.location}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-1">
                            {report.createdAt.split(',')[0]}
                          </span>
                        </td>

                        {/* Spesifikasi */}
                        <td className="py-3 px-3 border-r border-slate-200 align-top text-xs space-y-1">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Material:</span>
                            <span className="font-semibold text-slate-800">
                              {getGutterTypeLabel(report.gutterType)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Masalah:</span>
                            <span className="text-slate-700">
                              {getDamageTypeLabel(report.damageType)}
                            </span>
                          </div>
                        </td>

                        {/* FOTO SEBELUM (RUSAK) */}
                        <td className="py-2.5 px-3 border-r border-slate-200 align-top text-center bg-red-50/20">
                          <div 
                            onClick={() => setPreviewPhoto({
                              url: report.damagePhotoUrl,
                              title: `Foto Sebelum (Kerusakan Awal) - ${report.code}`,
                              type: 'before',
                              report,
                            })}
                            className="relative group/pic cursor-pointer rounded-xl overflow-hidden border border-red-200 bg-slate-900 shadow-2xs max-w-[190px] mx-auto"
                            title="Klik untuk perbesar foto kondisi awal"
                          >
                            <img 
                              src={report.damagePhotoUrl} 
                              alt={`Foto sebelum ${report.title}`}
                              className="w-full h-28 object-cover group-hover/pic:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded shadow-xs">
                              SEBELUM
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/pic:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>Zoom</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            Kondisi Rusak / Bocor
                          </span>
                        </td>

                        {/* FOTO SESUDAH (HASIL) */}
                        <td className="py-2.5 px-3 border-r border-slate-200 align-top text-center bg-emerald-50/20">
                          {report.repairPhotoUrl ? (
                            <>
                              <div 
                                onClick={() => setPreviewPhoto({
                                  url: report.repairPhotoUrl!,
                                  title: `Foto Sesudah (Hasil Perbaikan & Uji Siram) - ${report.code}`,
                                  type: 'after',
                                  report,
                                })}
                                className="relative group/pic cursor-pointer rounded-xl overflow-hidden border border-emerald-200 bg-slate-900 shadow-2xs max-w-[190px] mx-auto"
                                title="Klik untuk perbesar foto hasil perbaikan"
                              >
                                <img 
                                  src={report.repairPhotoUrl} 
                                  alt={`Foto sesudah ${report.title}`}
                                  className="w-full h-28 object-cover group-hover/pic:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                />
                                <div className="absolute top-1 right-1 bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded shadow-xs">
                                  SESUDAH
                                </div>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/pic:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                                  <Maximize2 className="w-3.5 h-3.5" />
                                  <span>Zoom</span>
                                </div>
                              </div>
                              <span className="text-[10px] text-emerald-700 font-bold mt-1 block flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Selesai & Uji Siram
                              </span>
                            </>
                          ) : (
                            <div className="h-28 border border-dashed border-slate-300 rounded-xl bg-slate-100 flex flex-col items-center justify-center p-2 text-center text-slate-400 max-w-[190px] mx-auto">
                              <Clock className="w-4 h-4 mb-1 text-slate-400" />
                              <span className="text-[10px] font-bold text-slate-600">Dalam Pengerjaan</span>
                              <span className="text-[9px] text-slate-400">Belum ada foto hasil</span>
                            </div>
                          )}
                        </td>

                        {/* Deskripsi & Tindakan */}
                        <td className="py-3 px-3 border-r border-slate-200 align-top text-xs space-y-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Diagnosa:</span>
                            <p className="text-slate-700 line-clamp-2 italic text-[11px]">
                              "{report.damageDescription}"
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Tindakan:</span>
                            <p className="text-slate-800 font-medium line-clamp-2 text-[11px]">
                              {report.repairNotes || 'Pembersihan talang, penambalan dengan sealant elastis & uji debit air siram.'}
                            </p>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 border-r border-slate-200 align-top text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.badgeClass}`}>
                            {statusCfg.label}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 block mt-1 font-bold">
                            {report.progressPercentage}%
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            Garansi: {report.warrantyPeriod || '6 Bulan'}
                          </span>
                        </td>

                        {/* Biaya */}
                        <td className="py-3 px-3 border-r border-slate-200 align-top text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {formatRupiah(report.estimatedCost)}
                        </td>

                        {/* Aksi (Hidden on Print) */}
                        <td className="py-3 px-3 align-top text-center print:hidden space-y-1">
                          <button
                            onClick={() => onOpenReportDetail(report)}
                            title="Buka Komparasi Slider Interaktif"
                            className="p-1.5 text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 rounded-lg transition-colors flex items-center justify-center gap-1 w-full text-[11px] font-bold"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Slider</span>
                          </button>
                          <button
                            onClick={() => onPrintSingleReport(report)}
                            title="Unduh PDF Berita Acara Tunggal"
                            className="p-1.5 text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 rounded-lg transition-colors flex items-center justify-center gap-1 w-full text-[11px] font-bold"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 border-t-2 border-slate-300 text-xs font-bold">
                  <tr>
                    <td colSpan={8} className="py-3 px-4 text-right uppercase tracking-wider text-slate-700">
                      Total Nilai Pekerjaan Dokumentasi ({filteredReports.length} Titik Talang):
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-blue-900 text-sm">
                      {formatRupiah(totalCost)}
                    </td>
                    <td className="print:hidden"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <Camera className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-700">Tidak Ada Foto Dokumentasi</h4>
              <p className="text-xs text-slate-400 mt-1">
                Silakan sesuaikan filter periode atau kata kunci di atas.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAMPILAN 2: FORMAT KATALOG CETAK LEMBAR FOTO PDF (A4 PRINTABLE CARDS MATRIX) */}
      {formatLayout === 'pdf' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
            {filteredReports.map((report, idx) => {
              const statusCfg = STATUS_CONFIG[report.status];
              const urgencyCfg = URGENCY_LABELS[report.urgency];

              return (
                <div 
                  key={report.id}
                  className="bg-white rounded-2xl border border-slate-300 p-4 sm:p-5 shadow-xs flex flex-col justify-between break-inside-avoid print:shadow-none print:border-slate-400 print:p-3"
                >
                  {/* Card Header: No, Code, Title */}
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-mono font-extrabold text-xs text-slate-900 block">
                            {report.code}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {report.createdAt.split(',')[0]}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.badgeClass}`}>
                          {statusCfg.label} ({report.progressPercentage}%)
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${urgencyCfg.badgeClass}`}>
                          {urgencyCfg.label.split(' ')[0]}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 mb-1">
                      {report.title}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{report.location}</span>
                    </p>

                    {/* DUAL FOTO SEBELUM & SESUDAH BERDAMPINGAN */}
                    <div className="grid grid-cols-2 gap-2.5 mb-3">
                      {/* Foto Sebelum */}
                      <div 
                        onClick={() => setPreviewPhoto({
                          url: report.damagePhotoUrl,
                          title: `Foto Sebelum - ${report.code}`,
                          type: 'before',
                          report,
                        })}
                        className="cursor-pointer group/pic rounded-xl overflow-hidden border border-red-300 bg-slate-900 relative shadow-2xs"
                      >
                        <img 
                          src={report.damagePhotoUrl} 
                          alt="Sebelum perbaikan"
                          className="w-full h-36 object-cover group-hover/pic:scale-105 transition-transform" 
                          loading="lazy"
                        />
                        <div className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-md">
                          SEBELUM (RUSAK)
                        </div>
                      </div>

                      {/* Foto Sesudah */}
                      {report.repairPhotoUrl ? (
                        <div 
                          onClick={() => setPreviewPhoto({
                            url: report.repairPhotoUrl!,
                            title: `Foto Sesudah - ${report.code}`,
                            type: 'after',
                            report,
                          })}
                          className="cursor-pointer group/pic rounded-xl overflow-hidden border border-emerald-300 bg-slate-900 relative shadow-2xs"
                        >
                          <img 
                            src={report.repairPhotoUrl} 
                            alt="Sesudah perbaikan"
                            className="w-full h-36 object-cover group-hover/pic:scale-105 transition-transform" 
                            loading="lazy"
                          />
                          <div className="absolute top-1.5 right-1.5 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-md">
                            SESUDAH (HASIL)
                          </div>
                        </div>
                      ) : (
                        <div className="h-36 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center p-2 text-center text-slate-400">
                          <Clock className="w-5 h-5 mb-1 text-slate-400" />
                          <span className="text-[11px] font-bold text-slate-600">Pengerjaan</span>
                          <span className="text-[10px] text-slate-400">Menunggu foto hasil</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata Spesifikasi */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Material:</span>
                        <strong className="text-slate-800">{getGutterTypeLabel(report.gutterType)}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Masalah Kerusakan:</span>
                        <strong className="text-slate-800">{getDamageTypeLabel(report.damageType)}</strong>
                      </div>
                    </div>

                    {/* Catatan Lapangan */}
                    <p className="text-xs text-slate-600 line-clamp-2 italic bg-blue-50/50 p-2 rounded-lg border border-blue-100 mb-3">
                      "{report.damageDescription}"
                    </p>
                  </div>

                  {/* Footer Card: Cost & Actions */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Estimasi Biaya:</span>
                      <span className="font-mono font-extrabold text-slate-900 text-sm">
                        {formatRupiah(report.estimatedCost)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 print:hidden">
                      <button
                        onClick={() => onPrintSingleReport(report)}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg border border-rose-200 transition-colors flex items-center gap-1"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Unduh PDF</span>
                      </button>
                      <button
                        onClick={() => onOpenReportDetail(report)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>Detail</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SIGNATURE SECTION (Visible during print on paper / PDF export) */}
          <div className="hidden print:block pt-8 mt-6 border-t border-slate-300 text-xs">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="font-semibold text-slate-600 mb-16">Pelapor / Pemilik Gedung:</p>
                <div className="border-b border-slate-400 mx-8"></div>
                <p className="font-bold text-slate-800 mt-1">Nama & Tanda Tangan</p>
              </div>
              <div>
                <p className="font-semibold text-slate-600 mb-16">Teknisi Penanggung Jawab:</p>
                <div className="border-b border-slate-400 mx-8"></div>
                <p className="font-bold text-slate-800 mt-1">{settings.picLeader || 'Ketua Tim Teknisi'}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-600 mb-16">Pengawas / Koordinator Lapangan:</p>
                <div className="border-b border-slate-400 mx-8"></div>
                <p className="font-bold text-slate-800 mt-1">{settings.picCoordinator || 'Koordinator Lapangan'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN PHOTO INSPECTION LIGHTBOX MODAL */}
      {previewPhoto && (
        <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full overflow-hidden text-white shadow-2xl flex flex-col max-h-[90vh]">
            {/* Lightbox Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                  previewPhoto.type === 'before' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {previewPhoto.type === 'before' ? 'Foto Sebelum (Rusak)' : 'Foto Sesudah (Hasil)'}
                </span>
                <h4 className="text-sm font-extrabold text-slate-100 truncate">
                  {previewPhoto.title}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const r = previewPhoto.report;
                    setPreviewPhoto(null);
                    onOpenReportDetail(r);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Buka Slider Komparasi</span>
                </button>
                <button
                  onClick={() => setPreviewPhoto(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Photo View Box */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/60">
              <img 
                src={previewPhoto.url} 
                alt={previewPhoto.title}
                className="max-h-[60vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-slate-800"
              />
            </div>

            {/* Lightbox Footer with Specs */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span>Titik: <strong className="text-slate-200">{previewPhoto.report.title}</strong></span>
                <span>•</span>
                <span>Lokasi: <strong className="text-slate-200">{previewPhoto.report.location}</strong></span>
                <span>•</span>
                <span>Material: <strong className="text-slate-200">{getGutterTypeLabel(previewPhoto.report.gutterType)}</strong></span>
              </div>

              {/* Toggle Before / After inside Lightbox if available */}
              {previewPhoto.report.repairPhotoUrl && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewPhoto({
                      url: previewPhoto.report.damagePhotoUrl,
                      title: `Foto Sebelum - ${previewPhoto.report.code}`,
                      type: 'before',
                      report: previewPhoto.report,
                    })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      previewPhoto.type === 'before' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    Lihat Sebelum
                  </button>
                  <button
                    onClick={() => setPreviewPhoto({
                      url: previewPhoto.report.repairPhotoUrl!,
                      title: `Foto Sesudah - ${previewPhoto.report.code}`,
                      type: 'after',
                      report: previewPhoto.report,
                    })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      previewPhoto.type === 'after' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    Lihat Sesudah
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
