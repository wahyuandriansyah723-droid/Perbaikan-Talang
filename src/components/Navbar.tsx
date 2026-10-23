import React from 'react';
import { 
  Wrench, 
  Plus, 
  Radio, 
  RotateCcw,
  BarChart3,
  ClipboardList,
  Settings
} from 'lucide-react';

interface NavbarProps {
  onOpenNewReport: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onResetData: () => void;
  activeView: 'list' | 'dashboard' | 'photos' | 'settings';
  onChangeView: (view: 'list' | 'dashboard' | 'photos' | 'settings') => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewReport,
  isSimulating,
  onToggleSimulation,
  onResetData,
  activeView,
  onChangeView,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                  SiTalang
                </span>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                  Laporan Progres
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200" title="Sinkronisasi online Firebase Firestore Real-Time Aktif">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Firestore Online</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Monitoring & Pelaporan Perbaikan Talang Air Real-Time
              </p>
            </div>
          </div>

          {/* Center Tabs: List vs Dashboard vs Photos vs Settings */}
          <div className="hidden md:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => onChangeView('list')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeView === 'list'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Tiket Lapangan</span>
            </button>
            <button
              onClick={() => onChangeView('dashboard')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeView === 'dashboard'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Dasbor & Rekap</span>
            </button>
            <button
              onClick={() => onChangeView('photos')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeView === 'photos'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Dasbor Laporan Foto format Excel & PDF"
            >
              <span className="flex items-center justify-center w-4 h-4 rounded bg-emerald-100 text-emerald-700 text-[10px] font-black">
                📷
              </span>
              <span>Laporan Foto (Excel/PDF)</span>
            </button>
            <button
              onClick={() => onChangeView('settings')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeView === 'settings'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Pengaturan</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* UNDO & REDO CONTROLS */}
            <div className="flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z): Batalkan perubahan terakhir"
                className="p-1.5 text-slate-700 hover:text-blue-700 hover:bg-white rounded-lg transition-all disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-700"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onRedo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y): Ulangi perubahan yang dibatalkan"
                className="p-1.5 text-slate-700 hover:text-blue-700 hover:bg-white rounded-lg transition-all disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-700 scale-x-[-1]"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Live Simulation Indicator & Toggle */}
            <button
              onClick={onToggleSimulation}
              title={isSimulating ? "Klik untuk hentikan simulasi otomatis" : "Aktifkan simulasi update real-time otomatis"}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                isSimulating 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isSimulating ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
              <span className="hidden xl:inline">
                {isSimulating ? 'Simulasi Live: Aktif' : 'Simulasi Real-Time'}
              </span>
              <span className="xl:hidden">
                {isSimulating ? 'Live' : 'Simulasi'}
              </span>
            </button>

            {/* Reset Data Button */}
            <button
              onClick={onResetData}
              title="Reset data ke default"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Button Tambah Laporan */}
            <button
              onClick={onOpenNewReport}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm shadow-blue-500/25 transition-all hover:shadow-md hover:shadow-blue-500/35 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Input Laporan</span>
              <span className="sm:hidden">Lapor</span>
            </button>
          </div>
        </div>

        {/* Mobile View Switcher Sub-bar */}
        <div className="md:hidden flex items-center justify-center p-1 pb-2 border-t border-slate-100 gap-1">
          <button
            onClick={() => onChangeView('list')}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 border ${
              activeView === 'list'
                ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            <ClipboardList className="w-3 h-3" />
            <span>Tiket</span>
          </button>
          <button
            onClick={() => onChangeView('dashboard')}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 border ${
              activeView === 'dashboard'
                ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            <BarChart3 className="w-3 h-3" />
            <span>Rekap</span>
          </button>
          <button
            onClick={() => onChangeView('photos')}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 border ${
              activeView === 'photos'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            <span>📷</span>
            <span>Foto</span>
          </button>
          <button
            onClick={() => onChangeView('settings')}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 border ${
              activeView === 'settings'
                ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            <Settings className="w-3 h-3" />
            <span>Atur</span>
          </button>
        </div>
      </div>
    </header>
  );
};
