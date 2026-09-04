"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaExclamationTriangle } from "react-icons/fa";

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  icon?: ReactNode;
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (result: boolean) => void;
}

interface ConfirmDialogProps extends ConfirmOptions {
  onResult: (result: boolean) => void;
}

function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  icon,
  onResult,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onResult(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onResult]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={() => onResult(false)}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-[rgba(221,198,182,0.15)] bg-[rgb(46,42,43)] p-6 shadow-2xl animate-dialog-in"
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              danger ? "bg-red-500/15 text-red-400" : "bg-white/[0.06] secondary-color-text"
            }`}
          >
            {icon || (danger ? <FaExclamationTriangle size={16} /> : null)}
          </div>
          <div className="min-w-0">
            <h3 className="secondary-color-text font-heading font-semibold text-base leading-snug">
              {title}
            </h3>
            {message && (
              <p className="secondary-color-text opacity-60 text-sm mt-1.5 leading-relaxed">
                {message}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => onResult(false)}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border secondary-color-border secondary-color-text hover:bg-white/5 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onResult(true)}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md ${
              danger
                ? "bg-red-500 hover:bg-red-400 text-white"
                : "secondary-color-bg primary-color-text hover:opacity-90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function useConfirm() {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const handleResult = useCallback((result: boolean) => {
    setPending((prev) => {
      prev?.resolve(result);
      return null;
    });
  }, []);

  const dialog =
    pending !== null ? (
      <ConfirmDialog {...pending} onResult={handleResult} />
    ) : null;

  return { confirm, dialog };
}

export { type ConfirmOptions };
