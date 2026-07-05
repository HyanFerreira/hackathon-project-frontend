"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  BookOpenCheck,
  CircleGauge,
  GraduationCap,
  type LucideIcon,
  MessageSquareText,
  School,
} from "lucide-react";
import { Skeleton } from "@/components/loading";
import {
  type GestorDesempenho,
  gamificationApi,
  type ProfessorDesempenho,
} from "@/services/api/modules/gamification";

type DashboardRole = "gestor" | "professor";
type PerformanceData = GestorDesempenho | ProfessorDesempenho;

type MetricProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  detail: string;
};

function Metric({ icon: Icon, label, value, detail }: MetricProps) {
  return (
    <article className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text-secondary">{label}</p>
          <p className="mt-2 text-3xl font-bold text-text-primary">{value}</p>
          <p className="mt-1 text-xs text-text-secondary">{detail}</p>
        </div>
        <span className="rounded-system bg-brand-primary-soft p-3 text-brand-primary">
          <Icon aria-hidden="true" className="size-5" />
        </span>
      </div>
    </article>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <h2 className="text-lg font-bold text-text-primary">{title}</h2>
      <p className="mt-1 text-sm text-text-secondary">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function EmptyData() {
  return (
    <p className="rounded-system bg-slate-50 p-4 text-sm text-text-secondary">
      Ainda não há respostas suficientes para esta análise.
    </p>
  );
}

function PercentageBars({
  items,
}: {
  items: Array<{
    id: string | number;
    label: string;
    value: number;
    detail?: string;
  }>;
}) {
  if (items.length === 0) return <EmptyData />;

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id}>
          <div className="mb-1.5 flex items-end justify-between gap-4 text-sm">
            <div className="min-w-0">
              <p className="truncate font-semibold text-text-primary">
                {item.label}
              </p>
              {item.detail && (
                <p className="truncate text-xs text-text-secondary">
                  {item.detail}
                </p>
              )}
            </div>
            <span className="shrink-0 font-bold text-brand-primary">
              {item.value}%
            </span>
          </div>
          <div
            className="h-2.5 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label={`${item.label}: ${item.value}% de acerto`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={item.value}
          >
            <div
              className="h-full rounded-full bg-brand-primary"
              style={{ width: `${Math.max(0, Math.min(item.value, 100))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RankingList({
  items,
  valueLabel,
}: {
  items: Array<{
    id: number;
    name: string;
    value: number;
    detail?: string;
  }>;
  valueLabel: (value: number) => string;
}) {
  if (items.length === 0) return <EmptyData />;

  return (
    <ol className="divide-y divide-slate-100">
      {items.map((item, index) => (
        <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-sm font-bold text-brand-primary">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-primary">
              {item.name}
            </p>
            {item.detail && (
              <p className="text-xs text-text-secondary">{item.detail}</p>
            )}
          </div>
          <span className="shrink-0 text-sm font-bold text-text-primary">
            {valueLabel(item.value)}
          </span>
        </li>
      ))}
    </ol>
  );
}

function PerformanceSkeleton() {
  const metricSkeletons = ["acertos", "ativos", "turmas", "professores"];
  const panelSkeletons = ["turmas", "disciplinas", "habilidades", "alunos"];

  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Carregando indicadores"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricSkeletons.map((key) => (
          <Skeleton key={key} className="h-36" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {panelSkeletons.map((key) => (
          <Skeleton key={key} className="h-80" />
        ))}
      </div>
    </div>
  );
}

function PerformanceContent({
  role,
  data,
}: {
  role: DashboardRole;
  data: PerformanceData;
}) {
  const isManager = role === "gestor";
  const professorData = !isManager ? (data as ProfessorDesempenho) : null;
  const managerData = isManager ? (data as GestorDesempenho) : null;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={CircleGauge}
          label="Taxa geral de acerto"
          value={`${data.resumo.taxa_acerto}%`}
          detail={`${data.resumo.acertos} acertos em ${data.resumo.respostas} respostas`}
        />
        <Metric
          icon={Activity}
          label="Alunos ativos"
          value={data.resumo.alunos_ativos}
          detail={`de ${data.resumo.alunos} alunos`}
        />
        <Metric
          icon={School}
          label="Turmas acompanhadas"
          value={data.resumo.turmas}
          detail="com dados consolidados"
        />
        <Metric
          icon={isManager ? GraduationCap : BookOpenCheck}
          label={isManager ? "Professores" : "Questões criadas"}
          value={
            isManager
              ? (data.resumo.professores ?? 0)
              : (data.resumo.questoes_criadas ?? 0)
          }
          detail={isManager ? "na escola" : "pelo professor"}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Desempenho por turma"
          description="Comparação da taxa de acerto entre as turmas."
        >
          <PercentageBars
            items={data.por_turma.map((turma) => ({
              id: turma.turma_id,
              label: turma.nome,
              value: turma.taxa_acerto,
              detail: `${turma.alunos} alunos · ${turma.respostas} respostas`,
            }))}
          />
        </Panel>

        <Panel
          title="Desempenho por disciplina"
          description="Taxa de acerto consolidada em cada disciplina."
        >
          <PercentageBars
            items={data.disciplinas.map((disciplina) => ({
              id: disciplina.id,
              label: disciplina.nome,
              value: disciplina.taxa_acerto,
              detail: `${disciplina.respostas} respostas`,
            }))}
          />
        </Panel>

        <Panel
          title="Habilidades que pedem atenção"
          description="Habilidades BNCC com as menores taxas de acerto."
        >
          <PercentageBars
            items={data.habilidades_dificeis.map((habilidade) => ({
              id: habilidade.codigo,
              label: habilidade.codigo,
              value: habilidade.taxa_acerto,
              detail: `${habilidade.disciplina} · ${habilidade.descricao}`,
            }))}
          />
        </Panel>

        <Panel
          title="Alunos que precisam de apoio"
          description="Menores taxas de acerto entre os alunos ativos."
        >
          <PercentageBars
            items={data.alunos_com_dificuldade.map((aluno) => ({
              id: aluno.id,
              label: aluno.nome,
              value: aluno.taxa_acerto,
              detail: `${aluno.respostas} respostas`,
            }))}
          />
        </Panel>

        {managerData && (
          <>
            <Panel
              title="Professores mais ativos"
              description="Quantidade de questões criadas por professor."
            >
              <RankingList
                items={managerData.professores_ativos.map((professor) => ({
                  id: professor.id,
                  name: professor.nome,
                  value: professor.questoes,
                }))}
                valueLabel={(value) => `${value} questões`}
              />
            </Panel>
            <Panel
              title="Destaques da escola"
              description="Alunos com as maiores pontuações acumuladas."
            >
              <RankingList
                items={managerData.top_alunos.map((aluno) => ({
                  id: aluno.id,
                  name: aluno.nome,
                  value: aluno.pontuacao,
                  detail: `Nível ${aluno.nivel}`,
                }))}
                valueLabel={(value) => `${value} pts`}
              />
            </Panel>
          </>
        )}

        {professorData && (
          <div className="xl:col-span-2">
            <Panel
              title="Questões com mais erros"
              description="Itens que apresentaram as menores taxas de acerto."
            >
              {professorData.questoes_mais_erradas.length === 0 ? (
                <EmptyData />
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {professorData.questoes_mais_erradas.map((questao) => (
                    <article
                      key={questao.id}
                      className="rounded-system border border-slate-200 p-4"
                    >
                      <div className="flex gap-3">
                        <MessageSquareText
                          aria-hidden="true"
                          className="mt-0.5 size-5 shrink-0 text-brand-primary"
                        />
                        <div>
                          <p className="line-clamp-2 text-sm font-semibold text-text-primary">
                            {questao.enunciado}
                          </p>
                          <p className="mt-2 text-xs text-text-secondary">
                            {questao.acertos} acertos em {questao.respostas}{" "}
                            respostas
                          </p>
                          <p className="mt-1 font-bold text-brand-primary">
                            {questao.taxa_acerto}% de acerto
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        )}
      </div>
    </div>
  );
}

export function PerformanceDashboard({ role }: { role: DashboardRole }) {
  const performanceQuery = useQuery<PerformanceData>({
    queryKey: ["dashboard", "desempenho", role],
    queryFn: () =>
      role === "gestor"
        ? gamificationApi.gestorDesempenho()
        : gamificationApi.professorDesempenho(),
  });

  if (performanceQuery.isPending) return <PerformanceSkeleton />;

  if (performanceQuery.isError) {
    return (
      <div
        role="alert"
        className="rounded-system border border-red-200 bg-red-50 p-5 text-sm text-red-700"
      >
        Não foi possível carregar os indicadores de desempenho. Tente novamente
        em instantes.
      </div>
    );
  }

  return <PerformanceContent role={role} data={performanceQuery.data} />;
}
