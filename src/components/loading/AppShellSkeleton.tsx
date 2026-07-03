import type { CSSProperties } from "react";
import { SIDEBAR_EXPANDED_WIDTH } from "@/components/ui/layout/AppSidebar";
import { Skeleton } from "./Skeleton";
import { TableSkeleton } from "./TableSkeleton";

const NAV_ITEM_KEYS = ["dashboard", "usuarios", "perfis"];

/**
 * Silhueta de carregamento do sistema completo (sidebar + header + conteúdo).
 * Espelha o layout do SystemShell para uma transição suave ao autenticar.
 */
export function AppShellSkeleton() {
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
        <header className="fixed top-0 right-0 left-0 z-30 flex h-24 items-center justify-end bg-white px-5 shadow-[0_4px_18px_rgba(0,0,0,0.08)] lg:left-[var(--sidebar-width)] lg:px-8">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="hidden h-4 w-28 sm:block" />
          </div>
        </header>

        <main className="space-y-6 px-5 pt-32 pb-8 lg:px-8">
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
