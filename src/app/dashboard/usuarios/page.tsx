import { AuthGuard } from "@/components/guard/AuthGuard";
import { SystemShell } from "@/components/ui/layout/SystemShell";
import { UsersWorkspace } from "@/components/ui/users/UsersWorkspace";

export default function DashboardUsersPage() {
  return (
    <AuthGuard>
      <SystemShell>
        <UsersWorkspace />
      </SystemShell>
    </AuthGuard>
  );
}
