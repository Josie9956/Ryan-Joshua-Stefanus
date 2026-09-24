import React, { useState, useEffect } from 'react';
import {
  X,
  UploadCloud,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  FileSpreadsheet,
  AlertCircle,
  RefreshCw,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { ReimbursementClaim } from '../types';
import {
  auth,
  initAuth,
  googleSignIn,
  logoutGoogle,
  uploadClaimsToGoogleDrive,
  DriveUploadResult,
  getAccessToken,
} from '../utils/googleDrive';
import { formatRupiah } from '../utils/claimUtils';

interface GoogleDriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  claims: ReimbursementClaim[];
  onToast: (msg: string) => void;
}

export const GoogleDriveSyncModal: React.FC<GoogleDriveSyncModalProps> = ({
  isOpen,
  onClose,
  claims,
  onToast,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<DriveUploadResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmUpload, setConfirmUpload] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setConfirmUpload(false);
      // Check auth state
      initAuth(
        (user) => {
          setCurrentUser(user);
        },
        () => {
          setCurrentUser(null);
        }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalAmount = claims.reduce((acc, c) => acc + c.amount, 0);

  const handleSignInGoogle = async () => {
    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        onToast(`Terhubung dengan Google: ${result.user.email}`);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Gagal masuk dengan Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOutGoogle = async () => {
    try {
      await logoutGoogle();
      setCurrentUser(null);
      setUploadResult(null);
      onToast('Berhasil memutuskan koneksi Google Drive.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecuteUpload = async () => {
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const result = await uploadClaimsToGoogleDrive(claims, 'Cadangan_Resmi');
      setUploadResult(result);
      setConfirmUpload(false);
      onToast(`Berhasil menyimpan file "${result.name}" ke Google Drive!`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'Terjadi kesalahan saat mengunggah file ke Google Drive.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Kirim & Cadangkan ke Google Drive
              </h3>
              <p className="text-xs text-slate-500">
                Sinkronisasi data rekapitulasi klaim reimbursement langsung ke cloud
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Account Connection State */}
          {!currentUser ? (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-4">
              <div className="max-w-xs mx-auto text-xs text-slate-600">
                Hubungkan akun Google Anda untuk mengizinkan aplikasi membuat dan menyimpan file laporan reimbursement secara otomatis ke Google Drive.
              </div>

              {/* Official Sign in with Google Button */}
              <button
                type="button"
                onClick={handleSignInGoogle}
                disabled={isLoggingIn}
                className="inline-flex items-center justify-center gap-3 px-5 py-2.5 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 rounded-full shadow-2xs text-xs font-semibold text-slate-700 transition-all cursor-pointer disabled:opacity-50 mx-auto"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>
                  {isLoggingIn ? 'Menghubungkan...' : 'Sign in with Google'}
                </span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hanya memiliki akses ke file yang dibuat oleh aplikasi ini.</span>
              </div>
            </div>
          ) : (
            /* Connected State */
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-9 h-9 rounded-full border border-emerald-300"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                      {currentUser.displayName ? currentUser.displayName[0] : 'G'}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <span>{currentUser.displayName || 'Pengguna Google'}</span>
                      <span className="text-[10px] font-semibold bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded-full">
                        Terhubung
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-800 font-mono">
                      {currentUser.email}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSignOutGoogle}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                  title="Putuskan koneksi Google"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Data Summary to be Uploaded */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-800 pb-2 border-b border-slate-200">
                  <span className="flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Paket Data yang Akan Dikirim:</span>
                  </span>
                  <span className="font-mono text-emerald-700 font-bold">
                    {formatRupiah(totalAmount)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                  <div>
                    <span className="text-slate-400 block">Jumlah Pengajuan:</span>
                    <strong className="text-slate-800">{claims.length} Klaim</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Format Berkas:</span>
                    <strong className="text-slate-800">CSV (Excel & Google Sheets)</strong>
                  </div>
                </div>
              </div>

              {/* Success Result View */}
              {uploadResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Laporan Berhasil Disimpan di Google Drive!</span>
                  </div>
                  <div className="text-xs text-emerald-800 font-mono bg-white/70 p-2 rounded-lg border border-emerald-200 truncate">
                    📄 {uploadResult.name}
                  </div>

                  {uploadResult.webViewLink && (
                    <a
                      href={uploadResult.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline pt-1"
                    >
                      <span>Buka File di Google Drive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Explicit User Confirmation Dialog (MANDATORY per Workspace Integration Skill) */}
              {!confirmUpload && !uploadResult && (
                <button
                  type="button"
                  onClick={() => setConfirmUpload(true)}
                  className="w-full py-3 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Kirim Data Klaim ke Google Drive</span>
                </button>
              )}

              {confirmUpload && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-3">
                  <div className="text-xs text-amber-900 leading-relaxed font-medium">
                    Apakah Anda yakin ingin membuat dan mengunggah berkas rekapitulasi{' '}
                    <strong>{claims.length} klaim reimbursement</strong> senilai{' '}
                    <strong>{formatRupiah(totalAmount)}</strong> ke akun Google Drive Anda?
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmUpload(false)}
                      disabled={isUploading}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteUpload}
                      disabled={isUploading}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengunggah...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Ya, Unggah Sekarang</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Koneksi Resmi Google Workspace API</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
