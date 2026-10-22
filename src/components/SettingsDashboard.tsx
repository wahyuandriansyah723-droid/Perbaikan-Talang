import React, { useState, useMemo, useEffect } from 'react';
import { 
  SystemSettings, 
  DEFAULT_SETTINGS, 
  GutterReport, 
  STATUS_CONFIG, 
  DEFAULT_GUTTER_TYPES, 
  DEFAULT_DAMAGE_TYPES, 
  MasterOptionItem 
} from '../types';
import { INITIAL_REPORTS } from '../data/mockData';
import { INDONESIAN_MONTHS, filterReportsByPeriod } from '../utils/dateHelper';
import { DeletePeriodModal } from './DeletePeriodModal';
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
  Info,
  Calendar,
  Layers,
  Plus,
  Wrench,
  Tag,
  Pencil
} from 'lucide-react';

interface SettingsDashboardProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  reports: GutterReport[];
  onRestoreReports: (restoredReports: GutterReport[]) => void;
  onResetAllData: () => void;
  onDeleteReportsBatch?: (reportIds: string[], periodLabel: string) => Promise<void> | void;
}

export const SettingsDashboard: React.FC<SettingsDashboardProps> = ({
  settings,
  onUpdateSettings,
  reports,
  onRestoreReports,
  onResetAllData,
  onDeleteReportsBatch,
}) => {
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'operational' | 'whatsapp' | 'database' | 'master_data'>('profile');
  const [restoreError, setRestoreError] = useState<string | null>(null);

  // Master Data Local State
  const [gutterList, setGutterList] = useState<MasterOptionItem[]>(
    settings.gutterTypes && settings.gutterTypes.length > 0 ? settings.gutterTypes : DEFAULT_GUTTER_TYPES
  );
  const [damageList, setDamageList] = useState<MasterOptionItem[]>(
    settings.damageTypes && settings.damageTypes.length > 0 ? settings.damageTypes : DEFAULT_DAMAGE_TYPES
  );
  const [newGutterInput, setNewGutterInput] = useState('');
  const [newDamageInput, setNewDamageInput] = useState('');
  const [masterSuccessMsg, setMasterSuccessMsg] = useState('');

  useEffect(() => {
    setFormData(settings);
    if (settings.gutterTypes && settings.gutterTypes.length > 0) {
      setGutterList(settings.gutterTypes);
    }
    if (settings.damageTypes && settings.damageTypes.length > 0) {
      setDamageList(settings.damageTypes);
    }
  }, [settings]);

  // State for Hapus per Bulan atau per Tahun
  const [deleteScope, setDeleteScope] = useState<'month' | 'year'>('month');
  const [deleteSelectedYear, setDeleteSelectedYear] = useState<number>(2026);
  const [deleteSelectedMonth, setDeleteSelectedMonth] = useState<number>(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string | null>(null);

  // Available years from reports or standard range
  const availableYears = useMemo(() => {
    const yrs = new Set<number>([2024, 2025, 2026, 2027, 2028]);
    reports.forEach((r) => {
      const match = r.createdAt?.match(/(\d{4})/);
      if (match) yrs.add(Number(match[1]));
    });
    return Array.from(yrs).sort((a, b) => b - a);
  }, [reports]);

  // Reports matching delete period
  const reportsMatchingDeletePeriod = useMemo(() => {
    return filterReportsByPeriod(
      reports,
      deleteScope,
      '',
      deleteSelectedMonth,
      deleteSelectedYear
    );
  }, [reports, deleteScope, deleteSelectedMonth, deleteSelectedYear]);

  const deletePeriodLabel = deleteScope === 'month'
    ? `${INDONESIAN_MONTHS[deleteSelectedMonth - 1]} ${deleteSelectedYear}`
    : `Tahun ${deleteSelectedYear}`;

  const handleExecuteBatchDelete = async () => {
    const ids = reportsMatchingDeletePeriod.map((r) => r.id);
    if (ids.length === 0) return;

    if (onDeleteReportsBatch) {
      await onDeleteReportsBatch(ids, deletePeriodLabel);
    } else {
      // Fallback: restore remaining reports
      const remaining = reports.filter((r) => !ids.includes(r.id));
      onRestoreReports(remaining);
    }
    setDeleteSuccessMessage(`Berhasil menghapus ${ids.length} laporan periode ${deletePeriodLabel}.`);
    setTimeout(() => setDeleteSuccessMessage(null), 4000);
  };

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
            onClick={() => setActiveSection('master_data')}
            className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
              activeSection === 'master_data'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Tag className={`w-5 h-5 ${activeSection === 'master_data' ? 'text-white' : 'text-blue-600'}`} />
            <div>
              <p className="text-xs font-bold">Master Material & Kerusakan</p>
              <p className={`text-[11px] ${activeSection === 'master_data' ? 'text-blue-100' : 'text-slate-400'}`}>
                Edit & tambah opsi talang
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
                    Tersinkronisasi real-time di database cloud Firebase Firestore.
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 text-xs block mb-1">Status Sinkronisasi Cloud:</span>
                  <div className="text-base font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
                    <ShieldCheck className="w-5 h-5" />
                    <span>Firebase Firestore Online</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Tersinkron ke seluruh HP, laptop, dan perangkat pengguna secara langsung.
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

              {/* SECTION 4.1: HAPUS LAPORAN PER BULAN ATAU PER TAHUN */}
              <div className="p-5 rounded-3xl border border-rose-200/90 bg-rose-50/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="p-1 bg-rose-100 text-rose-700 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                        Pembersihan Data: Hapus per Bulan atau per Tahun
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600">
                      Pilih periode waktu spesifik untuk menghapus seluruh laporan kerusakan talang air pada bulan atau tahun tersebut dari database online Firebase Firestore.
                    </p>
                  </div>

                  {deleteSuccessMessage && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 flex items-center gap-1.5 animate-pulse shrink-0">
                      <Check className="w-4 h-4 text-emerald-700" />
                      <span>{deleteSuccessMessage}</span>
                    </span>
                  )}
                </div>

                {/* Filter Controls: Scope (Month / Year), Month Selector, Year Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-rose-200 shadow-2xs">
                  {/* Scope Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-rose-600" />
                      <span>Mode Hapus Periode:</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setDeleteScope('month')}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                          deleteScope === 'month'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Per Bulan
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteScope('year')}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                          deleteScope === 'year'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Per Tahun
                      </button>
                    </div>
                  </div>

                  {/* Year Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Pilih Tahun:</span>
                    </label>
                    <select
                      value={deleteSelectedYear}
                      onChange={(e) => setDeleteSelectedYear(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-mono"
                    >
                      {availableYears.map((yr) => (
                        <option key={yr} value={yr}>
                          Tahun {yr}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Month Selector (if month scope) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Pilih Bulan:</span>
                    </label>
                    <select
                      value={deleteSelectedMonth}
                      disabled={deleteScope === 'year'}
                      onChange={(e) => setDeleteSelectedMonth(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    >
                      {INDONESIAN_MONTHS.map((m, idx) => (
                        <option key={m} value={idx + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Live Preview Box & Delete Trigger Button */}
                <div className="bg-white p-4 rounded-2xl border border-rose-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Status Data:</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono">
                        {deletePeriodLabel}
                      </span>
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">
                      {reportsMatchingDeletePeriod.length > 0 ? (
                        <span className="text-rose-700">
                          Ditemukan {reportsMatchingDeletePeriod.length} tiket laporan pada periode ini
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          Tidak ada laporan yang terdaftar pada periode ini
                        </span>
                      )}
                    </div>
                    {reportsMatchingDeletePeriod.length > 0 && (
                      <p className="text-[11px] text-slate-500">
                        Tiket yang cocok: {reportsMatchingDeletePeriod.slice(0, 3).map(r => r.code).join(', ')}
                        {reportsMatchingDeletePeriod.length > 3 ? ` dan ${reportsMatchingDeletePeriod.length - 3} lainnya` : ''}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    disabled={reportsMatchingDeletePeriod.length === 0}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-rose-600/20 transition-all active:scale-[0.98] shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>
                      Hapus {reportsMatchingDeletePeriod.length} Laporan ({deletePeriodLabel})
                    </span>
                  </button>
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

          {/* SECTION 5: MASTER DATA MATERIAL TALANG & BENTUK KERUSAKAN */}
          {activeSection === 'master_data' && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-blue-600" />
                    <span>Master Data Material Talang & Bentuk Kerusakan</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kelola pilihan jenis material dan masalah kerusakan yang tampil pada form input laporan dan foto perbaikan talang.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const updatedSettings: SystemSettings = {
                      ...formData,
                      gutterTypes: gutterList,
                      damageTypes: damageList,
                    };
                    onUpdateSettings(updatedSettings);
                    setMasterSuccessMsg('Perubahan master data jenis talang & kerusakan berhasil disimpan ke Firebase!');
                    setTimeout(() => setMasterSuccessMsg(''), 3000);
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan ke Firebase</span>
                </button>
              </div>

              {masterSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-bounce">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{masterSuccessMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PANEL 1: MATERIAL TALANG */}
                <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/90 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                          1. Material Talang Air
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {gutterList.length} jenis tersedia
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tambah Baru */}
                  <div className="bg-white p-3 rounded-xl border border-blue-200 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700">
                      + Tambah Material Baru:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newGutterInput}
                        onChange={(e) => setNewGutterInput(e.target.value)}
                        placeholder="Contoh: Tembaga / Copper, Zincalume 0.4mm..."
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = newGutterInput.trim();
                          if (!trimmed) return;
                          if (gutterList.some((g) => g.label.toLowerCase() === trimmed.toLowerCase())) {
                            alert('Material ini sudah ada');
                            return;
                          }
                          const newItem: MasterOptionItem = {
                            id: `custom_${Date.now()}`,
                            label: trimmed,
                            isCustom: true,
                          };
                          const updated = [...gutterList, newItem];
                          setGutterList(updated);
                          setNewGutterInput('');
                          const updatedSettings: SystemSettings = {
                            ...formData,
                            gutterTypes: updated,
                            damageTypes: damageList,
                          };
                          onUpdateSettings(updatedSettings);
                          setMasterSuccessMsg(`Material "${trimmed}" berhasil ditambahkan & disinkronkan!`);
                          setTimeout(() => setMasterSuccessMsg(''), 3000);
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah</span>
                      </button>
                    </div>
                  </div>

                  {/* Daftar Item */}
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {gutterList.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-400 w-5 text-center font-mono">
                          {idx + 1}.
                        </span>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGutterList((prev) =>
                              prev.map((g) => (g.id === item.id ? { ...g, label: val } : g))
                            );
                          }}
                          className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        {item.isCustom ? (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                            Kustom
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                            Bawaan
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (gutterList.length <= 1) {
                              alert('Minimal harus ada 1 material talang');
                              return;
                            }
                            const updated = gutterList.filter((g) => g.id !== item.id);
                            setGutterList(updated);
                            onUpdateSettings({ ...formData, gutterTypes: updated, damageTypes: damageList });
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus jenis material"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PANEL 2: BENTUK KERUSAKAN */}
                <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/90 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                          2. Bentuk Masalah Kerusakan
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {damageList.length} jenis tersedia
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tambah Baru */}
                  <div className="bg-white p-3 rounded-xl border border-rose-200 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700">
                      + Tambah Bentuk Kerusakan Baru:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newDamageInput}
                        onChange={(e) => setNewDamageInput(e.target.value)}
                        placeholder="Contoh: Sambungan Flashing Lepas, Karat Asam..."
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = newDamageInput.trim();
                          if (!trimmed) return;
                          if (damageList.some((d) => d.label.toLowerCase() === trimmed.toLowerCase())) {
                            alert('Bentuk kerusakan ini sudah ada');
                            return;
                          }
                          const newItem: MasterOptionItem = {
                            id: `custom_${Date.now()}`,
                            label: trimmed,
                            isCustom: true,
                          };
                          const updated = [...damageList, newItem];
                          setDamageList(updated);
                          setNewDamageInput('');
                          const updatedSettings: SystemSettings = {
                            ...formData,
                            gutterTypes: gutterList,
                            damageTypes: updated,
                          };
                          onUpdateSettings(updatedSettings);
                          setMasterSuccessMsg(`Bentuk kerusakan "${trimmed}" berhasil ditambahkan & disinkronkan!`);
                          setTimeout(() => setMasterSuccessMsg(''), 3000);
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah</span>
                      </button>
                    </div>
                  </div>

                  {/* Daftar Item */}
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {damageList.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-400 w-5 text-center font-mono">
                          {idx + 1}.
                        </span>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDamageList((prev) =>
                              prev.map((d) => (d.id === item.id ? { ...d, label: val } : d))
                            );
                          }}
                          className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        {item.isCustom ? (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                            Kustom
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                            Bawaan
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (damageList.length <= 1) {
                              alert('Minimal harus ada 1 bentuk kerusakan');
                              return;
                            }
                            const updated = damageList.filter((d) => d.id !== item.id);
                            setDamageList(updated);
                            onUpdateSettings({ ...formData, gutterTypes: gutterList, damageTypes: updated });
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus jenis kerusakan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reset to Default Presets */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset seluruh daftar material dan kerusakan ke standar bawaan sistem?')) {
                      setGutterList(DEFAULT_GUTTER_TYPES);
                      setDamageList(DEFAULT_DAMAGE_TYPES);
                      onUpdateSettings({
                        ...formData,
                        gutterTypes: DEFAULT_GUTTER_TYPES,
                        damageTypes: DEFAULT_DAMAGE_TYPES,
                      });
                      setMasterSuccessMsg('Daftar jenis talang & kerusakan berhasil direset ke bawaan default.');
                      setTimeout(() => setMasterSuccessMsg(''), 3000);
                    }
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset ke Standar Bawaan</span>
                </button>

                <p className="text-[11px] text-slate-400">
                  Semua perubahan langsung aktif di form pelaporan & komparasi foto
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Konfirmasi Hapus Data Periode */}
      <DeletePeriodModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        periodLabel={deletePeriodLabel}
        reportsToDelete={reportsMatchingDeletePeriod}
        onConfirmDelete={handleExecuteBatchDelete}
      />
    </div>
  );
};
