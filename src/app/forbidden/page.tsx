import { StatusPage } from "@/components/feedback/StatusPage";

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8 text-text-primary">
      <StatusPage
        eyebrow="403"
        title="Acesso não autorizado"
        message="Seu perfil não tem permissão para acessar esta área."
        actionHref="/dashboard"
        actionLabel="Ir para dashboard"
      />
    </main>
  );
}
