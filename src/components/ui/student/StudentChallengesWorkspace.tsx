"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  Gamepad2,
  Swords,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/buttons";
import { Toast } from "@/components/feedback";
import { Skeleton } from "@/components/loading";
import { getApiErrorMessage } from "@/services/api/errors/getApiErrorMessage";
import { gamificationApi } from "@/services/api/modules/gamification";
import type {
  Desafio,
  DesafioEstado,
  DesafioQuestaoAtual,
  DesafioResultado,
  DesafioTipo,
} from "@/types/aluno";

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
    facil: "Facil",
    media: "Media",
    dificil: "Dificil",
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

export function StudentChallengesWorkspace() {
  const queryClient = useQueryClient();
  const [selectedColegaId, setSelectedColegaId] = useState<number>();
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState<number>();
  const [challengeType, setChallengeType] = useState<DesafioTipo>("amistoso");
  const [totalQuestions, setTotalQuestions] = useState(5);
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
  const activeChallenge =
    desafios.find((desafio) => desafio.id === activeChallengeId) ??
    desafios.find((desafio) => desafio.status === "em_andamento");
  const selectedColega = colegasQuery.data?.find(
    (colega) => colega.id === selectedColegaId,
  );

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

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
        <div>
          <h1 className="text-4xl font-black tracking-normal text-[#4b18dc]">
            Desafios
          </h1>
          <p className="mt-1 text-base font-medium text-[#4f4b80]">
            Convide colegas para uma partida ao vivo e dispute questoes em tempo
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
        <article className="rounded-[18px] border border-[#e3d9f8] bg-white p-5 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-[10px] bg-[#f0e7ff] text-[#6d2ee8]">
              <Swords aria-hidden="true" className="size-6" />
            </span>
            <div>
              <h2 className="text-xl font-black text-[#101044]">
                Criar desafio
              </h2>
              <p className="text-sm font-medium text-[#5d5a89]">
                Escolha um colega disponivel para jogar.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <FormSelect
              label="Colega"
              value={selectedColegaId ?? ""}
              onChange={(value) =>
                setSelectedColegaId(Number(value) || undefined)
              }
              options={(colegasQuery.data ?? []).map((colega) => ({
                value: colega.id,
                label: colega.name,
              }))}
              placeholder={
                colegasQuery.isPending
                  ? "Carregando colegas..."
                  : "Selecione um colega"
              }
              emptyLabel="Nenhum colega disponivel"
              disabled={colegasQuery.isPending}
            />
            <FormSelect
              label="Disciplina"
              value={selectedDisciplinaId ?? ""}
              onChange={(value) =>
                setSelectedDisciplinaId(Number(value) || undefined)
              }
              options={(disciplinasQuery.data ?? []).map((disciplina) => ({
                value: disciplina.id,
                label: disciplina.name,
              }))}
              placeholder="Todas as disciplinas"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <FormSelect
                label="Tipo"
                value={challengeType}
                onChange={(value) => setChallengeType(value as DesafioTipo)}
                options={[
                  { value: "amistoso", label: "Amistoso" },
                  { value: "valendo", label: "Valendo pontos" },
                ]}
              />
              <FormSelect
                label="Questoes"
                value={totalQuestions}
                onChange={(value) => setTotalQuestions(Number(value))}
                options={[3, 5, 7, 10].map((amount) => ({
                  value: amount,
                  label: `${amount} questoes`,
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
            className="mt-5 min-h-12 w-full rounded-[10px] bg-gradient-to-r from-[#6d2ee8] to-[#8a3df2] px-5 text-white hover:from-[#5f22d7] hover:to-[#7a30e6]"
          >
            <Gamepad2 aria-hidden="true" className="size-5" />
            Desafiar {selectedColega?.name ?? "colega"}
          </Button>
        </article>

        <article className="rounded-[18px] border border-[#e3d9f8] bg-white p-5 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#101044]">
                Convites e partidas
              </h2>
              <p className="text-sm font-medium text-[#5d5a89]">
                Acompanhe desafios recebidos e em andamento.
              </p>
            </div>
            {desafiosQuery.isFetching && (
              <span className="text-xs font-bold text-[#6d2ee8]">
                Atualizando
              </span>
            )}
          </div>

          <div className="mt-5 grid gap-3">
            {desafiosQuery.isPending &&
              [1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-24 rounded-[12px]" />
              ))}

            {!desafiosQuery.isPending && desafios.length === 0 && (
              <div className="rounded-[14px] border border-dashed border-[#d9cdf8] bg-[#fbf8ff] p-6 text-center">
                <Swords className="mx-auto mb-3 size-9 text-[#6d2ee8]" />
                <p className="font-black text-[#101044]">
                  Nenhum desafio ainda
                </p>
                <p className="mt-1 text-sm font-medium text-[#5d5a89]">
                  Crie uma partida para comecar a competir com sua turma.
                </p>
              </div>
            )}

            {desafios.map((desafio) => (
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
      <p className="mt-3 text-2xl font-black text-[#101044]">{value}</p>
      <p className="text-sm font-semibold text-[#5d5a89]">{label}</p>
    </div>
  );
}

function FormSelect({
  disabled = false,
  emptyLabel,
  label,
  onChange,
  options,
  placeholder,
  value,
}: {
  disabled?: boolean;
  emptyLabel?: string;
  label: string;
  onChange: (value: string) => void;
  options: Array<{ value: number | string; label: string }>;
  placeholder?: string;
  value: number | string;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-[#101044]">
      {label}
      <select
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 rounded-[10px] border border-[#d9cdf8] bg-white px-3 font-semibold text-[#4f4b80] outline-none transition disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 focus:border-[#6d2ee8] focus:ring-2 focus:ring-[#d8c8ff]"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.length === 0 && emptyLabel && (
          <option value="" disabled>
            {emptyLabel}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
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
    <div className="grid gap-4 rounded-[14px] border border-[#e3d9f8] bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0">
        <p className="text-sm font-black text-[#6d2ee8]">
          {challenge.type === "valendo" ? "Valendo pontos" : "Amistoso"} -{" "}
          {getStatusLabel(challenge.status)}
        </p>
        <h3 className="mt-1 truncate text-lg font-black text-[#101044]">
          {opponent?.name ?? "Colega"}
        </h3>
        <p className="text-sm font-medium text-[#5d5a89]">
          {challenge.currentQuestion}/{challenge.totalQuestions} questoes
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {isIncoming && (
          <>
            <Button
              type="button"
              disabled={isAccepting}
              onClick={onAccept}
              className="min-h-10 rounded-[10px] bg-[#6d2ee8] px-4 text-white hover:bg-[#5f22d7]"
            >
              Aceitar
            </Button>
            <Button
              type="button"
              disabled={isRefusing}
              onClick={onRefuse}
              className="min-h-10 rounded-[10px] border border-[#e3d9f8] bg-white px-4 text-[#4f4b80] hover:bg-[#f6f0ff]"
            >
              Recusar
            </Button>
          </>
        )}
        {canOpen && (
          <Button
            type="button"
            onClick={onOpen}
            className="min-h-10 rounded-[10px] bg-[#f0e7ff] px-4 text-[#6d2ee8] hover:bg-[#eadfff]"
          >
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
          <p className="text-sm font-black text-[#6d2ee8]">Partida ao vivo</p>
          <h2 className="text-2xl font-black text-[#101044]">
            Contra {challenge ? getOpponent(challenge, myId)?.name : "colega"}
          </h2>
        </div>
        <Button
          type="button"
          onClick={onClose}
          className="min-h-10 rounded-[10px] border border-[#e3d9f8] bg-white px-4 text-[#4f4b80] hover:bg-[#f6f0ff]"
        >
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
        <span className="rounded-full bg-[#f0e7ff] px-3 py-1 text-sm font-black text-[#6d2ee8]">
          Questao {state.order}/{state.total}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#fff4d6] px-3 py-1 text-sm font-black text-[#8f5c00]">
          <Clock aria-hidden="true" className="size-4" />
          {Math.max(secondsLeft, 0)}s
        </span>
      </div>

      <p className="mt-4 text-xs font-black uppercase text-[#6d2ee8]">
        {getDifficultyLabel(state.question.difficulty)}
      </p>
      <h3 className="mt-2 text-xl font-black text-[#101044]">
        {state.question.statement}
      </h3>

      <div className="mt-5 grid gap-3">
        {state.question.alternatives.map((alternative) => {
          const isSelected = selectedAlternativeId === alternative.id;

          return (
            <button
              key={alternative.id}
              type="button"
              disabled={state.answeredByMe || isAnswering}
              onClick={() => onSelectAlternative(alternative.id)}
              className={`flex min-h-14 items-center gap-3 rounded-[12px] border px-4 text-left font-semibold transition ${
                isSelected
                  ? "border-[#6d2ee8] bg-[#f0e7ff] text-[#5e18e6]"
                  : "border-[#e3d9f8] bg-white text-[#101044] hover:bg-[#fbf8ff]"
              }`}
            >
              <Circle aria-hidden="true" className="size-5 shrink-0" />
              {alternative.text}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-[#5d5a89]">
          {state.answeredByMe
            ? "Voce ja respondeu. Aguardando o colega..."
            : state.answeredByOpponent
              ? "Seu colega ja respondeu."
              : "Os dois respondem a mesma questao."}
        </p>
        <Button
          type="button"
          disabled={
            !selectedAlternativeId || Boolean(state.answeredByMe) || isAnswering
          }
          onClick={onAnswer}
          className="min-h-11 rounded-[10px] bg-[#6d2ee8] px-5 text-white hover:bg-[#5f22d7]"
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
      ? "Voce venceu!"
      : "Vitoria do colega";

  return (
    <div className="mt-6 rounded-[16px] bg-[#fbf8ff] p-5">
      <div className="flex items-center gap-3">
        {state.winnerId === myId || state.draw ? (
          <CheckCircle2 className="size-7 text-emerald-600" />
        ) : (
          <XCircle className="size-7 text-amber-600" />
        )}
        <h3 className="text-2xl font-black text-[#101044]">{resultLabel}</h3>
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
      <p className="font-black text-[#101044]">{name}</p>
      <p className="mt-2 text-sm font-semibold text-[#5d5a89]">
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
