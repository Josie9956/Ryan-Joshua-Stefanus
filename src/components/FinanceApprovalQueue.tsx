import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  CreditCard,
  MessageCircle,
  Eye,
  Check,
  X,
  Receipt,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { ReimbursementClaim, ClaimStatus } from '../types';
import { formatRupiah, getStatusBadgeClass } from '../utils/claimUtils';

interface FinanceApprovalQueueProps {
  claims: ReimbursementClaim[];
  onUpdateStatus: (id: string, status: ClaimStatus, notes?: string) => void;
  onViewClaim: (claim: ReimbursementClaim) => void;
  onToast: (msg: string) => void;
}

export const FinanceApprovalQueue: React.FC<FinanceApprovalQueueProps> = ({
  claims,
  onUpdateStatus,
  onViewClaim,
  onToast,
}) => {
  const pendingClaims = claims.filter((c) => c.status === 'Menunggu Review');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = (claim: ReimbursementClaim) => {
    onUpdateStatus(
      claim.id,
      'Disetujui',
      `Disetujui oleh Finance pada ${new Date().toLocaleDateString('id-ID')}`
    );
    onToast(`Pengajuan ${claim.claimNumber} berhasil disetujui!`);
  };

  const handleRejectSubmit = (id: string) => {
    if (!rejectReason.trim()) {
      onToast('Harap tuliskan alasan penolakan untuk karyawan');
      return;
    }
    onUpdateStatus(id, 'Ditolak', rejectReason.trim());
    setRejectingId(null);
    setRejectReason('');
    onToast('Pengajuan telah ditolak dengan catatan.');
  };

  const handleClarifyWA = (claim: ReimbursementClaim) => {
    const text = encodeURIComponent(
      `Halo ${claim.employeeName}, perihal pengajuan reimbursement Anda (${claim.claimNumber}) sebesar ${formatRupiah(
        claim.amount
      )} untuk ${claim.category}. Mohon kirimkan kelengkapan bukti nota/kwitansi tambahan. Terima kasih.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleApproveAll = () => {
    if (pendingClaims.length === 0) return;
    if (
      window.confirm(
        `Setujui seluruh ${pendingClaims.length} pengajuan dalam antrean review sekarang?`
      )
    ) {
      pendingClaims.forEach((c) => {
        onUpdateStatus(
          c.id,
          'Disetujui',
          `Disetujui batch oleh Finance pada ${new Date().toLocaleDateString('id-ID')}`
        );
      });
      onToast(`Berhasil menyetujui ${pendingClaims.length} pengajuan reimbursement!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold bg-amber-800/80 px-2.5 py-1 rounded-full text-amber-200">
            Antrean Verifikasi Dokumen & Biaya
          </span>
          <h2 className="text-xl sm:text-2xl font-bold mt-2">
            Antrean Approval Keuangan
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Periksa keabsahan bukti pengeluaran, nomor rekening bank penerima, dan kelayakan anggaran sebelum disetujui untuk transfer dana.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-xl border border-white/10 text-right">
            <span className="text-[11px] text-slate-300 block">Menunggu Approval:</span>
            <span className="text-xl font-bold font-mono text-amber-300">
              {pendingClaims.length} Klaim
            </span>
          </div>

          {pendingClaims.length > 0 && (
            <button
              onClick={handleApproveAll}
              className="px-4 py-3 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-colors flex items-center gap-2 shadow-xs shrink-0"
            >
              <Check className="w-4 h-4" />
              <span>Setujui Semua</span>
            </button>
          )}
        </div>
      </div>

      {pendingClaims.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">
            Antrean Verifikasi Bersih!
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Tidak ada pengajuan reimbursement yang menunggu persetujuan saat ini. Semua data telah ditinjau.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingClaims.map((claim) => (
            <div
              key={claim.id}
              className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-900 block">
                      {claim.claimNumber}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Diajukan: {new Date(claim.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    Menunggu Review
                  </span>
                </div>

                {/* Amount & Category */}
                <div className="py-3 flex items-baseline justify-between">
                  <div className="text-xl font-bold font-mono text-emerald-700">
                    {formatRupiah(claim.amount)}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                    {claim.category}
                  </span>
                </div>

                {/* Employee info */}
                <div className="space-y-1.5 text-xs text-slate-600 pb-3">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{claim.employeeName}</span>
                    <span className="text-slate-400">({claim.department} · {claim.employeeId})</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>Rekening: <strong>{claim.bankName} {claim.accountNumber}</strong> (a.n. {claim.accountHolderName})</span>
                  </div>

                  <p className="text-xs text-slate-700 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 mt-2">
                    "{claim.description}"
                  </p>
                </div>

                {/* Reject Input box if opened */}
                {rejectingId === claim.id && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 mb-3">
                    <label className="text-[11px] font-semibold text-rose-900 block">
                      Alasan Penolakan Klaim:
                    </label>
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Contoh: Bukti nota tidak terbaca / di luar budget dinas..."
                      className="w-full text-xs p-2 bg-white border border-rose-300 rounded-lg focus:outline-none"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setRejectingId(null)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleRejectSubmit(claim.id)}
                        className="px-3 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md"
                      >
                        Konfirmasi Tolak
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleClarifyWA(claim)}
                    className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                    title="Minta klarifikasi bukti via WA"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onViewClaim(claim)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                    title="Lihat detail voucher"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setRejectingId(claim.id);
                      setRejectReason('');
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Tolak</span>
                  </button>

                  <button
                    onClick={() => handleApprove(claim)}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Setujui</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
