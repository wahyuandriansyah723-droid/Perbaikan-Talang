import React, { useState, useEffect } from 'react';
import { 
  GutterReport, 
  RepairStatus, 
  STATUS_CONFIG, 
  URGENCY_LABELS, 
  GUTTER_TYPE_LABELS, 
  DAMAGE_TYPE_LABELS,
  TimelineEvent,
  GutterType,
  DamageType,
  UrgencyLevel,
  SystemSettings,
  DEFAULT_SETTINGS,
  DEFAULT_GUTTER_TYPES,
  DEFAULT_DAMAGE_TYPES,
  MasterOptionItem,
  getGutterTypeLabel,
  getDamageTypeLabel
} from '../types';
import { parseReportDate } from '../utils/dateHelper';
import { ManageTypesModal } from './ManageTypesModal';
import { 
  X, 
  MapPin, 
  User, 
  Phone, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Camera, 
  Upload, 
  Send, 
  Share2, 
  Printer, 
  Droplets, 
  Layers, 
  FileText,
  AlertTriangle,
  ArrowRight,
  Pencil,
  Calendar,
  Save,
  Check,
  Plus
} from 'lucide-react';
import { GutterCompareGallery } from './GutterCompareGallery';

interface ReportDetailModalProps {
  report: GutterReport | null;
  onClose: () => void;
  onUpdateReport: (updated: GutterReport) => void;
  onPrintReport: (report: GutterReport) => void;
  settings?: SystemSettings;
  onUpdateSettings?: (settings: SystemSettings) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  onClose,
  onUpdateReport,
  onPrintReport,
  settings = DEFAULT_SETTINGS,
  onUpdateSettings,
}) => {
  const gutterOptions = settings.gutterTypes && settings.gutterTypes.length > 0 
    ? settings.gutterTypes 
    : DEFAULT_GUTTER_TYPES;

  const damageOptions = settings.damageTypes && settings.damageTypes.length > 0 
    ? settings.damageTypes 
    : DEFAULT_DAMAGE_TYPES;

  const [manageModal, setManageModal] = useState<{
    isOpen: boolean;
    target: 'gutter' | 'damage';
  }>({
    isOpen: false,
    target: 'gutter',
  });

  const [activeTab, setActiveTab] = useState<'timeline' | 'photos' | 'update' | 'edit'>('timeline');
  const [newLogNote, setNewLogNote] = useState('');
  const [newLogStatus, setNewLogStatus] = useState<RepairStatus>(report?.status || 'dilaporkan');
  const [newLogActor, setNewLogActor] = useState(report?.technicianName || 'Teknisi Lapangan');
  const [newLogPhotoUrl, setNewLogPhotoUrl] = useState('');
  const [copiedWA, setCopiedWA] = useState(false);

  // Edit Form State (allowing editing date, title, location, costs, technician, etc.)
  const initialParsedDate = parseReportDate(report?.createdAt || '');
  const initialTimeMatch = (report?.createdAt || '').match(/(\d{1,2}):(\d{2})/);

  const [editTitle, setEditTitle] = useState(report?.title || '');
  const [editLocation, setEditLocation] = useState(report?.location || '');
  const [editGutterType, setEditGutterType] = useState<GutterType>(report?.gutterType || 'seng_galvalum');
  const [editDamageType, setEditDamageType] = useState<DamageType>(report?.damageType || 'bocor_retak');
  const [editUrgency, setEditUrgency] = useState<UrgencyLevel>(report?.urgency || 'darurat');
  const [editCost, setEditCost] = useState(report?.estimatedCost || 0);
  const [editReporterName, setEditReporterName] = useState(report?.reporterName || '');
  const [editReporterPhone, setEditReporterPhone] = useState(report?.reporterPhone || '');
  const [editTechnicianName, setEditTechnicianName] = useState(report?.technicianName || '');
  const [editWarranty, setEditWarranty] = useState(report?.warrantyPeriod || '6 Bulan');
  const [editDamageDesc, setEditDamageDesc] = useState(report?.damageDescription || '');
  const [editRepairNotes, setEditRepairNotes] = useState(report?.repairNotes || '');
  const [editDate, setEditDate] = useState(initialParsedDate.formattedDate);
  const [editTime, setEditTime] = useState(initialTimeMatch ? `${initialTimeMatch[1].padStart(2, '0')}:${initialTimeMatch[2]}` : '09:00');
  const [editSavedToast, setEditSavedToast] = useState(false);

  // Synchronize when report prop updates
  useEffect(() => {
    if (report) {
      setEditTitle(report.title);
      setEditLocation(report.location);
      setEditGutterType(report.gutterType);
      setEditDamageType(report.damageType);
      setEditUrgency(report.urgency);
      setEditCost(report.estimatedCost);
      setEditReporterName(report.reporterName);
      setEditReporterPhone(report.reporterPhone || '');
      setEditTechnicianName(report.technicianName);
      setEditWarranty(report.warrantyPeriod || '6 Bulan');
      setEditDamageDesc(report.damageDescription);
      setEditRepairNotes(report.repairNotes || '');
      const parsed = parseReportDate(report.createdAt);
      const tm = report.createdAt.match(/(\d{1,2}):(\d{2})/);
      setEditDate(parsed.formattedDate);
      setEditTime(tm ? `${tm[1].padStart(2, '0')}:${tm[2]}` : '09:00');
    }
  }, [report?.id, report?.createdAt]);

  if (!report) return null;

  const statusCfg = STATUS_CONFIG[report.status];
  const urgencyCfg = URGENCY_LABELS[report.urgency];

  const handleStatusChange = (newStatus: RepairStatus) => {
    const newProgress = STATUS_CONFIG[newStatus].percentage;
    const now = new Date();
    const timeString = `${now.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][now.getMonth()]} ${now.getFullYear()}, ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} WIB`;

    const newEvent: TimelineEvent = {
      id: `t-${Date.now()}`,
      timestamp: timeString,
      status: newStatus,
      title: `Status Diperbarui: ${STATUS_CONFIG[newStatus].label}`,
      note: STATUS_CONFIG[newStatus].description,
      actor: report.technicianName || 'Pengawas Lapangan',
    };

    const updated: GutterReport = {
      ...report,
      status: newStatus,
      progressPercentage: newProgress,
      updatedAt: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
      timeline: [...report.timeline, newEvent],
    };

    onUpdateReport(updated);
  };

  const handleAddTimelineLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogNote.trim()) return;

    const now = new Date();
    const timeString = `${now.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][now.getMonth()]} ${now.getFullYear()}, ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} WIB`;

    const newEvent: TimelineEvent = {
      id: `t-${Date.now()}`,
      timestamp: timeString,
      status: newLogStatus,
      title: STATUS_CONFIG[newLogStatus].label,
      note: newLogNote.trim(),
      photoUrl: newLogPhotoUrl || undefined,
      actor: newLogActor.trim() || 'Teknisi',
    };

    const newProgress = STATUS_CONFIG[newLogStatus].percentage;

    const updated: GutterReport = {
      ...report,
      status: newLogStatus,
      progressPercentage: newProgress,
      repairPhotoUrl: newLogPhotoUrl ? newLogPhotoUrl : report.repairPhotoUrl,
      updatedAt: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
      timeline: [...report.timeline, newEvent],
    };

    onUpdateReport(updated);
    setNewLogNote('');
    setNewLogPhotoUrl('');
    setActiveTab('timeline');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'newLog' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (target === 'newLog') {
        setNewLogPhotoUrl(result);
      } else {
        const now = new Date();
        const timeFormatted = `${now.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][now.getMonth()]} ${now.getFullYear()}, ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} WIB`;
        const updated: GutterReport = {
          ...report,
          repairPhotoUrl: result,
          updatedAt: timeFormatted,
        };
        onUpdateReport(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Full Edit (including Date and Time)
  const handleSaveFullEdit = (e: React.FormEvent) => {
    e.preventDefault();

    let newCreatedAt = report.createdAt;
    if (editDate) {
      try {
        const [yStr, mStr, dStr] = editDate.split('-');
        const [hStr, minStr] = (editTime || '09:00').split(':');
        const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
        const mIdx = Math.max(0, Math.min(11, (Number(mStr) || 1) - 1));
        newCreatedAt = `${Number(dStr) || 1} ${monthNames[mIdx]} ${yStr}, ${hStr || '09'}:${minStr || '00'} WIB`;
      } catch (err) {
        console.error('Failed to parse updated report date', err);
      }
    }

    const now = new Date();
    const timeFormatted = `${now.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][now.getMonth()]} ${now.getFullYear()}, ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} WIB`;

    const updated: GutterReport = {
      ...report,
      createdAt: newCreatedAt,
      title: editTitle.trim() || report.title,
      location: editLocation.trim() || report.location,
      gutterType: editGutterType,
      damageType: editDamageType,
      urgency: editUrgency,
      estimatedCost: Number(editCost) || 0,
      reporterName: editReporterName.trim() || report.reporterName,
      reporterPhone: editReporterPhone.trim(),
      technicianName: editTechnicianName.trim() || report.technicianName,
      warrantyPeriod: editWarranty.trim() || '6 Bulan',
      damageDescription: editDamageDesc.trim() || report.damageDescription,
      repairNotes: editRepairNotes.trim() || report.repairNotes,
      updatedAt: timeFormatted,
      timeline: [
        ...report.timeline,
        {
          id: `t-edit-${Date.now()}`,
          timestamp: timeFormatted,
          status: report.status,
          title: 'Data & Tanggal Diperbarui',
          note: `Data laporan & tanggal kejadian (${newCreatedAt}) berhasil disunting via Detail Laporan.`,
          actor: 'Pengawas / Administrator',
        },
      ],
    };

    onUpdateReport(updated);
    setEditSavedToast(true);
    setTimeout(() => {
      setEditSavedToast(false);
      setActiveTab('timeline');
    }, 1200);
  };

  // WhatsApp formatted text
  const generateWhatsAppMessage = () => {
    const text = `*LAPORAN PERBAIKAN TALANG AIR - SiTalang*
━━━━━━━━━━━━━━━━━━━━
📌 *Kode:* ${report.code}
🏢 *Judul:* ${report.title}
📍 *Lokasi:* ${report.location}
🔧 *Jenis Talang:* ${GUTTER_TYPE_LABELS[report.gutterType]}
⚠️ *Masalah:* ${DAMAGE_TYPE_LABELS[report.damageType]}
📊 *Status Progres:* ${STATUS_CONFIG[report.status].label} (${report.progressPercentage}%)
👷 *Teknisi:* ${report.technicianName}
👤 *Pelapor:* ${report.reporterName}

📝 *Catatan Kerusakan:*
"${report.damageDescription}"

⏱️ *Update Terakhir:*
${report.timeline[report.timeline.length - 1]?.timestamp || report.updatedAt}:
"${report.timeline[report.timeline.length - 1]?.note || '-'}"

━━━━━━━━━━━━━━━━━━━━
_Sistem Pelaporan Talang Real-Time_`;

    return encodeURIComponent(text);
  };

  const handleCopyWhatsApp = () => {
    const text = decodeURIComponent(generateWhatsAppMessage());
    navigator.clipboard.writeText(text);
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${generateWhatsAppMessage()}`;
    window.open(url, '_blank');
  };

  const stages: RepairStatus[] = ['dilaporkan', 'survei', 'dikerjakan', 'uji_coba', 'selesai'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                {report.code}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${urgencyCfg.badgeClass}`}>
                {urgencyCfg.label}
              </span>
              <span className="text-xs font-medium text-slate-600 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                {GUTTER_TYPE_LABELS[report.gutterType]}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900">
              {report.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-1">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{report.location}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('edit')}
              title="Edit Data & Tanggal Laporan"
              className={`p-2 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 shadow-2xs ${
                activeTab === 'edit'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200'
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit Data & Tanggal</span>
            </button>
            <button
              onClick={() => onPrintReport(report)}
              title="Cetak Berita Acara / Laporan"
              className="p-2 sm:px-3 sm:py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Cetak PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="px-4 sm:px-6 py-4 bg-white border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full animate-ping bg-blue-500" />
              Progres Real-Time: <strong className="text-blue-600">{statusCfg.label}</strong>
            </span>
            <span className="text-xs font-mono font-bold text-slate-600">
              {report.progressPercentage}% Selesai
            </span>
          </div>

          {/* Stepper visual dots */}
          <div className="relative mb-2">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${report.progressPercentage}%` }}
              />
            </div>

            <div className="grid grid-cols-5 gap-1 mt-3">
              {stages.map((stageKey, idx) => {
                const s = STATUS_CONFIG[stageKey];
                const isCurrent = report.status === stageKey;
                const isPassed = report.progressPercentage >= s.percentage;

                return (
                  <button
                    key={stageKey}
                    onClick={() => handleStatusChange(stageKey)}
                    title={`Klik untuk ubah status ke ${s.label}`}
                    className={`text-center group transition-all p-1.5 rounded-xl border ${
                      isCurrent 
                        ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/10' 
                        : isPassed 
                        ? 'bg-slate-50 border-slate-200 hover:border-slate-300' 
                        : 'bg-white border-slate-100 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {idx + 1}
                      </div>
                    </div>
                    <p className={`text-[11px] font-bold truncate ${
                      isCurrent ? 'text-blue-700' : isPassed ? 'text-slate-800' : 'text-slate-400'
                    }`}>
                      {s.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-4 sm:px-6 bg-slate-50/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-3.5 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Timeline Log ({report.timeline.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`py-3 px-3.5 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'photos'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Foto Sebelum & Sesudah</span>
            {report.repairPhotoUrl && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('update')}
            className={`py-3 px-3.5 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'update'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>+ Update Lapangan</span>
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`py-3 px-3.5 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'edit'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Pencil className="w-4 h-4" />
            <span>Edit Data & Tanggal</span>
          </button>
        </div>

        {/* Modal Body Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white">
          {/* TAB 1: TIMELINE LOG */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* Report Quick Summary Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Pelapor & Kontak:</span>
                  <strong className="text-slate-800 text-sm">{report.reporterName}</strong>
                  <span className="text-slate-500 block">{report.reporterPhone || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Teknisi Penanggung Jawab:</span>
                  <strong className="text-slate-800 text-sm">{report.technicianName}</strong>
                  <span className="text-slate-500 block">Garansi: {report.warrantyPeriod || '6 Bulan'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Estimasi Biaya Perbaikan:</span>
                  <strong className="text-blue-700 text-sm font-mono">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(report.estimatedCost)}
                  </strong>
                  <span className="text-slate-500 block">Dibuat: {report.createdAt}</span>
                </div>
              </div>

              {/* Action buttons: Share to WhatsApp */}
              <div className="flex flex-wrap gap-2 items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>Kirim ringkasan progres ke WhatsApp klien / mandor:</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyWhatsApp}
                    className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-300 transition-colors"
                  >
                    {copiedWA ? '✓ Tersalin!' : 'Salin Teks WA'}
                  </button>
                  <button
                    onClick={handleOpenWhatsApp}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Kirim ke WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Chronological Timeline List */}
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {report.timeline.map((event, idx) => {
                  const evStatus = STATUS_CONFIG[event.status];
                  return (
                    <div key={event.id} className="relative group">
                      {/* Step node dot */}
                      <div 
                        className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white shadow-xs"
                        style={{ backgroundColor: evStatus.color }}
                      >
                        <span className="text-[10px] font-bold">{idx + 1}</span>
                      </div>

                      {/* Content box */}
                      <div className="bg-slate-50 hover:bg-slate-100/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200 transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${evStatus.badgeClass}`}>
                            {evStatus.label}
                          </span>
                          <span className="text-xs font-medium text-slate-500 font-mono">
                            {event.timestamp}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-800 mb-1">
                          {event.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {event.note}
                        </p>

                        {event.photoUrl && (
                          <div className="mt-2.5">
                            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                              Lampiran Foto Progres:
                            </span>
                            <div className="rounded-xl overflow-hidden border border-slate-200 max-w-xs">
                              <img 
                                src={event.photoUrl} 
                                alt="Foto lampiran timeline" 
                                className="w-full h-36 object-cover hover:scale-105 transition-transform" 
                              />
                            </div>
                          </div>
                        )}

                        <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] text-slate-500">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Oleh: <strong className="text-slate-700">{event.actor}</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: BEFORE & AFTER PHOTOS (GALERI KOMPARASI) */}
          {activeTab === 'photos' && (
            <GutterCompareGallery
              report={report}
              onUpdateRepairPhoto={(newPhotoUrl) => {
                const now = new Date();
                const timeFormatted = `${now.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][now.getMonth()]} ${now.getFullYear()}, ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} WIB`;
                const updated: GutterReport = {
                  ...report,
                  repairPhotoUrl: newPhotoUrl,
                  updatedAt: timeFormatted,
                };
                onUpdateReport(updated);
              }}
              onUpdateReport={onUpdateReport}
              settings={settings}
              onUpdateSettings={onUpdateSettings}
            />
          )}

          {/* TAB 3: INPUT UPDATE BARU */}
          {activeTab === 'update' && (
            <form onSubmit={handleAddTimelineLog} className="space-y-4 max-w-2xl mx-auto">
              <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 mb-4">
                <h4 className="text-sm font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-blue-600" />
                  Tambah Catatan Lapangan Real-Time
                </h4>
                <p className="text-xs text-blue-700">
                  Update status dan masukkan catatan pekerjaan yang baru saja dilakukan teknisi di atap.
                </p>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Tahap Status Progres:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {stages.map((st) => {
                    const cfg = STATUS_CONFIG[st];
                    const isSelected = newLogStatus === st;
                    return (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setNewLogStatus(st)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{cfg.label}</span>
                        </div>
                        <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          {cfg.percentage}% Progres
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Catatan Aktivitas / Hasil Pengecekan:
                </label>
                <textarea
                  rows={3}
                  value={newLogNote}
                  onChange={(e) => setNewLogNote(e.target.value)}
                  placeholder="Contoh: Pembersihan lumut selesai, telah diaplikasikan waterproofing serat fiber lapis ke-2. Ditunggu kering 30 menit."
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Actor & Photo URL or File */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Teknisi / Pelaksana:
                  </label>
                  <input
                    type="text"
                    value={newLogActor}
                    onChange={(e) => setNewLogActor(e.target.value)}
                    placeholder="Nama teknisi di atap"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Foto Progres Baru (Opsional):
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Ambil / Upload</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'newLog')}
                      />
                    </label>
                    {newLogPhotoUrl && (
                      <span className="text-[11px] font-semibold text-emerald-600 truncate">
                        ✓ Foto terlampir
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim & Update Progres Real-Time</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: EDIT DATA & TANGGAL LAPORAN */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSaveFullEdit} className="space-y-5">
              {/* Info Header Banner */}
              <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Pencil className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs sm:text-sm font-extrabold text-blue-900">
                    Edit Data & Tanggal Laporan ({report.code})
                  </h4>
                  <p className="text-[11px] sm:text-xs text-blue-700 mt-0.5">
                    Anda dapat mengubah tanggal dan waktu kejadian laporan, titik area, jenis kerusakan, serta estimasi biaya. Seluruh riwayat akan otomatis disinkronkan ke dokumen cetak dan dasbor rekap.
                  </p>
                </div>
              </div>

              {editSavedToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-bounce">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Perubahan data & tanggal berhasil disimpan! Mengalihkan ke timeline...</span>
                </div>
              )}

              {/* SECTION: TANGGAL & WAKTU KEJADIAN */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Tanggal & Waktu Laporan / Kejadian
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-bold">
                    Dapat Diedit
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tanggal Laporan / Kejadian:
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Tanggal saat kerusakan talang terjadi atau dilaporkan.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Waktu Kejadian (WIB):
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Waktu pencatatan laporan.
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION: TITIK & LOKASI */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Titik & Lokasi Talang</span>
                </h5>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Judul / Titik Area Talang:
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      required
                      placeholder="Contoh: Talang Seng Jurai Belakang Dapur"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Alamat / Posisi Gedung:
                    </label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      required
                      placeholder="Contoh: Perum. Graha Indah Blok C2 No. 5"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: SPESIFIKASI MATERIAL, KERUSAKAN, URGENSI */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Jenis Material Talang:
                    </label>
                    <button
                      type="button"
                      onClick={() => setManageModal({ isOpen: true, target: 'gutter' })}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah / Edit</span>
                    </button>
                  </div>
                  <select
                    value={editGutterType}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        setManageModal({ isOpen: true, target: 'gutter' });
                      } else {
                        setEditGutterType(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {gutterOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                    <option value="__ADD_NEW__" className="text-blue-600 font-bold">
                      + Tambah Jenis Material Baru...
                    </option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Jenis Masalah Kerusakan:
                    </label>
                    <button
                      type="button"
                      onClick={() => setManageModal({ isOpen: true, target: 'damage' })}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah / Edit</span>
                    </button>
                  </div>
                  <select
                    value={editDamageType}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        setManageModal({ isOpen: true, target: 'damage' });
                      } else {
                        setEditDamageType(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {damageOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                    <option value="__ADD_NEW__" className="text-blue-600 font-bold">
                      + Tambah Jenis Kerusakan Baru...
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tingkat Urgensi:
                  </label>
                  <select
                    value={editUrgency}
                    onChange={(e) => setEditUrgency(e.target.value as UrgencyLevel)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="darurat">🚨 Darurat (Rembes Plafon / Bocor Besar)</option>
                    <option value="sedang">⚠️ Sedang (Genangan / Retak Sambungan)</option>
                    <option value="ringan">ℹ️ Ringan (Pembersihan Lumut / Rembes Kecil)</option>
                  </select>
                </div>
              </div>

              {/* SECTION: BIAYA, GARANSI & KONTAK */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimasi Biaya (Rp):
                  </label>
                  <input
                    type="number"
                    value={editCost}
                    onChange={(e) => setEditCost(Number(e.target.value) || 0)}
                    step="50000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Masa Garansi:
                  </label>
                  <input
                    type="text"
                    value={editWarranty}
                    onChange={(e) => setEditWarranty(e.target.value)}
                    placeholder="Contoh: 6 Bulan / 1 Tahun"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teknisi Penanggung Jawab:
                  </label>
                  <input
                    type="text"
                    value={editTechnicianName}
                    onChange={(e) => setEditTechnicianName(e.target.value)}
                    placeholder="Nama teknisi / mandor"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* SECTION: PELAPOR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Pelapor / Klien:
                  </label>
                  <input
                    type="text"
                    value={editReporterName}
                    onChange={(e) => setEditReporterName(e.target.value)}
                    placeholder="Nama pelapor"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Kontak / WhatsApp:
                  </label>
                  <input
                    type="text"
                    value={editReporterPhone}
                    onChange={(e) => setEditReporterPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* SECTION: DESKRIPSI KERUSAKAN & CATATAN PERBAIKAN */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Deskripsi Kerusakan Awal:
                  </label>
                  <textarea
                    rows={2}
                    value={editDamageDesc}
                    onChange={(e) => setEditDamageDesc(e.target.value)}
                    placeholder="Deskripsi awal sebelum perbaikan"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan Solusi / Metode Perbaikan:
                  </label>
                  <textarea
                    rows={2}
                    value={editRepairNotes}
                    onChange={(e) => setEditRepairNotes(e.target.value)}
                    placeholder="Metode penambalan, lapis fiber, cat waterproofing, dsb."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* SUBMIT BUTTONS */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('timeline')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Laporan</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Terakhir diperbarui: {report.updatedAt}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Modal Kelola & Tambah Jenis Material / Kerusakan */}
      <ManageTypesModal
        isOpen={manageModal.isOpen}
        onClose={() => setManageModal((prev) => ({ ...prev, isOpen: false }))}
        typeTarget={manageModal.target}
        currentItems={manageModal.target === 'gutter' ? gutterOptions : damageOptions}
        onSave={(updatedList, newlyAddedId) => {
          if (manageModal.target === 'gutter') {
            if (onUpdateSettings) {
              onUpdateSettings({ ...settings, gutterTypes: updatedList });
            }
            if (newlyAddedId) {
              setEditGutterType(newlyAddedId);
            }
          } else {
            if (onUpdateSettings) {
              onUpdateSettings({ ...settings, damageTypes: updatedList });
            }
            if (newlyAddedId) {
              setEditDamageType(newlyAddedId);
            }
          }
        }}
      />
    </div>
  );
};
