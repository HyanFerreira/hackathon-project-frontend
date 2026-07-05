import {
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/loading";

export const dashboardCardClass =
  "rounded-system border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(33,31,79,0.06)]";

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function DashboardEmptyData() {
  return (
    <p className="py-8 text-center text-sm text-text-secondary">
      Ainda não há dados suficientes.
    </p>
  );
}

const summaryTones = {
  purple: "bg-purple-50 text-brand-primary",
  blue: "bg-blue-50 text-blue-500",
  green: "bg-emerald-50 text-emerald-500",
} as const;

export function DashboardSummaryCard({
  detail,
  icon: Icon,
  label,
  tone,
  value,
}: {
  detail: string;
  icon: LucideIcon;
  label: string;
  tone: keyof typeof summaryTones;
  value: number | string;
}) {
  return (
    <article className={`${dashboardCardClass} overflow-hidden`}>
      <div className="flex min-h-28 items-center gap-4 p-5">
        <span
          className={`flex size-14 shrink-0 items-center justify-center rounded-full ${summaryTones[tone]}`}
        >
          <Icon aria-hidden="true" className="size-7" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-600">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
          <p className="mt-1 truncate text-xs text-text-secondary">{detail}</p>
        </div>
      </div>
      <a
        className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs font-bold text-brand-primary transition hover:bg-brand-primary-soft"
        href="#analises"
      >
        Mais detalhes
        <ArrowRight aria-hidden="true" className="size-4" />
      </a>
    </article>
  );
}

export function DashboardPanel({
  children,
  description,
  footer,
  icon: Icon,
  compact = false,
  title,
}: {
  children: ReactNode;
  compact?: boolean;
  description: string;
  footer: { href: string; label: string };
  icon: LucideIcon;
  title: string;
}) {
  return (
    <section
      className={`${dashboardCardClass} flex ${compact ? "min-h-64" : "min-h-96"} flex-col overflow-hidden`}
    >
      <div className="flex items-start gap-3 px-5 pt-5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
        </div>
      </div>
      <div className="flex-1 px-5 py-5">{children}</div>
      <Link
        className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs font-bold text-brand-primary transition hover:bg-brand-primary-soft"
        href={footer.href}
      >
        {footer.label}
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </section>
  );
}

export type DashboardRow = {
  detail: string;
  id: number | string;
  label: string;
  value: number;
};

export function DashboardProgressRows({ items }: { items: DashboardRow[] }) {
  if (items.length === 0) return <DashboardEmptyData />;

  return (
    <div className="space-y-4">
      {items.slice(0, 5).map((item) => (
        <div key={item.id}>
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-xs font-bold text-slate-900">
              {item.label}
            </p>
            <span className="text-xs font-bold text-brand-primary">
              {item.value}%
            </span>
          </div>
          <p className="mt-1 truncate text-[11px] text-text-secondary">
            {item.detail}
          </p>
          <div
            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label={`${item.label}: ${item.value}%`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={item.value}
          >
            <div
              className="h-full rounded-full bg-brand-primary"
              style={{ width: `${Math.max(0, Math.min(100, item.value))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardTextRows({ items }: { items: DashboardRow[] }) {
  if (items.length === 0) return <DashboardEmptyData />;

  return (
    <div className="divide-y divide-slate-100">
      {items.slice(0, 5).map((item) => (
        <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-[11px] font-bold text-brand-primary">
            {getInitials(item.label)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-900">
              {item.label}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-text-secondary">
              {item.detail}
            </p>
          </div>
          <span className="text-xs font-bold text-brand-primary">
            {item.value}%
          </span>
        </div>
      ))}
    </div>
  );
}

export function PerformanceDashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Carregando dashboard">
      <Skeleton className="h-16 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {["one", "two", "three", "four"].map((key) => (
          <Skeleton key={key} className="h-40" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {["five", "six", "seven", "eight"].map((key) => (
          <Skeleton key={key} className="h-96" />
        ))}
      </div>
    </div>
  );
}
