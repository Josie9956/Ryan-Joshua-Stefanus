import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Receipt,
  PlusCircle,
  Eye,
  MessageCircle,
  Copy,
  Calendar,
  CreditCard,
  Search,
} from 'lucide-react';
import { ReimbursementClaim, ClaimStatus } from '../types';
import {
  formatRupiah,
  getStatusBadgeClass,
  generateFinanceReportMessage,
} from '../utils/claimUtils';

interface EmployeeClaimsListProps {
  claims: ReimbursementClaim[];
  currentEmployeeName: string;
  onAddNewClaim: () => void;
  onViewClaim: (claim: ReimbursementClaim) => void;
  onToast: (msg: string) => void;
}

export const EmployeeClaimsList: React.FC<EmployeeClaimsListProps> = ({
  claims,
  currentEmployeeName,
  onAddNewClaim,
  onViewClaim,
  onToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Filter only claims for this employee or allow seeing their submissions
  const employeeClaims = claims.filter((c) => {
    // If search term matches
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchQuery =
        c.claimNumber.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);
      if (!matchQuery) return false;
    }

    if (filterStatus !== 'ALL' && c.status !== filterStatus) {
      return false;
    }

    return true;
  });

  const totalMyAmount = employeeClaims.reduce((acc, c) => acc + c.amount, 0);
  const totalPaidAmount = employeeClaims
    .filter((c) => c.status === 'Selesai Dicairkan')
    .reduce((acc, c) => acc + c.amount, 0);

  const getStatusStep = (status: ClaimStatus) => {
    switch (status) {
      case 'Menunggu Review':
        return 1;
      case 'Disetujui':
        return 2;
      case 'Proses Transfer':
        return 3;
      case 'Selesai Dicairkan':
        return 4;
      case 'Ditolak':
        return -1;
      default:
        return 1;
    }
  };

  const handleFollowUpWA = (claim: ReimbursementClaim) => {
    const text = encodeURIComponent(
      `Halo Tim Keuangan / Finance, saya ingin konfirmasi status pengajuan reimbursement operasional:\n\n*No. Voucher:* ${claim.claimNumber}\n*Nama:* ${claim.employeeName} (${claim.employeeId})\n*Nominal:* ${formatRupiah(claim.amount)}\n*Status Saat Ini:* ${claim.status}\n\nTerima kasih.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Employee Profile & Quick Overview */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold bg-emerald-800/80 px-2.5 py-1 rounded-full text-emerald-200">
            Karyawan / Pemohon
          </span>
          <h2 className="text-xl sm:text-2xl font-bold mt-2">
            Riwayat Klaim: {currentEmployeeName}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Pantau proses verifikasi dokumen nota, persetujuan manajer, dan status transfer pencairan ke nomor rekening bank Anda.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-xl border border-white/10 text-right">
            <span className="text-[11px] text-slate-300 block">Total Diajukan:</span>
            <span className="text-lg font-bold font-mono text-emerald-300">
              {formatRupiah(totalMyAmount)}
            </span>
          </div>
          <button
            onClick={onAddNewClaim}
            className="px-4 py-3 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-colors flex items-center gap-2 shadow-xs shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Klaim Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari voucher, keperluan, kategori..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-medium text-slate-700"
          >
            <option value="ALL">Semua Status</option>
            <option value="Menunggu Review">Menunggu Review</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Proses Transfer">Proses Transfer</option>
            <option value="Selesai Dicairkan">Selesai Dicairkan</option>
            <option value="Ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Claims List View */}
      {employeeClaims.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">
            Belum ada pengajuan reimbursement
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Gunakan tombol di bawah untuk membuat permohonan penggantian biaya operasional kantor pertama Anda.
          </p>
          <button
            onClick={onAddNewClaim}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Buat Pengajuan Baru</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {employeeClaims.map((claim) => {
            const step = getStatusStep(claim.status);
            const badge = getStatusBadgeClass(claim.status);

            return (
              <div
                key={claim.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-900 block">
                        {claim.claimNumber}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {claim.category} · {claim.expenseDate}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {claim.status}
                    </span>
                  </div>

                  {/* Nominal & Description */}
                  <div className="py-3">
                    <div className="text-lg font-bold font-mono text-emerald-700">
                      {formatRupiah(claim.amount)}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 italic">
                      "{claim.description}"
                    </p>
                  </div>

                  {/* Bank info */}
                  <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-600 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>{claim.bankName} - {claim.accountNumber}</span>
                    </span>
                    <span className="font-medium text-slate-800">
                      a.n. {claim.accountHolderName}
                    </span>
                  </div>

                  {/* Visual Progress Steps */}
                  <div className="pt-4 pb-2">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Progres Pencairan:
                    </div>

                    {step === -1 ? (
                      <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-1.5">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">Pengajuan Ditolak</span>
                          {claim.approverNotes && (
                            <p className="text-[11px] text-rose-700 mt-0.5">
                              Alasan: {claim.approverNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-1 text-center">
                        <div
                          className={`p-1.5 rounded text-[10px] font-medium ${
                            step >= 1
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          1. Diajukan
                        </div>
                        <div
                          className={`p-1.5 rounded text-[10px] font-medium ${
                            step >= 2
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          2. Disetujui
                        </div>
                        <div
                          className={`p-1.5 rounded text-[10px] font-medium ${
                            step >= 3
                              ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          3. Transfer
                        </div>
                        <div
                          className={`p-1.5 rounded text-[10px] font-medium ${
                            step >= 4
                              ? 'bg-emerald-600 text-white font-bold'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          4. Selesai
                        </div>
                      </div>
                    )}

                    {claim.approverNotes && step !== -1 && (
                      <div className="mt-2 text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                        <strong className="text-slate-700">Catatan Finance:</strong> {claim.approverNotes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <button
                    onClick={() => handleFollowUpWA(claim)}
                    className="px-2.5 py-1.5 text-xs text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                    title="Tanyakan status ke Finance via WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Follow-up Finance</span>
                  </button>

                  <button
                    onClick={() => onViewClaim(claim)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Voucher</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
