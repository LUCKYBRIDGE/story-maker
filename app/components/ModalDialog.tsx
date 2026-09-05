"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function ModalDialog({
  overlayClassName,
  dialogClassName,
  label,
  children,
  onClose,
}: {
  overlayClassName: string;
  dialogClassName: string;
  label: string;
  children: ReactNode;
  onClose?: () => void;
}) {
  const dialogRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const dialog = dialogRef.current;
    if (dialog) {
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        dialog.focus();
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onCloseRef.current) {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (
        previousFocusRef.current &&
        previousFocusRef.current.isConnected &&
        typeof previousFocusRef.current.focus === "function"
      ) {
        previousFocusRef.current.focus();
      }
    };
  }, []);

  return (
    <div
      className={overlayClassName}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <section
        ref={dialogRef}
        className={dialogClassName}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
      >
        {children}
      </section>
    </div>
  );
}
