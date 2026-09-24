import { ReimbursementClaim } from '../types';
import { formatRupiah } from './claimUtils';

/**
 * Generates raw CSV formatted string compatible with Excel & Google Sheets
 */
export function generateClaimsCSVContent(claims: ReimbursementClaim[]): string {
  const headers = [
    'No. Pengajuan',
    'Nama Pengaju',
    'ID Karyawan',
    'Divisi',
    'No. Kontak',
    'Email',
    'Kategori Klaim',
    'Tgl Pengeluaran',
    'Nominal (IDR)',
    'Bank Tujuan',
    'Nomor Rekening',
    'Nama Pemilik Rekening',
    'No. Nota / Kwitansi',
    'Keterangan Keperluan',
    'Status Pengajuan',
    'Catatan Review / Approval',
    'Waktu Diajukan',
  ];

  const escapeCSV = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = claims.map((c) => [
    escapeCSV(c.claimNumber),
    escapeCSV(c.employeeName),
    escapeCSV(c.employeeId),
    escapeCSV(c.department),
    escapeCSV(c.phone),
    escapeCSV(c.email || '-'),
    escapeCSV(c.category),
    escapeCSV(c.expenseDate),
    escapeCSV(c.amount),
    escapeCSV(c.bankName),
    escapeCSV(`'${c.accountNumber}`), // Prepend apostrophe so Excel preserves leading zeros
    escapeCSV(c.accountHolderName),
    escapeCSV(c.receiptNumber || '-'),
    escapeCSV(c.description),
    escapeCSV(c.status),
    escapeCSV(c.approverNotes || '-'),
    escapeCSV(new Date(c.createdAt).toLocaleString('id-ID')),
  ]);

  return (
    '\uFEFF' +
    [headers.map(escapeCSV).join(','), ...rows.map((row) => row.join(','))].join('\r\n')
  );
}

/**
 * Exports reimbursement claims to CSV file download
 */
export function exportClaimsToCSV(claims: ReimbursementClaim[]): void {
  const csvContent = generateClaimsCSVContent(claims);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `rekap_reimbursement_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportClaimsToJSON(claims: ReimbursementClaim[]): void {
  const jsonStr = JSON.stringify(claims, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `backup_reimbursement_${dateStr}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
