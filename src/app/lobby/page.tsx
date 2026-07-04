import { AuthGuard } from "@/components/guard/AuthGuard";
import { StudentLobby } from "@/components/ui/student/StudentLobby";

export default function LobbyPage() {
  return (
    <AuthGuard>
      <StudentLobby />
    </AuthGuard>
  );
}
