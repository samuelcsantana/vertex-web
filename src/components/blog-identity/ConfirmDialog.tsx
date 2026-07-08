"use client";

import { useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

import { useDialogBehavior } from "@/hooks/useDialogBehavior";

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
  const t = useTranslations("Common");
  const titleId = useId();
  const dialogRef = useDialogBehavior(open, () => setOpen(false));

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>

      {/* Portaled to document.body — a trigger nested inside an ancestor
          with backdrop-filter/filter/transform (e.g. the home page's post
          cards, which use backdrop-blur-sm) creates a new containing block
          for position:fixed descendants, so this overlay would render sized
          and clipped to that ancestor's box instead of the viewport.
          LoginModal.tsx already does the same for the same reason. */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
            >
              <h2 id={titleId} className="text-base font-semibold text-white">
                {title}
              </h2>
              <p className="mt-2 text-sm text-slate-400">{description}</p>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-slate-700 bg-slate-800 px-4 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700"
                >
                  {t("cancel")}
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
          </div>,
          document.body
        )}
    </>
  );
}
