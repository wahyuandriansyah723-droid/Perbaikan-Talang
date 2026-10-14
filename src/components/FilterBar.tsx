import React from 'react';
import { Search, Filter, X, Droplets } from 'lucide-react';
import { GutterType, DamageType, GUTTER_TYPE_LABELS, DAMAGE_TYPE_LABELS } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedGutterType: string;
  onGutterTypeChange: (type: string) => void;
  selectedDamageType: string;
  onDamageTypeChange: (type: string) => void;
  selectedUrgency: string;
  onUrgencyChange: (urgency: string) => void;
  onClearFilters: () => void;
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedGutterType,
  onGutterTypeChange,
  selectedDamageType,
  onDamageTypeChange,
  selectedUrgency,
  onUrgencyChange,
  onClearFilters,
  totalResults,
}) => {
  const hasActiveFilters = 
    searchQuery.trim() !== '' || 
    selectedGutterType !== 'all' || 
    selectedDamageType !== 'all' || 
    selectedUrgency !== 'all';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 mb-6 shadow-xs">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari kode (TLG-001), lokasi, nama pelapor, atau masalah talang..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Gutter Material Type */}
          <select
            value={selectedGutterType}
            onChange={(e) => onGutterTypeChange(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Semua Jenis Talang</option>
            {Object.entries(GUTTER_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* Urgency */}
          <select
            value={selectedUrgency}
            onChange={(e) => onUrgencyChange(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Semua Urgensi</option>
            <option value="darurat">🚨 Darurat (Bocor Parah)</option>
            <option value="sedang">⚠️ Sedang (Rembes)</option>
            <option value="ringan">✅ Ringan (Perawatan)</option>
          </select>

          {/* Damage Type */}
          <select
            value={selectedDamageType}
            onChange={(e) => onDamageTypeChange(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Semua Masalah</option>
            {Object.entries(DAMAGE_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* Clear Filter button */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Result counter indicator */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-blue-500" />
          Menampilkan <strong className="text-slate-800">{totalResults}</strong> laporan perbaikan talang
        </span>
        {hasActiveFilters && (
          <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
            Filter diterapkan
          </span>
        )}
      </div>
    </div>
  );
};
