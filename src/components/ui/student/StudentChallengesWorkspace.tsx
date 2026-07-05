"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  Gamepad2,
  Inbox,
  PlayCircle,
  Send,
  Swords,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/buttons";
import { Toast } from "@/components/feedback";
import { Select } from "@/components/form/Select";
import { Skeleton } from "@/components/loading";
import { useMinimumVisibleLoading } from "@/hooks/useMinimumVisibleLoading";
import { getApiErrorMessage } from "@/services/api/errors/getApiErrorMessage";
import { gamificationApi } from "@/services/api/modules/gamification";
import type {
  Desafio,
  DesafioEstado,
  DesafioQuestaoAtual,
  DesafioResultado,
  DesafioTipo,
} from "@/types/aluno";
import { StudentChallengesSkeleton } from "./StudentWorkspaceSkeletons";

function getStatusLabel(status: Desafio["status"]) {
  const labels = {
    pendente: "Pendente",
    em_andamento: "Em andamento",
    finalizado: "Finalizado",
    recusado: "Recusado",
    expirado: "Expirado",
  };

  return labels[status];
}

function getDifficultyLabel(
  difficulty: DesafioQuestaoAtual["question"]["difficulty"],
) {
  const labels = {
    facil: "Fácil",
    media: "Média",
    dificil: "Difícil",
  };

  return labels[difficulty] ?? difficulty;
}

function getOpponent(challenge: Desafio, myId?: number) {
  if (challenge.challenger?.id === myId) return challenge.challenged;

  return challenge.challenger;
}

function formatTime(ms: number) {
  return `${(ms / 1000).toFixed(1)}s`;
}

type ChallengeTab = "received" | "sent" | "active";

export function StudentChallengesWorkspace() {
  const queryClient = useQueryClient();
  const [selectedColegaId, setSelectedColegaId] = useState<number>();
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState<number>();
  const [challengeType, setChallengeType] = useState<DesafioTipo>("amistoso");
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [activeTab, setActiveTab] = useState<ChallengeTab>("received");
  const [activeChallengeId, setActiveChallengeId] = useState<number>();
  const [selectedAlternativeId, setSelectedAlternativeId] = useState<number>();
  const [successNotice, setSuccessNotice] = useState<string>();

  const meQuery = useQuery({
    queryKey: ["auth", "me", "aluno"],
    queryFn: gamificationApi.alunoMe,
    retry: false,
  });
  const colegasQuery = useQuery({
    queryKey: ["aluno", "colegas"],
    queryFn: gamificationApi.colegas,
  });
  const disciplinasQuery = useQuery({
    queryKey: ["aluno", "disciplinas"],
    queryFn: gamificationApi.alunoDisciplinas,
  });
  const desafiosQuery = useQuery({
    queryKey: ["aluno", "desafios"],
    queryFn: gamificationApi.desafios,
    refetchInterval: 5000,
  });
  const activeChallengeQuery = useQuery({
    queryKey: ["aluno", "desafios", activeChallengeId, "atual"],
    queryFn: () => gamificationApi.desafioAtual(activeChallengeId ?? 0),
    enabled: Boolean(activeChallengeId),
    refetchInterval: activeChallengeId ? 1500 : false,
  });

  const myId = meQuery.data?.id;
  const desafios = desafiosQuery.data ?? [];
  const pendingIncoming = desafios.filter(
    (desafio) =>
      desafio.status === "pendente" && desafio.challenged?.id === myId,
  );
  const pendingOutgoing = desafios.filter(
    (desafio) =>
      desafio.status === "pendente" && desafio.challenger?.id === myId,
  );
  const inProgressChallenges = desafios.filter(
    (desafio) => desafio.status === "em_andamento",
  );
  const activeChallenge =
    desafios.find((desafio) => desafio.id === activeChallengeId) ??
    desafios.find((desafio) => desafio.status === "em_andamento");
  const selectedColega = colegasQuery.data?.find(
    (colega) => colega.id === selectedColegaId,
  );
  const visibleChallenges =
    activeTab === "received"
      ? pendingIncoming
      : activeTab === "sent"
        ? pendingOutgoing
        : inProgressChallenges;
  const challengeTabs = [
    {
      icon: Inbox,
      id: "received" as const,
      label: "Recebidos",
      count: pendingIncoming.length,
    },
    {
      icon: Send,
      id: "sent" as const,
      label: "Enviados",
      count: pendingOutgoing.length,
    },
    {
      icon: PlayCircle,
      id: "active" as const,
      label: "Em andamento",
      count: inProgressChallenges.length,
    },
  ];

  useEffect(() => {
    if (!activeChallengeId && activeChallenge?.status === "em_andamento") {
      setActiveChallengeId(activeChallenge.id);
    }
  }, [activeChallenge, activeChallengeId]);

  const createMutation = useMutation({
    mutationFn: () => {
      if (!selectedColegaId) {
        throw new Error("Selecione um colega para desafiar.");
      }

      return gamificationApi.criarDesafio({
        challengedId: selectedColegaId,
        disciplinaId: selectedDisciplinaId,
        type: challengeType,
        totalQuestions,
      });
    },
    onSuccess: async (challenge) => {
      setSelectedColegaId(undefined);
      setSuccessNotice(
        challenge.status === "em_andamento"
          ? "Desafio iniciado. Boa partida!"
          : "Convite de desafio enviado.",
      );
      await queryClient.invalidateQueries({ queryKey: ["aluno", "desafios"] });
    },
  });
  const acceptMutation = useMutation({
    mutationFn: gamificationApi.aceitarDesafio,
    onSuccess: async (challenge) => {
      setActiveChallengeId(challenge.id);
      setSuccessNotice("Desafio iniciado. Responda antes do tempo acabar.");
      await queryClient.invalidateQueries({ queryKey: ["aluno", "desafios"] });
    },
  });
  const refuseMutation = useMutation({
    mutationFn: gamificationApi.recusarDesafio,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["aluno", "desafios"] });
    },
  });
  const answerMutation = useMutation({
    mutationFn: () => {
      if (!activeChallengeId || !selectedAlternativeId) {
        throw new Error("Selecione uma alternativa.");
      }

      return gamificationApi.responderDesafio(
        activeChallengeId,
        selectedAlternativeId,
      );
    },
    onSuccess: async (state) => {
      setSelectedAlternativeId(undefined);

      if (state.status !== "em_andamento") {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["aluno", "desafios"] }),
          queryClient.invalidateQueries({ queryKey: ["aluno", "perfil"] }),
          queryClient.invalidateQueries({ queryKey: ["dashboard", "aluno"] }),
        ]);
      }
    },
  });

  const error =
    colegasQuery.error ??
    desafiosQuery.error ??
    createMutation.error ??
    acceptMutation.error ??
    refuseMutation.error ??
    answerMutation.error ??
    activeChallengeQuery.error;
  const showInitialSkeleton = useMinimumVisibleLoading(
    meQuery.isPending ||
      colegasQuery.isPending ||
      disciplinasQuery.isPending ||
      desafiosQuery.isPending,
  );

  if (showInitialSkeleton) {
    return <StudentChallengesSkeleton />;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1fr_0.95fr] xl:items-start">
        <div>
          <h1 className="text-4xl font-bold tracking-normal text-[#4b18dc]">
            Desafios
          </h1>
          <p className="mt-1 text-base font-medium text-[#4f4b80]">
            Convide colegas para uma partida ao vivo e dispute questões em tempo
            real.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryCard
            icon={Users}
            label="Colegas"
            value={(colegasQuery.data?.length ?? 0).toLocaleString("pt-BR")}
          />
          <SummaryCard
            icon={Clock}
            label="Convites"
            value={pendingIncoming.length.toLocaleString("pt-BR")}
          />
          <SummaryCard
            icon={Trophy}
            label="Partidas"
            value={desafios.length.toLocaleString("pt-BR")}
          />
        </div>
      </section>

      {successNotice && (
        <Toast
          variant="success"
          title="Desafio atualizado"
          message={successNotice}
          onClose={() => setSuccessNotice(undefined)}
        />
      )}

      {error && (
        <div
          role="alert"
          className="flex gap-3 rounded-[14px] border border-red-200 bg-red-50 p-4 text-red-700"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          <p>{getApiErrorMessage(error)}</p>
        </div>
      )}

      {activeChallengeId && (
        <LiveChallengePanel
          challenge={activeChallenge}
          state={activeChallengeQuery.data}
          myId={myId}
          isLoading={activeChallengeQuery.isPending}
          isAnswering={answerMutation.isPending}
          selectedAlternativeId={selectedAlternativeId}
          onSelectAlternative={setSelectedAlternativeId}
          onAnswer={() => answerMutation.mutate()}
          onClose={() => setActiveChallengeId(undefined)}
        />
      )}

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="flex flex-col rounded-[18px] border border-[#e3d9f8] bg-white p-5 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-[#f0e7ff] text-[#6d2ee8]">
              <Swords aria-hidden="true" className="size-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-[#101044]">
                Criar desafio
              </h2>
              <p className="text-sm font-medium text-[#5d5a89]">
                Escolha um colega disponível para jogar.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <Select
              label="Colega"
              value={selectedColegaId ? String(selectedColegaId) : ""}
              onChange={(value) =>
                setSelectedColegaId(Number(value) || undefined)
              }
              options={(colegasQuery.data ?? []).map((colega) => ({
                value: String(colega.id),
                label: colega.name,
              }))}
              placeholder={
                colegasQuery.isPending
                  ? "Carregando colegas..."
                  : "Selecione um colega"
              }
              emptyMessage="Nenhum colega disponível"
              disabled={colegasQuery.isPending}
              searchable
            />
            <Select
              label="Disciplina"
              value={selectedDisciplinaId ? String(selectedDisciplinaId) : ""}
              onChange={(value) =>
                setSelectedDisciplinaId(Number(value) || undefined)
              }
              options={(disciplinasQuery.data ?? []).map((disciplina) => ({
                value: String(disciplina.id),
                label: disciplina.name,
              }))}
              placeholder="Todas as disciplinas"
              searchable
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                label="Tipo"
                value={challengeType}
                onChange={(value) => setChallengeType(value as DesafioTipo)}
                options={[
                  { value: "amistoso", label: "Amistoso" },
                  { value: "valendo", label: "Valendo pontos" },
                ]}
              />
              <Select
                label="Questões"
                value={String(totalQuestions)}
                onChange={(value) => setTotalQuestions(Number(value))}
                options={[3, 5, 7, 10].map((amount) => ({
                  value: String(amount),
                  label: `${amount} questões`,
                }))}
              />
            </div>
          </div>

          <Button
            type="button"
            disabled={
              !selectedColegaId ||
              createMutation.isPending ||
              colegasQuery.isPending
            }
            onClick={() => createMutation.mutate()}
            variant="primary"
            className="mt-5 w-full disabled:opacity-100 disabled:from-[#a979f1] disabled:to-[#a979f1]"
          >
            <Gamepad2 aria-hidden="true" className="size-5" />
            Desafiar {selectedColega?.name ?? "colega"}
          </Button>
        </article>

        <article className="flex flex-col rounded-[18px] border border-[#e3d9f8] bg-white p-5 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-[#f0e7ff] text-[#6d2ee8]">
                <Trophy aria-hidden="true" className="size-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-[#101044]">
                  Convites e partidas
                </h2>
                <p className="text-sm font-medium text-[#5d5a89]">
                  Acompanhe desafios recebidos e em andamento.
                </p>
              </div>
            </div>
            {desafiosQuery.isFetching && (
              <span className="text-xs font-bold text-[#6d2ee8]">
                Atualizando
              </span>
            )}
          </div>

          <div className="mt-6 grid overflow-hidden rounded-[12px] border border-[#d9cdf8] bg-white sm:grid-cols-3">
            {challengeTabs.map((tab) => (
              <Button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex min-h-12 items-center justify-center gap-2 !rounded-none border-[#eee6ff] px-3 text-sm font-bold transition sm:border-r sm:last:border-r-0 ${
                  activeTab === tab.id
                    ? "bg-[#fbf8ff] text-[#6d2ee8]"
                    : "text-[#5d5a89] hover:bg-[#fbf8ff]"
                }`}
              >
                <tab.icon aria-hidden="true" className="size-5 shrink-0" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="rounded-full bg-[#efe7ff] px-2 py-0.5 text-xs text-[#6d2ee8]">
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <span className="absolute right-0 bottom-0 left-0 h-1 bg-[#6d2ee8]" />
                )}
              </Button>
            ))}
          </div>

          <div className="mt-6 flex flex-1 flex-col gap-3">
            {desafiosQuery.isPending &&
              [1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-24 rounded-[12px]" />
              ))}

            {!desafiosQuery.isPending && visibleChallenges.length === 0 && (
              <div className="flex min-h-[220px] flex-1 flex-col items-center justify-center rounded-[14px] border border-dashed border-[#d9cdf8] bg-[#fbf8ff] p-8 text-center">
                <Swords className="mx-auto mb-3 size-10 text-[#6d2ee8]" />
                <p className="font-bold text-[#101044]">Nenhum desafio ainda</p>
                <p className="mt-1 text-sm font-medium text-[#5d5a89]">
                  Crie uma partida para começar a competir com sua turma.
                </p>
              </div>
            )}

            {visibleChallenges.map((desafio) => (
              <ChallengeRow
                key={desafio.id}
                challenge={desafio}
                myId={myId}
                isAccepting={acceptMutation.isPending}
                isRefusing={refuseMutation.isPending}
                onAccept={() => acceptMutation.mutate(desafio.id)}
                onRefuse={() => refuseMutation.mutate(desafio.id)}
                onOpen={() => setActiveChallengeId(desafio.id)}
              />
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[16px] border border-[#e3d9f8] bg-white p-4 shadow-[0_12px_35px_rgba(72,35,137,0.08)]">
      <Icon aria-hidden="true" className="size-6 text-[#6d2ee8]" />
      <p className="mt-3 text-2xl font-bold text-[#101044]">{value}</p>
      <p className="text-sm font-bold text-[#5d5a89]">{label}</p>
    </div>
  );
}

function ChallengeRow({
  challenge,
  isAccepting,
  isRefusing,
  myId,
  onAccept,
  onOpen,
  onRefuse,
}: {
  challenge: Desafio;
  isAccepting: boolean;
  isRefusing: boolean;
  myId?: number;
  onAccept: () => void;
  onOpen: () => void;
  onRefuse: () => void;
}) {
  const opponent = getOpponent(challenge, myId);
  const isIncoming =
    challenge.status === "pendente" && challenge.challenged?.id === myId;
  const canOpen =
    challenge.status === "em_andamento" || challenge.status === "finalizado";

  return (
    <div className="grid gap-4 rounded-[14px] border border-[#e3d9f8] bg-white p-4 shadow-[0_10px_24px_rgba(72,35,137,0.05)] transition hover:border-[#cdb8ff] hover:shadow-[0_14px_34px_rgba(72,35,137,0.1)] sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0">
        <p className="text-sm font-bold text-[#6d2ee8]">
          {challenge.type === "valendo" ? "Valendo pontos" : "Amistoso"} -{" "}
          {getStatusLabel(challenge.status)}
        </p>
        <h3 className="mt-1 truncate text-lg font-bold text-[#101044]">
          {opponent?.name ?? "Colega"}
        </h3>
        <p className="text-sm font-medium text-[#5d5a89]">
          {challenge.currentQuestion}/{challenge.totalQuestions} questões
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {isIncoming && (
          <>
            <Button
              type="button"
              disabled={isAccepting}
              onClick={onAccept}
              variant="primary"
            >
              Aceitar
            </Button>
            <Button
              type="button"
              disabled={isRefusing}
              onClick={onRefuse}
              variant="primary"
            >
              Recusar
            </Button>
          </>
        )}
        {canOpen && (
          <Button type="button" onClick={onOpen} variant="primary">
            Abrir
          </Button>
        )}
      </div>
    </div>
  );
}

function LiveChallengePanel({
  challenge,
  isAnswering,
  isLoading,
  myId,
  onAnswer,
  onClose,
  onSelectAlternative,
  selectedAlternativeId,
  state,
}: {
  challenge?: Desafio;
  isAnswering: boolean;
  isLoading: boolean;
  myId?: number;
  onAnswer: () => void;
  onClose: () => void;
  onSelectAlternative: (id: number) => void;
  selectedAlternativeId?: number;
  state?: DesafioEstado;
}) {
  return (
    <article className="rounded-[18px] border border-[#cdb8ff] bg-white p-5 shadow-[0_20px_60px_rgba(72,35,137,0.14)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[#6d2ee8]">Partida ao vivo</p>
          <h2 className="text-2xl font-bold text-[#101044]">
            Contra {challenge ? getOpponent(challenge, myId)?.name : "colega"}
          </h2>
        </div>
        <Button type="button" onClick={onClose} variant="primary">
          Fechar painel
        </Button>
      </div>

      {isLoading && (
        <div className="mt-5 grid gap-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-24" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      )}

      {state?.status === "em_andamento" && (
        <QuestionState
          state={state}
          isAnswering={isAnswering}
          selectedAlternativeId={selectedAlternativeId}
          onSelectAlternative={onSelectAlternative}
          onAnswer={onAnswer}
        />
      )}

      {state && state.status !== "em_andamento" && (
        <ResultState state={state} challenge={challenge} myId={myId} />
      )}
    </article>
  );
}

function QuestionState({
  isAnswering,
  onAnswer,
  onSelectAlternative,
  selectedAlternativeId,
  state,
}: {
  isAnswering: boolean;
  onAnswer: () => void;
  onSelectAlternative: (id: number) => void;
  selectedAlternativeId?: number;
  state: DesafioQuestaoAtual;
}) {
  const secondsLeft = useCountdown(state.expiresAt);

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-[#f0e7ff] px-3 py-1 text-sm font-bold text-[#6d2ee8]">
          Questão {state.order}/{state.total}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#fff4d6] px-3 py-1 text-sm font-bold text-[#8f5c00]">
          <Clock aria-hidden="true" className="size-4" />
          {Math.max(secondsLeft, 0)}s
        </span>
      </div>

      <p className="mt-4 text-xs font-bold uppercase text-[#6d2ee8]">
        {getDifficultyLabel(state.question.difficulty)}
      </p>
      <h3 className="mt-2 text-xl font-bold text-[#101044]">
        {state.question.statement}
      </h3>

      <div className="mt-5 grid gap-3">
        {state.question.alternatives.map((alternative) => {
          const isSelected = selectedAlternativeId === alternative.id;

          return (
            <Button
              key={alternative.id}
              type="button"
              disabled={state.answeredByMe || isAnswering}
              onClick={() => onSelectAlternative(alternative.id)}
              className={`flex min-h-14 items-center gap-3 rounded-[12px] border px-4 text-left font-bold transition ${
                isSelected
                  ? "border-[#6d2ee8] bg-[#f0e7ff] text-[#5e18e6]"
                  : "border-[#e3d9f8] bg-white text-[#101044] hover:bg-[#fbf8ff]"
              }`}
            >
              <Circle aria-hidden="true" className="size-5 shrink-0" />
              {alternative.text}
            </Button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-[#5d5a89]">
          {state.answeredByMe
            ? "Você já respondeu. Aguardando o colega..."
            : state.answeredByOpponent
              ? "Seu colega já respondeu."
              : "Os dois respondem a mesma questão."}
        </p>
        <Button
          type="button"
          disabled={
            !selectedAlternativeId || Boolean(state.answeredByMe) || isAnswering
          }
          onClick={onAnswer}
          variant="primary"
        >
          Responder
        </Button>
      </div>
    </div>
  );
}

function ResultState({
  challenge,
  myId,
  state,
}: {
  challenge?: Desafio;
  myId?: number;
  state: DesafioResultado;
}) {
  const challengerName = challenge?.challenger?.name ?? "Desafiante";
  const challengedName = challenge?.challenged?.name ?? "Desafiado";
  const resultLabel = state.draw
    ? "Empate"
    : state.winnerId === myId
      ? "Você venceu!"
      : "Vitória do colega";

  return (
    <div className="mt-6 rounded-[16px] bg-[#fbf8ff] p-5">
      <div className="flex items-center gap-3">
        {state.winnerId === myId || state.draw ? (
          <CheckCircle2 className="size-7 text-emerald-600" />
        ) : (
          <XCircle className="size-7 text-amber-600" />
        )}
        <h3 className="text-2xl font-bold text-[#101044]">{resultLabel}</h3>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ScoreCard
          name={challengerName}
          correct={state.scoreboard.challenger.correct}
          time={state.scoreboard.challenger.totalTimeMs}
        />
        <ScoreCard
          name={challengedName}
          correct={state.scoreboard.challenged.correct}
          time={state.scoreboard.challenged.totalTimeMs}
        />
      </div>
    </div>
  );
}

function ScoreCard({
  correct,
  name,
  time,
}: {
  correct: number;
  name: string;
  time: number;
}) {
  return (
    <div className="rounded-[12px] border border-[#e3d9f8] bg-white p-4">
      <p className="font-bold text-[#101044]">{name}</p>
      <p className="mt-2 text-sm font-bold text-[#5d5a89]">
        {correct} acertos - {formatTime(time)}
      </p>
    </div>
  );
}

function useCountdown(expiresAt?: string | null) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(interval);
  }, []);

  return useMemo(() => {
    if (!expiresAt) return 0;

    return Math.ceil((new Date(expiresAt).getTime() - now) / 1000);
  }, [expiresAt, now]);
}
