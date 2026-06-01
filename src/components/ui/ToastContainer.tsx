'use client';

import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToast, type Toast } from '@/contexts/ToastContext';

const ICON_MAP: Record<string, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-green-400" />,
  error: <XCircle className="w-4 h-4 text-red-400" />,
  info: <Info className="w-4 h-4 text-blue-400" />,
};

const BORDER_MAP: Record<string, string> = {
  success: 'border-green-500/30',
  error: 'border-red-500/30',
  info: 'border-blue-500/30',
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  return (
    <div
      className={`flex items-start gap-2.5 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-md bg-card/95 min-w-[280px] max-w-sm animate-in slide-in-from-right-5 ${BORDER_MAP[toast.type]}`}
    >
      <span className="mt-0.5 flex-shrink-0">{ICON_MAP[toast.type]}</span>
      <p className="text-sm text-foreground flex-1 leading-snug">{toast.message}</p>
      <button onClick={onClose} className="text-muted-foreground/50 hover:text-foreground transition-colors flex-shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => {}} />
      ))}
    </div>
  );
}
