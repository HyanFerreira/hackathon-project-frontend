"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  CircleX,
  History,
  Trophy,
  Zap,
} from "lucide-react";
import { Skeleton, TableSkeleton } from "@/components/loading";
import { getApiErrorMessage } from "@/services/api/errors/getApiErrorMessage";
import { gamificationApi } from "@/services/api/modules/gamification";

function formatDate(value?: string) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function StudentProfileWorkspace() {
  const perfilQuery = useQuery({
    queryKey: ["aluno", "perfil"],
    queryFn: gamificationApi.alunoPerfil,
  });
  const respostasQuery = useQuery({
    queryKey: ["aluno", "respostas"],
    queryFn: gamificationApi.respostas,
  });

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold text-brand-primary">Meu perfil</h1>
        <p className="mt-1 text-base text-text-secondary">
          Acompanhe seu progresso, energia e historico de respostas.
        </p>
      </section>

      {perfilQuery.isError && (
        <div
          role="alert"
          className="flex gap-3 rounded-system border border-red-200 bg-red-50 p-4 text-red-700"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          <p>{getApiErrorMessage(perfilQuery.error)}</p>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3 text-brand-primary">
            <Trophy aria-hidden="true" className="size-6" />
            <h2 className="font-bold text-text-primary">Pontuacao</h2>
          </div>
          {perfilQuery.isPending ? (
            <Skeleton className="mt-4 h-9 w-24" />
          ) : (
            <p className="mt-4 text-3xl font-bold text-text-primary">
              {perfilQuery.data?.points ?? 0}
            </p>
          )}
        </div>

        <div className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3 text-brand-primary">
            <Zap aria-hidden="true" className="size-6" />
            <h2 className="font-bold text-text-primary">Energia</h2>
          </div>
          {perfilQuery.isPending ? (
            <Skeleton className="mt-4 h-9 w-24" />
          ) : (
            <p className="mt-4 text-3xl font-bold text-text-primary">
              {perfilQuery.data?.energy ?? 0}/{perfilQuery.data?.maxEnergy ?? 0}
            </p>
          )}
        </div>

        <div className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3 text-brand-primary">
            <History aria-hidden="true" className="size-6" />
            <h2 className="font-bold text-text-primary">Nivel e XP</h2>
          </div>
          {perfilQuery.isPending ? (
            <Skeleton className="mt-4 h-9 w-24" />
          ) : (
            <p className="mt-4 text-3xl font-bold text-text-primary">
              {perfilQuery.data?.level ?? 1}
              <span className="ml-2 text-base font-semibold text-text-secondary">
                {perfilQuery.data?.xp ?? 0} XP
              </span>
            </p>
          )}
        </div>
      </section>

      <section className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3">
          <History aria-hidden="true" className="size-5 text-brand-primary" />
          <h2 className="text-lg font-bold text-text-primary">
            Historico de respostas
          </h2>
        </div>

        {respostasQuery.isPending && (
          <div className="mt-4">
            <TableSkeleton rows={5} columns={5} />
          </div>
        )}

        {respostasQuery.isError && (
          <div
            role="alert"
            className="mt-4 flex gap-3 rounded-system border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <p>{getApiErrorMessage(respostasQuery.error)}</p>
          </div>
        )}

        {respostasQuery.data && respostasQuery.data.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-slate-200 border-b text-xs font-bold uppercase tracking-wide text-text-secondary">
                  <th className="px-3 py-3">Questao</th>
                  <th className="px-3 py-3">Resultado</th>
                  <th className="px-3 py-3">Pontos</th>
                  <th className="px-3 py-3">XP</th>
                  <th className="px-3 py-3">Respondida em</th>
                </tr>
              </thead>
              <tbody>
                {respostasQuery.data.map((resposta) => (
                  <tr
                    key={resposta.id}
                    className="border-slate-100 border-b last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-3 py-3 font-semibold text-text-primary">
                      {resposta.statement ?? `Questao #${resposta.questionId}`}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                          resposta.correct
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {resposta.correct ? (
                          <CheckCircle2 aria-hidden="true" className="size-4" />
                        ) : (
                          <CircleX aria-hidden="true" className="size-4" />
                        )}
                        {resposta.correct ? "Correta" : "Incorreta"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-text-secondary">
                      {resposta.pointsEarned}
                    </td>
                    <td className="px-3 py-3 text-text-secondary">
                      {resposta.xpEarned}
                    </td>
                    <td className="px-3 py-3 text-text-secondary">
                      {formatDate(resposta.answeredAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          respostasQuery.isSuccess && (
            <div className="mt-4 rounded-system border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="font-semibold text-text-primary">
                Nenhuma resposta registrada
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Depois que voce responder questoes, elas aparecem aqui.
              </p>
            </div>
          )
        )}
      </section>
    </div>
  );
}
