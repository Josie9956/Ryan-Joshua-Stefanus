import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  X,
  Eye,
  EyeOff,
  ArrowRight,
  Settings2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { getStoredPin, setStoredPin, unlockFinanceSession } from '../utils/security';

interface FinancePinModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  onToast: (msg: string) => void;
}

export const FinancePinModal: React.FC<FinancePinModalProps> = ({
  isOpen,
  onSuccess,
  onCancel,
  onToast,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);

  // States for changing PIN
  const [currentPinCheck, setCurrentPinCheck] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setErrorMessage('');
      setIsChangingPin(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPin = getStoredPin();

  const handleVerifyPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (pinInput === currentPin) {
      unlockFinanceSession();
      setErrorMessage('');
      onToast('PIN berhasil diverifikasi! Selamat datang di Menu Keuangan.');
      onSuccess();
    } else {
      setIsShaking(true);
      setErrorMessage('PIN salah! Silakan coba lagi.');
      setPinInput('');
      setTimeout(() => setIsShaking(false), 500);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (num: string) => {
    if (pinInput.length < 6) {
      const nextPin = pinInput + num;
      setPinInput(nextPin);
      setErrorMessage('');
      if (nextPin.length === currentPin.length) {
        if (nextPin === currentPin) {
          unlockFinanceSession();
          onToast('PIN berhasil diverifikasi!');
          onSuccess();
        } else {
          setIsShaking(true);
          setErrorMessage('PIN salah!');
          setTimeout(() => {
            setPinInput('');
            setIsShaking(false);
          }, 400);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPinCheck !== currentPin) {
      setErrorMessage('PIN Lama tidak sesuai');
      return;
    }
    if (newPin.length < 4 || !/^\d+$/.test(newPin)) {
      setErrorMessage('PIN baru harus minimal 4 angka');
      return;
    }
    if (newPin !== confirmNewPin) {
      setErrorMessage('Konfirmasi PIN baru tidak cocok');
      return;
    }

    setStoredPin(newPin);
    setIsChangingPin(false);
    setCurrentPinCheck('');
    setNewPin('');
    setConfirmNewPin('');
    setErrorMessage('');
    onToast('PIN Keuangan berhasil diperbarui!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl overflow-hidden transition-transform duration-200 ${
          isShaking ? 'translate-x-[-8px] animate-[shake_0.4s_ease-in-out]' : ''
        }`}
      >
        {/* Header Ribbon */}
        <div className="bg-indigo-950 text-white p-5 text-center relative">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-indigo-900 border border-indigo-700/60 text-indigo-300 flex items-center justify-center mx-auto mb-2 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="font-bold text-base tracking-tight">
            {isChangingPin ? 'Ubah PIN Keamanan' : 'Autentikasi Menu Keuangan'}
          </h3>
          <p className="text-xs text-indigo-200/80 mt-0.5">
            {isChangingPin
              ? 'Masukkan PIN lama dan atur PIN baru'
              : 'Masukkan PIN untuk membuka portal Finance'}
          </p>
        </div>

        {/* Body Content */}
        {!isChangingPin ? (
          <div className="p-6 space-y-5">
            {/* PIN Display Indicators */}
            <div className="flex justify-center items-center gap-3 py-2">
              {[0, 1, 2, 3].map((idx) => {
                const filled = pinInput.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      filled
                        ? 'bg-indigo-600 border-indigo-600 scale-110'
                        : 'border-slate-300 bg-slate-100'
                    }`}
                  />
                );
              })}
            </div>

            {/* Error Message */}
            {errorMessage ? (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-center font-medium flex items-center justify-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 text-center bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100">
                Default PIN sistem: <strong className="font-mono text-slate-800">1234</strong>
              </div>
            )}

            {/* Hidden Input for direct typing / autofill */}
            <form onSubmit={handleVerifyPin} className="sr-only">
              <input
                ref={inputRef}
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={6}
                value={pinInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPinInput(val);
                }}
              />
            </form>

            {/* Numeric Keypad for convenience */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(String(num))}
                  className="py-3 text-lg font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 rounded-xl border border-slate-200/80 transition-colors focus:outline-none"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPinInput('')}
                className="py-3 text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-colors"
              >
                Hapus
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="py-3 text-lg font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 rounded-xl border border-slate-200/80 transition-colors focus:outline-none"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="py-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-colors flex items-center justify-center"
              >
                ←
              </button>
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPin(true);
                  setErrorMessage('');
                }}
                className="hover:text-indigo-600 flex items-center gap-1 font-medium transition-colors"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Ubah PIN</span>
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="hover:text-slate-800 font-medium"
              >
                Kembali ke Karyawan
              </button>
            </div>
          </div>
        ) : (
          /* Change PIN Form */
          <form onSubmit={handleChangePinSubmit} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-center font-medium">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                PIN Saat Ini
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={currentPinCheck}
                onChange={(e) => setCurrentPinCheck(e.target.value.replace(/\D/g, ''))}
                placeholder="PIN lama (Default: 1234)"
                className="w-full text-sm font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                PIN Baru (4-6 Angka)
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Contoh: 5678"
                className="w-full text-sm font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Konfirmasi PIN Baru
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={confirmNewPin}
                onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Ketik ulang PIN baru"
                className="w-full text-sm font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                required
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPin(false);
                  setErrorMessage('');
                }}
                className="px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
              >
                Simpan PIN Baru
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
