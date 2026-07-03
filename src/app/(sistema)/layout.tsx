import type { ReactNode } from "react";
import { AuthGuard } from "@/components/guard/AuthGuard";
import { SystemShell } from "@/components/ui/layout/SystemShell";

type SistemaLayoutProps = {
  children: ReactNode;
};

export default function SistemaLayout({ children }: SistemaLayoutProps) {
  return (
    <AuthGuard>
      <SystemShell>{children}</SystemShell>
    </AuthGuard>
  );
}
