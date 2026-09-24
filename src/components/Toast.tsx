import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none transition-all">
      <div className="bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-lg shadow-lg border border-slate-800 flex items-center gap-2.5 max-w-sm">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="leading-tight">{message}</span>
      </div>
    </div>
  );
};
