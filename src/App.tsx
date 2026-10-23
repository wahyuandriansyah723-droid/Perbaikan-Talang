import React, { useState, useEffect } from 'react';
import { GutterReport, RepairStatus, STATUS_CONFIG, SystemSettings, DEFAULT_SETTINGS } from './types';
import { INITIAL_REPORTS } from './data/mockData';
import { parseReportDate, INDONESIAN_MONTHS } from './utils/dateHelper';
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
import { DeletePeriodModal } from './components/DeletePeriodModal';
import { DeleteReportedModal } from './components/DeleteReportedModal';
import { PhotoReportSheetDashboard } from './components/PhotoReportSheetDashboard';
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
  Settings,
  Cloud,
  Trash2,
  Camera
} from 'lucide-react';
import {
  subscribeToReports,
  subscribeToSettings,
  saveReportToFirestore,
  deleteReportFromFirestore,
  deleteReportsBatch,
  saveSettingsToFirestore,
  restoreReportsToFirestore,
  resetAllReportsInFirestore,
} from './firebase/firestoreService';

export default function App() {
  // Main Data States (Synchronized via Firebase Firestore Real-Time)
  const [reports, setReports] = useState<GutterReport[]>(INITIAL_REPORTS);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  // Undo & Redo History Stacks
  const [historyPast, setHistoryPast] = useState<GutterReport[][]>([]);
  const [historyFuture, setHistoryFuture] = useState<GutterReport[][]>([]);

  // Active view: 'list' (Tiket Lapangan) | 'dashboard' (Dasbor & Rekap Periode) | 'photos' (Laporan Foto Excel/PDF) | 'settings' (Pengaturan Sistem)
  const [activeView, setActiveView] = useState<'list' | 'dashboard' | 'photos' | 'settings'>('list');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterStatus, setActiveFilterStatus] = useState<string | null>(null);
  const [selectedGutterType, setSelectedGutterType] = useState('all');
  const [selectedDamageType, setSelectedDamageType] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');

  // Date Period Filter for Tiket Lapangan (Day, Month, Year)
  const [datePeriodType, setDatePeriodType] = useState<'all' | 'day' | 'month' | 'year'>('all');
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  // Modal & Print States
  const [selectedReportForDetail, setSelectedReportForDetail] = useState<GutterReport | null>(null);
  const [isNewReportOpen, setIsNewReportOpen] = useState(false);
  const [selectedReportForPrint, setSelectedReportForPrint] = useState<GutterReport | null>(null);
  const [summaryPrintData, setSummaryPrintData] = useState<{ reports: GutterReport[]; periodLabel: string } | null>(null);
  const [isFilterBarPeriodDeleteOpen, setIsFilterBarPeriodDeleteOpen] = useState(false);
  const [isDeleteReportedModalOpen, setIsDeleteReportedModalOpen] = useState(false);
  const [reportToDeleteInField, setReportToDeleteInField] = useState<GutterReport | null>(null);

  // Real-time live simulation mode state & toast notification
  const [isSimulating, setIsSimulating] = useState(false);
  const [liveToast, setLiveToast] = useState<{ message: string; code: string } | null>(null);

  // Subscribe to Firebase Firestore Real-Time Data (No localStorage / sessionStorage)
  useEffect(() => {
    const unsubReports = subscribeToReports(
      (firestoreReports) => {
        setReports(firestoreReports);
        setIsCloudConnected(true);
      },
      (error) => {
        console.error('Firestore reports listener error:', error);
      }
    );

    const unsubSettings = subscribeToSettings(
      (firestoreSettings) => {
        setSettings(firestoreSettings);
      },
      (error) => {
        console.error('Firestore settings listener error:', error);
      }
    );

    return () => {
      unsubReports();
      unsubSettings();
    };
  }, []);

  // Save settings directly to Firebase Firestore
  const handleUpdateSettings = async (newSettings: SystemSettings) => {
    setSettings(newSettings);
    try {
      await saveSettingsToFirestore(newSettings);
      setLiveToast({
        message: 'Pengaturan sistem berhasil disinkronkan ke Firebase Firestore.',
        code: 'CLOUD_SETTINGS',
      });
    } catch (e) {
      console.error('Failed to save settings to Firestore:', e);
    }
  };

  // Restore reports to Firebase Firestore
  const handleRestoreReports = async (restoredReports: GutterReport[]) => {
    try {
      await restoreReportsToFirestore(restoredReports);
      setLiveToast({
        message: `Database Firestore berhasil diperbarui (${restoredReports.length} laporan).`,
        code: 'CLOUD_RESTORE',
      });
    } catch (e) {
      console.error('Failed to restore reports to Firestore:', e);
    }
  };

  // Real-time simulation effect: updates Firestore so other devices see progress automatically
  useEffect(() => {
    if (!isSimulating) return;

    const intervalMs = (settings.simulationIntervalSec || 12) * 1000;

    const interval = setInterval(async () => {
      const activeReports = reports.filter(r => r.status !== 'selesai');
      if (activeReports.length === 0) return;

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

      try {
        await saveReportToFirestore(updatedReport);
        setLiveToast({
          message: `${targetReport.code}: ${STATUS_CONFIG[nextStatus].label} - "${updateNote}"`,
          code: targetReport.code,
        });
      } catch (err) {
        console.error('Simulation write to Firestore error:', err);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isSimulating, reports, settings.simulationIntervalSec, settings.picCoordinator]);

  // Toast auto-hide
  useEffect(() => {
    if (liveToast) {
      const timer = setTimeout(() => {
        setLiveToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [liveToast]);

  // Track snapshots for Undo & Redo
  const recordHistory = (currentReports: GutterReport[]) => {
    setHistoryPast((prev) => [...prev.slice(-25), [...currentReports]]);
    setHistoryFuture([]); // clear redo stack on new action
  };

  const handleUndo = async () => {
    if (historyPast.length === 0) return;
    const previousState = historyPast[historyPast.length - 1];
    const newPast = historyPast.slice(0, -1);

    setHistoryFuture((prev) => [...prev, [...reports]]);
    setHistoryPast(newPast);
    setReports(previousState);

    try {
      await restoreReportsToFirestore(previousState);
      setLiveToast({
        message: `Undo berhasil: Data laporan dikembalikan ke kondisi sebelumnya (${previousState.length} tiket).`,
        code: 'UNDO_SUCCESS',
      });
    } catch (err) {
      console.error('Failed to sync undo state to Firestore:', err);
    }
  };

  const handleRedo = async () => {
    if (historyFuture.length === 0) return;
    const nextState = historyFuture[historyFuture.length - 1];
    const newFuture = historyFuture.slice(0, -1);

    setHistoryPast((prev) => [...prev, [...reports]]);
    setHistoryFuture(newFuture);
    setReports(nextState);

    try {
      await restoreReportsToFirestore(nextState);
      setLiveToast({
        message: `Redo berhasil: Perubahan dipulihkan kembali (${nextState.length} tiket).`,
        code: 'REDO_SUCCESS',
      });
    } catch (err) {
      console.error('Failed to sync redo state to Firestore:', err);
    }
  };

  // Keyboard shortcut listener for Ctrl+Z / Cmd+Z (Undo) and Ctrl+Y / Cmd+Shift+Z (Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger global undo/redo when actively typing in text inputs or textareas
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        (activeEl as HTMLElement).isContentEditable
      );
      if (isInput) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.ctrlKey || e.metaKey) && 
        (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyPast, historyFuture, reports]);

  // CRUD Handlers - All synchronized directly with Firebase Firestore
  const handleCreateNewReport = async (newReport: GutterReport) => {
    recordHistory(reports);
    try {
      await saveReportToFirestore(newReport);
      setLiveToast({
        message: `Laporan baru ${newReport.code} berhasil disimpan ke Firebase Firestore!`,
        code: newReport.code,
      });
    } catch (e) {
      console.error('Failed to create report in Firestore:', e);
    }
  };

  const handleUpdateReport = async (updated: GutterReport) => {
    recordHistory(reports);
    try {
      await saveReportToFirestore(updated);
      setSelectedReportForDetail((curr) => curr && curr.id === updated.id ? updated : curr);
      setLiveToast({
        message: `Perubahan data ${updated.code} tersinkron ke semua perangkat!`,
        code: updated.code,
      });
    } catch (e) {
      console.error('Failed to update report in Firestore:', e);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    const target = reports.find(r => r.id === reportId);
    recordHistory(reports);
    try {
      await deleteReportFromFirestore(reportId);
      if (target) {
        setLiveToast({
          message: `Laporan ${target.code} (${target.title}) dihapus dari database online. Tekan Undo (Ctrl+Z) jika ingin membatalkan.`,
          code: target.code,
        });
      }
    } catch (e) {
      console.error('Failed to delete report in Firestore:', e);
    }
  };

  const handleDeleteReportsBatch = async (reportIds: string[], periodLabel: string) => {
    if (!reportIds || reportIds.length === 0) return;
    recordHistory(reports);
    try {
      await deleteReportsBatch(reportIds);
      setLiveToast({
        message: `Berhasil menghapus ${reportIds.length} data laporan periode ${periodLabel} dari Firebase Firestore. Anda dapat menggunakan Undo jika diperlukan.`,
        code: 'HAPUS_PERIODE',
      });
    } catch (e) {
      console.error('Failed to batch delete reports from Firestore:', e);
    }
  };

  const handleQuickAdvanceStatus = async (report: GutterReport) => {
    recordHistory(reports);
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

    await handleUpdateReport(updated);
  };

  const handleResetData = async () => {
    try {
      await resetAllReportsInFirestore();
      setLiveToast({
        message: 'Database Firestore telah direset ke contoh default.',
        code: 'RESET_CLOUD',
      });
    } catch (e) {
      console.error('Failed to reset reports in Firestore:', e);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveFilterStatus(null);
    setSelectedGutterType('all');
    setSelectedDamageType('all');
    setSelectedUrgency('all');
    setDatePeriodType('all');
  };

  // Filter logic for Tiket Lapangan (Text, Date/Month/Year, Status, Type, Urgency, Damage)
  const filteredReports = reports.filter((item) => {
    // 1. Text Search Query
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

    // 2. Date Period Filter (Per Tanggal, Per Bulan, Per Tahun)
    if (datePeriodType !== 'all') {
      const parsed = parseReportDate(item.createdAt);
      if (datePeriodType === 'day' && parsed.formattedDate !== selectedDate) {
        return false;
      }
      if (datePeriodType === 'month' && (parsed.year !== selectedYear || parsed.month !== selectedMonth)) {
        return false;
      }
      if (datePeriodType === 'year' && parsed.year !== selectedYear) {
        return false;
      }
    }

    // 3. Quick Status Filter
    if (activeFilterStatus === 'menunggu') {
      if (item.status !== 'dilaporkan' && item.status !== 'survei') return false;
    } else if (activeFilterStatus === 'proses') {
      if (item.status !== 'dikerjakan' && item.status !== 'uji_coba') return false;
    } else if (activeFilterStatus === 'selesai') {
      if (item.status !== 'selesai') return false;
    }

    // 4. Gutter Type
    if (selectedGutterType !== 'all' && item.gutterType !== selectedGutterType) {
      return false;
    }

    // 5. Damage Type
    if (selectedDamageType !== 'all' && item.damageType !== selectedDamageType) {
      return false;
    }

    // 6. Urgency Level
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
          if (window.confirm('Reset data laporan di Firebase Firestore ke contoh awal?')) {
            handleResetData();
          }
        }}
        activeView={activeView}
        onChangeView={setActiveView}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyPast.length > 0}
        canRedo={historyFuture.length > 0}
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
              Sinkronisasi online Firebase Firestore real-time: input foto sebelum-sesudah, pencarian tiket per hari/bulan/tahun, rekapitulasi, dasbor foto spreadsheet Excel & katalog cetak PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
            <button
              onClick={() => setActiveView(activeView === 'dashboard' ? 'list' : 'dashboard')}
              className={`px-3 py-2 text-white font-bold text-xs sm:text-sm rounded-xl border shadow-xs transition-all flex items-center gap-1.5 ${
                activeView === 'dashboard'
                  ? 'bg-blue-600 border-blue-300 ring-2 ring-blue-300/40'
                  : 'bg-blue-800/80 hover:bg-blue-700 border-blue-400/30'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-cyan-300" />
              <span>{activeView === 'dashboard' ? 'Kembali ke Tiket' : 'Dasbor & Rekap'}</span>
            </button>

            <button
              onClick={() => setActiveView(activeView === 'photos' ? 'list' : 'photos')}
              className={`px-3 py-2 text-white font-bold text-xs sm:text-sm rounded-xl border shadow-xs transition-all flex items-center gap-1.5 ${
                activeView === 'photos'
                  ? 'bg-emerald-600 border-emerald-300 ring-2 ring-emerald-300/40'
                  : 'bg-emerald-800/80 hover:bg-emerald-700 border-emerald-400/30'
              }`}
              title="Dasbor Laporan Foto format Excel & PDF"
            >
              <Camera className="w-4 h-4 text-emerald-300" />
              <span>{activeView === 'photos' ? 'Kembali ke Tiket' : 'Laporan Foto'}</span>
            </button>

            <button
              onClick={() => setActiveView(activeView === 'settings' ? 'list' : 'settings')}
              className="px-3 py-2 bg-blue-800/80 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl border border-blue-400/30 shadow-xs transition-all flex items-center gap-1.5"
            >
              <Settings className="w-4 h-4 text-cyan-300" />
              <span>{activeView === 'settings' ? 'Kembali ke Tiket' : 'Pengaturan'}</span>
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
                <strong>Mode Simulasi Real-Time Aktif:</strong> Sistem sedang memperbarui progres talang otomatis ke Firestore tiap {settings.simulationIntervalSec || 12} detik.
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
            {/* Action Bar Khusus Tiket Lapangan: Undo, Redo, Shortcut Dasbor Foto & Rekap */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={historyPast.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-white rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    title="Undo (Ctrl+Z): Batalkan aksi atau kembalikan tiket lapangan yang terhapus/berubah"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                    <span>Undo</span>
                    <span className="hidden sm:inline text-[10px] text-slate-400 font-mono font-normal">Ctrl+Z</span>
                    {historyPast.length > 0 && (
                      <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold">
                        {historyPast.length}
                      </span>
                    )}
                  </button>
                  <div className="w-px h-4 bg-slate-300 mx-1" />
                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={historyFuture.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-white rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    title="Redo (Ctrl+Y): Ulangi kembali perubahan tiket lapangan yang dibatalkan"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-blue-600 scale-x-[-1]" />
                    <span>Redo</span>
                    <span className="hidden sm:inline text-[10px] text-slate-400 font-mono font-normal">Ctrl+Y</span>
                    {historyFuture.length > 0 && (
                      <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded-full text-[10px] font-bold">
                        {historyFuture.length}
                      </span>
                    )}
                  </button>
                </div>
                <span className="text-xs text-slate-500 hidden lg:inline">
                  {historyPast.length > 0 
                    ? `Tersedia ${historyPast.length} histori Undo di Tiket Lapangan`
                    : 'Riwayat siap merekam aksi tiket lapangan'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Tombol Hapus Data yang Sudah Dilaporkan */}
                <button
                  type="button"
                  onClick={() => setIsDeleteReportedModalOpen(true)}
                  disabled={reports.filter((r) => r.status === 'dilaporkan').length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all active:scale-95 shadow-2xs"
                  title="Hapus data tiket yang berstatus 'Dilaporkan' (belum diproses)"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Hapus Data yang Sudah Dilaporkan ({reports.filter((r) => r.status === 'dilaporkan').length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('photos')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition-all active:scale-95 shadow-2xs"
                  title="Buka Dasbor Laporan Foto format Excel & PDF"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Dasbor Foto (Excel/PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('dashboard')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold rounded-xl transition-all active:scale-95 shadow-2xs"
                  title="Buka Dasbor & Rekapitulasi Periode"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-blue-700" />
                  <span>Rekap Bulanan</span>
                </button>
              </div>
            </div>

            {/* Stats Metric Cards */}
            <StatsCards
              reports={reports}
              onSelectFilterStatus={setActiveFilterStatus}
              activeFilterStatus={activeFilterStatus}
            />

            {/* Filter and Search Bar with Date Period Search (Hari, Bulan, Tahun) */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedGutterType={selectedGutterType}
              onGutterTypeChange={setSelectedGutterType}
              selectedDamageType={selectedDamageType}
              onDamageTypeChange={setSelectedDamageType}
              selectedUrgency={selectedUrgency}
              onUrgencyChange={setSelectedUrgency}
              gutterTypes={settings.gutterTypes}
              damageTypes={settings.damageTypes}
              datePeriodType={datePeriodType}
              onDatePeriodTypeChange={setDatePeriodType}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              onClearFilters={handleClearFilters}
              totalResults={filteredReports.length}
              onDeleteFilteredPeriod={() => setIsFilterBarPeriodDeleteOpen(true)}
              reportedCount={reports.filter((r) => r.status === 'dilaporkan').length}
              onDeleteReportedData={() => setIsDeleteReportedModalOpen(true)}
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
                    onDeleteReport={(r) => setReportToDeleteInField(r)}
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
                  Coba sesuaikan filter tanggal/bulan/tahun atau kata kunci pencarian, atau buat laporan kerusakan talang baru sekarang.
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

            {/* Modal Konfirmasi Hapus Tiket Tunggal Lapangan */}
            {reportToDeleteInField && (
              <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <Trash2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Hapus Tiket Lapangan?
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">
                        Kode: {reportToDeleteInField.code}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200 text-xs text-rose-800 space-y-1">
                    <p className="font-bold">
                      Apakah Anda yakin ingin menghapus tiket laporan ini?
                    </p>
                    <p className="text-slate-700">
                      Titik: <strong>{reportToDeleteInField.title}</strong>
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Lokasi: {reportToDeleteInField.location}
                    </p>
                    <p className="text-[11px] text-rose-600 font-medium pt-1">
                      ⚠️ Tiket yang dihapus dapat dipulihkan kapan saja dengan menekan tombol <strong>Undo (Ctrl+Z)</strong>.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setReportToDeleteInField(null)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const target = reportToDeleteInField;
                        setReportToDeleteInField(null);
                        if (target) {
                          await handleDeleteReport(target.id);
                        }
                      }}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Ya, Hapus Tiket Ini</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Hapus Periode dari FilterBar Tiket Lapangan */}
            <DeletePeriodModal
              isOpen={isFilterBarPeriodDeleteOpen}
              onClose={() => setIsFilterBarPeriodDeleteOpen(false)}
              periodLabel={
                datePeriodType === 'month' 
                  ? `${INDONESIAN_MONTHS[selectedMonth - 1]} ${selectedYear}` 
                  : datePeriodType === 'year' 
                  ? `Tahun ${selectedYear}`
                  : datePeriodType === 'day'
                  ? `Tanggal ${selectedDate}`
                  : 'Tiket Terfilter'
              }
              reportsToDelete={filteredReports}
              onConfirmDelete={async () => {
                const label = datePeriodType === 'month' 
                  ? `${INDONESIAN_MONTHS[selectedMonth - 1]} ${selectedYear}` 
                  : datePeriodType === 'year' 
                  ? `Tahun ${selectedYear}`
                  : datePeriodType === 'day'
                  ? `Tanggal ${selectedDate}`
                  : 'Tiket Terfilter';
                await handleDeleteReportsBatch(filteredReports.map((r) => r.id), label);
              }}
            />
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
            onDeleteReportsBatch={handleDeleteReportsBatch}
            onRestoreReports={handleRestoreReports}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyPast.length > 0}
            canRedo={historyFuture.length > 0}
            onOpenPhotoDashboard={() => setActiveView('photos')}
          />
        )}

        {/* VIEW 3: DASBOR LAPORAN FOTO (EXCEL & PDF) */}
        {activeView === 'photos' && (
          <PhotoReportSheetDashboard
            reports={reports}
            settings={settings}
            onOpenReportDetail={setSelectedReportForDetail}
            onPrintSingleReport={setSelectedReportForPrint}
          />
        )}

        {/* VIEW 4: DASBOR PENGATURAN SISTEM */}
        {activeView === 'settings' && (
          <SettingsDashboard
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            reports={reports}
            onRestoreReports={handleRestoreReports}
            onResetAllData={handleResetData}
            onDeleteReportsBatch={handleDeleteReportsBatch}
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
              <span>🔔 Notifikasi Real-Time</span>
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
          onDeleteReport={handleDeleteReport}
          onPrintReport={(rep) => {
            setSelectedReportForDetail(null);
            setSelectedReportForPrint(rep);
          }}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />
      )}

      {/* Modal Input Laporan Baru */}
      <NewReportModal
        isOpen={isNewReportOpen}
        onClose={() => setIsNewReportOpen(false)}
        onSubmit={handleCreateNewReport}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
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

      {/* Modal Hapus Data yang Sudah Dilaporkan */}
      <DeleteReportedModal
        isOpen={isDeleteReportedModalOpen}
        onClose={() => setIsDeleteReportedModalOpen(false)}
        reports={reports}
        onConfirmDelete={async (reportIds) => {
          await handleDeleteReportsBatch(reportIds, 'Status Dilaporkan');
        }}
      />

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
