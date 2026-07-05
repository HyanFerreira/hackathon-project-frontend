"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/buttons";

export type ToastVariant = "danger" | "success" | "warning" | "message";

type ToastProps = {
  duration?: number;
  message: string;
  title?: string;
  variant?: ToastVariant;
  onClose?: () => void;
};

const toastVariants = {
  danger: {
    icon: AlertCircle,
    role: "alert",
    title: "Perigo",
    className: "border-red-200 bg-red-50 text-red-700",
    iconClassName: "text-red-600",
    progressClassName: "bg-red-500",
  },
  success: {
    icon: CheckCircle2,
    role: "status",
    title: "Sucesso",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconClassName: "text-emerald-600",
    progressClassName: "bg-emerald-500",
  },
  warning: {
    icon: AlertTriangle,
    role: "alert",
    title: "Alerta",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    iconClassName: "text-amber-600",
    progressClassName: "bg-amber-500",
  },
  message: {
    icon: Info,
    role: "status",
    title: "Mensagem",
    className: "border-slate-200 bg-white text-text-primary",
    iconClassName: "text-brand-primary",
    progressClassName: "bg-brand-primary",
  },
} satisfies Record<
  ToastVariant,
  {
    icon: typeof AlertCircle;
    role: "alert" | "status";
    title: string;
    className: string;
    iconClassName: string;
    progressClassName: string;
  }
>;

export function Toast({
  duration = 5000,
  message,
  onClose,
  title,
  variant = "message",
}: ToastProps) {
  const tone = toastVariants[variant];
  const Icon = tone.icon;
  const toastRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(duration);
  const progress = useMemo(() => {
    if (duration <= 0) return 100;

    return Math.min(
      100,
      Math.max(0, ((duration - remainingTime) / duration) * 100),
    );
  }, [duration, remainingTime]);

  const closeToast = useCallback(() => {
    setIsVisible(false);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!isVisible || isPaused || duration <= 0) return;

    const interval = window.setInterval(() => {
      setRemainingTime((current) => {
        const nextRemainingTime = current - 100;

        if (nextRemainingTime <= 0) {
          window.clearInterval(interval);
          closeToast();
          return 0;
        }

        return nextRemainingTime;
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [closeToast, duration, isPaused, isVisible]);

  useEffect(() => {
    const toast = toastRef.current;

    if (!toast) return;

    const pauseToast = () => setIsPaused(true);
    const resumeToast = () => setIsPaused(false);

    toast.addEventListener("pointerenter", pauseToast);
    toast.addEventListener("pointerleave", resumeToast);
    toast.addEventListener("focusin", pauseToast);
    toast.addEventListener("focusout", resumeToast);

    return () => {
      toast.removeEventListener("pointerenter", pauseToast);
      toast.removeEventListener("pointerleave", resumeToast);
      toast.removeEventListener("focusin", pauseToast);
      toast.removeEventListener("focusout", resumeToast);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={toastRef}
      role={tone.role}
      className={`fixed right-5 top-5 z-50 flex w-[min(24rem,calc(100vw-2rem))] gap-3 overflow-hidden rounded-system border p-4 pr-3 shadow-[0_18px_50px_rgba(15,23,42,0.18)] ${tone.className}`}
    >
      <Icon
        aria-hidden="true"
        className={`mt-0.5 size-5 shrink-0 ${tone.iconClassName}`}
      />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title ?? tone.title}</p>
        <p className="mt-1 text-sm">{message}</p>
      </div>
      <Button
        type="button"
        aria-label="Fechar mensagem"
        onClick={closeToast}
        className="size-8 shrink-0 rounded-full bg-transparent p-0 text-current hover:bg-black/5"
      >
        <X aria-hidden="true" className="size-4" />
      </Button>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10">
        <div
          className={`h-full transition-[width] duration-100 ease-linear ${tone.progressClassName}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
