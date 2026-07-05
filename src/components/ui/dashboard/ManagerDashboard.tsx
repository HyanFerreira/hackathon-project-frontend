"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  ChevronDown,
  GraduationCap,
  School,
  Target,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import {
  type GestorDesempenho,
  gamificationApi,
} from "@/services/api/modules/gamification";
import {
  dashboardCardClass,
  DashboardEmptyData,
  DashboardPanel,
  DashboardProgressRows,
  DashboardSummaryCard,
  DashboardTextRows,
  getInitials,
  PerformanceDashboardSkeleton,
} from "./PerformanceDashboardShared";

function ManagerDashboardContent({
  data,
  userName,
}: {
  data: GestorDesempenho;
  userName: string;
}) {
  const firstName = userName.trim().split(" ")[0] || "Gestor";

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Olá, {firstName}!
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Acompanhe o desempenho geral da sua escola.
          </p>
        </div>
        <div className={`${dashboardCardClass} flex items-center gap-3 px-4 py-3`}>
          <CalendarDays
            aria-hidden="true"
            className="size-5 text-brand-primary"
          />
          <div>
            <p className="text-[10px] text-text-secondary">Período</p>
            <p className="text-xs font-bold text-slate-800">Todo o histórico</p>
          </div>
          <ChevronDown
            aria-hidden="true"
            className="size-4 text-text-secondary"
          />
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardSummaryCard
          label="Taxa geral de acerto"
          value={`${data.resumo.taxa_acerto}%`}
          detail={`${data.resumo.acertos.toLocaleString("pt-BR")} acertos em ${data.resumo.respostas.toLocaleString("pt-BR")} respostas`}
          icon={Target}
          tone="purple"
        />
        <DashboardSummaryCard
          label="Alunos ativos"
          value={data.resumo.alunos_ativos}
          detail={`de ${data.resumo.alunos} alunos`}
          icon={UserRound}
          tone="purple"
        />
        <DashboardSummaryCard
          label="Turmas acompanhadas"
          value={data.resumo.turmas}
          detail="turmas"
          icon={Users}
          tone="blue"
        />
        <DashboardSummaryCard
          label="Professores"
          value={data.resumo.professores ?? 0}
          detail="na escola"
          icon={GraduationCap}
          tone="green"
        />
      </section>

      <div
        id="analises"
        className="grid scroll-mt-6 gap-4 md:grid-cols-2 2xl:grid-cols-4"
      >
        <DashboardPanel
          title="Desempenho por turma"
          description="Compare a taxa de acerto entre as turmas."
          icon={School}
          footer={{ href: "/turmas", label: "Ver todas as turmas" }}
        >
          <DashboardProgressRows
            items={data.por_turma.map((item) => ({
              id: item.turma_id,
              label: item.nome,
              detail: `${item.alunos} alunos · ${item.respostas} respostas`,
              value: item.taxa_acerto,
            }))}
          />
        </DashboardPanel>

        <DashboardPanel
          title="Desempenho por disciplina"
          description="Taxa de acerto consolidada por disciplina."
          icon={BookOpenCheck}
          footer={{ href: "/dashboard", label: "Ver todas as disciplinas" }}
        >
          <DashboardProgressRows
            items={data.disciplinas.map((item) => ({
              id: item.id,
              label: item.nome,
              detail: `${item.respostas} respostas`,
              value: item.taxa_acerto,
            }))}
          />
        </DashboardPanel>

        <DashboardPanel
          title="Habilidades que pedem atenção"
          description="Habilidades BNCC com menores taxas."
          icon={Activity}
          footer={{ href: "/dashboard", label: "Ver todas as habilidades" }}
        >
          <DashboardProgressRows
            items={data.habilidades_dificeis.map((item) => ({
              id: item.codigo,
              label: item.codigo,
              detail: item.descricao,
              value: item.taxa_acerto,
            }))}
          />
        </DashboardPanel>

        <DashboardPanel
          title="Alunos que precisam de apoio"
          description="Alunos ativos com as menores taxas."
          icon={Users}
          footer={{ href: "/alunos", label: "Ver todos os alunos" }}
        >
          <DashboardTextRows
            items={data.alunos_com_dificuldade.map((item) => ({
              id: item.id,
              label: item.nome,
              detail: `${item.respostas} respostas`,
              value: item.taxa_acerto,
            }))}
          />
        </DashboardPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <DashboardPanel
          title="Professores mais ativos"
          description="Quantidade de questões criadas por professor."
          icon={BarChart3}
          compact
          footer={{ href: "/professores", label: "Ver todos os professores" }}
        >
          {data.professores_ativos.length === 0 ? (
            <DashboardEmptyData />
          ) : (
            <div className="divide-y divide-slate-100">
              {data.professores_ativos.slice(0, 5).map((professor) => (
                <div
                  key={professor.id}
                  className="flex items-center gap-3 py-3 first:pt-0"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-brand-primary-soft text-[11px] font-bold text-brand-primary">
                    {getInitials(professor.nome)}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-xs font-bold">
                    {professor.nome}
                  </p>
                  <span className="text-xs font-bold">
                    {professor.questoes} questões
                  </span>
                </div>
              ))}
            </div>
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Destaques da escola"
          description="Alunos com as maiores pontuações acumuladas."
          icon={Trophy}
          compact
          footer={{ href: "/ranking", label: "Ver ranking completo" }}
        >
          {data.top_alunos.length === 0 ? (
            <DashboardEmptyData />
          ) : (
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {data.top_alunos.slice(0, 5).map((aluno, index) => (
                <li
                  key={aluno.id}
                  className="relative border-slate-100 text-center lg:border-r lg:last:border-r-0"
                >
                  <span className="absolute top-0 left-0 flex size-6 items-center justify-center rounded-full bg-brand-primary-soft text-[10px] font-bold text-brand-primary">
                    {index + 1}
                  </span>
                  <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-50 text-xs font-bold text-brand-primary ring-2 ring-white">
                    {getInitials(aluno.nome)}
                  </span>
                  <p className="mt-2 truncate text-xs font-bold">
                    {aluno.nome}
                  </p>
                  <p className="mt-0.5 text-[10px] text-text-secondary">
                    Nível {aluno.nivel}
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {aluno.pontuacao.toLocaleString("pt-BR")} pts
                  </p>
                </li>
              ))}
            </ol>
          )}
        </DashboardPanel>
      </div>
    </div>
  );
}

export function ManagerDashboard({ userName }: { userName: string }) {
  const performanceQuery = useQuery({
    queryKey: ["dashboard", "desempenho", "gestor"],
    queryFn: gamificationApi.gestorDesempenho,
  });

  if (performanceQuery.isPending) return <PerformanceDashboardSkeleton />;

  if (performanceQuery.isError) {
    return (
      <div
        role="alert"
        className="rounded-system border border-red-200 bg-red-50 p-5 text-sm text-red-700"
      >
        Não foi possível carregar os indicadores da escola. Tente novamente em
        instantes.
      </div>
    );
  }

  return (
    <ManagerDashboardContent data={performanceQuery.data} userName={userName} />
  );
}
