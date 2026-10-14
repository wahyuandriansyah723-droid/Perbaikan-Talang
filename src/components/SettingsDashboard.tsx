import React, { useState } from 'react';
import { SystemSettings, DEFAULT_SETTINGS, GutterReport } from '../types';
import { INITIAL_REPORTS } from '../data/mockData';
import { 
  Settings, 
  Building2, 
  ShieldCheck, 
  FileText, 
  MessageSquare, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Save, 
  Check, 
  Radio, 
  Bell, 
  Sparkles,
  Printer,
  AlertTriangle,
  Info
} from 'lucide-react';

interface SettingsDashboardProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  reports: GutterReport[];
  onRestoreReports: (restoredReports: GutterReport[]) => void;
  onResetAllData: () => void;
}

export const SettingsDashboard: React.FC<SettingsDashboardProps> = ({
  settings,
  onUpdateSettings,
  reports,
  onRestoreReports,
  onResetAllData,
}) => {
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'operational' | 'whatsapp' | 'database'>('profile');
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateSettings(formData);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  const handleResetToDefaultTemplate = () => {
    setFormData((prev) => ({
      ...prev,
      waTemplate: DEFAULT_SETTINGS.waTemplate,
    }));
  };

  // Backup JSON download
  const handleDownloadBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: formData,
      reportsCount: reports.length,
      reports: reports,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SiTalang_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Restore JSON upload
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed && Array.isArray(parsed.reports)) {
          onRestoreReports(parsed.reports);
          if (parsed.settings) {
            onUpdateSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
            setFormData({ ...DEFAULT_SETTINGS, ...parsed.settings });
          }
          setRestoreError(null);
          alert(`Berhasil memulihkan ${parsed.reports.length} data laporan talang!`);
        } else {
          setRestoreError('Format file backup tidak valid. File harus memiliki data laporan yang benar.');
        }
      } catch (err) {
        setRestoreError('Gagal membaca file backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Settings className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Dasbor Pengaturan Sistem
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Konfigurasi & Pengaturan SiTalang
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Atur kop surat Berita Acara PDF, template WhatsApp, standar operasional garansi, dan cadangkan data sistem.
          </p>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-2">
          {isSavedToast && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-pulse">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Pengaturan Tersimpan!</span>
            </span>
          )}
          <button
            onClick={() => handleSave()}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Section Tabs on Left, Forms on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar Cards */}
        <div className="lg:col-span-1 space-y-2">
          <button
            onClick={() => setActiveSection('profile')}
            className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
              activeSection === 'profile'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Building2 className={`w-5 h-5 ${activeSection === 'profile' ? 'text-white' : 'text-blue-600'}`} />
            <div>
              <p className="text-xs font-bold">Profil Kop Berita Acara</p>
              <p className={`text-[11px] ${activeSection === 'profile' ? 'text-blue-100' : 'text-slate-400'}`}>
                Kop surat PDF & tanda tangan
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveSection('operational')}
            className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
              activeSection === 'operational'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className={`w-5 h-5 ${activeSection === 'operational' ? 'text-white' : 'text-emerald-600'}`} />
            <div>
              <p className="text-xs font-bold">Standar Garansi & SOP</p>
              <p className={`text-[11px] ${activeSection === 'operational' ? 'text-blue-100' : 'text-slate-400'}`}>
                Masa garansi & standar uji siram
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveSection('whatsapp')}
            className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
              activeSection === 'whatsapp'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className={`w-5 h-5 ${activeSection === 'whatsapp' ? 'text-white' : 'text-emerald-600'}`} />
            <div>
              <p className="text-xs font-bold">Template WhatsApp & Notifikasi</p>
              <p className={`text-[11px] ${activeSection === 'whatsapp' ? 'text-blue-100' : 'text-slate-400'}`}>
                Format pesan klien & live timer
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveSection('database')}
            className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
              activeSection === 'database'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Database className={`w-5 h-5 ${activeSection === 'database' ? 'text-white' : 'text-purple-600'}`} />
            <div>
              <p className="text-xs font-bold">Cadangan Data & Reset</p>
              <p className={`text-[11px] ${activeSection === 'database' ? 'text-blue-100' : 'text-slate-400'}`}>
                Backup JSON & pemulihan data
              </p>
            </div>
          </button>
        </div>

        {/* Section Contents on Right */}
        <div className="lg:col-span-3 space-y-6">
          {/* SECTION 1: PROFIL USAHA & KOP BERITA ACARA PDF */}
          {activeSection === 'profile' && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span>Profil Usaha & Kop Laporan PDF Resmi</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Informasi ini akan tercetak otomatis pada kop Berita Acara Laporan Satuan dan Rekapitulasi PDF.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Perusahaan / Layanan Spesialis Atap & Talang:
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Slogan / Sub-judul Layanan:
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Workshop / Kantor:
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. Hotline / WhatsApp Resmi:
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Resmi:
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Tanda Tangan Para Pihak */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">
                  Nama Penanggung Jawab Tanda Tangan Dokumen Cetak:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Pimpinan / Kepala Manajemen:
                    </label>
                    <input
                      type="text"
                      value={formData.picLeader}
                      onChange={(e) => setFormData({ ...formData, picLeader: e.target.value })}
                      placeholder="Nama pimpinan"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Koordinator / Mandor Lapangan:
                    </label>
                    <input
                      type="text"
                      value={formData.picCoordinator}
                      onChange={(e) => setFormData({ ...formData, picCoordinator: e.target.value })}
                      placeholder="Nama mandor lapangan"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Kop Surat */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                  Pratinjau Kop Surat PDF:
                </span>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <h4 className="font-extrabold text-sm text-slate-900 uppercase">
                    {formData.companyName || 'NAMA PERUSAHAAN'}
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {formData.tagline || 'Tagline Layanan'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {formData.address} • Telp: {formData.phone}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: STANDAR OPERASIONAL & GARANSI */}
          {activeSection === 'operational' && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Standar Operasional Prosedur (SOP) & Garansi</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Konfigurasi default masa garansi, format penomoran tiket, dan prosedur uji coba air (water test).
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Awalan (Prefix) Penomoran Kode Laporan:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.ticketPrefix}
                      onChange={(e) => setFormData({ ...formData, ticketPrefix: e.target.value.toUpperCase() })}
                      className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase focus:outline-none"
                    />
                    <span className="text-xs text-slate-500">
                      Contoh hasil format: <strong>{formData.ticketPrefix}-2026-102</strong>
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Default Masa Garansi Bebas Bocor:
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {['3 Bulan Bebas Bocor', '6 Bulan Bebas Bocor', '12 Bulan (1 Tahun)', '24 Bulan'].map((w) => (
                      <button
                        type="button"
                        key={w}
                        onClick={() => setFormData({ ...formData, defaultWarranty: w })}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                          formData.defaultWarranty === w
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formData.defaultWarranty}
                    onChange={(e) => setFormData({ ...formData, defaultWarranty: e.target.value })}
                    placeholder="Atau ketik kustom masa garansi..."
                    className="mt-2 w-full max-w-md px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Standar Pengujian Air (Water Test) Sebelum Serah Terima:
                  </label>
                  <input
                    type="text"
                    value={formData.waterTestStandard}
                    onChange={(e) => setFormData({ ...formData, waterTestStandard: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Standar ini menjadi acuan teknisi pada tahap Uji Coba Air (Tahap 4).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: TEMPLATE WHATSAPP & NOTIFIKASI */}
          {activeSection === 'whatsapp' && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    <span>Template Format Pesan WhatsApp & Notifikasi</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sesuaikan struktur format pesan otomatis yang dikirimkan ke WhatsApp pemilik/klien.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetToDefaultTemplate}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Template</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Format Teks Pesan WhatsApp:
                </label>
                <textarea
                  rows={10}
                  value={formData.waTemplate}
                  onChange={(e) => setFormData({ ...formData, waTemplate: e.target.value })}
                  className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <div className="mt-2 p-2.5 bg-blue-50 rounded-xl border border-blue-200 text-[11px] text-blue-800">
                  <span className="font-bold">Tag variabel yang didukung: </span>
                  <code>&#123;code&#125;</code>, <code>&#123;title&#125;</code>, <code>&#123;location&#125;</code>, <code>&#123;gutterType&#125;</code>, <code>&#123;damageType&#125;</code>, <code>&#123;status&#125;</code>, <code>&#123;progress&#125;</code>, <code>&#123;technician&#125;</code>, <code>&#123;reporter&#125;</code>, <code>&#123;damageDescription&#125;</code>, <code>&#123;lastUpdate&#125;</code>.
                </div>
              </div>

              {/* Simulasi Real-Time Interval Settings */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Pengaturan Kecepatan Simulasi Real-Time:
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  {[8, 12, 20, 30].map((sec) => (
                    <button
                      type="button"
                      key={sec}
                      onClick={() => setFormData({ ...formData, simulationIntervalSec: sec })}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        formData.simulationIntervalSec === sec
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Tiap {sec} Detik
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">
                  Interval waktu saat tombol "Simulasi Real-Time" di navbar diaktifkan untuk demonstrasi live progres.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 4: CADANGAN DATA (BACKUP & RESTORE) */}
          {activeSection === 'database' && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-600" />
                  <span>Cadangan Database, Pemulihan & Pembersihan</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unduh seluruh database laporan talang sebagai berkas JSON untuk diarsipkan atau dipindahkan ke perangkat lain.
                </p>
              </div>

              {restoreError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{restoreError}</span>
                </div>
              )}

              {/* Status Data Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 text-xs block mb-1">Total Laporan Tersimpan:</span>
                  <div className="text-2xl font-extrabold text-slate-900 font-mono">
                    {reports.length} Data Tiket
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Tersimpan aman di penyimpanan lokal peramban (LocalStorage).
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 text-xs block mb-1">Status Keamanan:</span>
                  <div className="text-base font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
                    <ShieldCheck className="w-5 h-5" />
                    <span>Database Siap Dicadangkan</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Bisa diunduh dan dipulihkan kapan saja tanpa batas.
                  </span>
                </div>
              </div>

              {/* Action Buttons: Backup & Restore */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Download Backup */}
                <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-700" />
                    <h4 className="text-xs font-bold text-emerald-900 uppercase">
                      1. Cadangkan Database (.JSON)
                    </h4>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Unduh salinan lengkap seluruh data laporan talang (termasuk foto sebelum-sesudah dan riwayat pengerjaan).
                  </p>
                  <button
                    onClick={handleDownloadBackup}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh File Cadangan (.json)</span>
                  </button>
                </div>

                {/* Restore File */}
                <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-blue-700" />
                    <h4 className="text-xs font-bold text-blue-900 uppercase">
                      2. Pulihkan dari File Cadangan
                    </h4>
                  </div>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Muat kembali database laporan dari file cadangan JSON yang pernah Anda unduh sebelumnya.
                  </p>
                  <label className="cursor-pointer w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Pilih File Backup (.json)</span>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleRestoreFile}
                    />
                  </label>
                </div>
              </div>

              {/* Reset to Mock or Clear All */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Muat ulang data contoh awal? Laporan saat ini akan digantikan dengan 3 kasus talang default.')) {
                      onResetAllData();
                    }
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Muat Ulang Contoh Kasus Default</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mengosongkan SELURUH data laporan talang? Tindakan ini tidak dapat dibatalkan.')) {
                      onRestoreReports([]);
                    }
                  }}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Kosongkan Semua Data Laporan</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
