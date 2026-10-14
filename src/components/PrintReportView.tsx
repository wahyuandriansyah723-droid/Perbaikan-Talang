import React from 'react';
import { GutterReport, STATUS_CONFIG, GUTTER_TYPE_LABELS, DAMAGE_TYPE_LABELS, URGENCY_LABELS, SystemSettings, DEFAULT_SETTINGS } from '../types';
import { Printer, X, Download, ShieldCheck, Wrench, Droplets } from 'lucide-react';

interface PrintReportViewProps {
  report: GutterReport | null;
  onClose: () => void;
  settings?: SystemSettings;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({ 
  report, 
  onClose,
  settings = DEFAULT_SETTINGS,
}) => {
  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      {/* Container */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto print:shadow-none print:border-none print:max-w-none print:w-full print:rounded-none">
        {/* Print / Action Toolbar (Hidden during print) */}
        <div className="p-4 bg-slate-800 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm">Pratinjau Cetak / Ekspor PDF Berita Acara</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formal Printable Document Content */}
        <div className="p-8 sm:p-12 text-slate-900 space-y-6 print:p-8 font-sans">
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
              <div className="font-mono text-xs font-bold px-3 py-1 bg-slate-100 rounded border border-slate-300 inline-block">
                {report.code}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Tanggal: {report.createdAt}</p>
            </div>
          </div>

          {/* Title Document */}
          <div className="text-center py-2">
            <h2 className="text-lg font-bold uppercase tracking-wider underline text-slate-900">
              BERITA ACARA & LAPORAN PERBAIKAN TALANG AIR
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Dokumentasi Hasil Pekerjaan & Status Progres Lapangan
            </p>
          </div>

          {/* Section 1: Informasi Lokasi & Klien */}
          <div className="grid grid-cols-2 gap-4 text-xs border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div>
              <p className="text-slate-500 font-medium">Titik Talang:</p>
              <p className="font-bold text-slate-900 text-sm">{report.title}</p>
              <p className="text-slate-500 font-medium mt-2">Alamat / Lokasi:</p>
              <p className="font-semibold text-slate-800">{report.location}</p>
            </div>

            <div>
              <p className="text-slate-500 font-medium">Nama Pelapor / Klien:</p>
              <p className="font-bold text-slate-900">{report.reporterName} ({report.reporterPhone || '-'})</p>
              <p className="text-slate-500 font-medium mt-2">Teknisi Penanggung Jawab:</p>
              <p className="font-semibold text-slate-800">{report.technicianName}</p>
            </div>
          </div>

          {/* Section 2: Spesifikasi & Diagnosa */}
          <div className="grid grid-cols-4 gap-2 text-xs border border-slate-200 rounded-xl p-3">
            <div>
              <span className="text-slate-400 block">Jenis Talang:</span>
              <strong className="text-slate-800">{GUTTER_TYPE_LABELS[report.gutterType]}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Masalah Utama:</span>
              <strong className="text-slate-800">{DAMAGE_TYPE_LABELS[report.damageType]}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Urgensi:</span>
              <strong className="text-slate-800">{URGENCY_LABELS[report.urgency].label.split(' ')[0]}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Status Terkini:</span>
              <strong className="text-blue-700">{STATUS_CONFIG[report.status].label} ({report.progressPercentage}%)</strong>
            </div>
          </div>

          {/* Section 3: Foto Dokumentasi Sebelum & Sesudah */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Dokumentasi Foto Bukti Pekerjaan:
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Foto Sebelum */}
              <div className="border border-slate-300 rounded-xl p-2.5 bg-white text-center">
                <span className="text-[11px] font-bold text-red-600 block mb-1">
                  1. KONDISI SEBELUM (RUSAK / BOCOR)
                </span>
                <div className="h-48 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                  <img 
                    src={report.damagePhotoUrl} 
                    alt="Sebelum perbaikan" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <p className="text-[10px] text-slate-600 mt-1.5 italic text-left line-clamp-2">
                  "{report.damageDescription}"
                </p>
              </div>

              {/* Foto Sesudah */}
              <div className="border border-slate-300 rounded-xl p-2.5 bg-white text-center">
                <span className="text-[11px] font-bold text-emerald-600 block mb-1">
                  2. KONDISI SESUDAH (PERBAIKAN SELESAI)
                </span>
                <div className="h-48 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                  {report.repairPhotoUrl ? (
                    <img 
                      src={report.repairPhotoUrl} 
                      alt="Setelah perbaikan" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="text-slate-400 text-xs italic p-4">
                      Foto perbaikan tahap akhir akan dilampirkan setelah uji coba air tuntas.
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-600 mt-1.5 italic text-left line-clamp-2">
                  {report.repairNotes ? `"${report.repairNotes}"` : 'Talang telah ditambal dengan lapisan tahan air.'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Catatan Pekerjaan & Garansi */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Biaya Keseluruhan:</span>
              <span className="font-bold font-mono text-slate-900 text-sm">
                {formatRupiah(report.estimatedCost)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-1">
              <span className="text-slate-600">Garansi Layanan Bebas Bocor:</span>
              <span className="font-bold text-emerald-700">{report.warrantyPeriod || settings.defaultWarranty || '6 Bulan Bebas Bocor'}</span>
            </div>
          </div>

          {/* Section 5: Tanda Tangan Para Pihak */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-center">
            <div>
              <p className="text-slate-500 mb-16">Pemberi Kerja / Pemilik:</p>
              <div className="border-t border-slate-400 w-44 mx-auto pt-1 font-bold text-slate-800">
                ( {report.reporterName.split('(')[0].trim()} )
              </div>
            </div>

            <div>
              <p className="text-slate-500 mb-16">Koordinator Lapangan / Pelaksana:</p>
              <div className="border-t border-slate-400 w-44 mx-auto pt-1 font-bold text-slate-800">
                ( {settings.picCoordinator || report.technicianName} )
              </div>
            </div>
          </div>

          {/* Footnote */}
          <div className="border-t border-slate-200 pt-2 text-[10px] text-slate-400 text-center">
            Dokumen sah diterbitkan otomatis melalui Aplikasi SiTalang • Bukti verifikasi pengerjaan talang air anti bocor.
          </div>
        </div>
      </div>
    </div>
  );
};
