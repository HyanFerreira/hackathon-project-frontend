"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "@/components/buttons";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Fechar modal"
        className="absolute inset-0 bg-slate-950/50"
        onClick={onClose}
      />

      <div
        className={twMerge(
          "relative z-10 w-full max-w-lg overflow-hidden rounded-system bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)]",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-slate-200 border-b p-5">
          <div>
            <h2 className="text-xl font-bold text-text-primary">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-text-secondary">{description}</p>
            )}
          </div>

          <Button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="size-9 shrink-0 bg-transparent p-0 text-text-secondary hover:bg-slate-100 hover:text-text-primary"
          >
            <X aria-hidden="true" className="size-5" />
          </Button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>

        {footer && (
          <div className="flex justify-end gap-3 border-slate-200 border-t bg-slate-50 p-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
