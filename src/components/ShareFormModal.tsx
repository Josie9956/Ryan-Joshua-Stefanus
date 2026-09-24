import React, { useState } from 'react';
import { X, Copy, Check, QrCode, ExternalLink, ShieldCheck } from 'lucide-react';

interface ShareFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const ShareFormModal: React.FC<ShareFormModalProps> = ({
  isOpen,
  onClose,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    onToast('Tautan formulir klaim berhasil disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-slate-800" />
            <h3 className="font-bold text-slate-900 text-sm">
              Bagikan Tautan Formulir Klaim
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Bagikan tautan formulir ini kepada karyawan atau staf yang ingin mengajukan penggantian biaya operasional kantor.
          </p>

          {/* QR Code generator placeholder image */}
          <div className="w-44 h-44 bg-slate-50 border border-slate-200 rounded-xl p-3 mx-auto flex items-center justify-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                currentUrl
              )}`}
              alt="QR Code Formulir Klaim"
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="bg-transparent text-xs text-slate-700 flex-1 truncate focus:outline-none font-mono"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-left text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1 font-semibold text-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ketentuan Pencairan:</span>
            </div>
            <p>
              Setiap pengajuan wajib menyertakan nomor bukti nota/kwitansi dan nomor rekening bank atas nama pengaju yang bersangkutan.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
