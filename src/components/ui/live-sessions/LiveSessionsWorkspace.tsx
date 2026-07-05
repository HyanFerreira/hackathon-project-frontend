"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Pause,
  Play,
  Radio,
  Send,
  Square,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/buttons";
import { Input } from "@/components/form/Input";
import { Select } from "@/components/form/Select";
import { Skeleton } from "@/components/loading";
import { getApiErrorMessage } from "@/services/api/errors/getApiErrorMessage";
import { gamificationApi } from "@/services/api/modules/gamification";
import type {
  SessaoAoVivoProfessorEstado,
  SessaoAoVivoResumo,
} from "@/types/aluno";

const ACTIVE_STATUSES = ["aguardando", "em_andamento", "pausada"];

function getStatusLabel(status: SessaoAoVivoResumo["status"]) {
  const labels = {
    aguardando: "Aguardando",
    em_andamento: "Em andamento",
    pausada: "Pausada",
    finalizada: "Finalizada",
    cancelada: "Cancelada",
  };

  return labels[status] ?? status;
}

export function LiveSessionsWorkspace() {
  const queryClient = useQueryClient();
  const [selectedSessionId, setSelectedSessionId] = useState<number>();
  const [title, setTitle] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  const sessionsQuery = useQuery({
    queryKey: ["professor", "sessoes-ao-vivo"],
    queryFn: gamificationApi.professorSessoesAoVivo,
    refetchInterval: 8000,
  });
  const questionsQuery = useQuery({
    queryKey: ["professor", "questoes"],
    queryFn: gamificationApi.professorQuestoes,
  });

  const sessions = sessionsQuery.data ?? [];
  const activeSession =
    sessions.find((session) => ACTIVE_STATUSES.includes(session.status)) ??
    sessions[0];
  const sessionId = selectedSessionId ?? activeSession?.id;

  useEffect(() => {
    if (!selectedSessionId && activeSession?.id) {
      setSelectedSessionId(activeSession.id);
    }
  }, [activeSession?.id, selectedSessionId]);

  const stateQuery = useQuery({
    queryKey: ["professor", "sessoes-ao-vivo", sessionId],
    queryFn: () => gamificationApi.professorSessaoAoVivo(Number(sessionId)),
    enabled: Boolean(sessionId),
    refetchInterval: 2500,
  });

  const setSessionState = (state: SessaoAoVivoProfessorEstado) => {
    queryClient.setQueryData(
      ["professor", "sessoes-ao-vivo", state.session.id],
      state,
    );
    setSelectedSessionId(state.session.id);
    void queryClient.invalidateQueries({
      queryKey: ["professor", "sessoes-ao-vivo"],
    });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      gamificationApi.criarSessaoAoVivo({
        turmaId: Number(turmaId),
        title: title.trim() || undefined,
        questionIds: selectedQuestionIds.map(Number),
      }),
    onSuccess: (state) => {
      setSessionState(state);
      setTitle("");
      setTurmaId("");
      setSelectedQuestionIds([]);
    },
  });

  const actionMutation = useMutation({
    mutationFn: async (
      action: "start" | "pause" | "resume" | "finish" | "next",
    ) => {
      if (!sessionId) throw new Error("Selecione uma sessao.");

      if (action === "start")
        return gamificationApi.iniciarSessaoAoVivo(sessionId);
      if (action === "pause")
        return gamificationApi.pausarSessaoAoVivo(sessionId);
      if (action === "resume")
        return gamificationApi.retomarSessaoAoVivo(sessionId);
      if (action === "finish")
        return gamificationApi.encerrarSessaoAoVivo(sessionId);

      return gamificationApi.proximaQuestaoSessaoAoVivo(sessionId);
    },
    onSuccess: setSessionState,
  });

  const questionOptions = useMemo(
    () =>
      (questionsQuery.data ?? []).map((question) => ({
        label: `${question.id} - ${question.statement}`,
        value: String(question.id),
      })),
    [questionsQuery.data],
  );
  const sessionOptions = useMemo(
    () =>
      sessions.map((session) => ({
        label: `${session.title ?? "Sessao"} - ${session.turma?.name ?? `Turma ${session.turma?.id ?? ""}`} (${getStatusLabel(session.status)})`,
        value: String(session.id),
      })),
    [sessions],
  );
  const turmaOptions = useMemo(() => {
    const turmas = new Map<string, string>();

    for (const session of sessions) {
      if (session.turma?.id) {
        turmas.set(
          String(session.turma.id),
          session.turma.name ?? `Turma ${session.turma.id}`,
        );
      }
    }

    return Array.from(turmas.entries()).map(([value, label]) => ({
      label,
      value,
    }));
  }, [sessions]);

  const state = stateQuery.data;
  const currentQuestion = state?.currentQuestion;
  const performance = state?.performance;
  const canCreate = Number(turmaId) > 0 && selectedQuestionIds.length > 0;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold text-brand-primary">
          Sessoes ao vivo
        </h1>
        <p className="mt-1 text-base text-text-secondary">
          Inicie uma atividade em tempo real e acompanhe as respostas da turma.
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <div className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <Radio className="size-5 text-brand-primary" />
              <h2 className="text-lg font-bold text-text-primary">
                Nova sessao
              </h2>
            </div>

            <div className="mt-5 space-y-4">
              <Input
                label="Titulo"
                placeholder="Aula de revisao"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              {turmaOptions.length > 0 ? (
                <Select
                  label="Turma"
                  value={turmaId}
                  onChange={setTurmaId}
                  options={turmaOptions}
                  placeholder="Selecione uma turma"
                />
              ) : (
                <Input
                  label="ID da turma"
                  inputMode="numeric"
                  placeholder="Ex.: 1"
                  value={turmaId}
                  onChange={(event) => setTurmaId(event.target.value)}
                />
              )}
              <Select
                multiple
                searchable
                label="Questoes"
                value={selectedQuestionIds}
                onChange={setSelectedQuestionIds}
                options={questionOptions}
                placeholder="Selecione as questoes"
              />
              <Button
                disabled={!canCreate || createMutation.isPending}
                onClick={() => createMutation.mutate()}
                className="min-h-11 w-full bg-brand-primary px-4 text-white hover:bg-brand-primary-hover"
              >
                Criar sessao
              </Button>
              {createMutation.isError && (
                <ErrorNotice error={createMutation.error} />
              )}
            </div>
          </div>

          <div className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <h2 className="text-lg font-bold text-text-primary">
              Sessoes recentes
            </h2>
            <div className="mt-4">
              {sessionsQuery.isPending && <Skeleton className="h-11" />}
              {sessionOptions.length > 0 && (
                <Select
                  value={sessionId ? String(sessionId) : ""}
                  onChange={(value) => setSelectedSessionId(Number(value))}
                  options={sessionOptions}
                  placeholder="Selecione uma sessao"
                />
              )}
              {!sessionsQuery.isPending && sessionOptions.length === 0 && (
                <p className="text-sm text-text-secondary">
                  Nenhuma sessao criada ainda.
                </p>
              )}
            </div>
          </div>
        </aside>

        <section className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          {stateQuery.isPending && sessionId && (
            <div>
              <Skeleton className="h-7 w-64" />
              <Skeleton className="mt-5 h-24" />
              <Skeleton className="mt-5 h-56" />
            </div>
          )}

          {!sessionId && (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <Radio className="mb-3 size-12 text-brand-primary" />
              <p className="font-semibold text-text-primary">
                Crie uma sessao para comecar.
              </p>
            </div>
          )}

          {state && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase text-brand-primary">
                    {getStatusLabel(state.session.status)}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-text-primary">
                    {state.session.title ?? "Sessao ao vivo"}
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    {state.session.turma?.name ?? "Turma"} -{" "}
                    {state.session.totalQuestions} questoes
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(state.session.status === "aguardando" ||
                    state.session.status === "pausada") && (
                    <Button
                      disabled={actionMutation.isPending}
                      onClick={() =>
                        actionMutation.mutate(
                          state.session.status === "pausada"
                            ? "resume"
                            : "start",
                        )
                      }
                      className="min-h-10 bg-brand-primary px-4 text-white hover:bg-brand-primary-hover"
                    >
                      <Play className="size-4" />
                      {state.session.status === "pausada"
                        ? "Retomar"
                        : "Iniciar"}
                    </Button>
                  )}
                  {state.session.status === "em_andamento" && (
                    <Button
                      disabled={actionMutation.isPending}
                      onClick={() => actionMutation.mutate("pause")}
                      className="min-h-10 border border-slate-200 bg-white px-4 text-text-primary hover:bg-slate-50"
                    >
                      <Pause className="size-4" />
                      Pausar
                    </Button>
                  )}
                  {state.session.status === "em_andamento" && (
                    <Button
                      disabled={actionMutation.isPending}
                      onClick={() => actionMutation.mutate("next")}
                      className="min-h-10 bg-brand-primary px-4 text-white hover:bg-brand-primary-hover"
                    >
                      <Send className="size-4" />
                      Proxima questao
                    </Button>
                  )}
                  {ACTIVE_STATUSES.includes(state.session.status) && (
                    <Button
                      disabled={actionMutation.isPending}
                      onClick={() => actionMutation.mutate("finish")}
                      className="min-h-10 bg-red-600 px-4 text-white hover:bg-red-700"
                    >
                      <Square className="size-4" />
                      Encerrar
                    </Button>
                  )}
                </div>
              </div>

              {actionMutation.isError && (
                <ErrorNotice error={actionMutation.error} />
              )}

              <div className="grid gap-4 sm:grid-cols-4">
                <MetricCard
                  label="Alunos"
                  value={performance?.totalStudents ?? 0}
                  icon={Users}
                />
                <MetricCard
                  label="Participantes"
                  value={performance?.participants ?? 0}
                  icon={CheckCircle2}
                />
                <MetricCard
                  label="Responderam"
                  value={performance?.currentQuestion.answered ?? 0}
                  icon={Radio}
                />
                <MetricCard
                  label="Acertos"
                  value={performance?.currentQuestion.correct ?? 0}
                  icon={CheckCircle2}
                />
              </div>

              <div className="rounded-system border border-slate-200 p-5">
                <h3 className="text-lg font-bold text-text-primary">
                  Questao atual
                </h3>
                {currentQuestion ? (
                  <div className="mt-3">
                    <p className="text-xs font-bold uppercase text-brand-primary">
                      Questao {currentQuestion.order} -{" "}
                      {currentQuestion.question.points} pontos
                    </p>
                    <p className="mt-2 text-xl font-semibold text-text-primary">
                      {currentQuestion.question.statement}
                    </p>
                    <div className="mt-4 grid gap-2">
                      {currentQuestion.question.alternatives.map(
                        (alternative) => (
                          <div
                            key={alternative.id}
                            className="rounded-system border border-slate-200 px-4 py-3 text-sm font-semibold"
                          >
                            {alternative.text}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-text-secondary">
                    Nenhuma questao enviada ainda.
                  </p>
                )}
              </div>

              <div className="overflow-hidden rounded-system border border-slate-200">
                <div className="grid grid-cols-[64px_1fr_100px_100px_100px] bg-slate-50 px-4 py-3 text-sm font-bold text-text-secondary">
                  <span>#</span>
                  <span>Aluno</span>
                  <span>Respostas</span>
                  <span>Acertos</span>
                  <span>Pontos</span>
                </div>
                {performance?.ranking.map((item) => (
                  <div
                    key={item.aluno.id}
                    className="grid grid-cols-[64px_1fr_100px_100px_100px] border-slate-200 border-t px-4 py-3 text-sm"
                  >
                    <span className="font-bold">{item.position}</span>
                    <span className="font-semibold">{item.aluno.name}</span>
                    <span>{item.answers}</span>
                    <span>{item.correct}</span>
                    <span className="font-bold">{item.points}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-system border border-slate-200 bg-slate-50 p-4">
      <Icon className="size-5 text-brand-primary" />
      <p className="mt-3 text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-sm font-semibold text-text-secondary">{label}</p>
    </div>
  );
}

function ErrorNotice({ error }: { error: unknown }) {
  return (
    <div
      role="alert"
      className="flex gap-3 rounded-system border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      <AlertCircle className="mt-0.5 size-5 shrink-0" />
      <p>{getApiErrorMessage(error)}</p>
    </div>
  );
}
