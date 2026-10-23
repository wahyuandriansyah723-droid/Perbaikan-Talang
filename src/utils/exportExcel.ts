import * as XLSX from 'xlsx';
import { 
  GutterReport, 
  STATUS_CONFIG, 
  GUTTER_TYPE_LABELS, 
  DAMAGE_TYPE_LABELS, 
  URGENCY_LABELS,
  getGutterTypeLabel,
  getDamageTypeLabel
} from '../types';

export function exportReportsToExcel(
  reports: GutterReport[],
  periodTitle: string = 'Semua Periode'
) {
  // Format rows
  const dataRows = reports.map((r, index) => ({
    'No': index + 1,
    'Kode Laporan': r.code,
    'Tanggal Laporan': r.createdAt,
    'Titik / Area Talang': r.title,
    'Alamat Lokasi': r.location,
    'Material Talang': getGutterTypeLabel(r.gutterType),
    'Jenis Kerusakan': getDamageTypeLabel(r.damageType),
    'Tingkat Urgensi': URGENCY_LABELS[r.urgency]?.label || r.urgency,
    'Status Progres': STATUS_CONFIG[r.status]?.label || r.status,
    'Progres (%)': `${r.progressPercentage}%`,
    'Estimasi Biaya (Rp)': r.estimatedCost,
    'Nama Pelapor': r.reporterName,
    'Kontak Pelapor': r.reporterPhone || '-',
    'Teknisi': r.technicianName,
    'Garansi': r.warrantyPeriod || '-',
    'Keterangan Kerusakan': r.damageDescription,
    'Tindakan Perbaikan': r.repairNotes || '-',
  }));

  // Calculate totals
  const totalCost = reports.reduce((acc, curr) => acc + (curr.estimatedCost || 0), 0);
  const totalCompleted = reports.filter(r => r.status === 'selesai').length;
  const totalInProgress = reports.filter(r => r.status === 'dikerjakan' || r.status === 'uji_coba').length;

  // Add blank row and summary
  dataRows.push({
    'No': '' as any,
    'Kode Laporan': 'TOTAL BIAYA & REKAPITULASI',
    'Tanggal Laporan': '',
    'Titik / Area Talang': `${reports.length} Titik Talang (${totalCompleted} Selesai, ${totalInProgress} Proses)`,
    'Alamat Lokasi': '',
    'Material Talang': '',
    'Jenis Kerusakan': '',
    'Tingkat Urgensi': '',
    'Status Progres': '',
    'Progres (%)': '',
    'Estimasi Biaya (Rp)': totalCost,
    'Nama Pelapor': '',
    'Kontak Pelapor': '',
    'Teknisi': '',
    'Garansi': '',
    'Keterangan Kerusakan': '',
    'Tindakan Perbaikan': '',
  });

  const worksheet = XLSX.utils.json_to_sheet(dataRows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 15 }, // Kode
    { wch: 22 }, // Tanggal
    { wch: 32 }, // Area
    { wch: 40 }, // Alamat
    { wch: 22 }, // Material
    { wch: 26 }, // Kerusakan
    { wch: 25 }, // Urgensi
    { wch: 22 }, // Status
    { wch: 12 }, // %
    { wch: 20 }, // Biaya
    { wch: 20 }, // Pelapor
    { wch: 16 }, // Kontak
    { wch: 22 }, // Teknisi
    { wch: 12 }, // Garansi
    { wch: 35 }, // Keterangan
    { wch: 35 }, // Tindakan
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Talang');

  // Generate filename with safe string
  const cleanPeriod = periodTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Laporan_Perbaikan_Talang_${cleanPeriod}.xlsx`;

  XLSX.writeFile(workbook, filename);
}

export function exportPhotoReportToExcel(
  reports: GutterReport[],
  periodTitle: string = 'Semua Periode'
) {
  const dataRows = reports.map((r, index) => ({
    'No': index + 1,
    'Kode Tiket': r.code,
    'Tanggal': r.createdAt,
    'Titik Talang': r.title,
    'Alamat Lokasi': r.location,
    'Material Talang': getGutterTypeLabel(r.gutterType),
    'Masalah Kerusakan': getDamageTypeLabel(r.damageType),
    'Status Progres': `${STATUS_CONFIG[r.status]?.label || r.status} (${r.progressPercentage}%)`,
    'Foto Kondisi Sebelum (URL)': r.damagePhotoUrl,
    'Foto Hasil Sesudah (URL)': r.repairPhotoUrl || 'Belum Ada Foto Hasil',
    'Analisa / Deskripsi Kerusakan': r.damageDescription,
    'Tindakan Perbaikan & Uji Siram': r.repairNotes || '-',
    'Estimasi Biaya (Rp)': r.estimatedCost,
    'Garansi': r.warrantyPeriod || '-',
    'Teknisi Penanggung Jawab': r.technicianName,
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataRows);

  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 15 }, // Kode
    { wch: 22 }, // Tanggal
    { wch: 30 }, // Titik
    { wch: 35 }, // Alamat
    { wch: 20 }, // Material
    { wch: 25 }, // Masalah
    { wch: 22 }, // Status
    { wch: 45 }, // Foto Sebelum
    { wch: 45 }, // Foto Sesudah
    { wch: 40 }, // Deskripsi
    { wch: 40 }, // Tindakan
    { wch: 20 }, // Biaya
    { wch: 15 }, // Garansi
    { wch: 22 }, // Teknisi
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dokumentasi Foto');

  const cleanPeriod = periodTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Laporan_Foto_Talang_Excel_${cleanPeriod}.xlsx`;

  XLSX.writeFile(workbook, filename);
}
