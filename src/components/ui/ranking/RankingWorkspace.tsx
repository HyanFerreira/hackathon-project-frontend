"use client";

import { useQuery } from "@tanstack/react-query";
import { Medal } from "lucide-react";
import { TableSkeleton } from "@/components/loading";
import { gamificationApi } from "@/services/api/modules/gamification";
import { getAuthActor } from "@/services/api/tokenStorage";

export function RankingWorkspace() {
  const actor = getAuthActor();
  const rankingQuery = useQuery({
    queryKey: ["ranking", actor],
    queryFn: () =>
      actor === "aluno"
        ? gamificationApi.rankingAlunoTurma()
        : gamificationApi.rankingGestorEscola(),
  });

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold text-brand-primary">Ranking</h1>
        <p className="mt-1 text-base text-text-secondary">
          Classificacao por pontos, XP e nivel.
        </p>
      </section>

      <section className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        {rankingQuery.isPending && <TableSkeleton rows={8} columns={5} />}

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
