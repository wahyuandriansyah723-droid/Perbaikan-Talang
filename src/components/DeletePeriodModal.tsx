import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, Calendar } from 'lucide-react';
import { GutterReport, STATUS_CONFIG } from '../types';

interface DeletePeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodLabel: string;
  reportsToDelete: GutterReport[];
  onConfirmDelete: () => Promise<void> | void;
}

export const DeletePeriodModal: React.FC<DeletePeriodModalProps> = ({
  isOpen,
  onClose,
  periodLabel,
  reportsToDelete,
  onConfirmDelete,
}) => {
  const [confirmedCheckbox, setConfirmedCheckbox] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const totalCost = reportsToDelete.reduce((sum, r) => sum + (r.estimatedCost || 0), 0);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleProceed = async () => {
    if (!confirmedCheckbox || isDeleting) return;
    setIsDeleting(true);
    try {
      await onConfirmDelete();
      setIsDeleting(false);
      setConfirmedCheckbox(false);
      onClose();
    } catch (err) {
      console.error('Error during batch deletion:', err);
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-rose-50/70 border-b border-rose-100 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                  Konfirmasi Hapus Data Periode
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Hapus Laporan {periodLabel}?
              </h3>
              <p className="text-xs text-rose-800 mt-1">
                Tindakan ini akan menghapus data terpilih dari database online Firebase Firestore dan tidak dapat dibatalkan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Preview */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Summary Box */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Jumlah Laporan Terhapus:</span>
              <span className="font-extrabold text-slate-900 text-base font-mono">
                {reportsToDelete.length} Tiket
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Total Estimasi Nilai:</span>
              <span className="font-extrabold text-rose-700 text-base font-mono">
                {formatRupiah(totalCost)}
              </span>
            </div>
          </div>

          {/* List Preview */}
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">
              Daftar Laporan yang akan Dihapus ({reportsToDelete.length} data):
            </span>
            {reportsToDelete.length > 0 ? (
              <div className="max-h-52 overflow-y-auto space-y-2 border border-slate-200 rounded-2xl p-2 bg-slate-50/50">
                {reportsToDelete.map((report) => (
                  <div
                    key={report.id}
                    className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono font-bold text-blue-700">
                          {report.code}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_CONFIG[report.status].color} ${STATUS_CONFIG[report.status].badgeClass}`}>
                          {STATUS_CONFIG[report.status].label}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800 truncate">
                        {report.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{report.createdAt}</span>
                        <span>•</span>
                        <span>{report.location}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-slate-700 text-xs block">
                        {formatRupiah(report.estimatedCost || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Tidak ada laporan yang ditemukan pada periode ini.
              </div>
            )}
          </div>

          {/* Warning Banner */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Peringatan Keamanan:</strong> Seluruh riwayat foto sebelum-sesudah, log pengerjaan teknisi, dan tanda terima digital yang terkait dengan tiket pada periode ini akan dihapus permanen.
            </p>
          </div>

          {/* Safety Checkbox */}
          {reportsToDelete.length > 0 && (
            <div className="space-y-1.5">
              <label className="flex items-start gap-2.5 p-3 bg-rose-50/50 rounded-xl border border-rose-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmedCheckbox}
                  onChange={(e) => setConfirmedCheckbox(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                />
                <span className="text-xs font-semibold text-rose-900 leading-snug">
                  Saya mengerti dan setuju untuk menghapus secara permanen {reportsToDelete.length} data laporan talang periode {periodLabel}.
                </span>
              </label>
              <p className="text-[11px] text-slate-500 italic px-1">
                💡 Setelah penghapusan, tombol <strong>Simpan Perubahan Rekap</strong> akan aktif di dasbor rekap untuk memfinalisasi status dan tersedia opsi pemulihan data.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleProceed}
            disabled={!confirmedCheckbox || reportsToDelete.length === 0 || isDeleting}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-rose-600/20 transition-all active:scale-[0.98]"
          >
            <Trash2 className="w-4 h-4" />
            <span>
              {isDeleting ? 'Menghapus Data...' : `Ya, Hapus ${reportsToDelete.length} Laporan`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
