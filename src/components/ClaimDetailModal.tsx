import React, { useState } from 'react';
import {
  X,
  Receipt,
  User,
  CreditCard,
  Building,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  Copy,
  MessageCircle,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
} from 'lucide-react';
import { ReimbursementClaim, ClaimStatus } from '../types';
import {
  formatRupiah,
  getStatusBadgeClass,
  generateFinanceReportMessage,
} from '../utils/claimUtils';

interface ClaimDetailModalProps {
  claim: ReimbursementClaim | null;
  onClose: () => void;
  onEdit: (claim: ReimbursementClaim) => void;
  onUpdateStatus: (id: string, newStatus: ClaimStatus, notes?: string) => void;
  onToast: (msg: string) => void;
}

export const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({
  claim,
  onClose,
  onEdit,
  onUpdateStatus,
  onToast,
}) => {
  if (!claim) return null;

  const [selectedStatus, setSelectedStatus] = useState<ClaimStatus>(claim.status);
  const [approverNotes, setApproverNotes] = useState(claim.approverNotes || '');
  const [isCopied, setIsCopied] = useState(false);

  const badge = getStatusBadgeClass(claim.status);

  const handleSaveStatus = () => {
    onUpdateStatus(claim.id, selectedStatus, approverNotes.trim() || undefined);
    onToast(`Status voucher berhasil diubah menjadi: ${selectedStatus}`);
  };

  const handleCopy = () => {
    const text = generateFinanceReportMessage(claim);
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    onToast('Rincian voucher berhasil disalin!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSendWA = () => {
    const text = encodeURIComponent(generateFinanceReportMessage(claim));
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Receipt className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 font-mono text-sm sm:text-base">
                  {claim.claimNumber}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                >
                  {claim.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Diajukan pada {new Date(claim.createdAt).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Big Amount Card */}
          <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-xs text-slate-400 block">Total Nominal Pencairan:</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                {formatRupiah(claim.amount)}
              </div>
              <div className="text-xs text-slate-300 mt-1">
                Kategori: <strong className="text-white">{claim.category}</strong>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-400 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4">
              <span>Tgl Pengeluaran:</span>
              <div className="font-mono text-white font-medium">{claim.expenseDate}</div>
              {claim.receiptNumber && (
                <div className="font-mono text-[11px] text-slate-400 mt-1">
                  Nota: {claim.receiptNumber}
                </div>
              )}
            </div>
          </div>

          {/* Section: Identitas & Rekening */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Identitas Pengaju */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-200">
                <User className="w-3.5 h-3.5 text-slate-700" />
                <span>Identitas Karyawan</span>
              </div>
              <div>
                <span className="text-slate-400 block">Nama Lengkap:</span>
                <span className="font-semibold text-slate-800">{claim.employeeName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">ID / NIP:</span>
                <span className="font-mono text-slate-800">{claim.employeeId}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Divisi:</span>
                <span className="text-slate-800">{claim.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block">No. Telepon / WhatsApp:</span>
                <span className="font-mono text-slate-800">{claim.phone}</span>
              </div>
              {claim.email && (
                <div>
                  <span className="text-slate-400 block">Email:</span>
                  <span className="text-slate-800 truncate block">{claim.email}</span>
                </div>
              )}
            </div>

            {/* Rekening Tujuan Pencairan */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-emerald-950 flex items-center gap-1.5 pb-2 border-b border-emerald-200">
                <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                <span>Rekening Bank Pencairan</span>
              </div>
              <div>
                <span className="text-emerald-700 block">Bank Tujuan:</span>
                <span className="font-bold text-emerald-950 text-sm">{claim.bankName}</span>
              </div>
              <div>
                <span className="text-emerald-700 block">Nomor Rekening:</span>
                <span className="font-mono font-bold text-slate-900 text-sm tracking-wider">
                  {claim.accountNumber}
                </span>
              </div>
              <div>
                <span className="text-emerald-700 block">Atas Nama Pemilik:</span>
                <span className="font-semibold text-emerald-950">
                  {claim.accountHolderName}
                </span>
              </div>
              <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-800">
                ✓ Telah diverifikasi untuk transfer dana reimbursement operasional.
              </div>
            </div>
          </div>

          {/* Rincian Keperluan */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
            <span className="font-bold text-slate-900 block">Rincian & Keperluan Pengeluaran:</span>
            <p className="text-slate-700 leading-relaxed italic">{claim.description}</p>
          </div>

          {/* Approval Section (Finance Action) */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-3">
            <span className="text-xs font-bold text-amber-950 block">
              Persetujuan & Status Finance:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                  Ubah Status Pengajuan
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ClaimStatus)}
                  className="w-full text-xs p-2 bg-white border border-amber-300 rounded-lg focus:outline-none"
                >
                  <option value="Menunggu Review">Menunggu Review</option>
                  <option value="Disetujui">Disetujui</option>
                  <option value="Proses Transfer">Proses Transfer</option>
                  <option value="Selesai Dicairkan">Selesai Dicairkan</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                  Catatan Review / Approval
                </label>
                <input
                  type="text"
                  value={approverNotes}
                  onChange={(e) => setApproverNotes(e.target.value)}
                  placeholder="Contoh: Disetujui, siap transfer hari Jumat..."
                  className="w-full text-xs p-2 bg-white border border-amber-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSaveStatus}
              className="px-3.5 py-1.5 text-xs font-medium bg-amber-900 text-white rounded-lg hover:bg-amber-950 transition-colors"
            >
              Simpan Perubahan Status & Catatan
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendWA}
              className="px-3 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Kirim via WA</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{isCopied ? 'Tersalin!' : 'Salin Voucher'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(claim);
              }}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Ubah Data</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
