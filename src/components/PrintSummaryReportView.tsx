import React from 'react';
import { GutterReport, STATUS_CONFIG, GUTTER_TYPE_LABELS, DAMAGE_TYPE_LABELS, SystemSettings, DEFAULT_SETTINGS } from '../types';
import { Printer, X, FileSpreadsheet, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PrintSummaryReportViewProps {
  reports: GutterReport[];
  periodLabel: string;
  onClose: () => void;
  settings?: SystemSettings;
}

export const PrintSummaryReportView: React.FC<PrintSummaryReportViewProps> = ({
  reports,
  periodLabel,
  onClose,
  settings = DEFAULT_SETTINGS,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const totalCost = reports.reduce((acc, curr) => acc + (curr.estimatedCost || 0), 0);
  const completedCount = reports.filter(r => r.status === 'selesai').length;
  const inProgressCount = reports.filter(r => r.status === 'dikerjakan' || r.status === 'uji_coba').length;
  const pendingCount = reports.filter(r => r.status === 'dilaporkan' || r.status === 'survei').length;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto print:shadow-none print:border-none print:max-w-none print:w-full print:rounded-none">
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm">
              Pratinjau Cetak / Ekspor PDF Rekapitulasi Laporan ({periodLabel})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF Rekap</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 text-slate-900 space-y-6 print:p-6 font-sans">
          {/* Header Kop Surat */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center font-extrabold text-xl shadow-xs">
                ST
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight uppercase text-slate-900">
                  {settings.companyName || DEFAULT_SETTINGS.companyName}
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  {settings.tagline || DEFAULT_SETTINGS.tagline}
                </p>
                <p className="text-[11px] text-slate-500">
                  {settings.address || DEFAULT_SETTINGS.address} • Hotline: {settings.phone || DEFAULT_SETTINGS.phone}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold px-3 py-1 bg-slate-100 rounded border border-slate-300 inline-block">
                REKAP PERIODE
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-1">{periodLabel}</p>
              <p className="text-[10px] text-slate-400">Dicetak: {currentDateStr}</p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center py-1">
            <h2 className="text-lg font-extrabold uppercase tracking-wider underline text-slate-900">
              LAPORAN REKAPITULASI PERBAIKAN TALANG AIR
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Periode: <strong>{periodLabel}</strong> • Total: <strong>{reports.length} Laporan</strong>
            </p>
          </div>

          {/* Summary Box */}
          <div className="grid grid-cols-4 gap-3 text-xs border border-slate-200 rounded-xl p-3 bg-slate-50">
            <div>
              <span className="text-slate-500 block">Total Titik Talang:</span>
              <strong className="text-slate-900 text-base">{reports.length}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Pekerjaan Selesai:</span>
              <strong className="text-emerald-700 text-base">{completedCount}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Sedang Dikerjakan:</span>
              <strong className="text-purple-700 text-base">{inProgressCount}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Total Estimasi Biaya:</span>
              <strong className="text-blue-700 text-base font-mono">{formatRupiah(totalCost)}</strong>
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold">
                  <th className="py-2.5 px-3 w-8">No</th>
                  <th className="py-2.5 px-3">Kode</th>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Titik Talang & Lokasi</th>
                  <th className="py-2.5 px-3">Material</th>
                  <th className="py-2.5 px-3">Masalah</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Biaya (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reports.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-800">{r.code}</td>
                    <td className="py-2 px-3 text-slate-600 whitespace-nowrap">{r.createdAt.split(',')[0]}</td>
                    <td className="py-2 px-3">
                      <strong className="text-slate-900 block">{r.title}</strong>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{r.location}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-700">{GUTTER_TYPE_LABELS[r.gutterType]}</td>
                    <td className="py-2 px-3 text-slate-700">{DAMAGE_TYPE_LABELS[r.damageType]}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-slate-300 bg-white inline-block">
                        {STATUS_CONFIG[r.status]?.label} ({r.progressPercentage}%)
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-slate-800">
                      {formatRupiah(r.estimatedCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-xs">
                  <td colSpan={7} className="py-2.5 px-3 text-right uppercase">
                    Total Biaya Keseluruhan:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-blue-800 text-sm">
                    {formatRupiah(totalCost)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-center">
            <div>
              <p className="text-slate-500 mb-16">Pengawas / Koordinator Proyek:</p>
              <div className="border-t border-slate-400 w-44 mx-auto pt-1 font-bold text-slate-800">
                ( {settings.picCoordinator || 'Pengawas Lapangan'} )
              </div>
            </div>

            <div>
              <p className="text-slate-500 mb-16">Mengetahui, Manajemen Properti:</p>
              <div className="border-t border-slate-400 w-44 mx-auto pt-1 font-bold text-slate-800">
                ( {settings.picLeader || 'Kepala Pengelola'} )
              </div>
            </div>
          </div>

          {/* Footnote */}
          <div className="border-t border-slate-200 pt-2 text-[10px] text-slate-400 text-center">
            Dokumen rekapitulasi sah diterbitkan melalui Aplikasi SiTalang • Laporan Perbaikan Talang Air.
          </div>
        </div>
      </div>
    </div>
  );
};
