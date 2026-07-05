import type { CSSProperties } from "react";
import { SIDEBAR_EXPANDED_WIDTH } from "@/components/ui/layout/AppSidebar";
import { Skeleton } from "./Skeleton";
import { TableSkeleton } from "./TableSkeleton";

const NAV_ITEM_KEYS = ["dashboard", "escolas", "usuarios"];

type AppShellSkeletonProps = {
  variant?: "student" | "system";
};

/**
 * Silhueta de carregamento do sistema completo (sidebar + header + conteúdo).
 * Espelha o layout do SystemShell para uma transição suave ao autenticar.
 */
export function AppShellSkeleton({
  variant = "system",
}: AppShellSkeletonProps) {
  if (variant === "student") {
    return (
      <div
        aria-label="Carregando área do estudante"
        className="min-h-screen bg-[#fbf7ff]"
        role="status"
      >
        <header className="h-[72px] bg-brand-primary px-4 lg:h-[86px]">
          <div className="mx-auto flex h-full max-w-[1740px] items-center justify-between gap-3">
            <Skeleton className="size-11 bg-white/20 lg:hidden" />
            <Skeleton className="h-9 w-32 bg-white/20 sm:w-44" />
            <div className="hidden flex-1 justify-center gap-3 lg:flex">
              {NAV_ITEM_KEYS.map((key) => (
                <Skeleton key={key} className="h-12 w-28 bg-white/15" />
              ))}
            </div>
            <Skeleton className="h-11 w-24 bg-white/20 sm:w-44" />
          </div>
        </header>
        <main className="mx-auto max-w-[1740px] space-y-5 px-4 py-5 sm:px-5 lg:px-8 lg:py-6">
          <section className="grid gap-5 xl:grid-cols-2">
            {["profile", "continue"].map((key) => (
              <div
                className="min-h-72 rounded-[18px] border border-[#e3d9f8] bg-white p-5"
                key={key}
              >
                <div className="flex gap-5">
                  <Skeleton className="size-28 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-7 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
                <Skeleton className="mt-8 h-20 w-full" />
              </div>
            ))}
          </section>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {NAV_ITEM_KEYS.map((key) => (
              <Skeleton className="h-52 w-full bg-white" key={key} />
            ))}
          </section>
        </main>
        <span className="sr-only">Carregando...</span>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-100"
      role="status"
      aria-label="Carregando sistema"
      style={
        { "--sidebar-width": `${SIDEBAR_EXPANDED_WIDTH}px` } as CSSProperties
      }
    >
      <aside
        className="fixed top-0 left-0 z-40 hidden h-screen bg-brand-primary lg:block"
        style={{ width: SIDEBAR_EXPANDED_WIDTH }}
      >
        <div className="flex h-full flex-col py-4">
          <div className="flex items-center gap-3 px-4">
            <Skeleton className="size-12 shrink-0 bg-white/20" />
            <Skeleton className="h-3 w-24 bg-white/20" />
          </div>

          <div className="my-4 h-px w-full bg-white/20" />

          <div className="flex flex-col gap-2 px-4">
            {NAV_ITEM_KEYS.map((key) => (
              <Skeleton key={key} className="h-12 w-full bg-white/15" />
            ))}
          </div>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[var(--sidebar-width)]">
        <header className="fixed top-0 right-0 left-0 z-30 flex h-20 items-center justify-between bg-white px-4 shadow-[0_4px_18px_rgba(0,0,0,0.08)] sm:px-5 lg:left-[var(--sidebar-width)] lg:h-24 lg:px-8">
          <Skeleton className="size-11 lg:hidden" />
          <Skeleton className="h-9 w-32" />
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="hidden h-4 w-28 sm:block" />
          </div>
        </header>

        <main className="space-y-6 px-4 pt-24 pb-6 sm:px-5 lg:px-8 lg:pt-32 lg:pb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>

          <section className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <div className="mb-5 flex items-center gap-3">
              <Skeleton className="size-12" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>

            <TableSkeleton rows={5} columns={5} />
          </section>
        </main>
      </div>

      <span className="sr-only">Carregando...</span>
    </div>
  );
}
