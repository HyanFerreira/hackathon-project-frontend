"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Radio,
  Trophy,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/buttons";
import { Skeleton } from "@/components/loading";
import { getApiErrorMessage } from "@/services/api/errors/getApiErrorMessage";
import { gamificationApi } from "@/services/api/modules/gamification";
import type { SessaoAoVivoAlunoEstado } from "@/types/aluno";

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

  if (activeQuery.isPending) {
    return (
      <section className="mx-auto w-full max-w-5xl rounded-[18px] border border-[#e3d9f8] bg-white p-7 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-5 h-10 w-4/5" />
        <div className="mt-6 grid gap-3">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      </section>
    );
  }

  if (activeQuery.data && !enteredSessionId) {
    const session = activeQuery.data.session;

    return (
      <section className="mx-auto flex min-h-[420px] w-full max-w-3xl flex-col items-center justify-center rounded-[18px] border border-[#d7c9f5] bg-white p-8 text-center shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
        <div className="flex size-16 items-center justify-center rounded-full bg-[#f1e8ff]">
          <Radio className="size-8 text-[#7c35e8]" />
        </div>
        <p className="mt-5 text-sm font-black uppercase text-[#7c35e8]">
          Sessão ao vivo disponível
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#101044]">
          {session.title ?? "Sessão ao vivo"}
        </h1>
        <p className="mt-2 font-semibold text-[#5d5a89]">
          {session.turma?.name ?? "Sua turma"} com{" "}
          {session.professor?.name ?? "seu professor"}
        </p>
        <Button
          disabled={enterMutation.isPending}
          onClick={() => enterMutation.mutate(session.id)}
          className="mt-7 min-h-12 bg-[#7c35e8] px-8 text-white hover:bg-[#6827cf]"
        >
          {enterMutation.isPending ? "Entrando..." : "Entrar na sessão"}
        </Button>
        {enterMutation.isError && (
          <div
            role="alert"
            className="mt-5 flex gap-3 rounded-[12px] border border-red-200 bg-red-50 p-4 text-left text-red-700"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <p>{getApiErrorMessage(enterMutation.error)}</p>
          </div>
        )}
      </section>
    );
  }

  if (!estado) {
    return (
      <section className="mx-auto flex min-h-[420px] w-full max-w-3xl flex-col items-center justify-center rounded-[18px] border border-dashed border-[#d7c9f5] bg-white p-8 text-center">
        <Radio className="mb-4 size-12 text-[#7c35e8]" />
        <h1 className="text-2xl font-black text-[#101044]">
          Nenhuma sessao ao vivo agora
        </h1>
        <p className="mt-2 text-sm font-semibold text-[#5d5a89]">
          Quando seu professor iniciar uma sessao, ela aparece aqui.
        </p>
      </section>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-[18px] border border-[#e3d9f8] bg-white p-6 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase text-[#7c35e8]">
              {getStatusLabel(estado.session.status)}
            </p>
            <h1 className="mt-1 text-3xl font-black text-[#101044]">
              {estado.session.title ?? "Sessao ao vivo"}
            </h1>
            <p className="mt-1 font-semibold text-[#5d5a89]">
              {estado.session.turma?.name ?? "Turma"} com{" "}
              {estado.session.professor?.name ?? "professor"}
            </p>
          </div>
          <span className="rounded-full bg-[#f1e8ff] px-4 py-2 text-sm font-black text-[#7c35e8]">
            Questao {currentQuestion?.order ?? 0}/
            {estado.session.totalQuestions}
          </span>
        </div>

        {estado.session.status === "aguardando" && (
          <div className="mt-8 rounded-[14px] border border-[#e3d9f8] bg-[#fbf7ff] p-5 text-center font-semibold text-[#5d5a89]">
            Voce ja entrou. Aguarde o professor enviar a primeira questao.
          </div>
        )}

        {estado.session.status === "pausada" && (
          <div className="mt-8 rounded-[14px] border border-amber-200 bg-amber-50 p-5 text-center font-semibold text-amber-800">
            A sessao esta pausada pelo professor.
          </div>
        )}

        {estado.session.status === "finalizada" && (
          <div className="mt-8 rounded-[14px] border border-emerald-200 bg-emerald-50 p-5 text-center font-semibold text-emerald-800">
            Sessao finalizada. Obrigado por participar!
          </div>
        )}

        {currentQuestion && estado.session.status === "em_andamento" && (
          <article className="mt-7">
            <p className="text-xs font-black uppercase text-[#7c35e8]">
              {currentQuestion.question.difficulty} -{" "}
              {currentQuestion.question.points} pontos
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#101044]">
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
                  <button
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
                    className={`flex min-h-14 items-center gap-3 rounded-[12px] border px-4 py-3 text-left font-semibold transition ${
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
                  </button>
                );
              })}
            </div>

            {answeredByMe && estado.myAnswer && (
              <div
                role="status"
                className={`mt-5 rounded-[12px] border p-4 font-semibold ${
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
                className="min-h-12 bg-[#7c35e8] px-6 text-white hover:bg-[#6827cf]"
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
          <h2 className="text-xl font-black">Placar ao vivo</h2>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <LiveMetric
            label="Entraram"
            value={podium.length ? estado.ranking.length : 0}
          />
          <LiveMetric
            label="Respostas"
            value={estado.ranking.reduce((sum, item) => sum + item.answers, 0)}
          />
          <LiveMetric
            label="Acertos"
            value={estado.ranking.reduce((sum, item) => sum + item.correct, 0)}
          />
        </div>
        <div className="mt-5 overflow-hidden rounded-[12px] border border-[#e3d9f8]">
          {podium.length === 0 && (
            <p className="px-4 py-6 text-sm font-semibold text-[#5d5a89]">
              O ranking aparece quando as respostas chegarem.
            </p>
          )}
          {podium.map((item) => (
            <div
              key={item.aluno.id}
              className="grid grid-cols-[36px_1fr_auto] items-center gap-3 border-[#e3d9f8] border-b px-4 py-3 last:border-b-0"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-[#f1e8ff] text-sm font-black text-[#7c35e8]">
                {item.position}
              </span>
              <div className="min-w-0">
                <p className="truncate font-black">{item.aluno.name}</p>
                <p className="text-xs font-semibold text-[#5d5a89]">
                  {item.correct}/{item.answers} acertos
                </p>
              </div>
              <span className="font-black">{item.points}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function LiveMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[12px] border border-[#e3d9f8] bg-[#fbf7ff] p-3 text-center">
      <p className="text-xl font-black text-[#101044]">{value}</p>
      <p className="text-xs font-semibold text-[#5d5a89]">{label}</p>
    </div>
  );
}
