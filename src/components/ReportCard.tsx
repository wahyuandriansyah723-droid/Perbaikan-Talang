import React from 'react';
import { 
  GutterReport, 
  STATUS_CONFIG, 
  URGENCY_LABELS, 
  GUTTER_TYPE_LABELS, 
  DAMAGE_TYPE_LABELS,
  RepairStatus
} from '../types';
import { 
  MapPin, 
  User, 
  ArrowRight, 
  Camera, 
  CheckCircle2, 
  Clock, 
  Printer,
  Layers,
  AlertCircle
} from 'lucide-react';

interface ReportCardProps {
  report: GutterReport;
  onOpenDetail: (report: GutterReport) => void;
  onQuickAdvanceStatus: (report: GutterReport) => void;
  onPrintReport: (report: GutterReport) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onOpenDetail,
  onQuickAdvanceStatus,
  onPrintReport,
}) => {
  const statusCfg = STATUS_CONFIG[report.status];
  const urgencyCfg = URGENCY_LABELS[report.urgency];
  const latestTimeline = report.timeline[report.timeline.length - 1];

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getNextStatusLabel = (current: RepairStatus): string | null => {
    switch (current) {
      case 'dilaporkan': return 'Mulai Survei & Bahan';
      case 'survei': return 'Mulai Pengerjaan';
      case 'dikerjakan': return 'Lakukan Uji Coba Air';
      case 'uji_coba': return 'Selesaikan Laporan';
      case 'selesai': return null;
    }
  };

  const nextActionLabel = getNextStatusLabel(report.status);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Top Bar: Code, Urgency, Status */}
      <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
              {report.code}
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${urgencyCfg.badgeClass}`}>
              {urgencyCfg.label}
            </span>
            <span className="text-[11px] font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
              {GUTTER_TYPE_LABELS[report.gutterType]}
            </span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-colors line-clamp-1">
            {report.title}
          </h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{report.location}</span>
          </p>
        </div>

        {/* Current Status Badge */}
        <div className="text-right shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusCfg.badgeClass}`}>
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: statusCfg.color }} 
            />
            {statusCfg.label}
          </span>
          <p className="text-[11px] font-semibold text-slate-400 mt-1 font-mono">
            {report.progressPercentage}% Progres
          </p>
        </div>
      </div>

      {/* Progress Bar Visual */}
      <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
        <div 
          className="h-full transition-all duration-500 rounded-r-full"
          style={{ 
            width: `${report.progressPercentage}%`,
            backgroundColor: statusCfg.color
          }}
        />
      </div>

      {/* DUAL FOTO SEBELUM & SESUDAH (FITUR UTAMA KARTU) */}
      <div className="p-4 sm:p-5 pb-2">
        <div 
          onClick={() => onOpenDetail(report)}
          className="relative cursor-pointer group/photos bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 shadow-xs"
          title="Klik untuk membuka komparasi slider interaktif sebelum & sesudah"
        >
          <div className="grid grid-cols-2 gap-0.5 h-36 sm:h-40 relative">
            {/* Foto Sebelum (Kerusakan Awal) */}
            <div className="relative overflow-hidden bg-slate-900">
              <img 
                src={report.damagePhotoUrl} 
                alt={`Kondisi sebelum rusak ${report.title}`}
                className="w-full h-full object-cover group-hover/photos:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute top-2 left-2 bg-red-600/90 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md backdrop-blur-xs">
                <AlertCircle className="w-3 h-3" />
                <span>SEBELUM</span>
              </div>
            </div>

            {/* Foto Sesudah (Hasil Perbaikan) */}
            <div className="relative overflow-hidden bg-slate-900">
              {report.repairPhotoUrl ? (
                <>
                  <img 
                    src={report.repairPhotoUrl} 
                    alt={`Hasil sesudah perbaikan ${report.title}`}
                    className="w-full h-full object-cover group-hover/photos:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 bg-emerald-600/95 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md backdrop-blur-xs">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>SESUDAH</span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-2 text-center text-slate-400">
                  <Clock className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-[10px] font-bold text-slate-600">Pengerjaan</span>
                  <span className="text-[9px] text-slate-400">Belum ada foto hasil</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Hover Strip */}
          <div className="py-1.5 px-3 bg-slate-900/90 text-white text-[11px] font-semibold flex items-center justify-between border-t border-slate-800">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="text-red-400 font-bold">Sebelum (Rusak)</span>
              <span>⇄</span>
              <span className="text-emerald-400 font-bold">Sesudah (Hasil)</span>
            </span>
            <span className="text-[10px] text-blue-300 font-bold group-hover/photos:underline">
              Buka Slider Komparasi →
            </span>
          </div>
        </div>
      </div>

      {/* Middle Content: Details & Notes */}
      <div className="px-4 sm:px-5 pb-4 flex-1 flex flex-col justify-between gap-3 text-xs text-slate-600">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-semibold text-slate-800">
              Masalah: <strong className="text-blue-700">{DAMAGE_TYPE_LABELS[report.damageType]}</strong>
            </span>
            <span className="text-slate-400 text-[11px] font-mono">
              Garansi: {report.warrantyPeriod || '6 Bulan'}
            </span>
          </div>
          <p className="text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            "{report.damageDescription}"
          </p>
        </div>

        {/* Latest timeline activity update */}
        {latestTimeline && (
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold mb-0.5">
              <Clock className="w-3 h-3" />
              <span>Update Terakhir: {latestTimeline.timestamp}</span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1 italic">
              "{latestTimeline.note}"
            </p>
          </div>
        )}

        {/* Footer Meta: Reporter, Cost, Actions */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <strong className="text-slate-700">{report.reporterName.split(' ')[0]}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-bold text-slate-800 font-mono">
              {formatRupiah(report.estimatedCost)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {/* Print Button */}
            <button
              onClick={() => onPrintReport(report)}
              title="Cetak Berita Acara / Laporan PDF"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Quick advance status if not completed */}
            {nextActionLabel && (
              <button
                onClick={() => onQuickAdvanceStatus(report)}
                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl border border-blue-200 transition-colors flex items-center gap-1"
                title="Percepat progres ke tahap berikutnya"
              >
                <span>{nextActionLabel}</span>
              </button>
            )}

            {/* Full Details Button */}
            <button
              onClick={() => onOpenDetail(report)}
              className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Detail & Komparasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
