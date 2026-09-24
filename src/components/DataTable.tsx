import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Printer,
  Trash2,
  Edit,
  Eye,
  MessageCircle,
  Copy,
  Plus,
  RefreshCcw,
  CheckSquare,
  Square,
  ChevronDown,
  DollarSign,
  CreditCard,
  Building,
  UploadCloud,
} from 'lucide-react';
import { ReimbursementClaim, ClaimStatus, DepartmentType } from '../types';
import {
  exportClaimsToCSV,
  exportClaimsToJSON,
} from '../utils/exportUtils';
import {
  formatRupiah,
  getStatusBadgeClass,
  generateFinanceReportMessage,
} from '../utils/claimUtils';

interface DataTableProps {
  claims: ReimbursementClaim[];
  onAddNew: () => void;
  onViewClaim: (claim: ReimbursementClaim) => void;
  onEditClaim: (claim: ReimbursementClaim) => void;
  onDeleteClaim: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onUpdateStatus: (id: string, newStatus: ClaimStatus) => void;
  onResetSampleData: () => void;
  onToast: (msg: string) => void;
  onOpenDriveModal?: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  claims,
  onAddNew,
  onViewClaim,
  onEditClaim,
  onDeleteClaim,
  onDeleteMultiple,
  onUpdateStatus,
  onResetSampleData,
  onToast,
  onOpenDriveModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'date' | 'amount' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtering & searching
  const filteredClaims = useMemo(() => {
    return claims
      .filter((c) => {
        // Status filter
        if (statusFilter !== 'ALL' && c.status !== statusFilter) {
          return false;
        }

        // Department filter
        if (departmentFilter !== 'ALL' && c.department !== departmentFilter) {
          return false;
        }

        // Search text
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          c.claimNumber.toLowerCase().includes(q) ||
          c.employeeName.toLowerCase().includes(q) ||
          c.employeeId.toLowerCase().includes(q) ||
          c.accountNumber.toLowerCase().includes(q) ||
          c.accountHolderName.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.bankName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'date') {
          diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortField === 'amount') {
          diff = a.amount - b.amount;
        } else if (sortField === 'name') {
          diff = a.employeeName.localeCompare(b.employeeName);
        }
        return sortOrder === 'desc' ? -diff : diff;
      });
  }, [claims, searchTerm, statusFilter, departmentFilter, sortField, sortOrder]);

  // Aggregate total for filtered claims
  const totalFilteredAmount = useMemo(() => {
    return filteredClaims.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredClaims]);

  // Selection handlers
  const allSelected =
    filteredClaims.length > 0 &&
    filteredClaims.every((c) => selectedIds.includes(c.id));

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredClaims.map((c) => c.id));
    }
  };

  const handleToggleRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus ${selectedIds.length} data pengajuan terpilih?`
      )
    ) {
      onDeleteMultiple(selectedIds);
      setSelectedIds([]);
      onToast(`${selectedIds.length} pengajuan berhasil dihapus`);
    }
  };

  const handleExportCSV = () => {
    const dataToExport =
      selectedIds.length > 0
        ? claims.filter((c) => selectedIds.includes(c.id))
        : filteredClaims;

    if (dataToExport.length === 0) {
      onToast('Tidak ada data untuk diekspor');
      return;
    }

    exportClaimsToCSV(dataToExport);
    onToast(`Berhasil mengekspor ${dataToExport.length} data ke file CSV!`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Control bar: Search, Filters & Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari no. klaim, nama pengaju, no. rekening, bank..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-slate-800"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none font-medium text-slate-700"
          >
            <option value="ALL">Semua Status</option>
            <option value="Menunggu Review">Menunggu Review</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Proses Transfer">Proses Transfer</option>
            <option value="Selesai Dicairkan">Selesai Dicairkan</option>
            <option value="Ditolak">Ditolak</option>
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none font-medium text-slate-700"
          >
            <option value="ALL">Semua Divisi</option>
            <option value="Operasional">Operasional</option>
            <option value="Keuangan">Keuangan</option>
            <option value="Pemasaran & Penjualan">Pemasaran & Penjualan</option>
            <option value="Teknologi & IT">Teknologi & IT</option>
            <option value="SDM & Umum">SDM & Umum</option>
            <option value="Manajemen">Manajemen</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            title="Unduh laporan dalam format CSV/Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ekspor Excel</span>
          </button>

          {/* Google Drive */}
          {onOpenDriveModal && (
            <button
              onClick={onOpenDriveModal}
              className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5"
              title="Kirim dan cadangkan data ini langsung ke Google Drive"
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Kirim ke Drive</span>
            </button>
          )}

          {/* Print */}
          <button
            onClick={handlePrint}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            title="Cetak rekapitulasi reimbursement"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak</span>
          </button>

          {/* New Claim */}
          <button
            onClick={onAddNew}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajukan Klaim</span>
          </button>
        </div>
      </div>

      {/* Selected Items Banner */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white rounded-lg px-4 py-2.5 flex items-center justify-between text-xs">
          <span>{selectedIds.length} pengajuan terpilih</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-medium transition-colors"
            >
              Ekspor Terpilih
            </button>
            <button
              onClick={handleDeleteSelected}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 rounded text-xs font-medium transition-colors"
            >
              Hapus Terpilih
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-slate-400 hover:text-white ml-2 text-xs"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold">
                <th className="py-3 pl-4 pr-2 w-10">
                  <button
                    onClick={handleToggleSelectAll}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none"
                    title="Pilih Semua"
                  >
                    {allSelected ? (
                      <CheckSquare className="w-4 h-4 text-slate-900" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">No. Pengajuan & Pengaju</th>
                <th className="py-3 px-3">Kategori & Keperluan</th>
                <th
                  onClick={() => {
                    if (sortField === 'amount') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('amount');
                      setSortOrder('desc');
                    }
                  }}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Nominal (Rp)</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        sortField === 'amount' && sortOrder === 'desc'
                          ? 'rotate-180'
                          : ''
                      }`}
                    />
                  </div>
                </th>
                <th className="py-3 px-3 hidden md:table-cell">Rekening Pencairan</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 pr-4 pl-3 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="max-w-xs mx-auto text-slate-500">
                      <p className="text-sm font-medium text-slate-700">
                        Tidak ada pengajuan reimbursement ditemukan
                      </p>
                      <p className="text-xs mt-1">
                        Coba sesuaikan kata kunci pencarian atau filter yang dipilih.
                      </p>
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <button
                          onClick={onResetSampleData}
                          className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                        >
                          Muat Data Contoh
                        </button>
                        <button
                          onClick={onAddNew}
                          className="px-3 py-1.5 text-xs text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
                        >
                          Ajukan Klaim Baru
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => {
                  const isChecked = selectedIds.includes(claim.id);
                  const badge = getStatusBadgeClass(claim.status);

                  return (
                    <tr
                      key={claim.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? 'bg-slate-50' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 pl-4 pr-2">
                        <button
                          onClick={() => handleToggleRow(claim.id)}
                          className="text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-slate-900" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Claim Number & Employee */}
                      <td className="py-3 px-3">
                        <div className="font-mono text-[11px] font-bold text-slate-900">
                          {claim.claimNumber}
                        </div>
                        <div className="font-medium text-slate-800 text-xs mt-0.5">
                          {claim.employeeName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {claim.department} · {claim.employeeId}
                        </div>
                      </td>

                      {/* Category & Description */}
                      <td className="py-3 px-3 max-w-[200px]">
                        <span className="font-semibold text-slate-800 block truncate">
                          {claim.category}
                        </span>
                        <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {claim.description}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Tgl: {claim.expenseDate}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3">
                        <div className="font-mono text-xs font-bold text-emerald-700">
                          {formatRupiah(claim.amount)}
                        </div>
                      </td>

                      {/* Bank Account */}
                      <td className="py-3 px-3 hidden md:table-cell">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          <span>{claim.bankName}</span>
                        </div>
                        <div className="font-mono text-[11px] text-slate-600">
                          {claim.accountNumber}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          a.n. {claim.accountHolderName}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <select
                          value={claim.status}
                          onChange={(e) =>
                            onUpdateStatus(claim.id, e.target.value as ClaimStatus)
                          }
                          className={`text-[11px] font-semibold px-2 py-1 rounded-md border focus:outline-none cursor-pointer ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          <option value="Menunggu Review">Menunggu Review</option>
                          <option value="Disetujui">Disetujui</option>
                          <option value="Proses Transfer">Proses Transfer</option>
                          <option value="Selesai Dicairkan">Selesai Dicairkan</option>
                          <option value="Ditolak">Ditolak</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3 pr-4 pl-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View details */}
                          <button
                            onClick={() => onViewClaim(claim)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Lihat Rincian Voucher"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditClaim(claim)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Ubah Data Pengajuan"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Hapus pengajuan ${claim.claimNumber} atas nama ${claim.employeeName}?`
                                )
                              ) {
                                onDeleteClaim(claim.id);
                                onToast('Pengajuan berhasil dihapus');
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Statistics */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
          <div>
            Menampilkan <span className="font-semibold text-slate-900">{filteredClaims.length}</span> dari{' '}
            <span className="font-semibold text-slate-900">{claims.length}</span> total pengajuan
          </div>
          <div className="font-medium text-slate-800">
            Total Nilai Rekap: <strong className="font-mono text-emerald-700 font-bold">{formatRupiah(totalFilteredAmount)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
