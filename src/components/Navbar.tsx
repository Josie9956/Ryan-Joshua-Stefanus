import React from 'react';
import {
  Receipt,
  FileSpreadsheet,
  BarChart3,
  QrCode,
  PlusCircle,
  ShieldCheck,
  CreditCard,
  Clock,
  ArrowRightLeft,
  Lock,
  UploadCloud,
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenShareModal: () => void;
  onOpenDriveModal: () => void;
  onLockFinance: () => void;
  totalPendingCount: number;
  totalMyClaimsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onChangeRole,
  activeTab,
  setActiveTab,
  onOpenShareModal,
  onOpenDriveModal,
  onLockFinance,
  totalPendingCount,
  totalMyClaimsCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs transition-colors ${
                currentRole === 'finance'
                  ? 'bg-indigo-950 text-indigo-300'
                  : 'bg-emerald-950 text-emerald-300'
              }`}
            >
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  ReimburseHub
                </span>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                    currentRole === 'finance'
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {currentRole === 'finance' ? 'Portal Finance' : 'Portal Karyawan'}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {currentRole === 'finance'
                  ? 'Verifikasi Berkas, Approval & Kliring Pencairan Rekening'
                  : 'Pengajuan & Pemantauan Status Penggantian Dana Operasional'}
              </p>
            </div>
          </div>

          {/* Navigation Links based on Active Role */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* EMPLOYEE TABS */}
            {currentRole === 'employee' ? (
              <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('form')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'form'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ajukan Klaim</span>
                </button>

                <button
                  onClick={() => setActiveTab('my_claims')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'my_claims'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                  <span>Riwayat Klaim Saya</span>
                  {totalMyClaimsCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                      {totalMyClaimsCount}
                    </span>
                  )}
                </button>
              </nav>
            ) : (
              /* FINANCE TABS */
              <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('approval_queue')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'approval_queue'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Antrean Review</span>
                  {totalPendingCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-amber-200 text-amber-900 text-[10px] font-bold rounded-full animate-pulse">
                      {totalPendingCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('table')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'table'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Semua Rekap</span>
                  <span className="sm:hidden">Rekap</span>
                </button>

                <button
                  onClick={() => setActiveTab('disbursement')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'disbursement'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Transfer Bank</span>
                  <span className="sm:hidden">Transfer</span>
                </button>

                <button
                  onClick={() => setActiveTab('stats')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'stats'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden md:inline">Statistik</span>
                </button>
              </nav>
            )}

            {/* Quick Action Tools: Google Drive & QR & Role Switcher */}
            <div className="border-l border-slate-200 pl-2 sm:pl-3 flex items-center gap-1.5">
              {/* Google Drive Sync Button */}
              <button
                onClick={onOpenDriveModal}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition-colors flex items-center gap-1.5 shadow-2xs"
                title="Kirim & Cadangkan Data ke Google Drive"
              >
                <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden md:inline">Google Drive</span>
              </button>

              {/* Lock Button for Finance mode */}
              {currentRole === 'finance' && (
                <button
                  onClick={onLockFinance}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 border border-slate-200"
                  title="Kunci Akses Menu Keuangan (PIN)"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden lg:inline">Kunci</span>
                </button>
              )}

              {/* Role Switcher Button */}
              <button
                onClick={() => {
                  const nextRole = currentRole === 'employee' ? 'finance' : 'employee';
                  onChangeRole(nextRole);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border shadow-2xs ${
                  currentRole === 'employee'
                    ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                }`}
                title={
                  currentRole === 'employee'
                    ? 'Klik untuk beralih ke Mode Bagian Keuangan / Finance (Perlu PIN)'
                    : 'Klik untuk beralih ke Mode Karyawan / Pemohon'
                }
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {currentRole === 'employee' ? 'Ke Menu Finance' : 'Ke Menu Karyawan'}
                </span>
                <span className="sm:hidden">
                  {currentRole === 'employee' ? 'Finance' : 'Karyawan'}
                </span>
              </button>

              {/* Share / QR Link */}
              <button
                onClick={onOpenShareModal}
                className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                title="Bagikan Tautan Form Pengajuan"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
