import { StatusPage } from "@/components/feedback/StatusPage";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8 text-text-primary">
      <StatusPage
        eyebrow="404"
        title="Página não encontrada"
        message="O endereço acessado não existe ou foi movido."
        actionHref="/dashboard"
        actionLabel="Voltar ao sistema"
      />
    </main>
  );
}
