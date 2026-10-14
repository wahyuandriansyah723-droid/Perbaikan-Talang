import React from 'react';
import { GutterReport } from '../types';
import { 
  ClipboardList, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle,
  Banknote
} from 'lucide-react';

interface StatsCardsProps {
  reports: GutterReport[];
  onSelectFilterStatus: (status: string | null) => void;
  activeFilterStatus: string | null;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  reports,
  onSelectFilterStatus,
  activeFilterStatus,
}) => {
  const total = reports.length;
  const pendingCount = reports.filter(r => r.status === 'dilaporkan' || r.status === 'survei').length;
  const inProgressCount = reports.filter(r => r.status === 'dikerjakan' || r.status === 'uji_coba').length;
  const completedCount = reports.filter(r => r.status === 'selesai').length;
  const emergencyCount = reports.filter(r => r.urgency === 'darurat' && r.status !== 'selesai').length;
  const totalCost = reports.reduce((acc, curr) => acc + (curr.estimatedCost || 0), 0);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const cards = [
    {
      id: null,
      title: 'Total Laporan',
      count: total,
      subtitle: `${emergencyCount > 0 ? `${emergencyCount} darurat bocor` : 'Semua titik talang'}`,
      icon: ClipboardList,
      colorClass: 'text-slate-700 bg-slate-100',
      activeBorder: 'ring-2 ring-slate-800',
    },
    {
      id: 'menunggu',
      title: 'Menunggu & Survei',
      count: pendingCount,
      subtitle: 'Antrean pemeriksaan',
      icon: Clock,
      colorClass: 'text-blue-600 bg-blue-50',
      activeBorder: 'ring-2 ring-blue-600',
    },
    {
      id: 'proses',
      title: 'Sedang Dikerjakan',
      count: inProgressCount,
      subtitle: 'Perbaikan di lapangan',
      icon: Wrench,
      colorClass: 'text-purple-600 bg-purple-50',
      pulse: inProgressCount > 0,
      activeBorder: 'ring-2 ring-purple-600',
    },
    {
      id: 'selesai',
      title: 'Selesai & Bergaransi',
      count: completedCount,
      subtitle: 'Siap hujan tanpa bocor',
      icon: CheckCircle2,
      colorClass: 'text-emerald-600 bg-emerald-50',
      activeBorder: 'ring-2 ring-emerald-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilterStatus === card.id;

        return (
          <button
            key={card.title}
            onClick={() => onSelectFilterStatus(isActive ? null : card.id)}
            className={`text-left p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all relative overflow-hidden group ${
              isActive ? card.activeBorder : 'hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.colorClass} relative`}>
                <Icon className="w-4 h-4" />
                {card.pulse && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full animate-ping" />
                )}
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {card.count}
              </span>
              <span className="text-xs text-slate-500 font-medium truncate">
                {card.subtitle}
              </span>
            </div>

            <div className="mt-2 text-[11px] text-slate-400 group-hover:text-blue-600 flex items-center gap-1 font-medium transition-colors">
              <span>{isActive ? '✓ Sedang difilter' : 'Klik untuk filter'}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
