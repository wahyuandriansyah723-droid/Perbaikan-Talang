export type GutterType = 'seng_galvalum' | 'pvc' | 'beton' | 'karpet_plat' | string;

export type DamageType = 
  | 'bocor_retak' 
  | 'karat_keropos' 
  | 'tersumbat_sampah' 
  | 'sambungan_lepas' 
  | 'kemiringan_anjlok'
  | string;

export interface MasterOptionItem {
  id: string;
  label: string;
  isCustom?: boolean;
}

export const DEFAULT_GUTTER_TYPES: MasterOptionItem[] = [
  { id: 'seng_galvalum', label: 'Seng / Galvalum' },
  { id: 'pvc', label: 'PVC / Paralon' },
  { id: 'beton', label: 'Talang Dak Beton' },
  { id: 'karpet_plat', label: 'Talang Karpet / Plat Aluminium' },
];

export const DEFAULT_DAMAGE_TYPES: MasterOptionItem[] = [
  { id: 'bocor_retak', label: 'Bocor & Retak Air Mengucur' },
  { id: 'karat_keropos', label: 'Karat & Keropos Parah' },
  { id: 'tersumbat_sampah', label: 'Tersumbat Daun & Lumut' },
  { id: 'sambungan_lepas', label: 'Sambungan Lepas / Patah' },
  { id: 'kemiringan_anjlok', label: 'Melengkung / Air Menggenang' },
];

export type UrgencyLevel = 'darurat' | 'sedang' | 'ringan';

export type RepairStatus = 
  | 'dilaporkan' 
  | 'survei' 
  | 'dikerjakan' 
  | 'uji_coba' 
  | 'selesai';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  status: RepairStatus;
  title: string;
  note: string;
  photoUrl?: string;
  actor: string;
}

export interface GutterReport {
  id: string;
  code: string; // e.g. TLG-2026-001
  title: string;
  location: string;
  gutterType: GutterType;
  damageType: DamageType;
  urgency: UrgencyLevel;
  reporterName: string;
  reporterPhone: string;
  technicianName: string;
  damagePhotoUrl: string;
  damageDescription: string;
  repairPhotoUrl?: string;
  repairNotes?: string;
  status: RepairStatus;
  progressPercentage: number;
  estimatedCost: number;
  createdAt: string;
  updatedAt: string;
  warrantyPeriod?: string;
  timeline: TimelineEvent[];
}

export const GUTTER_TYPE_LABELS: Record<string, string> = {
  seng_galvalum: 'Seng / Galvalum',
  pvc: 'PVC / Paralon',
  beton: 'Talang Dak Beton',
  karpet_plat: 'Talang Karpet / Plat Aluminium',
};

export const DAMAGE_TYPE_LABELS: Record<string, string> = {
  bocor_retak: 'Bocor & Retak Air Mengucur',
  karat_keropos: 'Karat & Keropos Parah',
  tersumbat_sampah: 'Tersumbat Daun & Lumut',
  sambungan_lepas: 'Sambungan Lepas / Patah',
  kemiringan_anjlok: 'Melengkung / Air Menggenang',
};

export function getGutterTypeLabel(typeKey: string, customList?: MasterOptionItem[]): string {
  if (customList && customList.length > 0) {
    const match = customList.find((c) => c.id === typeKey || c.label.toLowerCase() === typeKey.toLowerCase());
    if (match) return match.label;
  }
  return GUTTER_TYPE_LABELS[typeKey] || typeKey;
}

export function getDamageTypeLabel(damageKey: string, customList?: MasterOptionItem[]): string {
  if (customList && customList.length > 0) {
    const match = customList.find((c) => c.id === damageKey || c.label.toLowerCase() === damageKey.toLowerCase());
    if (match) return match.label;
  }
  return DAMAGE_TYPE_LABELS[damageKey] || damageKey;
}

export const URGENCY_LABELS: Record<UrgencyLevel, { label: string; color: string; badgeClass: string }> = {
  darurat: {
    label: 'Darurat (Bocor ke Plafon)',
    color: '#ef4444',
    badgeClass: 'bg-red-50 text-red-700 border-red-200 ring-red-500/10',
  },
  sedang: {
    label: 'Sedang (Rembes Saat Hujan)',
    color: '#f59e0b',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10',
  },
  ringan: {
    label: 'Ringan (Perawatan Rutin)',
    color: '#10b981',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',
  },
};

export const STATUS_CONFIG: Record<RepairStatus, {
  label: string;
  stepNumber: number;
  percentage: number;
  color: string;
  badgeClass: string;
  iconName: string;
  description: string;
}> = {
  dilaporkan: {
    label: 'Dilaporkan',
    stepNumber: 1,
    percentage: 15,
    color: '#64748b',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    iconName: 'FileText',
    description: 'Laporan baru diterima dan masuk ke antrean teknisi.',
  },
  survei: {
    label: 'Survei & Bahan',
    stepNumber: 2,
    percentage: 35,
    color: '#3b82f6',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    iconName: 'ClipboardCheck',
    description: 'Pengecekan fisik di atap & penyiapan bahan (sealant, serat fiber, plat baru).',
  },
  dikerjakan: {
    label: 'Sedang Dikerjakan',
    stepNumber: 3,
    percentage: 65,
    color: '#8b5cf6',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse',
    iconName: 'Wrench',
    description: 'Proses pembersihan kerak, pelapisan waterproofing / penggantian sambungan.',
  },
  uji_coba: {
    label: 'Uji Coba Air (Water Test)',
    stepNumber: 4,
    percentage: 85,
    color: '#06b6d4',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    iconName: 'Droplets',
    description: 'Pengujian debit air siram atap untuk memastikan nol rembesan.',
  },
  selesai: {
    label: 'Selesai & Serah Terima',
    stepNumber: 5,
    percentage: 100,
    color: '#10b981',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconName: 'CheckCircle2',
    description: 'Talang berfungsi sempurna, area dibersihkan, garansi aktif.',
  },
};

export interface SystemSettings {
  companyName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  picLeader: string;
  picCoordinator: string;
  ticketPrefix: string;
  defaultWarranty: string;
  waterTestStandard: string;
  simulationIntervalSec: number;
  enableNotifications: boolean;
  waTemplate: string;
  gutterTypes?: MasterOptionItem[];
  damageTypes?: MasterOptionItem[];
}

export const DEFAULT_SETTINGS: SystemSettings = {
  companyName: 'SITALANG - SPESIALIS TALANG AIR & ATAP',
  tagline: 'Jasa Perbaikan, Penambalan Kebocoran, Penggantian Talang & Waterproofing Bergaransi',
  address: 'Jl. Rawa Belong No. 88, Kebon Jeruk, Jakarta Barat 11530',
  phone: '0812-8876-9012',
  email: 'layanan@sitalang.id',
  picLeader: 'Ir. H. Hendra Wijaya',
  picCoordinator: 'Pak Joko (Pengawas Lapangan)',
  ticketPrefix: 'TLG',
  defaultWarranty: '6 Bulan Bebas Bocor',
  waterTestStandard: 'Siram air bertekanan debit 30 liter/menit selama 15 menit',
  simulationIntervalSec: 12,
  enableNotifications: true,
  gutterTypes: DEFAULT_GUTTER_TYPES,
  damageTypes: DEFAULT_DAMAGE_TYPES,
  waTemplate: `*LAPORAN PERBAIKAN TALANG AIR - SiTalang*
━━━━━━━━━━━━━━━━━━━━
📌 *Kode:* {code}
🏢 *Judul:* {title}
📍 *Lokasi:* {location}
🔧 *Jenis Talang:* {gutterType}
⚠️ *Masalah:* {damageType}
📊 *Status Progres:* {status} ({progress}%)
👷 *Teknisi:* {technician}
👤 *Pelapor:* {reporter}

📝 *Catatan Kerusakan:*
"{damageDescription}"

⏱️ *Update Terakhir:*
{lastUpdate}

━━━━━━━━━━━━━━━━━━━━
_Sistem Pelaporan Talang Real-Time_`,
};

