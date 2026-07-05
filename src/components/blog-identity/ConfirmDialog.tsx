"use client";

import { useState, type ReactNode } from "react";

interface ConfirmDialogProps {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  action: () => void | Promise<void>;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  action,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="text-base font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm text-slate-400">{description}</p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-slate-700 bg-slate-800 px-4 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  await action();
                  setOpen(false);
                }}
                className="rounded-full bg-red-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-red-400"
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
