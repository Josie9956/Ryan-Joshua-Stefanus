export type DepartmentType =
  | 'Operasional'
  | 'Keuangan'
  | 'Pemasaran & Penjualan'
  | 'Teknologi & IT'
  | 'SDM & Umum'
  | 'Manajemen';

export type ClaimCategory =
  | 'Transportasi & Bensin'
  | 'Konsumsi & Jamuan Klien'
  | 'Peralatan & ATK'
  | 'Perjalanan Dinas'
  | 'Biaya Medis & Kesehatan'
  | 'Internet & Komunikasi'
  | 'Lainnya';

export type ClaimStatus =
  | 'Menunggu Review'
  | 'Disetujui'
  | 'Proses Transfer'
  | 'Selesai Dicairkan'
  | 'Ditolak';

export type BankName =
  | 'BCA'
  | 'Bank Mandiri'
  | 'BRI'
  | 'BNI'
  | 'BSI (Bank Syariah Indonesia)'
  | 'CIMB Niaga'
  | 'Permata Bank'
  | 'Bank Jago'
  | 'SeaBank'
  | 'Bank Lainnya';

export interface ReimbursementClaim {
  id: string;
  claimNumber: string; // e.g. CLM-2409-001
  employeeName: string;
  employeeId: string;
  department: DepartmentType;
  phone: string;
  email?: string;
  category: ClaimCategory;
  expenseDate: string;
  amount: number;
  description: string;
  bankName: BankName;
  accountNumber: string;
  accountHolderName: string;
  receiptNumber?: string;
  status: ClaimStatus;
  approverNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BankOption {
  code: BankName;
  label: string;
}

export type UserRole = 'employee' | 'finance';
