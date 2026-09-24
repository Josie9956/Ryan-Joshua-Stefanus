import React, { useState, useId } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  Phone,
  Mail,
  Building,
  CreditCard,
  FileText,
  DollarSign,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Copy,
  Plus,
  RefreshCw,
  Receipt,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { ReimbursementClaim, DepartmentType, ClaimCategory, BankName } from '../types';
import {
  DEPARTMENTS,
  CLAIM_CATEGORIES,
  POPULAR_BANKS,
  formatRupiah,
  generateFinanceReportMessage,
} from '../utils/claimUtils';

interface DataEntryFormProps {
  onSaveClaim: (claim: ReimbursementClaim) => void;
  onViewTable: () => void;
  onToast: (msg: string) => void;
  initialData?: ReimbursementClaim | null;
  onCancelEdit?: () => void;
}

export const DataEntryForm: React.FC<DataEntryFormProps> = ({
  onSaveClaim,
  onViewTable,
  onToast,
  initialData,
  onCancelEdit,
}) => {
  const formId = useId();

  // Form states with sensible defaults for administrative reimbursement
  const [employeeName, setEmployeeName] = useState(
    initialData?.employeeName || 'Indah Permatasari'
  );
  const [employeeId, setEmployeeId] = useState(initialData?.employeeId || 'EMP-1042');
  const [department, setDepartment] = useState<DepartmentType>(
    initialData?.department || 'Operasional'
  );
  const [phone, setPhone] = useState(initialData?.phone || '081289102345');
  const [email, setEmail] = useState(
    initialData?.email || 'indah.permatasari@perusahaan.co.id'
  );

  const [category, setCategory] = useState<ClaimCategory>(
    initialData?.category || 'Transportasi & Bensin'
  );
  const [expenseDate, setExpenseDate] = useState(
    initialData?.expenseDate || new Date().toISOString().slice(0, 10)
  );
  const [amountRaw, setAmountRaw] = useState(
    initialData ? String(initialData.amount) : '350000'
  );
  const [description, setDescription] = useState(
    initialData?.description ||
      'Penggantian biaya transportasi dinas & operasional lapangan.'
  );
  const [receiptNumber, setReceiptNumber] = useState(
    initialData?.receiptNumber || 'INV-OPR-9921'
  );

  // Bank Account Disbursement Information
  const [bankName, setBankName] = useState<BankName>(
    initialData?.bankName || 'BCA'
  );
  const [accountNumber, setAccountNumber] = useState(
    initialData?.accountNumber || '5310928172'
  );
  const [accountHolderName, setAccountHolderName] = useState(
    initialData?.accountHolderName || 'Indah Permatasari'
  );

  // Form validation & UI states
  const [declarationChecked, setDeclarationChecked] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [lastSubmittedClaim, setLastSubmittedClaim] = useState<ReimbursementClaim | null>(
    null
  );
  const [isSummaryCopied, setIsSummaryCopied] = useState(false);

  // Parse numeric amount
  const numericAmount = Math.max(0, parseInt(amountRaw.replace(/\D/g, '') || '0', 10));

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!employeeName.trim()) {
      newErrors.employeeName = 'Nama pengaju wajib diisi';
    }
    if (!employeeId.trim()) {
      newErrors.employeeId = 'NIP / ID Karyawan wajib diisi';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Nomor telepon / WA wajib diisi';
    }
    if (numericAmount <= 0) {
      newErrors.amount = 'Nominal pengeluaran harus lebih besar dari Rp 0';
    }
    if (!description.trim()) {
      newErrors.description = 'Rincian keperluan pengeluaran wajib diisi';
    }
    if (!accountNumber.trim()) {
      newErrors.accountNumber = 'Nomor rekening pencairan wajib diisi';
    }
    if (!accountHolderName.trim()) {
      newErrors.accountHolderName = 'Nama pemilik rekening wajib diisi';
    }
    if (!declarationChecked) {
      newErrors.declaration =
        'Harap centang konfirmasi kebenaran bukti pengeluaran dan rekening';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      onToast('Mohon lengkapi kolom yang bertanda merah');
      return;
    }

    const claimNumber =
      initialData?.claimNumber ||
      `CLM-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(
        100 + Math.random() * 900
      )}`;

    const claim: ReimbursementClaim = {
      id:
        initialData?.id ||
        'clm-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      claimNumber,
      employeeName: employeeName.trim(),
      employeeId: employeeId.trim(),
      department,
      phone: phone.trim(),
      email: email.trim() || undefined,
      category,
      expenseDate,
      amount: numericAmount,
      description: description.trim(),
      bankName,
      accountNumber: accountNumber.trim(),
      accountHolderName: accountHolderName.trim(),
      receiptNumber: receiptNumber.trim() || undefined,
      status: initialData?.status || 'Menunggu Review',
      approverNotes: initialData?.approverNotes,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: initialData ? new Date().toISOString() : undefined,
    };

    onSaveClaim(claim);
    setLastSubmittedClaim(claim);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0f172a', '#10b981', '#3b82f6'],
      });
    } catch {
      // safe fallback
    }

    setIsSubmittedSuccess(true);
    onToast(
      initialData
        ? 'Perubahan formulir reimbursement berhasil disimpan!'
        : 'Formulir pengajuan reimbursement berhasil diajukan!'
    );

    if (initialData && onCancelEdit) {
      onCancelEdit();
    }
  };

  const handleResetForm = () => {
    setEmployeeName('Indah Permatasari');
    setEmployeeId('EMP-1042');
    setDepartment('Operasional');
    setPhone('081289102345');
    setEmail('indah.permatasari@perusahaan.co.id');
    setCategory('Transportasi & Bensin');
    setExpenseDate(new Date().toISOString().slice(0, 10));
    setAmountRaw('350000');
    setDescription('Penggantian biaya transportasi dinas & operasional lapangan.');
    setReceiptNumber('INV-OPR-9921');
    setBankName('BCA');
    setAccountNumber('5310928172');
    setAccountHolderName('Indah Permatasari');
    setErrors({});
    setIsSubmittedSuccess(false);
  };

  const handleCopySummary = () => {
    if (!lastSubmittedClaim) return;
    const msg = generateFinanceReportMessage(lastSubmittedClaim);
    navigator.clipboard.writeText(msg);
    setIsSummaryCopied(true);
    onToast('Format pengajuan berhasil disalin ke clipboard!');
    setTimeout(() => setIsSummaryCopied(false), 2500);
  };

  const handleSendToFinanceWA = () => {
    if (!lastSubmittedClaim) return;
    const msg = encodeURIComponent(generateFinanceReportMessage(lastSubmittedClaim));
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  // SUCCESS SUBMISSION SCREEN
  if (isSubmittedSuccess && !initialData && lastSubmittedClaim) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 max-w-2xl mx-auto shadow-xs">
        <div className="text-center">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-200">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Pengajuan Berhasil Tercatat
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-2">
            Voucher {lastSubmittedClaim.claimNumber}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
            Klaim reimbursement operasional atas nama{' '}
            <strong className="text-slate-900">{lastSubmittedClaim.employeeName}</strong>{' '}
            sebesar <strong className="text-emerald-700">{formatRupiah(lastSubmittedClaim.amount)}</strong> telah masuk ke antrean verifikasi Finance.
          </p>
        </div>

        {/* Voucher Summary Card */}
        <div className="mt-6 p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Rekening Tujuan Pencairan:</span>
            <span className="font-bold text-slate-900">
              {lastSubmittedClaim.bankName} - {lastSubmittedClaim.accountNumber}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Atas Nama Rekening:</span>
              <span className="font-semibold text-slate-800">
                {lastSubmittedClaim.accountHolderName}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Divisi & NIP:</span>
              <span className="font-semibold text-slate-800">
                {lastSubmittedClaim.department} ({lastSubmittedClaim.employeeId})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Kategori Klaim:</span>
              <span className="font-semibold text-slate-800">
                {lastSubmittedClaim.category}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Status Pengajuan:</span>
              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                {lastSubmittedClaim.status}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
            <span className="text-slate-500 block">Rincian Keperluan:</span>
            <p className="mt-0.5 italic">{lastSubmittedClaim.description}</p>
          </div>
        </div>

        {/* Actions for Finance / Notification */}
        <div className="mt-6 space-y-2">
          <button
            onClick={handleSendToFinanceWA}
            className="w-full py-2.5 px-4 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim Notifikasi Voucher ke Bagian Keuangan (WhatsApp)</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="w-full py-2.5 px-4 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{isSummaryCopied ? 'Teks Voucher Tersalin!' : 'Salin Teks Ringkasan Pengajuan'}</span>
          </button>
        </div>

        {/* Navigation */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleResetForm}
            className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Pengajuan Baru</span>
          </button>
          <button
            onClick={onViewTable}
            className="w-full sm:w-auto px-5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>Buka Rekapitulasi Klaim</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Primary Form Container */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              <span>
                {initialData
                  ? 'Ubah Data Pengajuan Reimbursement'
                  : 'Formulir Pengajuan Reimbursement & Klaim Operasional'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Pencatatan pengajuan penggantian dana operasional dengan verifikasi rekening bank pencairan.
            </p>
          </div>
          {initialData && onCancelEdit && (
            <button
              onClick={onCancelEdit}
              className="text-xs text-slate-500 hover:text-slate-900 underline"
            >
              Batal Ubah
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* SECTION 1: IDENTITAS PENGAJU */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-700" />
              <span>1. Identitas Karyawan / Pengaju</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Pengaju */}
              <div>
                <label
                  htmlFor={`${formId}-name`}
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Nama Lengkap Pengaju <span className="text-rose-500">*</span>
                </label>
                <input
                  id={`${formId}-name`}
                  type="text"
                  value={employeeName}
                  onChange={(e) => {
                    setEmployeeName(e.target.value);
                    if (errors.employeeName) setErrors({ ...errors, employeeName: '' });
                  }}
                  placeholder="Contoh: Indah Permatasari"
                  className={`w-full text-sm px-3 py-2 bg-slate-50/50 border rounded-lg focus:bg-white focus:outline-none ${
                    errors.employeeName
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-slate-200 focus:border-slate-800'
                  }`}
                />
                {errors.employeeName && (
                  <p className="text-xs text-rose-500 mt-1">{errors.employeeName}</p>
                )}
              </div>

              {/* NIP / ID Karyawan */}
              <div>
                <label
                  htmlFor={`${formId}-empid`}
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  NIP / ID Karyawan <span className="text-rose-500">*</span>
                </label>
                <input
                  id={`${formId}-empid`}
                  type="text"
                  value={employeeId}
                  onChange={(e) => {
                    setEmployeeId(e.target.value);
                    if (errors.employeeId) setErrors({ ...errors, employeeId: '' });
                  }}
                  placeholder="Contoh: EMP-1042"
                  className={`w-full text-sm font-mono px-3 py-2 bg-slate-50/50 border rounded-lg focus:bg-white focus:outline-none ${
                    errors.employeeId
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-slate-200 focus:border-slate-800'
                  }`}
                />
                {errors.employeeId && (
                  <p className="text-xs text-rose-500 mt-1">{errors.employeeId}</p>
                )}
              </div>

              {/* Divisi */}
              <div>
                <label
                  htmlFor={`${formId}-dept`}
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Divisi / Departemen
                </label>
                <select
                  id={`${formId}-dept`}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as DepartmentType)}
                  className="w-full text-sm px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kontak WA */}
              <div>
                <label
                  htmlFor={`${formId}-phone`}
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Nomor Telepon / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  id={`${formId}-phone`}
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}
                  placeholder="08123456789"
                  className={`w-full text-sm font-mono px-3 py-2 bg-slate-50/50 border rounded-lg focus:bg-white focus:outline-none ${
                    errors.phone
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-slate-200 focus:border-slate-800'
                  }`}
                />
                {errors.phone && (
                  <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: RINCIAN PENGELUARAN */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-700" />
              <span>2. Rincian Pengeluaran & Nominal</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Kategori Pengeluaran */}
              <div>
                <label
                  htmlFor={`${formId}-cat`}
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Kategori Klaim
                </label>
                <select
                  id={`${formId}-cat`}
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ClaimCategory)}
                  className="w-full text-sm px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
                >
                  {CLAIM_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tanggal Pengeluaran */}
              <div>
                <label
                  htmlFor={`${formId}-date`}
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Tanggal Pengeluaran Sesuai Struk
                </label>
                <input
                  id={`${formId}-date`}
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full text-sm px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
                />
              </div>

              {/* Nominal Pengeluaran */}
              <div>
                <label
                  htmlFor={`${formId}-amount`}
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Nominal Pengajuan (IDR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-semibold text-xs">
                    Rp
                  </div>
                  <input
                    id={`${formId}-amount`}
                    type="text"
                    value={amountRaw}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '');
                      setAmountRaw(clean);
                      if (errors.amount) setErrors({ ...errors, amount: '' });
                    }}
                    placeholder="350000"
                    className={`w-full text-sm font-mono pl-9 pr-3 py-2 bg-slate-50/50 border rounded-lg focus:bg-white focus:outline-none ${
                      errors.amount
                        ? 'border-rose-300 focus:border-rose-500'
                        : 'border-slate-200 focus:border-slate-800'
                    }`}
                  />
                </div>
                <div className="text-xs font-medium text-emerald-700 mt-1">
                  Terbilang: {formatRupiah(numericAmount)}
                </div>
                {errors.amount && (
                  <p className="text-xs text-rose-500 mt-0.5">{errors.amount}</p>
                )}
              </div>

              {/* No Nota / Struk */}
              <div>
                <label
                  htmlFor={`${formId}-receipt`}
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Nomor Kwitansi / Faktur / Struk (Opsional)
                </label>
                <input
                  id={`${formId}-receipt`}
                  type="text"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  placeholder="Contoh: INV-GRB-9921"
                  className="w-full text-sm font-mono px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Keterangan Keperluan */}
            <div className="mt-4">
              <label
                htmlFor={`${formId}-desc`}
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Rincian Keperluan Pengeluaran <span className="text-rose-500">*</span>
              </label>
              <textarea
                id={`${formId}-desc`}
                rows={2}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors({ ...errors, description: '' });
                }}
                placeholder="Jelaskan tujuan pengeluaran operasional secara ringkas dan jelas..."
                className={`w-full text-sm p-3 bg-slate-50/50 border rounded-lg focus:bg-white focus:outline-none ${
                  errors.description
                    ? 'border-rose-300 focus:border-rose-500'
                    : 'border-slate-200 focus:border-slate-800'
                }`}
              />
              {errors.description && (
                <p className="text-xs text-rose-500 mt-1">{errors.description}</p>
              )}
            </div>
          </div>

          {/* SECTION 3: REKENING PENERIMA PENCAIRAN */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-700" />
              <span>3. Data Rekening Bank Penerima Pencairan</span>
            </h3>

            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Bank */}
                <div>
                  <label
                    htmlFor={`${formId}-bank`}
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Bank Tujuan Pencairan
                  </label>
                  <select
                    id={`${formId}-bank`}
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value as BankName)}
                    className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  >
                    {POPULAR_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nomor Rekening */}
                <div>
                  <label
                    htmlFor={`${formId}-accnum`}
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Nomor Rekening <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id={`${formId}-accnum`}
                    type="text"
                    value={accountNumber}
                    onChange={(e) => {
                      setAccountNumber(e.target.value);
                      if (errors.accountNumber)
                        setErrors({ ...errors, accountNumber: '' });
                    }}
                    placeholder="Contoh: 5310928172"
                    className={`w-full text-sm font-mono px-3 py-2 bg-white border rounded-lg focus:outline-none ${
                      errors.accountNumber
                        ? 'border-rose-300 focus:border-rose-500'
                        : 'border-slate-200 focus:border-slate-800'
                    }`}
                  />
                  {errors.accountNumber && (
                    <p className="text-xs text-rose-500 mt-1">
                      {errors.accountNumber}
                    </p>
                  )}
                </div>

                {/* Atas Nama Rekening */}
                <div>
                  <label
                    htmlFor={`${formId}-accholder`}
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Nama Pemilik Rekening <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id={`${formId}-accholder`}
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => {
                      setAccountHolderName(e.target.value);
                      if (errors.accountHolderName)
                        setErrors({ ...errors, accountHolderName: '' });
                    }}
                    placeholder="Sesuai buku tabungan"
                    className={`w-full text-sm px-3 py-2 bg-white border rounded-lg focus:outline-none ${
                      errors.accountHolderName
                        ? 'border-rose-300 focus:border-rose-500'
                        : 'border-slate-200 focus:border-slate-800'
                    }`}
                  />
                  {errors.accountHolderName && (
                    <p className="text-xs text-rose-500 mt-1">
                      {errors.accountHolderName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Pastikan nama pemilik rekening sesuai dengan identitas pengaju agar proses transfer dana berjalan lancar tanpa kendala kliring.
                </span>
              </div>
            </div>
          </div>

          {/* Pernyataan & Konfirmasi */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={declarationChecked}
                onChange={(e) => {
                  setDeclarationChecked(e.target.checked);
                  if (e.target.checked && errors.declaration) {
                    setErrors({ ...errors, declaration: '' });
                  }
                }}
                className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-800 w-4 h-4 shrink-0"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                Saya menyatakan bahwa seluruh rincian pengeluaran operasional ini sah untuk kepentingan dinas, dilengkapi bukti yang valid, dan rekening di atas adalah rekening penerima yang benar.
              </span>
            </label>
            {errors.declaration && (
              <p className="text-xs text-rose-500 mt-1">{errors.declaration}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleResetForm}
              className="text-xs text-slate-500 hover:text-slate-800 py-2 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Formulir</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <span>
                {initialData ? 'Simpan Perubahan Klaim' : 'Ajukan Reimbursement'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Side Preview: Live Voucher Preview */}
      <div className="lg:col-span-5 space-y-4 sticky top-24">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Pratinjau Voucher Klaim</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">DRAF PENGAJUAN</span>
          </div>

          {/* Voucher Preview Card */}
          <div className="mt-4 p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3">
            {/* Header info */}
            <div>
              <div className="text-base font-bold text-slate-900">
                {employeeName || 'Nama Pengaju'}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{department}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{employeeId}</span>
              </div>
            </div>

            {/* Nominal Big Banner */}
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block">Nominal Klaim:</span>
              <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
                {formatRupiah(numericAmount)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Kategori: <strong className="text-slate-800 font-medium">{category}</strong>
              </div>
            </div>

            {/* Rekening Tujuan Box */}
            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Pencairan ke Rekening:</span>
                <span className="font-bold text-slate-900">{bankName}</span>
              </div>
              <div className="font-mono text-sm font-semibold text-slate-800">
                {accountNumber || 'Nomor rekening...'}
              </div>
              <div className="text-[11px] text-slate-500">
                a.n. <strong className="text-slate-700">{accountHolderName || '-'}</strong>
              </div>
            </div>

            {/* Description quote */}
            <div className="text-xs text-slate-600 border-l-2 border-slate-300 pl-2.5 italic">
              "{description || 'Rincian keperluan pengeluaran...'}"
            </div>

            {receiptNumber && (
              <div className="text-[11px] text-slate-400 font-mono">
                No. Bukti / Kwitansi: {receiptNumber}
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-emerald-50/60 border border-emerald-100 rounded-lg text-xs text-emerald-900 space-y-1">
            <span className="font-semibold block">Alur Proses Pencairan:</span>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              1. Pengajuan diverifikasi oleh Admin/Manajer Divisi.
              <br />
              2. Finance memverifikasi keabsahan bukti nota fisik/digital.
              <br />
              3. Dana ditransfer ke rekening bank atas nama pengaju sesuai jadwal batch transfer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
