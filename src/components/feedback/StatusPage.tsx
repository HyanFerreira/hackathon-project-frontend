import { ArrowLeft, LayoutDashboard, ShieldAlert } from "lucide-react";
import Link from "next/link";

type StatusPageProps = {
  actionHref?: string;
  actionLabel?: string;
  eyebrow: string;
  message: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  title: string;
};

export function StatusPage({
  actionHref = "/dashboard",
  actionLabel = "Ir para dashboard",
  eyebrow,
  message,
  secondaryHref,
  secondaryLabel,
  title,
}: StatusPageProps) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <section className="w-full max-w-2xl text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-system bg-brand-primary-soft text-brand-primary">
          <ShieldAlert aria-hidden="true" className="size-8" />
        </div>

        <p className="text-sm font-bold uppercase tracking-wide text-brand-primary">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-text-primary sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-text-secondary">
          {message}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={actionHref}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-system bg-brand-primary px-5 py-2.5 font-bold text-white transition hover:bg-brand-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-input-border-focus"
          >
            <LayoutDashboard aria-hidden="true" className="size-5" />
            {actionLabel}
          </Link>

          {secondaryHref && secondaryLabel && (
            <Link
              href={secondaryHref}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-system border border-slate-200 bg-white px-5 py-2.5 font-bold text-text-primary transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-input-border-focus"
            >
              <ArrowLeft aria-hidden="true" className="size-5" />
              {secondaryLabel}
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
