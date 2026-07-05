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
  const [selectedQuestionId, setSelectedQuestionId] = useState("");

  const sessionsQuery = useQuery({
    queryKey: ["professor", "sessoes-ao-vivo"],
    queryFn: gamificationApi.professorSessoesAoVivo,
    refetchInterval: 8000,
  });
  const questionsQuery = useQuery({
    queryKey: ["professor", "questoes"],
    queryFn: gamificationApi.professorQuestoes,
  });
  const turmasQuery = useQuery({
    queryKey: ["professor", "turmas"],
    queryFn: gamificationApi.professorTurmas,
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
        title: title.trim(),
      }),
    onSuccess: (state) => {
      setSessionState(state);
      setTitle("");
      setTurmaId("");
    },
  });

  const actionMutation = useMutation({
    mutationFn: async (action: "start" | "pause" | "resume" | "finish") => {
      if (!sessionId) throw new Error("Selecione uma sessão.");

      if (action === "start")
        return gamificationApi.iniciarSessaoAoVivo(sessionId);
      if (action === "pause")
        return gamificationApi.pausarSessaoAoVivo(sessionId);
      if (action === "resume")
        return gamificationApi.retomarSessaoAoVivo(sessionId);
      if (action === "finish")
        return gamificationApi.encerrarSessaoAoVivo(sessionId);

      throw new Error("Ação inválida.");
    },
    onSuccess: setSessionState,
  });

  const sendQuestionMutation = useMutation({
    mutationFn: () => {
      if (!sessionId || !selectedQuestionId) {
        throw new Error("Selecione uma questão.");
      }

      return gamificationApi.enviarQuestaoSessaoAoVivo(
        sessionId,
        Number(selectedQuestionId),
      );
    },
    onSuccess: (state) => {
      setSelectedQuestionId("");
      setSessionState(state);
    },
  });

  const state = stateQuery.data;
  const currentQuestion = state?.currentQuestion;
  const performance = state?.performance;
  const questionOptions = useMemo(() => {
    const usedQuestionIds = new Set(state?.session.questionIds ?? []);

    return (questionsQuery.data ?? [])
      .filter((question) => !usedQuestionIds.has(question.id))
      .map((question) => ({
        label: `${question.id} - ${question.statement}`,
        value: String(question.id),
      }));
  }, [questionsQuery.data, state?.session.questionIds]);
  const sessionOptions = useMemo(
    () =>
      sessions.map((session) => ({
        label: `${session.title ?? "Sessão"} - ${session.turma?.name ?? `Turma ${session.turma?.id ?? ""}`} (${getStatusLabel(session.status)})`,
        value: String(session.id),
      })),
    [sessions],
  );
  const turmaOptions = useMemo(() => {
    return (
      turmasQuery.data?.map((turma) => ({
        label: turma.name,
        value: String(turma.id),
      })) ?? []
    );
  }, [turmasQuery.data]);

  const canCreate = title.trim().length > 0 && Number(turmaId) > 0;
  const canSelectQuestion =
    state?.session.status === "em_andamento" &&
    (performance?.participants ?? 0) > 0 &&
    (!currentQuestion || performance?.currentQuestion.pending === 0);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold text-brand-primary">
          Sessões ao vivo
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
                Nova sessão
              </h2>
            </div>

            <div className="mt-5 space-y-4">
              <Input
                label="Título"
                placeholder="Aula de revisao"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              {turmasQuery.isPending ? (
                <Skeleton className="h-11" />
              ) : turmasQuery.isSuccess && turmaOptions.length > 0 ? (
                <Select
                  label="Turma"
                  value={turmaId}
                  onChange={setTurmaId}
                  options={turmaOptions}
                  placeholder="Selecione uma turma"
                />
              ) : turmasQuery.isSuccess ? (
                <p className="rounded-system border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-text-secondary">
                  Nenhuma turma vinculada ao seu usuário.
                </p>
              ) : null}
              {turmasQuery.isError && <ErrorNotice error={turmasQuery.error} />}
              <Button
                disabled={!canCreate || createMutation.isPending}
                onClick={() => createMutation.mutate()}
                className="min-h-11 w-full bg-brand-primary px-4 text-white hover:bg-brand-primary-hover"
              >
                Criar sessão
              </Button>
              {createMutation.isError && (
                <ErrorNotice error={createMutation.error} />
              )}
            </div>
          </div>

          <div className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <h2 className="text-lg font-bold text-text-primary">
              Sessões recentes
            </h2>
            <div className="mt-4">
              {sessionsQuery.isPending && <Skeleton className="h-11" />}
              {sessionOptions.length > 0 && (
                <Select
                  value={sessionId ? String(sessionId) : ""}
                  onChange={(value) => setSelectedSessionId(Number(value))}
                  options={sessionOptions}
                  placeholder="Selecione uma sessão"
                />
              )}
              {!sessionsQuery.isPending && sessionOptions.length === 0 && (
                <p className="text-sm text-text-secondary">
                  Nenhuma sessão criada ainda.
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
              <p className="font-bold text-text-primary">
                Crie uma sessão para começar.
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
                    {state.session.title ?? "Sessão ao vivo"}
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    {state.session.turma?.name ?? "Turma"} -{" "}
                    {state.session.totalQuestions} questões
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

              {state.session.status === "aguardando" && (
                <div className="rounded-system border border-brand-primary/20 bg-brand-primary-soft p-4">
                  <p className="font-bold text-text-primary">
                    Aguardando o início da sessão
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Os alunos podem entrar agora. Quando estiver tudo pronto,
                    inicie a sessão para selecionar a primeira questão.
                  </p>
                </div>
              )}

              {state.session.status === "em_andamento" &&
                (performance?.participants ?? 0) === 0 && (
                  <div className="rounded-system border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    Aguardando pelo menos um aluno entrar para liberar a
                    primeira questão.
                  </div>
                )}

              {canSelectQuestion && (
                <div className="rounded-system border border-brand-primary/20 bg-brand-primary-soft p-5">
                  <h3 className="font-bold text-text-primary">
                    {currentQuestion
                      ? "Selecionar próxima questão"
                      : "Selecionar primeira questão"}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    A questão será enviada aos estudantes imediatamente.
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                    <Select
                      searchable
                      className="flex-1"
                      label="Questão"
                      value={selectedQuestionId}
                      onChange={setSelectedQuestionId}
                      options={questionOptions}
                      placeholder={
                        questionsQuery.isPending
                          ? "Carregando questões..."
                          : "Selecione uma questão"
                      }
                      disabled={
                        questionsQuery.isPending ||
                        sendQuestionMutation.isPending ||
                        questionOptions.length === 0
                      }
                      emptyMessage="Nenhuma questão disponível."
                    />
                    <Button
                      disabled={
                        !selectedQuestionId || sendQuestionMutation.isPending
                      }
                      onClick={() => sendQuestionMutation.mutate()}
                      className="min-h-11 bg-brand-primary px-4 text-white hover:bg-brand-primary-hover"
                    >
                      <Send className="size-4" />
                      Enviar questão
                    </Button>
                  </div>
                  {questionOptions.length === 0 &&
                    !questionsQuery.isPending && (
                      <p className="mt-3 text-sm text-text-secondary">
                        Todas as questões disponíveis já foram utilizadas.
                      </p>
                    )}
                  {sendQuestionMutation.isError && (
                    <div className="mt-3">
                      <ErrorNotice error={sendQuestionMutation.error} />
                    </div>
                  )}
                </div>
              )}

              {state.session.status === "em_andamento" &&
                currentQuestion &&
                (performance?.currentQuestion.pending ?? 0) > 0 && (
                  <div className="rounded-system border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    Aguardando {performance?.currentQuestion.pending ?? 0}{" "}
                    aluno(s) responder(em) antes da próxima questão.
                  </div>
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
                  Questão atual
                </h3>
                {currentQuestion ? (
                  <div className="mt-3">
                    <p className="text-xs font-bold uppercase text-brand-primary">
                      Questão {currentQuestion.order} -{" "}
                      {currentQuestion.question.points} pontos
                    </p>
                    <p className="mt-2 text-xl font-bold text-text-primary">
                      {currentQuestion.question.statement}
                    </p>
                    <div className="mt-4 grid gap-2">
                      {currentQuestion.question.alternatives.map(
                        (alternative) => (
                          <div
                            key={alternative.id}
                            className="rounded-system border border-slate-200 px-4 py-3 text-sm font-bold"
                          >
                            {alternative.text}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-text-secondary">
                    Nenhuma questão enviada ainda.
                  </p>
                )}
              </div>

              <div className="overflow-x-auto rounded-system border border-slate-200">
                <div className="grid min-w-[580px] grid-cols-[64px_1fr_100px_100px_100px] bg-slate-50 px-4 py-3 text-sm font-bold text-text-secondary">
                  <span>#</span>
                  <span>Aluno</span>
                  <span>Respostas</span>
                  <span>Acertos</span>
                  <span>Pontos</span>
                </div>
                {performance?.ranking.map((item) => (
                  <div
                    key={item.aluno.id}
                    className="grid min-w-[580px] grid-cols-[64px_1fr_100px_100px_100px] border-slate-200 border-t px-4 py-3 text-sm"
                  >
                    <span className="font-bold">{item.position}</span>
                    <span className="font-bold">{item.aluno.name}</span>
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
      <p className="text-sm font-bold text-text-secondary">{label}</p>
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
