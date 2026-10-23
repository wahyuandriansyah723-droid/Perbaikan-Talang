import React, { useState, useMemo } from 'react';
import { Trash2, AlertTriangle, X, CheckSquare, Square, Clock, MapPin, User, RotateCcw } from 'lucide-react';
import { GutterReport, STATUS_CONFIG, GUTTER_TYPE_LABELS, DAMAGE_TYPE_LABELS } from '../types';

interface DeleteReportedModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: GutterReport[];
  onConfirmDelete: (reportIds: string[]) => Promise<void> | void;
}

export const DeleteReportedModal: React.FC<DeleteReportedModalProps> = ({
  isOpen,
  onClose,
  reports,
  onConfirmDelete,
}) => {
  // Only target reports that have status 'dilaporkan'
  const reportedReports = useMemo(() => {
    return reports.filter((r) => r.status === 'dilaporkan');
  }, [reports]);

  // Selected report IDs to delete (defaults to all reported reports)
  const [selectedIds, setSelectedIds] = useState<string[]>(() => reportedReports.map((r) => r.id));
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Update selected IDs when reportedReports changes
  React.useEffect(() => {
    setSelectedIds(reportedReports.map((r) => r.id));
  }, [reportedReports]);

  if (!isOpen) return null;

  const filteredItems = reportedReports.filter((r) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      r.code.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      r.reporterName.toLowerCase().includes(q)
    );
  });

  const allSelected = filteredItems.length > 0 && filteredItems.every((r) => selectedIds.includes(r.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredItems.some((r) => r.id === id)));
    } else {
      const idsToAdd = filteredItems.map((r) => r.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleProceed = async () => {
    if (selectedIds.length === 0 || isDeleting) return;
    setIsDeleting(true);
    try {
      await onConfirmDelete(selectedIds);
      setIsDeleting(false);
      onClose();
    } catch (err) {
      console.error('Failed to delete reported data:', err);
      setIsDeleting(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-rose-50/80 border-b border-rose-100 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/25">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Manajemen Tiket Baru
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Status: Dilaporkan (15%)
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Hapus Data yang Sudah Dilaporkan
              </h3>
              <p className="text-xs text-rose-800 mt-0.5">
                Pilih data laporan talang yang baru dilaporkan untuk dihapus dari database sistem.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {reportedReports.length === 0 ? (
            <div className="text-center py-10 text-slate-500 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm">Tidak Ada Data Berstatus "Dilaporkan"</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Semua laporan talang saat ini telah berada dalam tahap survei, pengerjaan, uji coba, atau telah selesai.
              </p>
            </div>
          ) : (
            <>
              {/* Summary & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="text-xs text-slate-600">
                  Ditemukan <strong>{reportedReports.length}</strong> data dengan status{' '}
                  <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    Dilaporkan
                  </span>
                  . Terpilih: <strong className="text-rose-700">{selectedIds.length}</strong> tiket.
                </div>

                <input
                  type="text"
                  placeholder="Cari kode/lokasi..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              {/* Select All Toggle Bar */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 font-bold text-slate-700 hover:text-slate-900"
                >
                  {allSelected ? (
                    <CheckSquare className="w-4 h-4 text-rose-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Pilih Semua Data Dilaporkan ({filteredItems.length})</span>
                </button>

                <div className="text-[11px] text-slate-500 font-medium">
                  {selectedIds.length} dari {reportedReports.length} dipilih
                </div>
              </div>

              {/* Items List */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {filteredItems.map((rep) => {
                  const isChecked = selectedIds.includes(rep.id);
                  return (
                    <div
                      key={rep.id}
                      onClick={() => toggleSelectOne(rep.id)}
                      className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
                        isChecked ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="pt-0.5 shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-rose-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                            {rep.code}
                          </span>
                          <span className="font-bold text-xs text-slate-800 truncate">
                            {rep.title}
                          </span>
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.2 rounded-full border border-blue-200">
                            Dilaporkan
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {rep.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            Pelapor: {rep.reporterName}
                          </span>
                          <span className="font-mono font-semibold text-slate-700">
                            {formatRupiah(rep.estimatedCost)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Info Note about Undo */}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-start gap-2.5 text-xs text-blue-900">
                <RotateCcw className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Fitur Undo Tersedia:</strong> Data yang sudah dilaporkan dan dihapus tetap dapat dipulihkan kapan saja menggunakan tombol <strong>Undo (Ctrl+Z)</strong> di bilah navigasi atau tiket lapangan.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
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
            disabled={selectedIds.length === 0 || isDeleting}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-rose-600/25 transition-all active:scale-95"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menghapus Data...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Hapus {selectedIds.length} Data yang Dilaporkan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
