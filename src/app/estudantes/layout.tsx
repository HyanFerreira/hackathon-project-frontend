import type { ReactNode } from "react";
import { AuthGuard } from "@/components/guard/AuthGuard";
import { StudentShell } from "@/components/ui/student/StudentShell";

type EstudantesLayoutProps = {
  children: ReactNode;
};

export default function EstudantesLayout({ children }: EstudantesLayoutProps) {
  return (
    <AuthGuard>
      <StudentShell>{children}</StudentShell>
    </AuthGuard>
  );
}
