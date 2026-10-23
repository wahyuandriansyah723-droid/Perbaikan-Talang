import React from 'react';
import { Search, Filter, X, Droplets, Calendar, Trash2 } from 'lucide-react';
import { GutterType, DamageType, GUTTER_TYPE_LABELS, DAMAGE_TYPE_LABELS, MasterOptionItem } from '../types';
import { INDONESIAN_MONTHS } from '../utils/dateHelper';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedGutterType: string;
  onGutterTypeChange: (type: string) => void;
  selectedDamageType: string;
  onDamageTypeChange: (type: string) => void;
  selectedUrgency: string;
  onUrgencyChange: (urgency: string) => void;
  gutterTypes?: MasterOptionItem[];
  damageTypes?: MasterOptionItem[];
  // Date period filtering
  datePeriodType: 'all' | 'day' | 'month' | 'year';
  onDatePeriodTypeChange: (type: 'all' | 'day' | 'month' | 'year') => void;
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
  selectedMonth: number; // 1-12
  onMonthChange: (month: number) => void;
  selectedYear: number;
  onYearChange: (year: number) => void;
  onClearFilters: () => void;
  totalResults: number;
  onDeleteFilteredPeriod?: () => void;
  reportedCount?: number;
  onDeleteReportedData?: () => void;
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
  gutterTypes,
  damageTypes,
  datePeriodType,
  onDatePeriodTypeChange,
  selectedDate,
  onDateChange,
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
  onClearFilters,
  totalResults,
  onDeleteFilteredPeriod,
  reportedCount,
  onDeleteReportedData,
}) => {
  const hasActiveFilters = 
    searchQuery.trim() !== '' || 
    selectedGutterType !== 'all' || 
    selectedDamageType !== 'all' || 
    selectedUrgency !== 'all' ||
    datePeriodType !== 'all';

  const years = [2024, 2025, 2026, 2027, 2028];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 mb-6 shadow-xs">
      <div className="flex flex-col gap-3">
        {/* Row 1: Search Input & Date Search Controls */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
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

          {/* Date Period Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Periode:</span>
            </div>

            <select
              value={datePeriodType}
              onChange={(e) => onDatePeriodTypeChange(e.target.value as 'all' | 'day' | 'month' | 'year')}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Semua Waktu</option>
              <option value="day">Per Hari / Tanggal</option>
              <option value="month">Per Bulan</option>
              <option value="year">Per Tahun</option>
            </select>

            {/* If Per Hari */}
            {datePeriodType === 'day' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
              />
            )}

            {/* If Per Bulan */}
            {datePeriodType === 'month' && (
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedMonth}
                  onChange={(e) => onMonthChange(Number(e.target.value))}
                  className="px-2 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                >
                  {INDONESIAN_MONTHS.map((monthName, idx) => (
                    <option key={idx} value={idx + 1}>
                      {monthName}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => onYearChange(Number(e.target.value))}
                  className="px-2 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* If Per Tahun */}
            {datePeriodType === 'year' && (
              <select
                value={selectedYear}
                onChange={(e) => onYearChange(Number(e.target.value))}
                className="px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    Tahun {y}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Row 2: Secondary Dropdown Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {/* Gutter Material Type */}
            <select
              value={selectedGutterType}
              onChange={(e) => onGutterTypeChange(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Semua Jenis Talang</option>
              {gutterTypes && gutterTypes.length > 0
                ? gutterTypes.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))
                : Object.entries(GUTTER_TYPE_LABELS).map(([key, label]) => (
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
              {damageTypes && damageTypes.length > 0
                ? damageTypes.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))
                : Object.entries(DAMAGE_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
            </select>
          </div>

          {/* Period Bulk Delete & Clear Filter buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {totalResults > 0 && onDeleteFilteredPeriod && (
              <button
                type="button"
                onClick={onDeleteFilteredPeriod}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors shadow-2xs"
                title={`Hapus seluruh ${totalResults} tiket laporan yang tampil`}
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>
                  Hapus {totalResults} Tiket Lapangan
                  {datePeriodType === 'month' ? ` (${INDONESIAN_MONTHS[selectedMonth - 1]} ${selectedYear})` : datePeriodType === 'year' ? ` (${selectedYear})` : ''}
                </span>
              </button>
            )}

            {reportedCount !== undefined && reportedCount > 0 && onDeleteReportedData && (
              <button
                type="button"
                onClick={onDeleteReportedData}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-300 transition-colors shadow-2xs"
                title="Hapus data yang sudah dilaporkan (status: Dilaporkan)"
              >
                <Trash2 className="w-3.5 h-3.5 text-amber-700" />
                <span>Hapus Data Dilaporkan ({reportedCount})</span>
              </button>
            )}

            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Semua Filter</span>
              </button>
            )}
          </div>
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
