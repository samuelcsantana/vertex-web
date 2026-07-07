import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Shared open/close behavior for anything acting as a modal dialog
// (ConfirmDialog, LoginModal): moves focus inside on open, restores it to
// whatever triggered the dialog on close, traps Tab/Shift+Tab within the
// dialog while it's open, and closes on Escape. role="dialog" +
// aria-modal="true" on the container (set by the caller) is what tells
// screen readers to treat everything outside as inert — this hook handles
// the keyboard-interaction half of that contract.
export function useDialogBehavior(isOpen: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;
    } else if (triggerElementRef.current) {
      triggerElementRef.current.focus();
      triggerElementRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const container = containerRef.current;
    const getFocusable = () =>
      container
        ? Array.from(
            container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
          )
        : [];

    // Move focus into the dialog as soon as it mounts, rather than leaving
    // it on whatever was focused behind it.
    getFocusable()[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusable();
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return containerRef;
}
