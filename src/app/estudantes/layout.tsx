import type { ReactNode } from "react";
import { AuthGuard } from "@/components/guard/AuthGuard";
import { StudentRouteSkeleton } from "@/components/ui/student/StudentRouteSkeleton";
import { StudentShell } from "@/components/ui/student/StudentShell";

type EstudantesLayoutProps = {
  children: ReactNode;
};

export default function EstudantesLayout({ children }: EstudantesLayoutProps) {
  return (
    <AuthGuard
      loadingFallback={
        <StudentShell>
          <StudentRouteSkeleton />
        </StudentShell>
      }
    >
      <StudentShell>{children}</StudentShell>
    </AuthGuard>
  );
}
