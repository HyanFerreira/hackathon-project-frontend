"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Medal, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/buttons";
import { Input } from "@/components/form/Input";
import { Select } from "@/components/form/Select";
import { TableSkeleton } from "@/components/loading";
import { getApiErrorMessage } from "@/services/api/errors/getApiErrorMessage";
import { authApi } from "@/services/api/modules/auth";
import { gamificationApi } from "@/services/api/modules/gamification";
import { getAuthActor } from "@/services/api/tokenStorage";
import type { Aluno } from "@/types/aluno";
import type { User } from "@/types/user";

export function RankingWorkspace() {
  const actor = getAuthActor();
  const [studentScope, setStudentScope] = useState<"turma" | "escola">("turma");
  const [gestorScope, setGestorScope] = useState<"escola" | "turma">("escola");
  const [selectedTurmaId, setSelectedTurmaId] = useState("");
  const [professorTurmaId, setProfessorTurmaId] = useState("");
  const [submittedProfessorTurmaId, setSubmittedProfessorTurmaId] =
    useState("");

  const meQuery = useQuery<User | Aluno>({
    queryKey: ["auth", "me", actor],
    queryFn: () =>
      actor === "aluno" ? gamificationApi.alunoMe() : authApi.me(),
    retry: false,
  });
  const role =
    meQuery.data && "roles" in meQuery.data
      ? meQuery.data.roles?.[0]?.name
      : undefined;

  const turmasQuery = useQuery({
    queryKey: ["gestor", "turmas"],
    queryFn: gamificationApi.turmas,
    enabled: role === "gestor",
  });

  const rankingQuery = useQuery({
    queryKey: [
      "ranking",
      actor,
      role,
      studentScope,
      gestorScope,
      selectedTurmaId,
      submittedProfessorTurmaId,
    ],
    queryFn: () => {
      if (actor === "aluno") {
        return studentScope === "turma"
          ? gamificationApi.rankingAlunoTurma()
          : gamificationApi.rankingAlunoEscola();
      }

      if (role === "professor") {
        return gamificationApi.rankingProfessorTurma(
          Number(submittedProfessorTurmaId),
        );
      }

      if (gestorScope === "turma" && selectedTurmaId) {
        return gamificationApi.rankingGestorTurma(Number(selectedTurmaId));
      }

      return gamificationApi.rankingGestorEscola();
    },
    enabled:
      actor === "aluno" ||
      role === "gestor" ||
      (role === "professor" && Boolean(submittedProfessorTurmaId)),
  });

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Ranking</h1>
          <p className="mt-1 text-base text-text-secondary">
            Classificacao por pontos, XP e nivel.
          </p>
        </div>

        {actor === "aluno" && (
          <Select
            className="w-full lg:w-64"
            label="Visualizar"
            value={studentScope}
            options={[
              { label: "Minha turma", value: "turma" },
              { label: "Minha escola", value: "escola" },
            ]}
            onChange={(value) =>
              setStudentScope(value === "escola" ? "escola" : "turma")
            }
          />
        )}

        {role === "gestor" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:w-[520px]">
            <Select
              label="Visualizar"
              value={gestorScope}
              options={[
                { label: "Escola", value: "escola" },
                { label: "Turma", value: "turma" },
              ]}
              onChange={(value) =>
                setGestorScope(value === "turma" ? "turma" : "escola")
              }
            />
            <Select
              label="Turma"
              value={selectedTurmaId}
              disabled={gestorScope !== "turma"}
              searchable
              placeholder="Selecionar turma"
              options={
                turmasQuery.data?.map((turma) => ({
                  label: turma.name,
                  value: String(turma.id),
                })) ?? []
              }
              onChange={setSelectedTurmaId}
            />
          </div>
        )}

        {role === "professor" && (
          <form
            className="flex w-full items-end gap-3 lg:w-[420px]"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmittedProfessorTurmaId(professorTurmaId);
            }}
          >
            <Input
              className="flex-1"
              label="ID da turma"
              name="turma"
              type="number"
              min={1}
              value={professorTurmaId}
              onChange={(event) => setProfessorTurmaId(event.target.value)}
            />
            <Button
              type="submit"
              disabled={!professorTurmaId}
              className="min-h-11 bg-brand-primary px-4 text-white hover:bg-brand-primary-hover"
            >
              <Search aria-hidden="true" className="size-4" />
              Buscar
            </Button>
          </form>
        )}
      </section>

      <section className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        {rankingQuery.isFetching && <TableSkeleton rows={8} columns={5} />}

        {rankingQuery.isError && (
          <div
            role="alert"
            className="flex gap-3 rounded-system border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <p>{getApiErrorMessage(rankingQuery.error)}</p>
          </div>
        )}

        {role === "professor" && !submittedProfessorTurmaId && (
          <div className="rounded-system border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <Medal className="mx-auto mb-3 size-10 text-brand-primary" />
            <p className="font-semibold text-text-primary">
              Informe uma turma para consultar
            </p>
          </div>
        )}

        {rankingQuery.data && rankingQuery.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-slate-200 border-b text-xs font-bold uppercase tracking-wide text-text-secondary">
                  <th className="px-3 py-3">Posicao</th>
                  <th className="px-3 py-3">Aluno</th>
                  <th className="px-3 py-3">Pontos</th>
                  <th className="px-3 py-3">XP</th>
                  <th className="px-3 py-3">Nivel</th>
                </tr>
              </thead>
              <tbody>
                {rankingQuery.data.map((item) => (
                  <tr
                    key={item.aluno.id}
                    className="border-slate-100 border-b last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-3 py-3 font-bold text-brand-primary">
                      #{item.position}
                    </td>
                    <td className="px-3 py-3 font-semibold text-text-primary">
                      {item.aluno.name}
                    </td>
                    <td className="px-3 py-3 text-text-secondary">
                      {item.points}
                    </td>
                    <td className="px-3 py-3 text-text-secondary">{item.xp}</td>
                    <td className="px-3 py-3 text-text-secondary">
                      {item.level}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          rankingQuery.isSuccess && (
            <div className="rounded-system border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <Medal className="mx-auto mb-3 size-10 text-brand-primary" />
              <p className="font-semibold text-text-primary">
                Ranking ainda sem dados
              </p>
            </div>
          )
        )}
      </section>
    </div>
  );
}
