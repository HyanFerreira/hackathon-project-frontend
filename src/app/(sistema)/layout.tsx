import type { ReactNode } from "react";
import { AuthGuard } from "@/components/guard/AuthGuard";
import { SystemRouteSkeleton } from "@/components/ui/layout/SystemRouteSkeleton";
import { SystemShell } from "@/components/ui/layout/SystemShell";

type SistemaLayoutProps = {
  children: ReactNode;
};

export default function SistemaLayout({ children }: SistemaLayoutProps) {
  return (
    <AuthGuard
      loadingFallback={
        <SystemShell routeSkeleton={<SystemRouteSkeleton />}>
          <SystemRouteSkeleton />
        </SystemShell>
      }
    >
      <SystemShell routeSkeleton={<SystemRouteSkeleton />}>
        {children}
      </SystemShell>
    </AuthGuard>
  );
}
