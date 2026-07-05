"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock3,
  Eye,
  Radio,
  Sparkles,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { Button } from "@/components/buttons";
import { Select } from "@/components/form/Select";
import { Skeleton } from "@/components/loading";
import { Modal } from "@/components/modal";
import { useMinimumVisibleLoading } from "@/hooks/useMinimumVisibleLoading";
import { getApiErrorMessage } from "@/services/api/errors/getApiErrorMessage";
import { gamificationApi } from "@/services/api/modules/gamification";
import type {
  SessaoAoVivoAlunoEstado,
  SessaoAoVivoHistoricoItem,
  SessaoAoVivoResumo,
} from "@/types/aluno";
import { StudentLiveSkeleton } from "./StudentWorkspaceSkeletons";

const metricChartBars = [
  { height: 15, id: "first" },
  { height: 23, id: "second" },
  { height: 18, id: "third" },
  { height: 30, id: "fourth" },
];

function getStatusLabel(status: SessaoAoVivoAlunoEstado["session"]["status"]) {
  const labels = {
    aguardando: "Aguardando",
    em_andamento: "Em andamento",
    pausada: "Pausada",
    finalizada: "Finalizada",
    cancelada: "Cancelada",
  };

  return labels[status] ?? status;
}

export function StudentLiveSessionWorkspace() {
  const queryClient = useQueryClient();
  const [selectedAnswer, setSelectedAnswer] = useState<{
    alternativeId: number;
    questionId: number;
  }>();
  const [enteredSessionId, setEnteredSessionId] = useState<number>();

  const activeQuery = useQuery({
    queryKey: ["aluno", "sessoes-ao-vivo", "ativa"],
    queryFn: gamificationApi.sessaoAoVivoAtiva,
    refetchInterval: 5000,
  });

  const enterMutation = useMutation({
    mutationFn: (sessionId: number) =>
      gamificationApi.entrarSessaoAoVivo(sessionId),
    onSuccess: (estado) => {
      setEnteredSessionId(estado.session.id);
      queryClient.setQueryData(
        ["aluno", "sessoes-ao-vivo", estado.session.id],
        estado,
      );
    },
  });

  const sessionId = enteredSessionId;
  const sessionQuery = useQuery({
    queryKey: ["aluno", "sessoes-ao-vivo", sessionId],
    queryFn: () => gamificationApi.sessaoAoVivoAtual(Number(sessionId)),
    enabled: Boolean(sessionId),
    refetchInterval: 2500,
  });

  const estado = sessionQuery.data;
  const currentQuestion = estado?.currentQuestion;
  const answeredByMe = Boolean(estado?.answeredByMe);
  const selectedAlternativeId =
    selectedAnswer && selectedAnswer.questionId === currentQuestion?.id
      ? selectedAnswer.alternativeId
      : undefined;

  const podium = useMemo(() => estado?.ranking.slice(0, 5) ?? [], [estado]);
  const showInitialSkeleton = useMinimumVisibleLoading(
    activeQuery.isPending || (Boolean(sessionId) && sessionQuery.isPending),
  );

  const answerMutation = useMutation({
    mutationFn: () => {
      if (!estado?.session.id || !selectedAlternativeId) {
        throw new Error("Selecione uma alternativa antes de responder.");
      }

      return gamificationApi.responderSessaoAoVivo(
        estado.session.id,
        selectedAlternativeId,
      );
    },
    onSuccess: (result) => {
      queryClient.setQueryData(
        ["aluno", "sessoes-ao-vivo", result.estado.session.id],
        result.estado,
      );
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["aluno", "perfil"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", "aluno"] }),
        queryClient.invalidateQueries({ queryKey: ["aluno", "ranking"] }),
      ]);
    },
  });

  if (showInitialSkeleton) {
    return <StudentLiveSkeleton />;
  }

  if (activeQuery.data && !enteredSessionId) {
    const activeState = activeQuery.data;

    return (
      <LiveOverview
        state={activeState}
        isEntering={enterMutation.isPending}
        enterError={enterMutation.error}
        onEnter={() => enterMutation.mutate(activeState.session.id)}
      />
    );
  }

  if (!estado) {
    return <LiveOverview activeError={activeQuery.error} />;
  }

  return (
    <div className="space-y-6">
      <LivePageHeader />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-[18px] border border-[#e3d9f8] bg-white p-6 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase text-[#7c35e8]">
                {getStatusLabel(estado.session.status)}
              </p>
              <h1 className="mt-1 text-3xl font-bold text-[#101044]">
                {estado.session.title ?? "Sessão ao vivo"}
              </h1>
              <p className="mt-1 font-bold text-[#5d5a89]">
                {estado.session.turma?.name ?? "Turma"} com{" "}
                {estado.session.professor?.name ?? "professor"}
              </p>
            </div>
            <span className="rounded-full bg-[#f1e8ff] px-4 py-2 text-sm font-bold text-[#7c35e8]">
              Questão {currentQuestion?.order ?? 0}/
              {estado.session.totalQuestions}
            </span>
          </div>

          {estado.session.status === "aguardando" && (
            <div className="mt-8 rounded-[14px] border border-[#e3d9f8] bg-[#fbf7ff] p-5 text-center font-bold text-[#5d5a89]">
              Você já entrou. Aguarde o professor enviar a primeira questão.
            </div>
          )}

          {estado.session.status === "pausada" && (
            <div className="mt-8 rounded-[14px] border border-amber-200 bg-amber-50 p-5 text-center font-bold text-amber-800">
              A sessão está pausada pelo professor.
            </div>
          )}

          {estado.session.status === "finalizada" && (
            <div className="mt-8 rounded-[14px] border border-emerald-200 bg-emerald-50 p-5 text-center font-bold text-emerald-800">
              Sessão finalizada. Obrigado por participar!
            </div>
          )}

          {currentQuestion && estado.session.status === "em_andamento" && (
            <article className="mt-7">
              <p className="text-xs font-bold uppercase text-[#7c35e8]">
                {currentQuestion.question.difficulty} -{" "}
                {currentQuestion.question.points} pontos
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[#101044]">
                {currentQuestion.question.statement}
              </h2>

              <div className="mt-6 grid gap-3">
                {currentQuestion.question.alternatives.map((alternative) => {
                  const isSelected = selectedAlternativeId === alternative.id;
                  const wasMyAnswer =
                    estado.myAnswer?.alternativeId === alternative.id;
                  const showCorrect = wasMyAnswer && estado.myAnswer?.correct;
                  const showWrong =
                    wasMyAnswer && estado.myAnswer?.correct === false;

                  return (
                    <Button
                      key={alternative.id}
                      type="button"
                      disabled={answeredByMe || answerMutation.isPending}
                      onClick={() =>
                        currentQuestion &&
                        setSelectedAnswer({
                          alternativeId: alternative.id,
                          questionId: currentQuestion.id,
                        })
                      }
                      className={`flex min-h-14 items-center gap-3 rounded-[12px] border px-4 py-3 text-left font-bold transition ${
                        showCorrect
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                          : showWrong
                            ? "border-red-300 bg-red-50 text-red-700"
                            : isSelected
                              ? "border-[#7c35e8] bg-[#f1e8ff] text-[#7c35e8]"
                              : "border-[#e3d9f8] bg-white text-[#101044] hover:bg-[#fbf7ff]"
                      }`}
                    >
                      {showCorrect ? (
                        <CheckCircle2 className="size-5 shrink-0" />
                      ) : showWrong ? (
                        <XCircle className="size-5 shrink-0" />
                      ) : (
                        <Circle className="size-5 shrink-0" />
                      )}
                      {alternative.text}
                    </Button>
                  );
                })}
              </div>

              {answeredByMe && estado.myAnswer && (
                <div
                  role="status"
                  className={`mt-5 rounded-[12px] border p-4 font-bold ${
                    estado.myAnswer.correct
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                  }`}
                >
                  {estado.myAnswer.correct
                    ? "Resposta enviada corretamente."
                    : "Resposta enviada."}{" "}
                  +{estado.myAnswer.pointsEarned} pontos, +
                  {estado.myAnswer.xpEarned} XP.
                </div>
              )}

              {answerMutation.isError && (
                <div
                  role="alert"
                  className="mt-5 flex gap-3 rounded-[12px] border border-red-200 bg-red-50 p-4 text-red-700"
                >
                  <AlertCircle className="mt-0.5 size-5 shrink-0" />
                  <p>{getApiErrorMessage(answerMutation.error)}</p>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button
                  disabled={
                    answeredByMe ||
                    !selectedAlternativeId ||
                    answerMutation.isPending
                  }
                  onClick={() => answerMutation.mutate()}
                  variant="primary"
                >
                  {answeredByMe ? "Resposta enviada" : "Responder"}
                </Button>
              </div>
            </article>
          )}
        </section>

        <aside className="rounded-[18px] border border-[#e3d9f8] bg-white p-6 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
          <div className="flex items-center gap-3">
            <Trophy className="size-6 text-[#7c35e8]" />
            <h2 className="text-xl font-bold">Placar ao vivo</h2>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <LiveMetric
              label="Entraram"
              value={podium.length ? estado.ranking.length : 0}
            />
            <LiveMetric
              label="Respostas"
              value={estado.ranking.reduce(
                (sum, item) => sum + item.answers,
                0,
              )}
            />
            <LiveMetric
              label="Acertos"
              value={estado.ranking.reduce(
                (sum, item) => sum + item.correct,
                0,
              )}
            />
          </div>
          <div className="mt-5 overflow-hidden rounded-[12px] border border-[#e3d9f8]">
            {podium.length === 0 && (
              <p className="px-4 py-6 text-sm font-bold text-[#5d5a89]">
                O ranking aparece quando as respostas chegarem.
              </p>
            )}
            {podium.map((item) => (
              <div
                key={item.aluno.id}
                className="grid grid-cols-[36px_1fr_auto] items-center gap-3 border-[#e3d9f8] border-b px-4 py-3 last:border-b-0"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-[#f1e8ff] text-sm font-bold text-[#7c35e8]">
                  {item.position}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold">{item.aluno.name}</p>
                  <p className="text-xs font-bold text-[#5d5a89]">
                    {item.correct}/{item.answers} acertos
                  </p>
                </div>
                <span className="font-bold">{item.points}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function LivePageHeader() {
  return (
    <header>
      <h1 className="text-4xl font-bold tracking-normal text-[#4b18dc]">
        Ao vivo
      </h1>
      <p className="mt-1 text-base font-medium text-[#4f4b80]">
        Participe das sessões da sua turma e acompanhe seu desempenho em tempo
        real.
      </p>
    </header>
  );
}

function LiveOverview({
  activeError,
  enterError,
  isEntering = false,
  onEnter,
  state,
}: {
  activeError?: Error | null;
  enterError?: Error | null;
  isEntering?: boolean;
  onEnter?: () => void;
  state?: SessaoAoVivoAlunoEstado | null;
}) {
  const [period, setPeriod] = useState("all");
  const [selectedHistory, setSelectedHistory] =
    useState<SessaoAoVivoHistoricoItem>();
  const session = state?.session;
  const summaryQuery = useQuery({
    queryKey: ["aluno", "sessoes-ao-vivo", "resumo", period],
    queryFn: () =>
      gamificationApi.sessoesAoVivoResumo(period as "30-days" | "all" | "year"),
  });
  const summary = summaryQuery.data?.summary;
  const history = summaryQuery.data?.history ?? [];

  return (
    <div className="space-y-7">
      <LivePageHeader />
      <section className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="grid gap-3">
          <OverviewMetricCard
            icon={ClipboardList}
            label="Sessões concluídas"
            value={
              summaryQuery.isPending
                ? "-"
                : (summary?.completedSessions ?? 0).toLocaleString("pt-BR")
            }
            detail="Participe e revise para evoluir!"
            tone="purple"
          />
          <OverviewMetricCard
            icon={Zap}
            label="XP ganho ao vivo"
            value={
              summaryQuery.isPending
                ? "-"
                : (summary?.earnedXp ?? 0).toLocaleString("pt-BR")
            }
            suffix="XP"
            detail="Continue participando!"
            tone="blue"
          />
          <OverviewMetricCard
            icon={Trophy}
            label="Melhor pontuação"
            value={
              summaryQuery.isPending
                ? "-"
                : (summary?.bestScore ?? 0).toLocaleString("pt-BR")
            }
            suffix="pts"
            detail={summary?.bestSession?.title ?? "Aguardando uma sessão"}
            tone="orange"
          />
        </div>

        <LiveSessionCard
          error={activeError}
          enterError={enterError}
          isEntering={isEntering}
          onEnter={onEnter}
          session={session}
        />
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#101044]">
              Sessões anteriores
            </h2>
            <p className="mt-1 text-sm font-medium text-[#5d5a89]">
              Revise seu desempenho nas sessões ao vivo anteriores.
            </p>
          </div>
          <Select
            className="w-full sm:w-52"
            label="Filtrar por data"
            value={period}
            onChange={setPeriod}
            options={[
              { label: "Todas as datas", value: "all" },
              { label: "Últimos 30 dias", value: "30-days" },
              { label: "Este ano", value: "year" },
            ]}
          />
        </div>

        <div className="overflow-hidden rounded-[12px] border border-[#dfd2f7] bg-white shadow-[0_12px_32px_rgba(72,35,137,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead className="bg-[#fcfaff] text-[#5d5a89]">
                <tr className="border-[#e9e0f8] border-b">
                  <th className="px-4 py-3 font-bold">Sessão</th>
                  <th className="px-4 py-3 font-bold">Data</th>
                  <th className="px-4 py-3 font-bold">Participação</th>
                  <th className="px-4 py-3 font-bold">Pontos</th>
                  <th className="px-4 py-3 font-bold">XP</th>
                  <th className="px-4 py-3 font-bold">Acertos</th>
                  <th className="px-4 py-3 font-bold">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {summaryQuery.isPending && (
                  <tr>
                    <td colSpan={7} className="p-5">
                      <div className="grid gap-3">
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                      </div>
                    </td>
                  </tr>
                )}
                {summaryQuery.isError && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-8 text-center text-red-700"
                    >
                      <AlertCircle className="mx-auto size-8" />
                      <p className="mt-3 font-bold">
                        {getApiErrorMessage(summaryQuery.error)}
                      </p>
                    </td>
                  </tr>
                )}
                {!summaryQuery.isPending &&
                  !summaryQuery.isError &&
                  history.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center">
                        <ClipboardList className="mx-auto size-9 text-[#b79ee9]" />
                        <p className="mt-3 font-bold text-[#101044]">
                          Nenhuma sessão concluída
                        </p>
                        <p className="mt-1 text-sm text-[#5d5a89]">
                          Suas participações anteriores aparecerão aqui.
                        </p>
                      </td>
                    </tr>
                  )}
                {history.map((item) => (
                  <LiveHistoryRow
                    key={item.id}
                    item={item}
                    onOpen={() => setSelectedHistory(item)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-center gap-3 text-center text-sm font-medium text-[#5d5a89]">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f1e8ff] text-[#7c35e8]">
          <Sparkles aria-hidden="true" className="size-4" />
        </span>
        <p>
          Participe das sessões ao vivo para ganhar{" "}
          <strong className="text-[#7c35e8]">pontos e XP!</strong>
        </p>
      </div>

      <LiveHistoryModal
        item={selectedHistory}
        onClose={() => setSelectedHistory(undefined)}
      />
    </div>
  );
}

function LiveHistoryRow({
  item,
  onOpen,
}: {
  item: SessaoAoVivoHistoricoItem;
  onOpen: () => void;
}) {
  return (
    <tr className="border-[#e9e0f8] border-b last:border-b-0 hover:bg-[#fcfaff]">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f1e8ff] text-[#7c35e8]">
            <Radio aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-bold text-[#101044]">
              {item.title ?? "Sessão ao vivo"}
            </p>
            <p className="truncate text-xs text-[#5d5a89]">
              {item.turma?.name ?? "Turma"} com{" "}
              {item.professor?.name ?? "professor"}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-[#5d5a89]">
        {formatLiveSessionDate(item.date)}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-[8px] px-3 py-1 text-xs font-bold ${
            item.participated
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {item.participated ? "Participou" : "Não participou"}
        </span>
      </td>
      <td className="px-4 py-3 font-bold text-[#7c35e8]">
        {item.points.toLocaleString("pt-BR")} pts
      </td>
      <td className="px-4 py-3 font-bold text-blue-600">
        {item.xp.toLocaleString("pt-BR")} XP
      </td>
      <td className="px-4 py-3">
        <span className="font-bold text-emerald-700">{item.correct}</span>
        <span className="text-[#5d5a89]"> / {item.totalQuestions}</span>
      </td>
      <td className="px-4 py-3">
        <Button type="button" variant="primary" onClick={onOpen}>
          <Eye aria-hidden="true" className="size-4" />
          Ver detalhes
        </Button>
      </td>
    </tr>
  );
}

function LiveHistoryModal({
  item,
  onClose,
}: {
  item?: SessaoAoVivoHistoricoItem;
  onClose: () => void;
}) {
  return (
    <Modal
      isOpen={Boolean(item)}
      onClose={onClose}
      title={item?.title ?? "Detalhes da sessão"}
      description={
        item
          ? `${item.turma?.name ?? "Turma"} • ${formatLiveSessionDate(item.date)}`
          : undefined
      }
      footer={
        <Button type="button" variant="primary" onClick={onClose}>
          Fechar
        </Button>
      }
    >
      {item && (
        <div className="grid gap-3 sm:grid-cols-2">
          <HistoryDetail label="Participação">
            {item.participated ? "Participou" : "Não participou"}
          </HistoryDetail>
          <HistoryDetail label="Professor">
            {item.professor?.name ?? "Não informado"}
          </HistoryDetail>
          <HistoryDetail label="Pontos">
            {item.points.toLocaleString("pt-BR")}
          </HistoryDetail>
          <HistoryDetail label="XP">
            {item.xp.toLocaleString("pt-BR")}
          </HistoryDetail>
          <HistoryDetail label="Acertos">
            {item.correct} de {item.totalQuestions}
          </HistoryDetail>
          <HistoryDetail label="Erros">{item.errors}</HistoryDetail>
        </div>
      )}
    </Modal>
  );
}

function HistoryDetail({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-[10px] border border-[#e3d9f8] bg-[#fcfaff] p-4">
      <p className="text-xs font-medium text-[#5d5a89]">{label}</p>
      <p className="mt-1 font-bold text-[#101044]">{children}</p>
    </div>
  );
}

function formatLiveSessionDate(value?: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function LiveSessionCard({
  enterError,
  error,
  isEntering,
  onEnter,
  session,
}: {
  enterError?: Error | null;
  error?: Error | null;
  isEntering: boolean;
  onEnter?: () => void;
  session?: SessaoAoVivoResumo;
}) {
  return (
    <article className="flex min-h-[320px] flex-col justify-center rounded-[18px] border border-[#dfd2f7] bg-white p-6 shadow-[0_18px_50px_rgba(72,35,137,0.08)] sm:p-8 lg:p-10">
      {error ? (
        <div role="alert" className="flex items-start gap-3 text-red-700">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <div>
            <h1 className="font-bold">Não foi possível carregar a sessão</h1>
            <p className="mt-1 text-sm">{getApiErrorMessage(error)}</p>
          </div>
        </div>
      ) : session ? (
        <>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f1e8ff] px-3 py-2 text-xs font-bold text-[#7c35e8]">
            <Radio aria-hidden="true" className="size-4" />
            Sessão ao vivo disponível
          </span>
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-[#101044]">
                {session.title ?? "Sessão ao vivo"}
              </h1>
              <p className="mt-2 font-medium text-[#5d5a89]">
                {session.turma?.name ?? "Sua turma"} com{" "}
                {session.professor?.name ?? "seu professor"}
              </p>
            </div>
            <Button
              disabled={isEntering}
              onClick={onEnter}
              variant="primary"
              className="shrink-0"
            >
              {isEntering ? "Entrando..." : "Entrar na sessão"}
              <ArrowRight aria-hidden="true" className="size-5" />
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-[#5d5a89]">
            <span className="inline-flex items-center gap-2">
              <Circle aria-hidden="true" className="size-4 text-[#7c35e8]" />
              {session.totalQuestions} questões
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 aria-hidden="true" className="size-4 text-[#7c35e8]" />
              {Math.max(session.totalQuestions * 2, 10)} min estimados
            </span>
          </div>
          {enterError && (
            <div
              role="alert"
              className="mt-5 flex gap-3 rounded-[12px] border border-red-200 bg-red-50 p-4 text-red-700"
            >
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0"
              />
              <p>{getApiErrorMessage(enterError)}</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#f1e8ff] text-[#7c35e8]">
            <Radio aria-hidden="true" className="size-8" />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-[#101044]">
            Nenhuma sessão ao vivo agora
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium text-[#5d5a89]">
            Quando seu professor iniciar uma sessão, ela aparecerá aqui.
          </p>
        </div>
      )}
    </article>
  );
}

function OverviewMetricCard({
  detail,
  icon: Icon,
  label,
  suffix,
  tone,
  value,
}: {
  detail: string;
  icon: typeof ClipboardList;
  label: string;
  suffix?: string;
  tone: "blue" | "orange" | "purple";
  value: string;
}) {
  const tones = {
    blue: {
      icon: "bg-[#eaf2ff] text-[#2764c7]",
      line: "bg-[#4f8df7]",
    },
    orange: {
      icon: "bg-[#fff2dd] text-[#f59e0b]",
      line: "bg-[#f59e0b]",
    },
    purple: {
      icon: "bg-[#f1e8ff] text-[#7c35e8]",
      line: "bg-[#7c35e8]",
    },
  };

  return (
    <article className="grid min-h-[98px] grid-cols-[64px_minmax(0,1fr)_64px] items-center gap-4 rounded-[14px] border border-[#dfd2f7] bg-white p-4 shadow-[0_12px_32px_rgba(72,35,137,0.06)]">
      <span
        className={`flex size-14 items-center justify-center rounded-full ${tones[tone].icon}`}
      >
        <Icon aria-hidden="true" className="size-7" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-[#5d5a89]">{label}</p>
        <p className="mt-1 truncate text-2xl font-bold text-[#101044]">
          {value} {suffix && <span className="text-[#7c35e8]">{suffix}</span>}
        </p>
        <p className="mt-1 truncate text-xs text-[#5d5a89]">{detail}</p>
      </div>
      <span className="flex items-end gap-1" aria-hidden="true">
        {metricChartBars.map((bar) => (
          <span
            key={bar.id}
            className={`w-2 rounded-full ${tones[tone].line}`}
            style={{ height: `${bar.height}px` }}
          />
        ))}
      </span>
    </article>
  );
}

function LiveMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[12px] border border-[#e3d9f8] bg-[#fbf7ff] p-3 text-center">
      <p className="text-xl font-bold text-[#101044]">{value}</p>
      <p className="text-xs font-bold text-[#5d5a89]">{label}</p>
    </div>
  );
}
