"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/buttons";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Input } from "@/components/form/Input";
import { Select } from "@/components/form/Select";
import { TableSkeleton } from "@/components/loading";
import { Modal } from "@/components/modal";
import { getApiErrorMessage } from "@/services/api/errors/getApiErrorMessage";
import { gamificationApi } from "@/services/api/modules/gamification";
import type { Questao } from "@/types/pedagogico";

type FormState = {
  statement: string;
  difficulty: string;
  points: string;
  status: string;
  habilidades: string[];
  alternatives: Array<{ key: string; text: string; correct: boolean }>;
};

const EMPTY_FORM: FormState = {
  statement: "",
  difficulty: "facil",
  points: "10",
  status: "ativa",
  habilidades: [],
  alternatives: [
    { key: "a", text: "", correct: true },
    { key: "b", text: "", correct: false },
    { key: "c", text: "", correct: false },
    { key: "d", text: "", correct: false },
  ],
};

const DIFFICULTY_OPTIONS = [
  { label: "Fácil", value: "facil" },
  { label: "Média", value: "media" },
  { label: "Difícil", value: "dificil" },
];

const STATUS_OPTIONS = [
  { label: "Ativa", value: "ativa" },
  { label: "Inativa", value: "inativa" },
];

export function QuestionsWorkspace() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Questao>();
  const [questionToDelete, setQuestionToDelete] = useState<Questao>();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string>();

  const questionsQuery = useQuery({
    queryKey: ["professor", "questoes"],
    queryFn: gamificationApi.professorQuestoes,
  });

  const habilidadesQuery = useQuery({
    queryKey: ["habilidades"],
    queryFn: () => gamificationApi.habilidades(),
    enabled: isFormOpen,
  });

  const habilidadeOptions = useMemo(
    () =>
      habilidadesQuery.data?.map((habilidade) => ({
        label: `${habilidade.code} - ${habilidade.description}`,
        value: String(habilidade.id),
      })) ?? [],
    [habilidadesQuery.data],
  );

  useEffect(() => {
    if (!isFormOpen) return;

    setError(undefined);
    setForm({
      statement: editingQuestion?.statement ?? "",
      difficulty: editingQuestion?.difficulty ?? "facil",
      points: String(editingQuestion?.points ?? 10),
      status: editingQuestion?.status ?? "ativa",
      habilidades:
        editingQuestion?.habilidades?.map((habilidade) =>
          String(habilidade.id),
        ) ?? [],
      alternatives:
        editingQuestion?.alternatives?.map((alternative, index) => ({
          key: alternative.id ? String(alternative.id) : `alternative-${index}`,
          text: alternative.text,
          correct: Boolean(alternative.correct),
        })) ?? EMPTY_FORM.alternatives,
    });
  }, [editingQuestion, isFormOpen]);

  const saveMutation = useMutation({
    mutationFn: () =>
      gamificationApi.saveQuestao(
        {
          enunciado: form.statement,
          dificuldade: form.difficulty,
          pontos: Number(form.points) || 1,
          status: form.status,
          habilidades: form.habilidades.map(Number),
          alternativas: form.alternatives
            .filter((alternative) => alternative.text.trim())
            .map((alternative) => ({
              texto: alternative.text,
              correta: alternative.correct,
            })),
        },
        editingQuestion?.id,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["professor", "questoes"],
      });
      setIsFormOpen(false);
    },
    onError: (requestError) => setError(getApiErrorMessage(requestError)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => gamificationApi.removeQuestao(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["professor", "questoes"],
      });
      setQuestionToDelete(undefined);
    },
  });

  function setCorrectAlternative(index: number) {
    setForm((current) => ({
      ...current,
      alternatives: current.alternatives.map((alternative, currentIndex) => ({
        ...alternative,
        correct: currentIndex === index,
      })),
    }));
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Questões</h1>
          <p className="mt-1 text-base text-text-secondary">
            Crie questões por habilidade BNCC com uma alternativa correta.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditingQuestion(undefined);
            setIsFormOpen(true);
          }}
          className="min-h-11 self-start bg-brand-primary px-5 py-3 text-white hover:bg-brand-primary-hover"
        >
          <Plus aria-hidden="true" className="size-5" />
          Nova questão
        </Button>
      </section>

      <section className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        {questionsQuery.isPending && <TableSkeleton rows={5} columns={5} />}

        {questionsQuery.isError && (
          <div
            role="alert"
            className="flex gap-3 rounded-system border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <p>{getApiErrorMessage(questionsQuery.error)}</p>
          </div>
        )}

        {questionsQuery.data && questionsQuery.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-slate-200 border-b text-xs font-bold uppercase tracking-wide text-text-secondary">
                  <th className="px-3 py-3">Enunciado</th>
                  <th className="px-3 py-3">Dificuldade</th>
                  <th className="px-3 py-3">Pontos</th>
                  <th className="px-3 py-3 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {questionsQuery.data.map((question) => (
                  <tr
                    key={question.id}
                    className="border-slate-100 border-b last:border-0 hover:bg-slate-50"
                  >
                    <td className="max-w-xl px-3 py-3 font-bold text-text-primary">
                      {question.statement}
                    </td>
                    <td className="px-3 py-3 text-text-secondary">
                      {question.difficulty}
                    </td>
                    <td className="px-3 py-3 text-text-secondary">
                      {question.points}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          aria-label="Editar questão"
                          onClick={() => {
                            setEditingQuestion(question);
                            setIsFormOpen(true);
                          }}
                          className="size-9 border border-slate-200 bg-white p-0 text-brand-primary hover:bg-brand-primary-soft"
                        >
                          <Pencil aria-hidden="true" className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          aria-label="Excluir questão"
                          onClick={() => setQuestionToDelete(question)}
                          className="size-9 border border-red-200 bg-white p-0 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          questionsQuery.isSuccess && (
            <div className="rounded-system border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="font-bold text-text-primary">
                Nenhuma questão criada
              </p>
            </div>
          )
        )}
      </section>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingQuestion ? "Editar questão" : "Nova questão"}
        className="max-w-3xl"
        footer={
          <>
            <Button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="min-h-11 border border-slate-200 bg-white px-5 py-2.5 text-text-primary hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="question-form"
              disabled={saveMutation.isPending}
              className="min-h-11 bg-brand-primary px-5 py-2.5 text-white hover:bg-brand-primary-hover"
            >
              Salvar
            </Button>
          </>
        }
      >
        <form
          id="question-form"
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            saveMutation.mutate();
          }}
        >
          <Input
            label="Enunciado"
            name="statement"
            value={form.statement}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                statement: event.target.value,
              }))
            }
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Select
              label="Dificuldade"
              value={form.difficulty}
              options={DIFFICULTY_OPTIONS}
              onChange={(value) =>
                setForm((current) => ({ ...current, difficulty: value }))
              }
            />
            <Input
              label="Pontos"
              name="points"
              type="number"
              min={1}
              value={form.points}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  points: event.target.value,
                }))
              }
            />
            <Select
              label="Status"
              value={form.status}
              options={STATUS_OPTIONS}
              onChange={(value) =>
                setForm((current) => ({ ...current, status: value }))
              }
            />
          </div>
          <Select
            label="Habilidades"
            multiple
            searchable
            value={form.habilidades}
            options={habilidadeOptions}
            onChange={(value) =>
              setForm((current) => ({ ...current, habilidades: value }))
            }
          />

          <fieldset className="space-y-3">
            <legend className="text-sm font-bold text-text-primary">
              Alternativas
            </legend>
            {form.alternatives.map((alternative, index) => (
              <div key={alternative.key} className="flex items-end gap-3">
                <Input
                  className="flex-1"
                  label={`Alternativa ${index + 1}`}
                  value={alternative.text}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      alternatives: current.alternatives.map(
                        (item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, text: event.target.value }
                            : item,
                      ),
                    }))
                  }
                />
                <label className="mb-3 flex items-center gap-2 text-sm font-bold text-text-primary">
                  <input
                    type="checkbox"
                    checked={alternative.correct}
                    onChange={() => setCorrectAlternative(index)}
                  />
                  Correta
                </label>
              </div>
            ))}
          </fieldset>

          {error && (
            <div
              role="alert"
              className="rounded-system border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(questionToDelete)}
        title="Excluir questão"
        message="Tem certeza que deseja excluir esta questão?"
        confirmLabel="Excluir"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (questionToDelete) deleteMutation.mutate(questionToDelete.id);
        }}
        onClose={() => setQuestionToDelete(undefined)}
      />
    </div>
  );
}
