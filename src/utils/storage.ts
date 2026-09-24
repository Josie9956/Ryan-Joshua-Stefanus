import { ReimbursementClaim } from '../types';

const STORAGE_KEY = 'reimbursement_claims_v1';

export const INITIAL_SAMPLE_CLAIMS: ReimbursementClaim[] = [
  {
    id: 'clm-001',
    claimNumber: 'CLM-2026-001',
    employeeName: 'Indah Permatasari',
    employeeId: 'EMP-1042',
    department: 'Operasional',
    phone: '081289102345',
    email: 'indah.permatasari@perusahaan.co.id',
    category: 'Transportasi & Bensin',
    expenseDate: '2026-09-20',
    amount: 350000,
    description: 'Biaya transportasi Grab & BBM saat kunjungan lapangan ke vendor logistik Cikarang.',
    bankName: 'BCA',
    accountNumber: '5310928172',
    accountHolderName: 'Indah Permatasari',
    receiptNumber: 'INV-GRB-9921',
    status: 'Menunggu Review',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'clm-002',
    claimNumber: 'CLM-2026-002',
    employeeName: 'Rian Pratama',
    employeeId: 'EMP-1018',
    department: 'Pemasaran & Penjualan',
    phone: '085712348899',
    email: 'rian.pratama@perusahaan.co.id',
    category: 'Konsumsi & Jamuan Klien',
    expenseDate: '2026-09-18',
    amount: 620000,
    description: 'Jamuan makan siang diskusi perpanjangan kontrak kerjasama dengan Tim Klien PT Mega Sejahtera.',
    bankName: 'Bank Mandiri',
    accountNumber: '1370019283741',
    accountHolderName: 'Rian Pratama',
    receiptNumber: 'STR-RESTO-4410',
    status: 'Disetujui',
    approverNotes: 'Disetujui Manajer Penjualan. Siap diproses batch transfer hari Jumat.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'clm-003',
    claimNumber: 'CLM-2026-003',
    employeeName: 'Dewi Lestari',
    employeeId: 'EMP-1088',
    department: 'SDM & Umum',
    phone: '087855667788',
    email: 'dewi.lestari@perusahaan.co.id',
    category: 'Peralatan & ATK',
    expenseDate: '2026-09-15',
    amount: 475000,
    description: 'Pembelian toner printer darurat dan kertas dokumen arsip evaluasi bulanan kantor.',
    bankName: 'BRI',
    accountNumber: '034101002938531',
    accountHolderName: 'Dewi Lestari',
    receiptNumber: 'KWT-GRAMED-7721',
    status: 'Selesai Dicairkan',
    approverNotes: 'Dana telah ditransfer ke rekening BRI penerima pada 17 Sep 2026.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

export function loadStoredClaims(): ReimbursementClaim[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_CLAIMS));
      return INITIAL_SAMPLE_CLAIMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load claims from localStorage:', error);
    return INITIAL_SAMPLE_CLAIMS;
  }
}

export function saveStoredClaims(claims: ReimbursementClaim[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
  } catch (error) {
    console.error('Failed to save claims to localStorage:', error);
  }
}

export function resetToSampleClaims(): ReimbursementClaim[] {
  saveStoredClaims(INITIAL_SAMPLE_CLAIMS);
  return INITIAL_SAMPLE_CLAIMS;
}
