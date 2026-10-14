import React, { useState, useRef, useCallback } from 'react';
import { GutterReport } from '../types';
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Maximize2, 
  X, 
  RotateCcw, 
  Sliders, 
  Columns, 
  Layers, 
  Sparkles,
  Download,
  Info
} from 'lucide-react';

interface GutterCompareGalleryProps {
  report: GutterReport;
  onUpdateRepairPhoto: (newPhotoUrl: string) => void;
}

export const GutterCompareGallery: React.FC<GutterCompareGalleryProps> = ({
  report,
  onUpdateRepairPhoto,
}) => {
  // View mode: 'split_slider' (interactive slider), 'side_by_side' (berdampingan), 'dual' (both slider and side-by-side)
  const [displayLayout, setDisplayLayout] = useState<'dual' | 'slider' | 'side'>('dual');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Collect all photos from report (damage photo, repair photo, and timeline photos)
  const allProjectPhotos = [
    {
      id: 'damage-primary',
      title: 'Foto Kerusakan Awal (Sebelum)',
      type: 'before' as const,
      url: report.damagePhotoUrl,
      caption: report.damageDescription,
      date: report.createdAt,
    },
    ...(report.repairPhotoUrl ? [{
      id: 'repair-primary',
      title: 'Foto Hasil Perbaikan (Sesudah)',
      type: 'after' as const,
      url: report.repairPhotoUrl,
      caption: report.repairNotes || 'Pekerjaan penambalan dan perbaikan talang selesai.',
      date: report.updatedAt,
    }] : []),
    ...report.timeline
      .filter((t) => t.photoUrl)
      .map((t, idx) => ({
        id: `timeline-${t.id}-${idx}`,
        title: `Foto Progres: ${t.title}`,
        type: 'progress' as const,
        url: t.photoUrl!,
        caption: t.note,
        date: t.timestamp,
      })),
  ];

  // Drag handler for the interactive slider
  const handlePointerMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(Math.round(percentage));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handlePointerMove(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handlePointerMove(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handlePointerMove(e.touches[0].clientX);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onUpdateRepairPhoto(result);
    };
    reader.readAsDataURL(file);
  };

  const hasRepairPhoto = Boolean(report.repairPhotoUrl);

  return (
    <div className="space-y-6">
      {/* Top Header Control Bar */}
      <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>Galeri Komparasi Talang: Sebelum vs Sesudah</span>
              {hasRepairPhoto ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Lengkap (Sebelum & Sesudah)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Menunggu Foto Hasil
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-500">
              Bandingkan perubahan fisik talang menggunakan slider interaktif dan tampilan berdampingan.
            </p>
          </div>
        </div>

        {/* Layout Switcher Tabs */}
        {hasRepairPhoto && (
          <div className="flex items-center p-1 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs">
            <button
              onClick={() => setDisplayLayout('dual')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                displayLayout === 'dual'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kombinasi</span>
            </button>
            <button
              onClick={() => setDisplayLayout('slider')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                displayLayout === 'slider'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Slider Interaktif</span>
            </button>
            <button
              onClick={() => setDisplayLayout('side')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                displayLayout === 'side'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Berdampingan</span>
            </button>
          </div>
        )}
      </div>

      {/* SECTION 1: SLIDER INTERAKTIF (BEFORE / AFTER SPLIT VIEWER) */}
      {(displayLayout === 'slider' || displayLayout === 'dual') && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                Slider Komparasi Interaktif (Geser Untuk Membandingkan)
              </h4>
            </div>

            {hasRepairPhoto && (
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                {sliderPosition}% Sebelum • {100 - sliderPosition}% Sesudah
              </span>
            )}
          </div>

          {hasRepairPhoto ? (
            <div className="space-y-3">
              {/* Interactive Canvas */}
              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchMove={handleTouchMove}
                className="relative w-full h-80 sm:h-96 md:h-[420px] rounded-2xl overflow-hidden select-none border-2 border-slate-300 shadow-md cursor-ew-resize group/slider bg-slate-900"
              >
                {/* Background Layer: Sesudah (After) */}
                <img
                  src={report.repairPhotoUrl}
                  alt="Hasil Perbaikan Talang"
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
                <div className="absolute top-3 right-3 z-10 bg-emerald-600/95 backdrop-blur-xs text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SESUDAH DIPERBAIKI</span>
                </div>

                {/* Foreground Layer with Clip: Sebelum (Before) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={report.damagePhotoUrl}
                    alt="Kondisi Kerusakan Awal Talang"
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    style={{
                      width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                      height: '100%',
                    }}
                    draggable={false}
                  />
                  <div className="absolute top-3 left-3 z-10 bg-red-600/95 backdrop-blur-xs text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>SEBELUM (RUSAK)</span>
                  </div>
                </div>

                {/* Draggable Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(0,0,0,0.5)] z-20 flex items-center justify-center transition-opacity"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="w-9 h-9 bg-white text-slate-900 rounded-full shadow-xl flex items-center justify-center border-2 border-blue-600 -ml-4.5 group-hover/slider:scale-110 transition-transform">
                    <span className="text-xs font-extrabold tracking-tighter">⇄</span>
                  </div>
                </div>

                {/* Fullscreen Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImage({
                      url: sliderPosition < 50 ? report.repairPhotoUrl! : report.damagePhotoUrl,
                      title: sliderPosition < 50 ? 'Hasil Perbaikan (Sesudah)' : 'Kerusakan Awal (Sebelum)',
                      subtitle: sliderPosition < 50 ? report.repairNotes : report.damageDescription,
                    });
                  }}
                  className="absolute bottom-3 right-3 z-10 bg-black/60 hover:bg-black/80 text-white p-2 rounded-xl backdrop-blur-xs text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Buka Layar Penuh"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Perbesar</span>
                </button>
              </div>

              {/* Slider Controller & Quick Jump Presets */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                {/* Range bar */}
                <div className="w-full sm:flex-1 flex items-center gap-3">
                  <span className="text-xs font-extrabold text-red-600 shrink-0">Sebelum</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                    className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-extrabold text-emerald-600 shrink-0">Sesudah</span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setSliderPosition(100)}
                    className="px-2 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    100% Sebelum
                  </button>
                  <button
                    onClick={() => setSliderPosition(50)}
                    className="px-2.5 py-1 text-[11px] font-bold bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                  >
                    50:50 Seimbang
                  </button>
                  <button
                    onClick={() => setSliderPosition(0)}
                    className="px-2 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    100% Sesudah
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Empty After Photo State for Slider */
            <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
              <Camera className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                Slider Interaktif Memerlukan Foto Hasil Perbaikan
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                Saat ini baru ada foto kerusakan awal. Unggah foto setelah talang ditambal/diperbaiki untuk mengaktifkan komparasi slider interaktif.
              </p>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors">
                <Upload className="w-4 h-4" />
                <span>Upload Foto Hasil Perbaikan Sekarang</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: TAMPILAN BERDAMPINGAN (SIDE-BY-SIDE CARDS) */}
      {(displayLayout === 'side' || displayLayout === 'dual') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Columns className="w-4 h-4 text-blue-600" />
              <span>Tampilan Berdampingan (Detail Sebelum & Sesudah)</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-medium">
              Klik gambar untuk melihat resolusi penuh
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CARD 1: FOTO SEBELUM (KERUSAKAN AWAL) */}
            <div className="bg-white rounded-2xl border border-red-200 overflow-hidden shadow-xs flex flex-col justify-between">
              <div>
                <div className="p-3 bg-red-50/80 border-b border-red-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-xs font-bold text-red-900 uppercase tracking-wide">
                      1. Kondisi Awal Kerusakan (Sebelum)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-red-700">
                    {report.createdAt.split(',')[0]}
                  </span>
                </div>

                <div 
                  onClick={() => setLightboxImage({
                    url: report.damagePhotoUrl,
                    title: 'Kondisi Awal Kerusakan Talang (Sebelum)',
                    subtitle: report.damageDescription,
                  })}
                  className="relative h-64 bg-slate-900 cursor-pointer group/img overflow-hidden"
                >
                  <img
                    src={report.damagePhotoUrl}
                    alt="Foto Kerusakan Talang"
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover/img:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                    <span className="px-3 py-1.5 bg-black/70 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs">
                      <Maximize2 className="w-3.5 h-3.5" />
                      Perbesar Foto
                    </span>
                  </div>
                </div>

                <div className="p-3.5 text-xs text-slate-600 space-y-1.5">
                  <span className="font-bold text-slate-800 block">Diagnosa Kerusakan:</span>
                  <p className="leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-700">
                    "{report.damageDescription}"
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50/80 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Bukti dokumentasi pelaporan awal</span>
                <span className="text-red-700 font-bold font-mono">Status: Awal</span>
              </div>
            </div>

            {/* CARD 2: FOTO SESUDAH (HASIL PERBAIKAN) */}
            <div className="bg-white rounded-2xl border border-emerald-200 overflow-hidden shadow-xs flex flex-col justify-between">
              <div>
                <div className="p-3 bg-emerald-50/80 border-b border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                      2. Hasil Pekerjaan (Sesudah)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-emerald-700">
                    {hasRepairPhoto ? report.updatedAt.split(',')[0] : 'Belum Ada'}
                  </span>
                </div>

                {hasRepairPhoto ? (
                  <div 
                    onClick={() => setLightboxImage({
                      url: report.repairPhotoUrl!,
                      title: 'Hasil Akhir Perbaikan Talang (Sesudah)',
                      subtitle: report.repairNotes || 'Pekerjaan perbaikan selesai secara tuntas.',
                    })}
                    className="relative h-64 bg-slate-900 cursor-pointer group/img overflow-hidden"
                  >
                    <img
                      src={report.repairPhotoUrl}
                      alt="Hasil Perbaikan Talang"
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover/img:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                      <span className="px-3 py-1.5 bg-black/70 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs">
                        <Maximize2 className="w-3.5 h-3.5" />
                        Perbesar Foto
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 bg-slate-50 flex flex-col items-center justify-center p-6 text-center border-b border-slate-100">
                    <Camera className="w-10 h-10 text-slate-300 mb-2" />
                    <h5 className="text-xs font-bold text-slate-700 mb-1">
                      Foto Hasil Perbaikan Belum Diunggah
                    </h5>
                    <p className="text-[11px] text-slate-500 max-w-xs mb-3">
                      Unggah foto talang yang sudah ditambal / diganti untuk menyelesaikan dokumentasi laporan.
                    </p>
                    <label className="cursor-pointer px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Foto Hasil Sekarang</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                )}

                <div className="p-3.5 text-xs text-slate-600 space-y-1.5">
                  <span className="font-bold text-slate-800 block">Tindakan & Material Digunakan:</span>
                  <p className="leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-700">
                    {report.repairNotes ? `"${report.repairNotes}"` : 'Talang telah dilapisi membrane waterproofing elastis dan sambungan dirapatkan.'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50/80 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Garansi: {report.warrantyPeriod || '6 Bulan Bebas Bocor'}</span>
                {hasRepairPhoto ? (
                  <label className="cursor-pointer text-emerald-700 hover:text-emerald-900 font-bold underline">
                    Ganti Foto
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                ) : (
                  <span className="text-amber-600 font-bold font-mono">Belum Selesai</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: STRIP DOKUMENTASI SELURUH FOTO PROYEK */}
      {allProjectPhotos.length > 1 && (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-blue-600" />
              Semua Foto Dokumentasi Titik Talang ({allProjectPhotos.length} Foto)
            </span>
            <span className="text-[11px] text-slate-400">
              Termasuk foto tahapan pengerjaan di atap
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {allProjectPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setLightboxImage({
                  url: photo.url,
                  title: photo.title,
                  subtitle: photo.caption,
                })}
                className="group/thumb relative rounded-xl overflow-hidden border border-slate-200 bg-white cursor-pointer hover:border-blue-400 hover:shadow-xs transition-all"
              >
                <div className="h-24 bg-slate-100 overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-1.5 text-[10px]">
                  <p className="font-bold text-slate-800 truncate">{photo.title}</p>
                  <p className="text-slate-400 truncate">{photo.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LIGHTBOX FULLSCREEN PREVIEW MODAL */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col"
          >
            {/* Lightbox Header */}
            <div className="p-3.5 bg-slate-800/90 text-white flex items-center justify-between border-b border-slate-700">
              <div>
                <h4 className="text-sm font-bold text-white">{lightboxImage.title}</h4>
                {lightboxImage.subtitle && (
                  <p className="text-xs text-slate-300 line-clamp-1">{lightboxImage.subtitle}</p>
                )}
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lightbox Image Preview */}
            <div className="max-h-[75vh] flex items-center justify-center bg-black/60 p-2 overflow-auto">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>

            {/* Lightbox Footer */}
            <div className="p-3 bg-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>SiTalang Dokumentasi Foto Lapangan</span>
              <a
                href={lightboxImage.url}
                target="_blank"
                rel="noreferrer"
                download
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Buka Gambar Asli</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
