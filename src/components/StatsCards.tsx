import React from 'react';
import {
  DollarSign,
  CheckCircle2,
  Clock,
  AlertOctagon,
  TrendingUp,
  Receipt,
  PieChart,
  Building2,
} from 'lucide-react';
import { ReimbursementClaim } from '../types';
import { formatRupiah } from '../utils/claimUtils';

interface StatsCardsProps {
  claims: ReimbursementClaim[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ claims }) => {
  // Aggregate stats
  const totalAmount = claims.reduce((acc, c) => acc + c.amount, 0);

  const approvedClaims = claims.filter(
    (c) => c.status === 'Disetujui' || c.status === 'Selesai Dicairkan'
  );
  const totalApprovedAmount = approvedClaims.reduce((acc, c) => acc + c.amount, 0);

  const pendingClaims = claims.filter((c) => c.status === 'Menunggu Review');
  const totalPendingAmount = pendingClaims.reduce((acc, c) => acc + c.amount, 0);

  const inTransferClaims = claims.filter((c) => c.status === 'Proses Transfer');
  const totalInTransferAmount = inTransferClaims.reduce((acc, c) => acc + c.amount, 0);

  // Group by category
  const categoryStats = claims.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  // Group by department
  const deptStats = claims.reduce((acc, curr) => {
    acc[curr.department] = (acc[curr.department] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Diajukan */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Nilai Klaim
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-2">
            {formatRupiah(totalAmount)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Dari total <strong className="text-slate-800">{claims.length}</strong> pengajuan operasional
          </p>
        </div>

        {/* Total Dicairkan */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Disetujui / Dicairkan
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-2">
            {formatRupiah(totalApprovedAmount)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            <strong className="text-emerald-700">{approvedClaims.length}</strong> pengajuan siap/telah ditransfer
          </p>
        </div>

        {/* Menunggu Review */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Menunggu Review
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-amber-700 mt-2">
            {formatRupiah(totalPendingAmount)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            <strong className="text-amber-800">{pendingClaims.length}</strong> pengajuan dalam antrean approval
          </p>
        </div>

        {/* Proses Transfer */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Proses Transfer
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-indigo-700 mt-2">
            {formatRupiah(totalInTransferAmount)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            <strong className="text-indigo-800">{inTransferClaims.length}</strong> sedang kliring perbankan
          </p>
        </div>
      </div>

      {/* Breakdown by Category & Department */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kategori Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-600" />
            <span>Distribusi Biaya Berdasarkan Kategori</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(categoryStats).map(([cat, amount]) => {
              const pct = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{cat}</span>
                    <span className="font-mono text-slate-600">
                      {formatRupiah(amount)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Departemen Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Pengeluaran Berdasarkan Divisi</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(deptStats).map(([dept, amount]) => {
              const pct = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0;
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{dept}</span>
                    <span className="font-mono text-slate-600">
                      {formatRupiah(amount)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
