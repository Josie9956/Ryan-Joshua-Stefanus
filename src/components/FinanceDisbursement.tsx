import React, { useState } from 'react';
import {
  CreditCard,
  Building,
  CheckCircle2,
  TrendingUp,
  Download,
  Copy,
  DollarSign,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { ReimbursementClaim, ClaimStatus, BankName } from '../types';
import { formatRupiah } from '../utils/claimUtils';
import { exportClaimsToCSV } from '../utils/exportUtils';

interface FinanceDisbursementProps {
  claims: ReimbursementClaim[];
  onUpdateStatus: (id: string, status: ClaimStatus, notes?: string) => void;
  onToast: (msg: string) => void;
}

export const FinanceDisbursement: React.FC<FinanceDisbursementProps> = ({
  claims,
  onUpdateStatus,
  onToast,
}) => {
  // Only claims that are approved or in transfer process
  const payableClaims = claims.filter(
    (c) =>
      c.status === 'Disetujui' ||
      c.status === 'Proses Transfer' ||
      c.status === 'Selesai Dicairkan'
  );

  const readyForTransfer = claims.filter(
    (c) => c.status === 'Disetujui' || c.status === 'Proses Transfer'
  );

  const totalPayableAmount = readyForTransfer.reduce((acc, c) => acc + c.amount, 0);

  // Group by Bank
  const bankGrouping = readyForTransfer.reduce((acc, curr) => {
    if (!acc[curr.bankName]) {
      acc[curr.bankName] = [];
    }
    acc[curr.bankName].push(curr);
    return acc;
  }, {} as Record<BankName, ReimbursementClaim[]>);

  const handleMarkBatchTransferred = (bankClaims: ReimbursementClaim[]) => {
    bankClaims.forEach((c) => {
      if (c.status === 'Disetujui') {
        onUpdateStatus(
          c.id,
          'Proses Transfer',
          `Sedang dalam antrean batch transfer perbankan ${new Date().toLocaleDateString('id-ID')}`
        );
      }
    });
    onToast(`Berhasil menandai ${bankClaims.length} klaim ke status 'Proses Transfer'`);
  };

  const handleMarkBatchCompleted = (bankClaims: ReimbursementClaim[]) => {
    bankClaims.forEach((c) => {
      onUpdateStatus(
        c.id,
        'Selesai Dicairkan',
        `Dana telah berhasil ditransfer ke rekening penerima pada ${new Date().toLocaleDateString('id-ID')}`
      );
    });
    onToast(`Berhasil menyelesaikan pencairan untuk ${bankClaims.length} pengajuan!`);
  };

  const handleCopyBankList = (bankName: string, bankClaims: ReimbursementClaim[]) => {
    const lines = bankClaims.map(
      (c) =>
        `${c.accountNumber} | ${c.accountHolderName} | ${c.amount} | ${c.claimNumber} (${c.employeeName})`
    );
    navigator.clipboard.writeText(lines.join('\n'));
    onToast(`Daftar nomor rekening ${bankName} berhasil disalin!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Finance Payout Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold bg-indigo-800/80 px-2.5 py-1 rounded-full text-indigo-200">
            Modul Pencairan Kas & Kliring Perbankan
          </span>
          <h2 className="text-xl sm:text-2xl font-bold mt-2">
            Disbursement & Rekap Rekening Transfer
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Daftar pengajuan yang telah disetujui, dikelompokkan menurut bank tujuan untuk memudahkan proses transfer kolektif (*Corporate Internet Banking / Payroll Batch*).
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xs px-5 py-4 rounded-xl border border-white/10 text-right self-start md:self-auto">
          <span className="text-[11px] text-slate-300 block">Total Dana Siap Cair:</span>
          <span className="text-xl font-bold font-mono text-emerald-300">
            {formatRupiah(totalPayableAmount)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {readyForTransfer.length} klaim disetujui / dalam proses
          </span>
        </div>
      </div>

      {readyForTransfer.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">
            Tidak ada antrean transfer saat ini
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Semua klaim yang disetujui telah selesai dicairkan, atau belum ada klaim baru yang disetujui oleh manajer / approver.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(bankGrouping).map(([bankName, bankClaims]) => {
            const bankTotal = bankClaims.reduce((acc, c) => acc + c.amount, 0);

            return (
              <div
                key={bankName}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs"
              >
                {/* Bank Header */}
                <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-900 text-white flex items-center justify-center font-bold text-xs">
                      {bankName.substring(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{bankName}</h3>
                      <p className="text-xs text-slate-500">
                        {bankClaims.length} rekening tujuan pencairan
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                      Total: {formatRupiah(bankTotal)}
                    </div>

                    <button
                      onClick={() => handleCopyBankList(bankName, bankClaims)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
                      title="Salin daftar nomor rekening & nominal"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Rekening</span>
                    </button>

                    <button
                      onClick={() => handleMarkBatchCompleted(bankClaims)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Tandai Selesai Ditransfer</span>
                    </button>
                  </div>
                </div>

                {/* Table of Transfers for this Bank */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-semibold">
                        <th className="py-2.5 px-4">No. Rekening</th>
                        <th className="py-2.5 px-3">Atas Nama Rekening</th>
                        <th className="py-2.5 px-3">Pengaju & Divisi</th>
                        <th className="py-2.5 px-3">Nominal Transfer</th>
                        <th className="py-2.5 px-3">Status Saat Ini</th>
                        <th className="py-2.5 pr-4 pl-3 text-right">Aksi Cepat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {bankClaims.map((claim) => (
                        <tr key={claim.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900 tracking-wider">
                            {claim.accountNumber}
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-800">
                            {claim.accountHolderName}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold block text-slate-900">
                              {claim.employeeName}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {claim.department} · {claim.claimNumber}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                            {formatRupiah(claim.amount)}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                                claim.status === 'Proses Transfer'
                                  ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                  : 'bg-blue-50 text-blue-800 border-blue-200'
                              }`}
                            >
                              {claim.status}
                            </span>
                          </td>
                          <td className="py-3 pr-4 pl-3 text-right">
                            {claim.status !== 'Selesai Dicairkan' && (
                              <button
                                onClick={() =>
                                  onUpdateStatus(
                                    claim.id,
                                    'Selesai Dicairkan',
                                    `Transfer sukses ke rekening ${claim.bankName} ${claim.accountNumber}`
                                  )
                                }
                                className="px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                              >
                                Selesai
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
