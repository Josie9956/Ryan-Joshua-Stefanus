import { BankName, ClaimCategory, ClaimStatus, DepartmentType, ReimbursementClaim } from '../types';

export const DEPARTMENTS: DepartmentType[] = [
  'Operasional',
  'Keuangan',
  'Pemasaran & Penjualan',
  'Teknologi & IT',
  'SDM & Umum',
  'Manajemen',
];

export const CLAIM_CATEGORIES: ClaimCategory[] = [
  'Transportasi & Bensin',
  'Konsumsi & Jamuan Klien',
  'Peralatan & ATK',
  'Perjalanan Dinas',
  'Biaya Medis & Kesehatan',
  'Internet & Komunikasi',
  'Lainnya',
];

export const POPULAR_BANKS: BankName[] = [
  'BCA',
  'Bank Mandiri',
  'BRI',
  'BNI',
  'BSI (Bank Syariah Indonesia)',
  'CIMB Niaga',
  'Permata Bank',
  'Bank Jago',
  'SeaBank',
  'Bank Lainnya',
];

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getStatusBadgeClass(status: ClaimStatus): { bg: string; text: string; border: string } {
  switch (status) {
    case 'Menunggu Review':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' };
    case 'Disetujui':
      return { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' };
    case 'Proses Transfer':
      return { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' };
    case 'Selesai Dicairkan':
      return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' };
    case 'Ditolak':
      return { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200' };
  }
}

export function generateFinanceReportMessage(claim: ReimbursementClaim): string {
  const dateStr = new Date(claim.createdAt).toLocaleString('id-ID');
  return `📋 *PENGAJUAN REIMBURSEMENT OPERASIONAL*
────────────────────────
🆔 *No. Pengajuan:* ${claim.claimNumber}
👤 *Nama Pengaju:* ${claim.employeeName} (${claim.employeeId})
🏢 *Divisi:* ${claim.department}
📞 *Kontak/WA:* ${claim.phone}
📁 *Kategori:* ${claim.category}
📅 *Tgl Pengeluaran:* ${claim.expenseDate}
💰 *Nominal Klaim:* ${formatRupiah(claim.amount)}

🏦 *REKENING PENERIMA PENCAIRAN:*
• Bank: ${claim.bankName}
• No. Rekening: ${claim.accountNumber}
• Atas Nama: ${claim.accountHolderName}
${claim.receiptNumber ? `🧾 *No. Kwitansi/Nota:* ${claim.receiptNumber}\n` : ''}📝 *Keterangan Keperluan:*
"${claim.description}"

⏳ *Status Saat Ini:* ${claim.status}
⏰ *Waktu Diajukan:* ${dateStr}
────────────────────────
_Sistem Administrasi Reimbursement Internal_`;
}
