"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Trophy, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/buttons";
import { Skeleton } from "@/components/loading";
import { getApiErrorMessage } from "@/services/api/errors/getApiErrorMessage";
import { gamificationApi } from "@/services/api/modules/gamification";
import type { Questao } from "@/types/pedagogico";

type Feedback = {
  questionId: number;
  correct: boolean;
  message: string;
  answer: string;
  points: number;
  xp: number;
};

export function StudentQuestionsWorkspace() {
  const queryClient = useQueryClient();
  const [selectedAlternatives, setSelectedAlternatives] = useState<
    Record<number, number>
  >({});
  const [feedback, setFeedback] = useState<Feedback>();

  const questionsQuery = useQuery({
    queryKey: ["aluno", "questoes"],
    queryFn: () => gamificationApi.alunoQuestoes(),
  });

  const perfilQuery = useQuery({
    queryKey: ["aluno", "perfil"],
    queryFn: gamificationApi.alunoPerfil,
  });

  const answerMutation = useMutation({
    mutationFn: (question: Questao) => {
      const alternativeId = selectedAlternatives[question.id];

      return gamificationApi.responderQuestao(question.id, alternativeId);
    },
    onSuccess: async (result, question) => {
      setFeedback({
        questionId: question.id,
        correct: result.correta,
        message: result.mensagem,
        answer: result.gabarito.text,
        points: result.pontos_ganhos,
        xp: result.xp_ganho,
      });
      await queryClient.invalidateQueries({ queryKey: ["aluno"] });
    },
  });

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Responder</h1>
          <p className="mt-1 text-base text-text-secondary">
            Resolva questoes ativas da sua escola e acompanhe sua energia.
          </p>
        </div>
        <div className="rounded-system border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-text-primary shadow-sm">
          Energia: {perfilQuery.data?.energy ?? "-"} /{" "}
          {perfilQuery.data?.maxEnergy ?? "-"}
        </div>
      </section>

      {questionsQuery.isPending && (
        <div className="grid gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
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

      {questionsQuery.data?.length === 0 && (
        <section className="rounded-system border border-dashed border-slate-300 bg-white p-8 text-center">
          <Trophy className="mx-auto mb-3 size-10 text-brand-primary" />
          <p className="font-semibold text-text-primary">
            Nenhuma questao disponivel agora
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Quando novas questoes forem publicadas, elas aparecem aqui.
          </p>
        </section>
      )}

      <section className="grid gap-4">
        {questionsQuery.data?.map((question) => (
          <article
            key={question.id}
            className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand-primary">
                  {question.difficulty} - {question.points} pontos
                </p>
                <h2 className="mt-2 text-lg font-bold text-text-primary">
                  {question.statement}
                </h2>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {question.alternatives?.map((alternative) => (
                <label
                  key={alternative.id}
                  className="flex cursor-pointer items-center gap-3 rounded-system border border-slate-200 px-4 py-3 text-sm text-text-primary hover:bg-slate-50"
                >
                  <input
                    type="radio"
                    name={`questao-${question.id}`}
                    checked={
                      selectedAlternatives[question.id] === alternative.id
                    }
                    onChange={() => {
                      if (!alternative.id) return;

                      const alternativeId = alternative.id;

                      setSelectedAlternatives((current) => ({
                        ...current,
                        [question.id]: alternativeId,
                      }));
                    }}
                  />
                  {alternative.text}
                </label>
              ))}
            </div>

            {feedback?.questionId === question.id && (
              <div
                role="status"
                className={`mt-4 flex gap-3 rounded-system border p-4 ${
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
                </div>
              </div>
            )}

            <Button
              type="button"
              disabled={
                !selectedAlternatives[question.id] || answerMutation.isPending
              }
              onClick={() => answerMutation.mutate(question)}
              className="mt-4 min-h-11 bg-brand-primary px-5 py-2.5 text-white hover:bg-brand-primary-hover"
            >
              Responder
            </Button>
          </article>
        ))}
      </section>
    </div>
  );
}
