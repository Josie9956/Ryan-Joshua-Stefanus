/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DataEntryForm } from './components/DataEntryForm';
import { DataTable } from './components/DataTable';
import { StatsCards } from './components/StatsCards';
import { ClaimDetailModal } from './components/ClaimDetailModal';
import { ShareFormModal } from './components/ShareFormModal';
import { EmployeeClaimsList } from './components/EmployeeClaimsList';
import { FinanceApprovalQueue } from './components/FinanceApprovalQueue';
import { FinanceDisbursement } from './components/FinanceDisbursement';
import { FinancePinModal } from './components/FinancePinModal';
import { GoogleDriveSyncModal } from './components/GoogleDriveSyncModal';
import { Toast } from './components/Toast';
import { ReimbursementClaim, ClaimStatus, UserRole } from './types';
import {
  loadStoredClaims,
  saveStoredClaims,
  resetToSampleClaims,
} from './utils/storage';
import {
  isFinanceUnlocked,
  lockFinanceSession,
} from './utils/security';
import {
  PlusCircle,
  Database,
  BarChart3,
  Receipt,
  ShieldCheck,
  Briefcase,
  CreditCard,
  Clock,
  ArrowRightLeft,
  Lock,
  UploadCloud,
} from 'lucide-react';

export default function App() {
  const [claims, setClaims] = useState<ReimbursementClaim[]>([]);
  const [currentRole, setCurrentRole] = useState<UserRole>('employee');

  // Active tab per role
  const [activeTab, setActiveTab] = useState<string>('form');

  // Modals
  const [selectedClaim, setSelectedClaim] = useState<ReimbursementClaim | null>(null);
  const [editingClaim, setEditingClaim] = useState<ReimbursementClaim | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active employee identity
  const currentEmployeeName = 'Indah Permatasari';

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadStoredClaims();
    setClaims(loaded);

    // Initial role check
    const savedRole = (localStorage.getItem('reimburse_active_role') as UserRole) || 'employee';
    if (savedRole === 'finance') {
      if (isFinanceUnlocked()) {
        setCurrentRole('finance');
        setActiveTab('approval_queue');
      } else {
        setCurrentRole('employee');
        setActiveTab('form');
      }
    } else {
      setCurrentRole('employee');
      setActiveTab('form');
    }
  }, []);

  const handleRequestSwitchRole = (targetRole: UserRole) => {
    if (targetRole === 'finance') {
      // Check PIN authentication
      if (isFinanceUnlocked()) {
        setCurrentRole('finance');
        setActiveTab('approval_queue');
        localStorage.setItem('reimburse_active_role', 'finance');
        showToast('Beralih ke Portal Keuangan (Finance)');
      } else {
        // Open PIN modal
        setIsPinModalOpen(true);
      }
    } else {
      // Switch back to employee
      setCurrentRole('employee');
      setActiveTab('form');
      localStorage.setItem('reimburse_active_role', 'employee');
      showToast('Beralih ke Portal Karyawan (Employment)');
    }
  };

  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    setCurrentRole('finance');
    setActiveTab('approval_queue');
    localStorage.setItem('reimburse_active_role', 'finance');
  };

  const handleLockFinance = () => {
    lockFinanceSession();
    setCurrentRole('employee');
    setActiveTab('form');
    localStorage.setItem('reimburse_active_role', 'employee');
    showToast('Menu Keuangan berhasil dikunci. Memerlukan PIN untuk membukanya kembali.');
  };

  // Save changes to localStorage
  const handleSaveClaim = (newOrUpdated: ReimbursementClaim) => {
    setClaims((prev) => {
      const existsIndex = prev.findIndex((c) => c.id === newOrUpdated.id);
      let updated: ReimbursementClaim[];
      if (existsIndex >= 0) {
        updated = [...prev];
        updated[existsIndex] = newOrUpdated;
      } else {
        updated = [newOrUpdated, ...prev];
      }
      saveStoredClaims(updated);
      return updated;
    });

    if (editingClaim) {
      setEditingClaim(null);
    }
  };

  const handleDeleteClaim = (id: string) => {
    setClaims((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveStoredClaims(updated);
      return updated;
    });
  };

  const handleDeleteMultiple = (ids: string[]) => {
    setClaims((prev) => {
      const updated = prev.filter((c) => !ids.includes(c.id));
      saveStoredClaims(updated);
      return updated;
    });
  };

  const handleUpdateStatus = (id: string, newStatus: ClaimStatus, notes?: string) => {
    setClaims((prev) => {
      const updated = prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: newStatus,
              approverNotes: notes !== undefined ? notes : c.approverNotes,
              updatedAt: new Date().toISOString(),
            }
          : c
      );
      saveStoredClaims(updated);
      return updated;
    });

    if (selectedClaim && selectedClaim.id === id) {
      setSelectedClaim((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              approverNotes: notes !== undefined ? notes : prev.approverNotes,
            }
          : null
      );
    }
    showToast(`Status pengajuan berhasil diubah menjadi: ${newStatus}`);
  };

  const handleResetSampleData = () => {
    const samples = resetToSampleClaims();
    setClaims(samples);
    showToast('Data contoh reimbursement berhasil dimuat ulang');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Metrics
  const pendingCount = claims.filter((c) => c.status === 'Menunggu Review').length;
  const myClaimsCount = claims.filter((c) =>
    c.employeeName.toLowerCase().includes(currentEmployeeName.toLowerCase())
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Bar Navigation */}
      <Navbar
        currentRole={currentRole}
        onChangeRole={handleRequestSwitchRole}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (editingClaim) setEditingClaim(null);
          setActiveTab(tab);
        }}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        onLockFinance={handleLockFinance}
        totalPendingCount={pendingCount}
        totalMyClaimsCount={myClaimsCount}
      />

      {/* Role Banner Ribbon */}
      <div
        className={`border-b text-xs py-2 px-4 transition-colors ${
          currentRole === 'employee'
            ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-950'
            : 'bg-indigo-50/80 border-indigo-200/80 text-indigo-950'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                currentRole === 'employee' ? 'bg-emerald-600' : 'bg-indigo-600'
              }`}
            />
            {currentRole === 'employee' ? (
              <span>
                <strong>Mode Karyawan (Employment):</strong> Masuk sebagai{' '}
                <span className="font-semibold text-slate-900">{currentEmployeeName}</span>.
                Ajukan reimbursement dan pantau progres transfer pencairan ke rekening.
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  <strong>Mode Keuangan (Finance / Terproteksi PIN):</strong> Memiliki akses
                  approval dokumen, pencairan kas, dan sinkronisasi laporan ke Google Drive.
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentRole === 'finance' && (
              <button
                onClick={handleLockFinance}
                className="text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 text-[11px]"
                title="Kunci sesi Finance sekarang"
              >
                <Lock className="w-3 h-3" />
                <span>Kunci PIN</span>
              </button>
            )}

            <button
              onClick={() =>
                handleRequestSwitchRole(currentRole === 'employee' ? 'finance' : 'employee')
              }
              className="hidden sm:inline-flex items-center gap-1 font-semibold underline hover:opacity-80 shrink-0"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>
                {currentRole === 'employee' ? 'Ke Menu Finance (Perlu PIN)' : 'Ke Menu Karyawan'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ==================== EMPLOYEE ROLE VIEWS ==================== */}
        {currentRole === 'employee' && (
          <div>
            {activeTab === 'form' && (
              <DataEntryForm
                onSaveClaim={handleSaveClaim}
                onViewTable={() => setActiveTab('my_claims')}
                onToast={showToast}
                initialData={editingClaim}
                onCancelEdit={() => setEditingClaim(null)}
              />
            )}

            {activeTab === 'my_claims' && (
              <EmployeeClaimsList
                claims={claims}
                currentEmployeeName={currentEmployeeName}
                onAddNewClaim={() => {
                  setEditingClaim(null);
                  setActiveTab('form');
                }}
                onViewClaim={(claim) => setSelectedClaim(claim)}
                onToast={showToast}
              />
            )}
          </div>
        )}

        {/* ==================== FINANCE ROLE VIEWS ==================== */}
        {currentRole === 'finance' && (
          <div>
            {activeTab === 'approval_queue' && (
              <FinanceApprovalQueue
                claims={claims}
                onUpdateStatus={handleUpdateStatus}
                onViewClaim={(claim) => setSelectedClaim(claim)}
                onToast={showToast}
              />
            )}

            {activeTab === 'table' && (
              <DataTable
                claims={claims}
                onAddNew={() => {
                  setEditingClaim(null);
                  setActiveTab('form');
                }}
                onViewClaim={(claim) => setSelectedClaim(claim)}
                onEditClaim={(claim) => {
                  setEditingClaim(claim);
                  setActiveTab('form');
                }}
                onDeleteClaim={handleDeleteClaim}
                onDeleteMultiple={handleDeleteMultiple}
                onUpdateStatus={handleUpdateStatus}
                onResetSampleData={handleResetSampleData}
                onToast={showToast}
                onOpenDriveModal={() => setIsDriveModalOpen(true)}
              />
            )}

            {activeTab === 'disbursement' && (
              <FinanceDisbursement
                claims={claims}
                onUpdateStatus={handleUpdateStatus}
                onToast={showToast}
              />
            )}

            {activeTab === 'stats' && <StatsCards claims={claims} />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-800">ReimburseHub</span>
            <span aria-hidden="true">·</span>
            <span>Sistem Klaim Operasional & Integrasi Google Drive</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDriveModalOpen(true)}
              className="font-medium text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Google Drive</span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() =>
                handleRequestSwitchRole(currentRole === 'employee' ? 'finance' : 'employee')
              }
              className="font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Ganti Mode Akses</span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="text-slate-700 hover:text-slate-900 font-medium"
            >
              Bagikan Tautan (QR Code)
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <FinancePinModal
        isOpen={isPinModalOpen}
        onSuccess={handlePinSuccess}
        onCancel={() => setIsPinModalOpen(false)}
        onToast={showToast}
      />

      <GoogleDriveSyncModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        claims={claims}
        onToast={showToast}
      />

      <ClaimDetailModal
        claim={selectedClaim}
        onClose={() => setSelectedClaim(null)}
        onEdit={(claim) => {
          setEditingClaim(claim);
          setActiveTab('form');
        }}
        onUpdateStatus={handleUpdateStatus}
        onToast={showToast}
      />

      <ShareFormModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onToast={showToast}
      />

      <Toast message={toastMessage} />
    </div>
  );
}
