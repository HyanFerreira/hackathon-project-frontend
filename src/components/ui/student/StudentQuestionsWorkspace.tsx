"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Circle,
  Sparkles,
  Trophy,
  UserRound,
  XCircle,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/buttons";
import { Skeleton } from "@/components/loading";
import { getApiErrorMessage } from "@/services/api/errors/getApiErrorMessage";
import { gamificationApi } from "@/services/api/modules/gamification";
import type {
  ConquistaProgresso,
  MissaoProgresso,
  PersonagemFeedback,
} from "@/types/aluno";
import type { Questao } from "@/types/pedagogico";

type Feedback = {
  questionId: number;
  selectedAlternativeId: number;
  correct: boolean;
  correctAlternativeId?: number;
  message: string;
  answer: string;
  points: number;
  xp: number;
  conquistas: ConquistaProgresso[];
  missoes: MissaoProgresso[];
  personagem?: PersonagemFeedback | null;
};

function getDifficultyLabel(difficulty: Questao["difficulty"]) {
  const labels = {
    facil: "Facil",
    media: "Media",
    dificil: "Dificil",
  };

  return labels[difficulty] ?? difficulty;
}

export function StudentQuestionsWorkspace() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const disciplinaId = Number(searchParams.get("disciplina")) || undefined;
  const isRandomMode = searchParams.get("aleatorio") === "1";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAlternativeId, setSelectedAlternativeId] = useState<number>();
  const [feedback, setFeedback] = useState<Feedback>();

  const questionsQuery = useQuery({
    queryKey: ["aluno", "questoes", disciplinaId, isRandomMode],
    queryFn: () =>
      gamificationApi.alunoQuestoes({
        disciplinaId,
        aleatorio: isRandomMode,
        limite: isRandomMode ? 10 : undefined,
      }),
  });

  const perfilQuery = useQuery({
    queryKey: ["aluno", "perfil"],
    queryFn: gamificationApi.alunoPerfil,
  });

  const questions = questionsQuery.data ?? [];
  const currentQuestion = questions[currentIndex];
  const hasAnsweredCurrent = feedback?.questionId === currentQuestion?.id;
  const isLastQuestion = currentIndex >= questions.length - 1;
  const progressLabel = useMemo(() => {
    if (!questions.length) return "0 / 0";

    return `${currentIndex + 1} / ${questions.length}`;
  }, [currentIndex, questions.length]);

  const answerMutation = useMutation({
    mutationFn: (question: Questao) => {
      if (!selectedAlternativeId) {
        throw new Error("Selecione uma alternativa antes de responder.");
      }

      return gamificationApi.responderQuestao(
        question.id,
        selectedAlternativeId,
      );
    },
    onSuccess: (result, question) => {
      const answeredAlternativeId = selectedAlternativeId;
      const correctAlternativeId =
        result.gabarito.id ??
        question.alternatives?.find((alternative) => alternative.correct)?.id;

      if (
        answeredAlternativeId === undefined ||
        correctAlternativeId === undefined
      ) {
        throw new Error("Nao foi possivel identificar o gabarito da questao.");
      }

      setFeedback({
        questionId: question.id,
        selectedAlternativeId: answeredAlternativeId,
        correct: result.correta,
        correctAlternativeId,
        message: result.mensagem,
        answer: result.gabarito.text,
        points: result.pontos_ganhos,
        xp: result.xp_ganho,
        conquistas: result.conquistas_desbloqueadas,
        missoes: result.missoes_concluidas,
        personagem: result.personagem,
      });

      queryClient.setQueryData(["aluno", "perfil"], result.perfil);

      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard", "aluno"] }),
        queryClient.invalidateQueries({ queryKey: ["aluno", "personagens"] }),
        queryClient.invalidateQueries({ queryKey: ["aluno", "missoes"] }),
        queryClient.invalidateQueries({ queryKey: ["aluno", "conquistas"] }),
        queryClient.invalidateQueries({ queryKey: ["aluno", "respostas"] }),
      ]);
    },
  });

  function goToNextQuestion() {
    if (isLastQuestion) {
      void queryClient.invalidateQueries({ queryKey: ["aluno", "questoes"] });
      setSelectedAlternativeId(undefined);
      setFeedback(undefined);
      setCurrentIndex((current) => current + 1);
      return;
    }

    setCurrentIndex((current) => current + 1);
    setSelectedAlternativeId(undefined);
    setFeedback(undefined);
  }

  return (
    <div className="flex min-h-[calc(100vh-150px)] flex-col gap-5">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Responder</h1>
          <p className="mt-1 text-base text-text-secondary">
            Resolva uma questao por vez e avance sem voltar.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-system border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-text-primary shadow-sm">
            Questao: {progressLabel}
          </div>
          <div className="rounded-system border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-text-primary shadow-sm">
            Energia: {perfilQuery.data?.energy ?? "-"} /{" "}
            {perfilQuery.data?.maxEnergy ?? "-"}
          </div>
        </div>
      </section>

      {questionsQuery.isPending && (
        <section className="mx-auto w-full max-w-5xl rounded-system border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-5 h-8 w-4/5" />
          <div className="mt-6 grid gap-3">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        </section>
      )}

      {questionsQuery.isError && (
        <div
          role="alert"
          className="flex gap-3 rounded-system border border-red-200 bg-red-50 p-4 text-red-700"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          <p>{getApiErrorMessage(questionsQuery.error)}</p>
        </div>
      )}

      {!questionsQuery.isPending && questions.length === 0 && (
        <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center rounded-system border border-dashed border-slate-300 bg-white p-8 text-center">
          <Trophy className="mb-3 size-10 text-brand-primary" />
          <p className="font-semibold text-text-primary">
            Nenhuma questao disponivel agora
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Quando novas questoes forem publicadas, elas aparecem aqui.
          </p>
        </section>
      )}

      {currentQuestion && currentIndex < questions.length && (
        <section className="mx-auto flex w-full max-w-5xl flex-1 items-center">
          <article className="w-full rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand-primary">
                  {getDifficultyLabel(currentQuestion.difficulty)} -{" "}
                  {currentQuestion.points} pontos
                </p>
                <h2 className="mt-2 text-xl font-bold text-text-primary sm:text-2xl">
                  {currentQuestion.statement}
                </h2>
              </div>
              <span className="shrink-0 rounded-full bg-brand-primary-soft px-3 py-1 text-sm font-bold text-brand-primary">
                {progressLabel}
              </span>
            </div>

            <div className="mt-6 grid gap-3">
              {currentQuestion.alternatives?.map((alternative) => {
                const alternativeId = alternative.id;
                const isSelected = selectedAlternativeId === alternativeId;
                const isCorrect =
                  hasAnsweredCurrent &&
                  alternativeId === feedback.correctAlternativeId;
                const isWrongSelection =
                  hasAnsweredCurrent &&
                  alternativeId === feedback.selectedAlternativeId &&
                  !feedback.correct;

                return (
                  <button
                    key={alternativeId}
                    type="button"
                    disabled={hasAnsweredCurrent || answerMutation.isPending}
                    onClick={() => {
                      if (!alternativeId) return;
                      setSelectedAlternativeId(alternativeId);
                    }}
                    className={`flex min-h-14 w-full items-center gap-3 rounded-system border px-4 py-3 text-left text-sm font-semibold transition ${
                      isCorrect
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                        : isWrongSelection
                          ? "border-red-300 bg-red-50 text-red-700"
                          : isSelected
                            ? "border-brand-primary bg-brand-primary-soft text-brand-primary"
                            : "border-slate-200 bg-white text-text-primary hover:bg-slate-50"
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle2
                        aria-hidden="true"
                        className="size-5 shrink-0"
                      />
                    ) : isWrongSelection ? (
                      <XCircle aria-hidden="true" className="size-5 shrink-0" />
                    ) : (
                      <Circle aria-hidden="true" className="size-5 shrink-0" />
                    )}
                    <span>{alternative.text}</span>
                  </button>
                );
              })}
            </div>

            {hasAnsweredCurrent && feedback && (
              <div
                role="status"
                className={`mt-5 flex gap-3 rounded-system border p-4 ${
                  feedback.correct
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                }`}
              >
                {feedback.correct ? (
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                ) : (
                  <XCircle className="mt-0.5 size-5 shrink-0" />
                )}
                <div>
                  <p className="font-semibold">{feedback.message}</p>
                  <p className="mt-1 text-sm">
                    Gabarito: {feedback.answer}. +{feedback.points} pontos, +
                    {feedback.xp} XP.
                  </p>
                  {(feedback.conquistas.length > 0 ||
                    feedback.missoes.length > 0 ||
                    feedback.personagem) && (
                    <div className="mt-3 grid gap-2 text-sm">
                      {feedback.conquistas.map((conquista) => (
                        <RewardNotice
                          key={`conquista-${conquista.id}`}
                          icon={Trophy}
                          title={`Conquista: ${conquista.name}`}
                          description={`+${conquista.rewardPoints} pontos, +${conquista.rewardXp} XP`}
                        />
                      ))}
                      {feedback.missoes.map((missao) => (
                        <RewardNotice
                          key={`missao-${missao.id}`}
                          icon={Sparkles}
                          title={`Missao: ${missao.title}`}
                          description={`+${missao.rewardPoints} pontos, +${missao.rewardXp} XP`}
                        />
                      ))}
                      {feedback.personagem && (
                        <RewardNotice
                          icon={UserRound}
                          title={`${feedback.personagem.name} esta no nivel ${feedback.personagem.level}`}
                          description={
                            feedback.personagem.leveledUp
                              ? "Seu personagem evoluiu de nivel."
                              : "Progresso do personagem atualizado."
                          }
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {answerMutation.isError && !hasAnsweredCurrent && (
              <div
                role="alert"
                className="mt-5 flex gap-3 rounded-system border border-red-200 bg-red-50 p-4 text-red-700"
              >
                <AlertCircle className="mt-0.5 size-5 shrink-0" />
                <p>{getApiErrorMessage(answerMutation.error)}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              {hasAnsweredCurrent ? (
                <Button
                  type="button"
                  onClick={goToNextQuestion}
                  className="min-h-11 bg-brand-primary px-5 py-2.5 text-white hover:bg-brand-primary-hover"
                >
                  {isLastQuestion ? "Finalizar" : "Proxima questao"}
                  <ChevronRight aria-hidden="true" className="size-5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={!selectedAlternativeId || answerMutation.isPending}
                  onClick={() => answerMutation.mutate(currentQuestion)}
                  className="min-h-11 bg-brand-primary px-5 py-2.5 text-white hover:bg-brand-primary-hover"
                >
                  Responder
                </Button>
              )}
            </div>
          </article>
        </section>
      )}

      {currentIndex >= questions.length && questions.length > 0 && (
        <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center rounded-system border border-slate-200 bg-white p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <Trophy className="mb-3 size-12 text-brand-primary" />
          <h2 className="text-2xl font-bold text-text-primary">
            Sequencia finalizada
          </h2>
          <p className="mt-2 text-text-secondary">
            Voce concluiu as questoes carregadas para este desafio.
          </p>
        </section>
      )}
    </div>
  );
}

function RewardNotice({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: typeof Trophy;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-system bg-white/70 px-3 py-2">
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      <span>
        <strong>{title}</strong>
        <span className="ml-1">{description}</span>
      </span>
    </div>
  );
}
