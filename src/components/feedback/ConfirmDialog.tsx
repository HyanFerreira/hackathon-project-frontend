"use client";

import { AlertTriangle, LoaderCircle } from "lucide-react";
import { Button } from "@/components/buttons";
import { Modal } from "@/components/modal";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="max-w-md"
      footer={
        <>
          <Button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="min-h-11 border border-slate-200 bg-white px-5 py-2.5 text-text-primary hover:bg-slate-50"
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="min-h-11 bg-red-600 px-5 py-2.5 text-white hover:bg-red-700"
          >
            {isLoading && (
              <LoaderCircle
                aria-hidden="true"
                className="size-5 animate-spin"
              />
            )}
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle aria-hidden="true" className="size-6" />
        </div>
        <p className="text-sm text-text-secondary">{message}</p>
      </div>
    </Modal>
  );
}
