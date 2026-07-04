"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Link2, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/buttons";
import { Select } from "@/components/form/Select";
import { TableSkeleton } from "@/components/loading";
import { gamificationApi } from "@/services/api/modules/gamification";

type Props = {
  turmaId: number;
};

export function TurmaLinksWorkspace({ turmaId }: Props) {
  const queryClient = useQueryClient();

  const turmaQuery = useQuery({
    queryKey: ["gestor", "turma", turmaId],
    queryFn: () => gamificationApi.turma(turmaId),
  });
  const professoresQuery = useQuery({
    queryKey: ["gestor", "professores"],
    queryFn: gamificationApi.professores,
  });
  const alunosQuery = useQuery({
    queryKey: ["gestor", "alunos"],
    queryFn: gamificationApi.alunos,
  });

  const invalidateTurma = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["gestor", "turma", turmaId],
    });
  };

  const linkProfessorMutation = useMutation({
    mutationFn: (professorId: number) =>
      gamificationApi.vincularProfessor(turmaId, professorId),
    onSuccess: invalidateTurma,
  });
  const unlinkProfessorMutation = useMutation({
    mutationFn: (professorId: number) =>
      gamificationApi.desvincularProfessor(turmaId, professorId),
    onSuccess: invalidateTurma,
  });
  const linkAlunoMutation = useMutation({
    mutationFn: (alunoId: number) =>
      gamificationApi.vincularAluno(turmaId, alunoId),
    onSuccess: invalidateTurma,
  });
  const unlinkAlunoMutation = useMutation({
    mutationFn: (alunoId: number) =>
      gamificationApi.desvincularAluno(turmaId, alunoId),
    onSuccess: invalidateTurma,
  });

  const linkedTeacherIds = new Set(
    turmaQuery.data?.teachers?.map((teacher) => teacher.id) ?? [],
  );
  const linkedStudentIds = new Set(
    turmaQuery.data?.students?.map((student) => student.id) ?? [],
  );

  const teacherOptions =
    professoresQuery.data
      ?.filter((teacher) => !linkedTeacherIds.has(teacher.id))
      .map((teacher) => ({ label: teacher.name, value: String(teacher.id) })) ??
    [];
  const studentOptions =
    alunosQuery.data
      ?.filter((student) => !linkedStudentIds.has(student.id))
      .map((student) => ({ label: student.name, value: String(student.id) })) ??
    [];

  return (
    <div className="space-y-6">
      <section>
        <Link
          href="/turmas"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary"
        >
          <ArrowLeft className="size-4" />
          Voltar para turmas
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-brand-primary">
          Vinculos da turma
        </h1>
        <p className="mt-1 text-base text-text-secondary">
          {turmaQuery.data?.name ?? "Carregando turma..."}
        </p>
      </section>

      {turmaQuery.isPending ? (
        <TableSkeleton rows={4} columns={3} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <h2 className="text-lg font-bold text-text-primary">Professores</h2>
            <div className="mt-4 flex gap-3">
              <Select
                className="flex-1"
                searchable
                options={teacherOptions}
                placeholder="Selecionar professor"
                onChange={(value) => {
                  if (value) linkProfessorMutation.mutate(Number(value));
                }}
                value=""
              />
            </div>
            <div className="mt-4 space-y-2">
              {turmaQuery.data?.teachers?.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex items-center justify-between rounded-system border border-slate-200 px-3 py-2"
                >
                  <span className="font-semibold text-text-primary">
                    {teacher.name}
                  </span>
                  <Button
                    type="button"
                    aria-label={`Desvincular ${teacher.name}`}
                    onClick={() => unlinkProfessorMutation.mutate(teacher.id)}
                    className="size-9 border border-red-200 bg-white p-0 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <h2 className="text-lg font-bold text-text-primary">Alunos</h2>
            <div className="mt-4 flex gap-3">
              <Select
                className="flex-1"
                searchable
                options={studentOptions}
                placeholder="Selecionar aluno"
                onChange={(value) => {
                  if (value) linkAlunoMutation.mutate(Number(value));
                }}
                value=""
              />
            </div>
            <div className="mt-4 space-y-2">
              {turmaQuery.data?.students?.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between rounded-system border border-slate-200 px-3 py-2"
                >
                  <span className="font-semibold text-text-primary">
                    {student.name}
                  </span>
                  <Button
                    type="button"
                    aria-label={`Desvincular ${student.name}`}
                    onClick={() => unlinkAlunoMutation.mutate(student.id)}
                    className="size-9 border border-red-200 bg-white p-0 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Link2 className="size-4" />
        Os vinculos respeitam o escopo da escola validado no backend.
      </div>
    </div>
  );
}
