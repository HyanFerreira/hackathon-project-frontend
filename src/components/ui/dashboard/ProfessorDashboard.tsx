"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  BookOpenCheck,
  CalendarDays,
  ChevronDown,
  GraduationCap,
  MessageSquareText,
  School,
  Target,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  gamificationApi,
  type ProfessorDesempenho,
} from "@/services/api/modules/gamification";
import {
  dashboardCardClass,
  DashboardEmptyData,
  DashboardPanel,
  DashboardProgressRows,
  DashboardSummaryCard,
  DashboardTextRows,
  PerformanceDashboardSkeleton,
} from "./PerformanceDashboardShared";

function QuestionsWithMostErrors({
  data,
}: {
  data: ProfessorDesempenho["questoes_mais_erradas"];
}) {
  return (
    <section
      className={`${dashboardCardClass} flex min-h-72 flex-col overflow-hidden`}
    >
      <div className="flex items-start gap-3 px-5 pt-5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
          <MessageSquareText aria-hidden="true" className="size-4" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Questões com mais erros
          </h2>
          <p className="mt-0.5 text-xs text-text-secondary">
            Itens que apresentaram as menores taxas de acerto.
          </p>
        </div>
      </div>

      <div className="flex-1 px-5 py-5">
        {data.length === 0 ? (
          <DashboardEmptyData />
        ) : (
          <div className="grid gap-x-6 gap-y-2 lg:grid-cols-2">
            {data.slice(0, 8).map((question) => (
              <article
                key={question.id}
                className="flex items-center gap-3 rounded-system border border-slate-200 px-3 py-2"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
                  <MessageSquareText aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900">
                    {question.enunciado}
                  </p>
                  <p className="mt-0.5 text-[11px] text-text-secondary">
                    {question.acertos} acertos em {question.respostas} respostas
                  </p>
                </div>
                <span className="shrink-0 text-xs font-bold text-rose-500">
                  {question.taxa_acerto}%
                </span>
              </article>
            ))}
          </div>
        )}
      </div>

      <Link
        className="border-t border-slate-100 px-5 py-3 text-center text-xs font-bold text-brand-primary transition hover:bg-brand-primary-soft"
        href="/questoes"
      >
        Ver todas as questões →
      </Link>
    </section>
  );
}

function ProfessorDashboardContent({ data }: { data: ProfessorDesempenho }) {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Painel do professor
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Acompanhe o seu desempenho geral e o das suas turmas.
          </p>
        </div>
        <div
          className={`${dashboardCardClass} flex items-center gap-3 px-4 py-3`}
        >
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
          detail={data.resumo.turmas === 1 ? "turma" : "turmas"}
          icon={Users}
          tone="blue"
        />
        <DashboardSummaryCard
          label="Questões criadas"
          value={data.resumo.questoes_criadas ?? 0}
          detail="pelo professor"
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
          description="Comparação da taxa de acerto entre as turmas."
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
          description="Habilidades BNCC com menores taxas de acerto."
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
          description="Menores taxas de acerto entre os alunos ativos."
          icon={Users}
          footer={{ href: "/turmas", label: "Ver todos os alunos" }}
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

      <QuestionsWithMostErrors data={data.questoes_mais_erradas} />
    </div>
  );
}

export function ProfessorDashboard() {
  const performanceQuery = useQuery({
    queryKey: ["dashboard", "desempenho", "professor"],
    queryFn: gamificationApi.professorDesempenho,
  });

  if (performanceQuery.isPending) return <PerformanceDashboardSkeleton />;

  if (performanceQuery.isError) {
    return (
      <div
        role="alert"
        className="rounded-system border border-red-200 bg-red-50 p-5 text-sm text-red-700"
      >
        Não foi possível carregar os indicadores das turmas. Tente novamente em
        instantes.
      </div>
    );
  }

  return <ProfessorDashboardContent data={performanceQuery.data} />;
}
