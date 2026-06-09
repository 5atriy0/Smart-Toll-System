"use client";

import { useEffect, useRef } from "react";
import { X, AlertTriangle, Ban, Trash2 } from "lucide-react";

type Variant = "danger" | "warning" | "info";

const VARIANT_STYLES: Record<Variant, { icon: React.ElementType; header: string; iconBg: string; iconColor: string; confirmBg: string; confirmHover: string }> = {
  danger: {
    icon: Trash2,
    header: "bg-danger/10 text-danger border-danger/20",
    iconBg: "bg-danger/10",
    iconColor: "text-danger",
    confirmBg: "bg-danger",
    confirmHover: "hover:bg-danger/90",
  },
  warning: {
    icon: Ban,
    header: "bg-warning/10 text-warning border-warning/20",
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    confirmBg: "bg-warning",
    confirmHover: "hover:bg-warning/90",
  },
  info: {
    icon: AlertTriangle,
    header: "bg-accent/10 text-accent border-accent/20",
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    confirmBg: "bg-accent",
    confirmHover: "hover:bg-accent/90",
  },
};

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  variant = "info",
  loading = false,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const styles = VARIANT_STYLES[variant];
  const Icon = styles.icon;

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-sm mx-4 animate-in zoom-in-95 duration-200 outline-none"
      >
        <div className={`flex items-center justify-between px-5 py-3 border-b border-border rounded-t-xl ${styles.header}`}>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {title}
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${styles.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              {typeof description === "string" ? (
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              ) : (
                description
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end px-5 pb-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50 inline-flex items-center gap-1.5 ${styles.confirmBg} ${styles.confirmHover}`}
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
