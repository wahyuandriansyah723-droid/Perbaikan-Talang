import React, { useState } from 'react';
import { 
  GutterReport, 
  GutterType, 
  DamageType, 
  UrgencyLevel,
  RepairStatus,
  GUTTER_TYPE_LABELS, 
  DAMAGE_TYPE_LABELS, 
  URGENCY_LABELS,
  STATUS_CONFIG,
  TimelineEvent
} from '../types';
import { SAMPLE_PRESET_IMAGES } from '../data/mockData';
import { 
  X, 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Wrench,
  DollarSign,
  Calendar,
  Clock,
  Layers
} from 'lucide-react';

interface NewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newReport: GutterReport) => void;
}

export const NewReportModal: React.FC<NewReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [reportDate, setReportDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [reportTime, setReportTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [gutterType, setGutterType] = useState<GutterType>('seng_galvalum');
  const [damageType, setDamageType] = useState<DamageType>('bocor_retak');
  const [urgency, setUrgency] = useState<UrgencyLevel>('darurat');
  const [status, setStatus] = useState<RepairStatus>('dilaporkan');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [technicianName, setTechnicianName] = useState('Pak Joko (Spesialis Atap)');
  const [estimatedCost, setEstimatedCost] = useState('500000');
  const [damageDescription, setDamageDescription] = useState('');
  const [repairNotes, setRepairNotes] = useState('');

  // Foto Sebelum (Kerusakan Awal)
  const [damagePhotoUrl, setDamagePhotoUrl] = useState(SAMPLE_PRESET_IMAGES[0].beforeUrl);
  // Foto Sesudah (Hasil Perbaikan)
  const [repairPhotoUrl, setRepairPhotoUrl] = useState(SAMPLE_PRESET_IMAGES[0].afterUrl);

  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number | null>(0);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Ukuran foto maksimal 8MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (target === 'before') {
        setDamagePhotoUrl(result);
      } else {
        setRepairPhotoUrl(result);
      }
      setSelectedPresetIdx(null);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetPair = (idx: number) => {
    const preset = SAMPLE_PRESET_IMAGES[idx];
    if (!preset) return;
    setDamagePhotoUrl(preset.beforeUrl);
    setRepairPhotoUrl(preset.afterUrl);
    setSelectedPresetIdx(idx);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg('Harap isi judul / area talang yang rusak');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Harap isi alamat / lokasi detail talang');
      return;
    }
    if (!damagePhotoUrl) {
      setErrorMsg('Harap sertakan foto sebelum perbaikan (foto kerusakan)');
      return;
    }

    let timeFormatted = '';
    let reportYear = new Date().getFullYear();
    try {
      if (reportDate) {
        const [yStr, mStr, dStr] = reportDate.split('-');
        reportYear = Number(yStr) || reportYear;
        const [hStr, minStr] = (reportTime || '09:00').split(':');
        const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
        const mIdx = Math.max(0, Math.min(11, (Number(mStr) || 1) - 1));
        timeFormatted = `${Number(dStr) || 1} ${monthNames[mIdx]} ${yStr}, ${hStr || '09'}:${minStr || '00'} WIB`;
      }
    } catch {
      // fallback
    }

    if (!timeFormatted) {
      const now = new Date();
      timeFormatted = `${now.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][now.getMonth()]} ${now.getFullYear()}, ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} WIB`;
    }

    const code = `TLG-${reportYear}-${String(Math.floor(Math.random() * 900) + 100)}`;
    const progressPct = STATUS_CONFIG[status].percentage;

    const timelineEvents: TimelineEvent[] = [
      {
        id: `t-${Date.now()}-1`,
        timestamp: timeFormatted,
        status: 'dilaporkan',
        title: 'Laporan Kerusakan Didaftarkan',
        note: `Dokumentasi foto kerusakan talang diterima pada tanggal ${timeFormatted.split(',')[0]} oleh ${reporterName.trim() || 'Pelapor'}.`,
        actor: reporterName.trim() || 'Pelapor',
      },
    ];

    if (status === 'selesai' && repairPhotoUrl) {
      timelineEvents.push({
        id: `t-${Date.now()}-2`,
        timestamp: timeFormatted,
        status: 'selesai' as const,
        title: 'Perbaikan Selesai & Foto Hasil Terlampir',
        note: repairNotes.trim() || 'Pekerjaan penambalan dan perbaikan talang rampung bergaransi.',
        photoUrl: repairPhotoUrl,
        actor: technicianName.trim() || 'Teknisi',
      });
    }

    const newReport: GutterReport = {
      id: `rep-${Date.now()}`,
      code,
      title: title.trim(),
      location: location.trim(),
      gutterType,
      damageType,
      urgency,
      reporterName: reporterName.trim() || 'Pelapor Lapangan',
      reporterPhone: reporterPhone.trim() || '-',
      technicianName: technicianName.trim() || 'Tim SiTalang',
      damagePhotoUrl,
      damageDescription: damageDescription.trim() || 'Ditemukan kebocoran dan kerusakan pada talang air perlu tindakan perbaikan.',
      repairPhotoUrl: repairPhotoUrl || undefined,
      repairNotes: repairNotes.trim() || (repairPhotoUrl ? 'Pembersihan talang, penambalan serat fiber waterproofing, dan uji kebocoran.' : undefined),
      status,
      progressPercentage: progressPct,
      estimatedCost: Number(estimatedCost) || 0,
      createdAt: timeFormatted,
      updatedAt: timeFormatted,
      warrantyPeriod: '6 Bulan',
      timeline: timelineEvents,
    };

    onSubmit(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
                Formulir Laporan Lengkap
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Foto Sebelum & Sesudah
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
              Input Laporan & Foto Perbaikan Talang
            </h2>
            <p className="text-xs text-slate-500">
              Lampirkan tanggal kejadian, foto sebelum (rusak), serta foto sesudah (hasil pengerjaan).
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tanggal & Waktu Pelaporan Kerusakan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200/80">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Tanggal Laporan / Kejadian <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="date"
                required
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Waktu Kejadian (WIB)</span>
              </label>
              <input
                type="time"
                value={reportTime}
                onChange={(e) => setReportTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
              />
            </div>
          </div>

          {/* FOTO SEBELUM & SESUDAH (FITUR UTAMA) */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Dokumentasi Foto: Sebelum vs Sesudah</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Pilih foto kamera/galeri atau gunakan preset simulasi di bawah
              </span>
            </div>

            {/* Dua Frame Foto: Sebelum dan Sesudah */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Frame 1: Foto Sebelum (Kerusakan Awal) */}
              <div className="bg-white p-3 rounded-2xl border-2 border-red-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-red-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    1. Foto Sebelum (Rusak) <span className="text-rose-500">*</span>
                  </span>
                  <label className="cursor-pointer text-[11px] font-bold text-blue-600 hover:text-blue-800 underline flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload Foto</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, 'before')}
                    />
                  </label>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-40 flex items-center justify-center">
                  {damagePhotoUrl ? (
                    <img 
                      src={damagePhotoUrl} 
                      alt="Pratinjau Foto Sebelum" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-3 text-slate-400">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                      <span className="text-[11px]">Belum ada foto sebelum</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                    SEBELUM
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={damageDescription}
                  onChange={(e) => setDamageDescription(e.target.value)}
                  placeholder="Deskripsi kerusakan awal (contoh: sambungan talang seng bolong rembes ke plafon)"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Frame 2: Foto Sesudah (Hasil Perbaikan) */}
              <div className="bg-white p-3 rounded-2xl border-2 border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    2. Foto Sesudah (Hasil)
                  </span>
                  <label className="cursor-pointer text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload Foto</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, 'after')}
                    />
                  </label>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-40 flex items-center justify-center">
                  {repairPhotoUrl ? (
                    <img 
                      src={repairPhotoUrl} 
                      alt="Pratinjau Foto Sesudah" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-3 text-slate-400">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                      <span className="text-[11px]">Belum ada foto sesudah</span>
                    </div>
                  )}
                  {repairPhotoUrl && (
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                      SESUDAH
                    </div>
                  )}
                </div>

                <textarea
                  rows={2}
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  placeholder="Tindakan perbaikan (contoh: penambalan serat fiber 3 lapis & no-drop elastis)"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Quick Presets Pairs */}
            <div className="pt-1">
              <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                Atau pilih contoh sepasang foto sebelum & sesudah:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {SAMPLE_PRESET_IMAGES.map((preset, idx) => (
                  <button
                    type="button"
                    key={preset.name}
                    onClick={() => handleSelectPresetPair(idx)}
                    className={`text-[11px] p-2 rounded-xl border font-bold transition-all text-left flex items-center justify-between ${
                      selectedPresetIdx === idx
                        ? 'bg-blue-100 text-blue-800 border-blue-400 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{preset.thumb}</span>
                    {selectedPresetIdx === idx && (
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Judul & Lokasi */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Area / Titik Talang yang Rusak <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Talang Seng Jurai Samping Dapur / Talang PVC Carport Depan"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat / Posisi Gedung <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Jl. Anggrek No. 14, Blok C, Kebayoran Baru"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Jenis Talang, Kerusakan, dan Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Material Talang:
              </label>
              <select
                value={gutterType}
                onChange={(e) => setGutterType(e.target.value as GutterType)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {Object.entries(GUTTER_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bentuk Kerusakan:
              </label>
              <select
                value={damageType}
                onChange={(e) => setDamageType(e.target.value as DamageType)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {Object.entries(DAMAGE_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status Pekerjaan Awal:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RepairStatus)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="dilaporkan">1. Baru Dilaporkan (15%)</option>
                <option value="survei">2. Survei & Bahan (35%)</option>
                <option value="dikerjakan">3. Sedang Dikerjakan (65%)</option>
                <option value="uji_coba">4. Uji Coba Air (85%)</option>
                <option value="selesai">5. Selesai 100% (Bergaransi)</option>
              </select>
            </div>
          </div>

          {/* Urgensi Tingkat Kebocoran */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tingkat Urgensi Kerusakan:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['darurat', 'sedang', 'ringan'] as UrgencyLevel[]).map((level) => {
                const conf = URGENCY_LABELS[level];
                const isSelected = urgency === level;
                return (
                  <button
                    type="button"
                    key={level}
                    onClick={() => setUrgency(level)}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all text-center ${
                      isSelected
                        ? `${conf.badgeClass} ring-2 ring-blue-500/20 font-extrabold shadow-2xs`
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {conf.label.split(' ')[0]}
                    <span className="block text-[10px] font-normal opacity-80">
                      {conf.label.replace(/^.*?\((.*?)\)$/, '$1')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data Pelapor & Teknisi & Biaya */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Pelapor:
              </label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Nama pemilik / penghuni"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                No. WhatsApp / HP:
              </label>
              <input
                type="text"
                value={reporterPhone}
                onChange={(e) => setReporterPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimasi Biaya (Rp):
              </label>
              <input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="500000"
                step="50000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-extrabold text-sm rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              <span>Simpan Laporan Talang (Sebelum & Sesudah)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
