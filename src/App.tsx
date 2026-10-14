import React, { useState, useEffect } from 'react';
import { GutterReport, RepairStatus, STATUS_CONFIG, SystemSettings, DEFAULT_SETTINGS } from './types';
import { INITIAL_REPORTS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { StatsCards } from './components/StatsCards';
import { FilterBar } from './components/FilterBar';
import { ReportCard } from './components/ReportCard';
import { ReportDetailModal } from './components/ReportDetailModal';
import { NewReportModal } from './components/NewReportModal';
import { PrintReportView } from './components/PrintReportView';
import { ReportDashboard } from './components/ReportDashboard';
import { PrintSummaryReportView } from './components/PrintSummaryReportView';
import { SettingsDashboard } from './components/SettingsDashboard';
import { 
  Plus, 
  Wrench, 
  Droplets, 
  CheckCircle2, 
  BellRing, 
  RotateCcw,
  Sparkles,
  CloudRain,
  BarChart3,
  ClipboardList,
  Settings
} from 'lucide-react';

const STORAGE_KEY = 'sitalang_reports_data_v1';
const SETTINGS_STORAGE_KEY = 'sitalang_settings_data_v1';

export default function App() {
  const [reports, setReports] = useState<GutterReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: GutterReport) => {
            const found = INITIAL_REPORTS.find(init => init.id === item.id);
            if (found && !item.repairPhotoUrl && found.repairPhotoUrl) {
              return { ...item, repairPhotoUrl: found.repairPhotoUrl, repairNotes: found.repairNotes };
            }
            return item;
          });
        }
      }
    } catch (e) {
      console.error('Failed to load reports from localStorage', e);
    }
    return INITIAL_REPORTS;
  });

  // Settings State
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
    return DEFAULT_SETTINGS;
  });

  // Active view: 'list' (Tiket Lapangan) | 'dashboard' (Dasbor & Rekap Periode) | 'settings' (Pengaturan Sistem)
  const [activeView, setActiveView] = useState<'list' | 'dashboard' | 'settings'>('list');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterStatus, setActiveFilterStatus] = useState<string | null>(null);
  const [selectedGutterType, setSelectedGutterType] = useState('all');
  const [selectedDamageType, setSelectedDamageType] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');

  const [selectedReportForDetail, setSelectedReportForDetail] = useState<GutterReport | null>(null);
  const [isNewReportOpen, setIsNewReportOpen] = useState(false);
  const [selectedReportForPrint, setSelectedReportForPrint] = useState<GutterReport | null>(null);
  const [summaryPrintData, setSummaryPrintData] = useState<{ reports: GutterReport[]; periodLabel: string } | null>(null);

  // Real-time live simulation mode state & toast notification
  const [isSimulating, setIsSimulating] = useState(false);
  const [liveToast, setLiveToast] = useState<{ message: string; code: string } | null>(null);

  // Save to localStorage whenever reports change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    } catch (e) {
      console.error('Failed to save reports to localStorage', e);
    }
  }, [reports]);

  // Save settings to localStorage
  const handleUpdateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
    setLiveToast({
      message: 'Pengaturan sistem berhasil diperbarui.',
      code: 'SETTINGS',
    });
  };

  const handleRestoreReports = (restoredReports: GutterReport[]) => {
    setReports(restoredReports);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(restoredReports));
    } catch (e) {
      console.error('Failed to save restored reports', e);
    }
    setLiveToast({
      message: `Database berhasil diperbarui (${restoredReports.length} laporan).`,
      code: 'DATABASE',
    });
  };

  // Real-time simulation effect
  useEffect(() => {
    if (!isSimulating) return;

    const intervalMs = (settings.simulationIntervalSec || 12) * 1000;

    const interval = setInterval(() => {
      setReports((prevReports) => {
        // Find a report that is not yet completed
        const activeReports = prevReports.filter(r => r.status !== 'selesai');
        if (activeReports.length === 0) return prevReports;

        const targetReport = activeReports[Math.floor(Math.random() * activeReports.length)];
        let nextStatus: RepairStatus = targetReport.status;
        let updateNote = '';

        if (targetReport.status === 'dilaporkan') {
          nextStatus = 'survei';
          updateNote = 'Teknisi tiba di lokasi dan memulai inspeksi fisik titik talang air.';
        } else if (targetReport.status === 'survei') {
          nextStatus = 'dikerjakan';
          updateNote = 'Material sealant bitumen & serat fiber disiapkan. Pembersihan talang dimulai.';
        } else if (targetReport.status === 'dikerjakan') {
          nextStatus = 'uji_coba';
          updateNote = 'Penambalan selesai 100%. Mulai tes siram air dengan debit deras untuk uji kebocoran.';
        } else if (targetReport.status === 'uji_coba') {
          nextStatus = 'selesai';
          updateNote = 'Uji coba air sukses tanpa rembesan. Talang bersih dan garansi diaktifkan.';
        }

        const now = new Date();
        const timeFormatted = `${now.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][now.getMonth()]} ${now.getFullYear()}, ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} WIB`;

        const newEvent = {
          id: `t-sim-${Date.now()}`,
          timestamp: timeFormatted,
          status: nextStatus,
          title: `Update Lapangan: ${STATUS_CONFIG[nextStatus].label}`,
          note: updateNote,
          actor: targetReport.technicianName || settings.picCoordinator || 'Teknisi SiTalang',
        };

        const updatedReport: GutterReport = {
          ...targetReport,
          status: nextStatus,
          progressPercentage: STATUS_CONFIG[nextStatus].percentage,
          updatedAt: timeFormatted,
          timeline: [...targetReport.timeline, newEvent],
        };

        // Trigger toast
        setLiveToast({
          message: `${targetReport.code}: ${STATUS_CONFIG[nextStatus].label} - "${updateNote}"`,
          code: targetReport.code,
        });

        // Also update detail modal if it's currently open on this report
        setSelectedReportForDetail((curr) => curr && curr.id === targetReport.id ? updatedReport : curr);

        return prevReports.map(r => r.id === targetReport.id ? updatedReport : r);
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isSimulating, settings.simulationIntervalSec, settings.picCoordinator]);

  // Toast auto-hide
  useEffect(() => {
    if (liveToast) {
      const timer = setTimeout(() => {
        setLiveToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [liveToast]);

  // Handlers
  const handleCreateNewReport = (newReport: GutterReport) => {
    setReports(prev => [newReport, ...prev]);
    setLiveToast({
      message: `Laporan baru ${newReport.code} berhasil ditambahkan! Menunggu antrean teknisi.`,
      code: newReport.code,
    });
  };

  const handleUpdateReport = (updated: GutterReport) => {
    setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
    setSelectedReportForDetail(updated);
    setLiveToast({
      message: `Perubahan data laporan ${updated.code} berhasil disimpan!`,
      code: updated.code,
    });
  };

  const handleDeleteReport = (reportId: string) => {
    const target = reports.find(r => r.id === reportId);
    setReports(prev => prev.filter(r => r.id !== reportId));
    if (target) {
      setLiveToast({
        message: `Laporan ${target.code} (${target.title}) berhasil dihapus.`,
        code: target.code,
      });
    }
  };

  const handleQuickAdvanceStatus = (report: GutterReport) => {
    let nextStatus: RepairStatus = report.status;
    let note = '';

    if (report.status === 'dilaporkan') {
      nextStatus = 'survei';
      note = 'Pemeriksaan lapangan oleh teknisi dimulai.';
    } else if (report.status === 'survei') {
      nextStatus = 'dikerjakan';
      note = 'Pekerjaan fisik penambalan & perbaikan talang dimulai.';
    } else if (report.status === 'dikerjakan') {
      nextStatus = 'uji_coba';
      note = 'Pengujian debit air siram dimulai untuk memastikan tidak ada rembes.';
    } else if (report.status === 'uji_coba') {
      nextStatus = 'selesai';
      note = 'Pekerjaan perbaikan selesai secara keseluruhan & garansi diaktifkan.';
    }

    const now = new Date();
    const timeFormatted = `${now.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][now.getMonth()]} ${now.getFullYear()}, ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} WIB`;

    const newEvent = {
      id: `t-${Date.now()}`,
      timestamp: timeFormatted,
      status: nextStatus,
      title: STATUS_CONFIG[nextStatus].label,
      note,
      actor: report.technicianName || settings.picCoordinator || 'Teknisi',
    };

    const updated: GutterReport = {
      ...report,
      status: nextStatus,
      progressPercentage: STATUS_CONFIG[nextStatus].percentage,
      updatedAt: timeFormatted,
      timeline: [...report.timeline, newEvent],
    };

    handleUpdateReport(updated);
    setLiveToast({
      message: `${report.code} dinaikkan ke tahap: ${STATUS_CONFIG[nextStatus].label}`,
      code: report.code,
    });
  };

  const handleResetData = () => {
    setReports(INITIAL_REPORTS);
    localStorage.removeItem(STORAGE_KEY);
    setLiveToast({
      message: 'Data laporan telah direset ke contoh default.',
      code: 'RESET',
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveFilterStatus(null);
    setSelectedGutterType('all');
    setSelectedDamageType('all');
    setSelectedUrgency('all');
  };

  // Filter logic for List View
  const filteredReports = reports.filter((item) => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchCode = item.code.toLowerCase().includes(q);
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchLoc = item.location.toLowerCase().includes(q);
      const matchReporter = item.reporterName.toLowerCase().includes(q);
      const matchDesc = item.damageDescription.toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchLoc && !matchReporter && !matchDesc) {
        return false;
      }
    }

    if (activeFilterStatus === 'menunggu') {
      if (item.status !== 'dilaporkan' && item.status !== 'survei') return false;
    } else if (activeFilterStatus === 'proses') {
      if (item.status !== 'dikerjakan' && item.status !== 'uji_coba') return false;
    } else if (activeFilterStatus === 'selesai') {
      if (item.status !== 'selesai') return false;
    }

    if (selectedGutterType !== 'all' && item.gutterType !== selectedGutterType) {
      return false;
    }

    if (selectedDamageType !== 'all' && item.damageType !== selectedDamageType) {
      return false;
    }

    if (selectedUrgency !== 'all' && item.urgency !== selectedUrgency) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation with View Switcher */}
      <Navbar
        onOpenNewReport={() => setIsNewReportOpen(true)}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        onResetData={() => {
          if (window.confirm('Reset data laporan ke contoh awal?')) {
            handleResetData();
          }
        }}
        activeView={activeView}
        onChangeView={setActiveView}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Banner Quick Intro */}
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-xs font-semibold backdrop-blur-xs border border-blue-400/20">
              <Droplets className="w-3.5 h-3.5 text-cyan-300" />
              <span>{settings.companyName || 'Sistem Manajemen & Pelaporan Talang Air'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Pantau Kerusakan & Progres Perbaikan Talang Air
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/90 max-w-2xl">
              Input foto sebelum-sesudah, pantau tahapan secara real-time, cek rekapitulasi harian/bulanan/tahunan, dan konfigurasikan kop PDF di pengaturan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
            <button
              onClick={() => setActiveView(activeView === 'settings' ? 'list' : 'settings')}
              className="px-3 py-2 bg-blue-800/80 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl border border-blue-400/30 shadow-xs transition-all flex items-center gap-1.5"
            >
              <Settings className="w-4 h-4 text-cyan-300" />
              <span>{activeView === 'settings' ? 'Kembali ke Tiket' : 'Pengaturan Sistem'}</span>
            </button>

            <button
              onClick={() => setIsNewReportOpen(true)}
              className="px-4 py-2 bg-white hover:bg-blue-50 text-blue-900 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Input Laporan Baru</span>
            </button>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
        </div>

        {/* Live Simulation Alert Bar if active */}
        {isSimulating && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 shadow-xs">
            <div className="flex items-center gap-2 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>
                <strong>Mode Simulasi Real-Time Aktif:</strong> Sistem sedang memperbarui progres talang otomatis tiap {settings.simulationIntervalSec || 12} detik.
              </span>
            </div>
            <button
              onClick={() => setIsSimulating(false)}
              className="text-xs font-bold underline hover:text-emerald-950"
            >
              Hentikan
            </button>
          </div>
        )}

        {/* VIEW 1: TIKET LAPANGAN (CARDS & FILTERS) */}
        {activeView === 'list' && (
          <div className="space-y-6">
            {/* Stats Metric Cards */}
            <StatsCards
              reports={reports}
              onSelectFilterStatus={setActiveFilterStatus}
              activeFilterStatus={activeFilterStatus}
            />

            {/* Filter and Search Bar */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedGutterType={selectedGutterType}
              onGutterTypeChange={setSelectedGutterType}
              selectedDamageType={selectedDamageType}
              onDamageTypeChange={setSelectedDamageType}
              selectedUrgency={selectedUrgency}
              onUrgencyChange={setSelectedUrgency}
              onClearFilters={handleClearFilters}
              totalResults={filteredReports.length}
            />

            {/* Reports Grid */}
            {filteredReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onOpenDetail={setSelectedReportForDetail}
                    onQuickAdvanceStatus={handleQuickAdvanceStatus}
                    onPrintReport={setSelectedReportForPrint}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-xs max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
                  <CloudRain className="w-8 h-8" />
                </div>
                <h3 className="text-base font-extrabold text-slate-800 mb-1">
                  Tidak Ada Laporan Talang yang Sesuai
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
                  Coba reset filter atau kata kunci pencarian, atau buat laporan kerusakan talang baru sekarang.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handleClearFilters}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    Reset Semua Filter
                  </button>
                  <button
                    onClick={() => setIsNewReportOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Input Laporan Baru</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: DASBOR & REKAP PERIODE (EXCEL & PDF EXPORT) */}
        {activeView === 'dashboard' && (
          <ReportDashboard
            reports={reports}
            onOpenReportDetail={setSelectedReportForDetail}
            onPrintSingleReport={setSelectedReportForPrint}
            onOpenPrintSummary={(reps, label) => setSummaryPrintData({ reports: reps, periodLabel: label })}
            onUpdateReport={handleUpdateReport}
            onDeleteReport={handleDeleteReport}
          />
        )}

        {/* VIEW 3: DASBOR PENGATURAN SISTEM */}
        {activeView === 'settings' && (
          <SettingsDashboard
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            reports={reports}
            onRestoreReports={handleRestoreReports}
            onResetAllData={handleResetData}
          />
        )}
      </main>

      {/* Floating Real-Time Toast Notification */}
      {liveToast && (
        <div className="fixed bottom-5 right-5 z-40 max-w-md bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 flex items-start gap-3 animate-bounce">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <BellRing className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-xs">
            <div className="font-bold text-blue-300 mb-0.5 flex items-center gap-1.5">
              <span>🔔 Notifikasi Sistem</span>
              <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700">
                {liveToast.code}
              </span>
            </div>
            <p className="text-slate-200 line-clamp-2 leading-relaxed">
              {liveToast.message}
            </p>
          </div>
          <button
            onClick={() => setLiveToast(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Modal Detail & Timeline Real-Time */}
      {selectedReportForDetail && (
        <ReportDetailModal
          report={selectedReportForDetail}
          onClose={() => setSelectedReportForDetail(null)}
          onUpdateReport={handleUpdateReport}
          onPrintReport={(rep) => {
            setSelectedReportForDetail(null);
            setSelectedReportForPrint(rep);
          }}
        />
      )}

      {/* Modal Input Laporan Baru */}
      <NewReportModal
        isOpen={isNewReportOpen}
        onClose={() => setIsNewReportOpen(false)}
        onSubmit={handleCreateNewReport}
      />

      {/* Modal Pratinjau Cetak / Ekspor PDF Satuan */}
      {selectedReportForPrint && (
        <PrintReportView
          report={selectedReportForPrint}
          onClose={() => setSelectedReportForPrint(null)}
          settings={settings}
        />
      )}

      {/* Modal Pratinjau Cetak / Ekspor PDF Rekapitulasi Periode */}
      {summaryPrintData && (
        <PrintSummaryReportView
          reports={summaryPrintData.reports}
          periodLabel={summaryPrintData.periodLabel}
          onClose={() => setSummaryPrintData(null)}
          settings={settings}
        />
      )}

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">SiTalang</span>
            <span>— Sistem Pelaporan & Progres Real-Time Talang Air</span>
          </div>
          <p className="text-slate-400">
            {settings.companyName || 'SiTalang Indonesia'} • Hotline: {settings.phone || '0812-8876-9012'}
          </p>
        </div>
      </footer>
    </div>
  );
}
