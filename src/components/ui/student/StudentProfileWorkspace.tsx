"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CircleX,
  Clock,
  Flame,
  Gift,
  Grid2X2,
  History,
  Info,
  List,
  LoaderCircle,
  Lock,
  PackageCheck,
  ShoppingBag,
  Star,
  TrendingUp,
  Trophy,
  UserRound,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/buttons";
import { Toast } from "@/components/feedback";
import { Select } from "@/components/form/Select";
import { Skeleton, TableSkeleton } from "@/components/loading";
import { getApiErrorMessage } from "@/services/api/errors/getApiErrorMessage";
import { gamificationApi } from "@/services/api/modules/gamification";
import type {
  AlunoPersonagem,
  ConquistaProgresso,
  MissaoProgresso,
  PerfilAluno,
  PersonagemLoja,
} from "@/types/aluno";
import {
  markEquippedCharacter,
  readStoredEquippedCharacterId,
  resolveEquippedCharacterId,
  storeEquippedCharacterId,
} from "@/utils/student/equippedCharacter";
import { getAchievementImage, getAvatarImage } from "./studentVisualAssets";

type StudentProfileWorkspaceProps = {
  view?: StudentProfileView;
};

export type StudentProfileView =
  | "resumo"
  | "missoes"
  | "conquistas"
  | "personagens"
  | "loja";

const viewContent: Record<
  StudentProfileView,
  { title: string; description: string }
> = {
  resumo: {
    title: "Meu perfil",
    description: "Acompanhe seus dados de progresso e historico.",
  },
  missoes: {
    title: "Missoes",
    description: "Veja objetivos ativos e recompensas disponiveis.",
  },
  conquistas: {
    title: "Conquistas",
    description: "Acompanhe marcos desbloqueados e proximos objetivos.",
  },
  personagens: {
    title: "Personagens",
    description: "Escolha o personagem equipado para sua jornada.",
  },
  loja: {
    title: "Loja",
    description: "Use seu saldo de pontos para desbloquear personagens.",
  },
};

function formatDate(value?: string) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getProgressPercent(current: number, goal: number) {
  if (goal <= 0) return 0;

  return Math.min(100, Math.round((current / goal) * 100));
}

export function StudentProfileWorkspace({
  view = "resumo",
}: StudentProfileWorkspaceProps) {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<string>();
  const [buyingCharacterId, setBuyingCharacterId] = useState<number | null>(
    null,
  );
  const [equippedCharacterId, setEquippedCharacterId] = useState<number | null>(
    readStoredEquippedCharacterId,
  );

  const perfilQuery = useQuery({
    queryKey: ["aluno", "perfil"],
    queryFn: gamificationApi.alunoPerfil,
  });
  const respostasQuery = useQuery({
    queryKey: ["aluno", "respostas"],
    queryFn: gamificationApi.respostas,
  });
  const missoesQuery = useQuery({
    queryKey: ["aluno", "missoes"],
    queryFn: gamificationApi.missoes,
  });
  const conquistasQuery = useQuery({
    queryKey: ["aluno", "conquistas"],
    queryFn: gamificationApi.conquistas,
  });
  const personagensQuery = useQuery({
    queryKey: ["aluno", "personagens"],
    queryFn: gamificationApi.personagens,
  });
  const lojaQuery = useQuery({
    queryKey: ["aluno", "loja"],
    queryFn: gamificationApi.loja,
  });

  const comprarMutation = useMutation({
    mutationFn: gamificationApi.comprarPersonagem,
    onMutate: async (id) => {
      setBuyingCharacterId(id);
      setFeedback(undefined);

      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["aluno", "perfil"] }),
        queryClient.cancelQueries({ queryKey: ["aluno", "loja"] }),
        queryClient.cancelQueries({ queryKey: ["aluno", "personagens"] }),
      ]);

      const previousPerfil = queryClient.getQueryData<PerfilAluno>([
        "aluno",
        "perfil",
      ]);
      const previousLoja = queryClient.getQueryData<PersonagemLoja[]>([
        "aluno",
        "loja",
      ]);
      const previousPersonagens = queryClient.getQueryData<AlunoPersonagem[]>([
        "aluno",
        "personagens",
      ]);
      const purchasedCharacter = previousLoja?.find((item) => item.id === id);

      if (purchasedCharacter) {
        queryClient.setQueryData<PerfilAluno>(["aluno", "perfil"], (current) =>
          current
            ? {
                ...current,
                points: Math.max(0, current.points - purchasedCharacter.price),
              }
            : current,
        );

        queryClient.setQueryData<PersonagemLoja[]>(["aluno", "loja"], (items) =>
          items?.map((item) =>
            item.id === id ? { ...item, owned: true } : item,
          ),
        );

        queryClient.setQueryData<AlunoPersonagem[]>(
          ["aluno", "personagens"],
          (items) => {
            if (
              items?.some((item) => item.personagemId === purchasedCharacter.id)
            ) {
              return items;
            }

            const newCharacter: AlunoPersonagem = {
              personagemId: purchasedCharacter.id,
              key: purchasedCharacter.key,
              name: purchasedCharacter.name,
              tier: purchasedCharacter.tier,
              level: 1,
              maxLevel: purchasedCharacter.maxLevel,
              answeredQuestions: 0,
              nextLevelIn: null,
              equipped: (items?.length ?? 0) === 0,
              image: purchasedCharacter.image,
            };

            return [...(items ?? []), newCharacter];
          },
        );
      }

      return { previousPerfil, previousLoja, previousPersonagens };
    },
    onSuccess: (result, id) => {
      setFeedback(result.message);
      queryClient.setQueryData(["aluno", "perfil"], result.perfil);
      queryClient.setQueryData(["aluno", "personagens"], result.inventario);
      queryClient.setQueryData<PersonagemLoja[]>(["aluno", "loja"], (items) =>
        items?.map((item) =>
          item.id === id ||
          result.inventario.some(
            (personagem) => personagem.personagemId === item.id,
          )
            ? { ...item, owned: true }
            : item,
        ),
      );
      setBuyingCharacterId(null);
    },
    onError: (_error, _id, context) => {
      queryClient.setQueryData(["aluno", "perfil"], context?.previousPerfil);
      queryClient.setQueryData(["aluno", "loja"], context?.previousLoja);
      queryClient.setQueryData(
        ["aluno", "personagens"],
        context?.previousPersonagens,
      );
      setBuyingCharacterId(null);
    },
    onSettled: () => {
      setBuyingCharacterId(null);
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["aluno", "perfil"] }),
        queryClient.invalidateQueries({ queryKey: ["aluno", "loja"] }),
        queryClient.invalidateQueries({ queryKey: ["aluno", "personagens"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", "aluno"] }),
      ]);
    },
  });

  const equiparMutation = useMutation({
    mutationFn: gamificationApi.equiparPersonagem,
    onMutate: async (id) => {
      setFeedback(undefined);
      setEquippedCharacterId(id);
      storeEquippedCharacterId(id);

      await queryClient.cancelQueries({ queryKey: ["aluno", "personagens"] });

      const previousPersonagens = queryClient.getQueryData<AlunoPersonagem[]>([
        "aluno",
        "personagens",
      ]);

      queryClient.setQueryData<AlunoPersonagem[]>(
        ["aluno", "personagens"],
        (items) => markEquippedCharacter(items, id),
      );

      return { previousPersonagens };
    },
    onSuccess: (result, id) => {
      setFeedback(result.message);
      setEquippedCharacterId(id);
      storeEquippedCharacterId(id);
      queryClient.setQueryData(
        ["aluno", "personagens"],
        markEquippedCharacter(result.inventario, id),
      );
    },
    onError: (_error, _id, context) => {
      queryClient.setQueryData(
        ["aluno", "personagens"],
        context?.previousPersonagens,
      );
    },
  });

  useEffect(() => {
    if (!personagensQuery.data) return;

    const nextEquippedCharacterId = resolveEquippedCharacterId(
      personagensQuery.data,
      equippedCharacterId,
    );

    if (nextEquippedCharacterId !== equippedCharacterId) {
      setEquippedCharacterId(nextEquippedCharacterId);
      storeEquippedCharacterId(nextEquippedCharacterId);
    }

    const hasMismatchedEquippedState = personagensQuery.data.some(
      (personagem) =>
        personagem.equipped !==
        (personagem.personagemId === nextEquippedCharacterId),
    );

    if (hasMismatchedEquippedState) {
      queryClient.setQueryData(
        ["aluno", "personagens"],
        markEquippedCharacter(personagensQuery.data, nextEquippedCharacterId),
      );
    }
  }, [equippedCharacterId, personagensQuery.data, queryClient]);

  const personagens = markEquippedCharacter(
    personagensQuery.data,
    resolveEquippedCharacterId(personagensQuery.data, equippedCharacterId),
  );
  const equippedCharacter = personagens?.find(
    (personagem) => personagem.equipped,
  );

  return (
    <div className="space-y-6">
      {view !== "loja" && view !== "personagens" && view !== "conquistas" && (
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-primary">
              {viewContent[view].title}
            </h1>
            <p className="mt-1 text-base text-text-secondary">
              {viewContent[view].description}
            </p>
          </div>
        </section>
      )}

      {feedback && (
        <Toast
          variant="success"
          message={feedback}
          onClose={() => setFeedback(undefined)}
        />
      )}

      {(perfilQuery.isError ||
        missoesQuery.isError ||
        conquistasQuery.isError ||
        personagensQuery.isError ||
        lojaQuery.isError ||
        comprarMutation.isError) && (
        <Toast
          variant="danger"
          message={getApiErrorMessage(
            perfilQuery.error ??
              missoesQuery.error ??
              conquistasQuery.error ??
              personagensQuery.error ??
              lojaQuery.error ??
              comprarMutation.error,
          )}
        />
      )}

      {view === "resumo" && (
        <ResumoTab
          isPerfilPending={perfilQuery.isPending}
          points={perfilQuery.data?.points ?? 0}
          totalPoints={perfilQuery.data?.totalPoints ?? 0}
          energy={perfilQuery.data?.energy ?? 0}
          maxEnergy={perfilQuery.data?.maxEnergy ?? 0}
          level={perfilQuery.data?.level ?? 1}
          xp={perfilQuery.data?.xp ?? 0}
          streak={perfilQuery.data?.streak}
          equippedCharacter={equippedCharacter}
          respostasQuery={respostasQuery}
        />
      )}

      {view === "missoes" && (
        <ProgressGrid
          isPending={missoesQuery.isPending}
          emptyTitle="Nenhuma missao disponivel"
          items={missoesQuery.data ?? []}
          renderItem={(missao) => (
            <MissionCard key={missao.id} missao={missao} />
          )}
        />
      )}

      {view === "conquistas" && (
        <AchievementsDashboard
          isPending={conquistasQuery.isPending}
          items={conquistasQuery.data ?? []}
        />
      )}

      {view === "personagens" && (
        <CharacterInventory
          items={personagens ?? []}
          storeItems={lojaQuery.data ?? []}
          isPending={personagensQuery.isPending}
          isEquipping={equiparMutation.isPending}
          onEquip={(id) => equiparMutation.mutate(id)}
        />
      )}

      {view === "loja" && (
        <CharacterStore
          items={lojaQuery.data ?? []}
          points={perfilQuery.data?.points ?? 0}
          isPointsPending={perfilQuery.isPending}
          isPending={lojaQuery.isPending}
          buyingCharacterId={buyingCharacterId}
          onBuy={(id) => comprarMutation.mutate(id)}
        />
      )}
    </div>
  );
}

function ResumoTab({
  equippedCharacter,
  isPerfilPending,
  level,
  energy,
  maxEnergy,
  points,
  totalPoints,
  respostasQuery,
  streak,
  xp,
}: {
  equippedCharacter?: AlunoPersonagem;
  isPerfilPending: boolean;
  level: number;
  energy: number;
  maxEnergy: number;
  points: number;
  totalPoints: number;
  respostasQuery: ReturnType<typeof useQuery>;
  streak?: PerfilAluno["streak"];
  xp: number;
}) {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          icon={Trophy}
          label="Pontuacao"
          isPending={isPerfilPending}
          value={totalPoints.toLocaleString("pt-BR")}
          detail={`${points.toLocaleString("pt-BR")} saldo`}
        />
        <MetricCard
          icon={Zap}
          label="Energia"
          isPending={isPerfilPending}
          value={`${energy}/${maxEnergy}`}
        />
        <MetricCard
          icon={History}
          label="Nivel e XP"
          isPending={isPerfilPending}
          value={`Nivel ${level}`}
          detail={`${xp.toLocaleString("pt-BR")} XP`}
        />
        <MetricCard
          icon={Flame}
          label="Sequência diária"
          isPending={isPerfilPending}
          value={`${streak?.currentDays ?? 0} dia(s)`}
          detail={`Recorde: ${streak?.longestDays ?? 0} · Bônus em ${streak?.daysUntilNextBonus ?? 7} dia(s)`}
        />
        <div className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3 text-brand-primary">
            <UserRound aria-hidden="true" className="size-6" />
            <h2 className="font-bold text-text-primary">Personagem</h2>
          </div>
          {equippedCharacter ? (
            <div className="mt-4 flex items-center gap-3">
              <Image
                src={getAvatarImage(equippedCharacter.image)}
                alt={equippedCharacter.name}
                className="size-14 rounded-full object-contain"
              />
              <div>
                <p className="font-bold text-text-primary">
                  {equippedCharacter.name}
                </p>
                <p className="text-sm text-text-secondary">
                  Nivel {equippedCharacter.level}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-text-secondary">
              Nenhum personagem equipado.
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

        {Array.isArray(respostasQuery.data) &&
        respostasQuery.data.length > 0 ? (
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
    </>
  );
}

function MetricCard({
  detail,
  icon: Icon,
  isPending,
  label,
  value,
}: {
  detail?: string;
  icon: typeof Trophy;
  isPending: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-3 text-brand-primary">
        <Icon aria-hidden="true" className="size-6" />
        <h2 className="font-bold text-text-primary">{label}</h2>
      </div>
      {isPending ? (
        <Skeleton className="mt-4 h-9 w-24" />
      ) : (
        <p className="mt-4 text-3xl font-bold text-text-primary">
          {value}
          {detail && (
            <span className="ml-2 text-base font-semibold text-text-secondary">
              {detail}
            </span>
          )}
        </p>
      )}
    </div>
  );
}

type AchievementFilter = "all" | "completed" | "progress" | "locked";
type AchievementSort = "default" | "progress" | "points" | "xp";

function AchievementsDashboard({
  isPending,
  items,
}: {
  isPending: boolean;
  items: ConquistaProgresso[];
}) {
  const [filter, setFilter] = useState<AchievementFilter>("all");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<AchievementSort>("default");
  const total = items.length;
  const completed = items.filter((item) => item.unlocked).length;
  const inProgress = items.filter(isAchievementInProgress).length;
  const conqueredPoints = items
    .filter((item) => item.unlocked)
    .reduce((sum, item) => sum + item.rewardPoints, 0);
  const earnedXp = items
    .filter((item) => item.unlocked)
    .reduce((sum, item) => sum + item.rewardXp, 0);
  const completionPercent = getProgressPercent(completed, total);
  const visibleItems = sortAchievements(
    items.filter((item) => matchesAchievementFilter(item, filter)),
    sort,
  );

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-[1fr_2.05fr] xl:items-center">
        <div>
          <h1 className="text-5xl font-black tracking-normal text-[#4b18dc]">
            Conquistas
          </h1>
          <p className="mt-3 max-w-md text-lg font-medium leading-8 text-[#5d5a89]">
            Acompanhe marcos desbloqueados e proximos objetivos.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AchievementMetricCard
            icon={CheckCircle2}
            label="Desbloqueadas"
            value={`${completed} / ${total}`}
            detail={`${completionPercent}% do total`}
            progress={completionPercent}
            tone="purple"
          />
          <AchievementMetricCard
            icon={Clock}
            label="Em progresso"
            value={inProgress.toLocaleString("pt-BR")}
            detail="Continue assim!"
            tone="orange"
          />
          <AchievementMetricCard
            icon={Star}
            label="Pontos conquistados"
            value={conqueredPoints.toLocaleString("pt-BR")}
            detail="Total de pontos"
            tone="gold"
          />
          <AchievementMetricCard
            icon={Zap}
            label="XP ganho"
            value={earnedXp.toLocaleString("pt-BR")}
            detail="Total de XP"
            tone="purple"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3">
          <AchievementFilterButton
            active={filter === "all"}
            icon={Grid2X2}
            onClick={() => setFilter("all")}
          >
            Todos
          </AchievementFilterButton>
          <AchievementFilterButton
            active={filter === "completed"}
            icon={CheckCircle2}
            onClick={() => setFilter("completed")}
          >
            Concluidas
          </AchievementFilterButton>
          <AchievementFilterButton
            active={filter === "progress"}
            icon={Clock}
            onClick={() => setFilter("progress")}
          >
            Em progresso
          </AchievementFilterButton>
          <AchievementFilterButton
            active={filter === "locked"}
            icon={Lock}
            onClick={() => setFilter("locked")}
          >
            Bloqueadas
          </AchievementFilterButton>
        </div>

        <div className="flex items-center gap-3">
          <Select
            className="w-64"
            label=""
            value={sort}
            options={[
              { label: "Ordenar por: Padrao", value: "default" },
              { label: "Ordenar por: Progresso", value: "progress" },
              { label: "Ordenar por: Pontos", value: "points" },
              { label: "Ordenar por: XP", value: "xp" },
            ]}
            onChange={(value) =>
              setSort(
                value === "progress" || value === "points" || value === "xp"
                  ? value
                  : "default",
              )
            }
          />
          <Button
            type="button"
            aria-label="Visualizacao em grade"
            onClick={() => setLayout("grid")}
            className={`size-12 rounded-[12px] p-0 ${
              layout === "grid"
                ? "bg-gradient-to-r from-[#6d2ee8] to-[#8a3df2] text-white shadow-[0_12px_24px_rgba(109,46,232,0.22)]"
                : "border border-[#e3d9f8] bg-white text-[#7c35e8] hover:bg-[#f6f0ff]"
            }`}
          >
            <Grid2X2 aria-hidden="true" className="size-5" />
          </Button>
          <Button
            type="button"
            aria-label="Visualizacao em lista"
            onClick={() => setLayout("list")}
            className={`size-12 rounded-[12px] p-0 ${
              layout === "list"
                ? "bg-gradient-to-r from-[#6d2ee8] to-[#8a3df2] text-white shadow-[0_12px_24px_rgba(109,46,232,0.22)]"
                : "border border-[#e3d9f8] bg-white text-[#7c35e8] hover:bg-[#f6f0ff]"
            }`}
          >
            <List aria-hidden="true" className="size-5" />
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <section className="rounded-[18px] border border-dashed border-[#d9cdf8] bg-white p-8 text-center shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
          <p className="font-black text-[#101044]">
            Nenhuma conquista disponivel
          </p>
        </section>
      ) : visibleItems.length === 0 ? (
        <section className="rounded-[18px] border border-dashed border-[#d9cdf8] bg-white p-8 text-center shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
          <p className="font-black text-[#101044]">
            Nenhuma conquista neste filtro
          </p>
        </section>
      ) : (
        <section
          className={`grid gap-4 ${layout === "grid" ? "xl:grid-cols-2" : ""}`}
        >
          {visibleItems.map((conquista) => (
            <AchievementTemplateCard key={conquista.id} conquista={conquista} />
          ))}
        </section>
      )}
    </section>
  );
}

function AchievementMetricCard({
  detail,
  icon: Icon,
  label,
  progress,
  tone,
  value,
}: {
  detail: string;
  icon: typeof Trophy;
  label: string;
  progress?: number;
  tone: "gold" | "orange" | "purple";
  value: string;
}) {
  const toneClasses = {
    gold: {
      box: "bg-[#fff6da] text-[#f0a800]",
      value: "text-[#f0a800]",
    },
    orange: {
      box: "bg-[#fff0de] text-[#e96d00]",
      value: "text-[#e96d00]",
    },
    purple: {
      box: "bg-[#efe7ff] text-[#7c35e8]",
      value: "text-[#6d2ee8]",
    },
  }[tone];

  return (
    <article className="rounded-[18px] border border-[#e3d9f8] bg-white p-4 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
      <div className="flex items-center gap-4">
        <span
          className={`flex size-16 shrink-0 items-center justify-center rounded-[14px] ${toneClasses.box}`}
        >
          <Icon aria-hidden="true" className="size-8" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#5d5a89]">{label}</p>
          <p className={`text-2xl font-black ${toneClasses.value}`}>{value}</p>
          <p className="text-sm font-medium text-[#5d5a89]">{detail}</p>
        </div>
      </div>
      {typeof progress === "number" && (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e9e8f2]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#6d2ee8] to-[#8a3df2]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </article>
  );
}

function AchievementFilterButton({
  active,
  children,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  children: string;
  icon: typeof Trophy;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-full border px-5 text-sm font-black ${
        active
          ? "border-transparent bg-gradient-to-r from-[#6d2ee8] to-[#8a3df2] text-white shadow-[0_12px_24px_rgba(109,46,232,0.22)]"
          : "border-[#d8c9fb] bg-white text-[#6d2ee8] hover:bg-[#f6f0ff]"
      }`}
    >
      <Icon aria-hidden="true" className="size-4" />
      {children}
    </Button>
  );
}

function AchievementTemplateCard({
  conquista,
}: {
  conquista: ConquistaProgresso;
}) {
  const percent = getProgressPercent(conquista.current, conquista.goal);
  const achievementImage = getAchievementImage(conquista.icon);
  const status = getAchievementStatus(conquista);

  return (
    <article className="grid min-h-[158px] grid-cols-[112px_1fr] gap-4 rounded-[18px] border border-[#e3d9f8] bg-white p-4 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
      <div className="flex items-center justify-center">
        {achievementImage ? (
          <Image
            src={achievementImage}
            alt=""
            aria-hidden="true"
            className={`size-24 object-contain ${
              status === "locked" ? "grayscale" : ""
            }`}
          />
        ) : (
          <span className="flex size-24 items-center justify-center rounded-full bg-[#efe7ff] text-[#6d2ee8]">
            <Star aria-hidden="true" className="size-10" />
          </span>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-[#7c35e8]">
              {formatAchievementType(conquista.type)}
            </p>
            <h2 className="mt-1 truncate text-2xl font-black text-[#101044]">
              {conquista.name}
            </h2>
            <p className="mt-1 line-clamp-2 text-base font-medium text-[#5d5a89]">
              {conquista.description}
            </p>
          </div>
          <AchievementStatusPill status={status} />
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-4">
          <div className="h-2 overflow-hidden rounded-full bg-[#e9e8f2]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6d2ee8] to-[#8a3df2]"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-sm font-black text-[#4f4b80]">
            {conquista.current}/{conquista.goal}
          </span>
        </div>

        <RewardLine points={conquista.rewardPoints} xp={conquista.rewardXp} />
      </div>
    </article>
  );
}

function AchievementStatusPill({
  status,
}: {
  status: "completed" | "locked" | "progress";
}) {
  if (status === "completed") {
    return (
      <span className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full bg-[#e6f8dc] px-4 text-sm font-black text-[#27851f]">
        <CheckCircle2 aria-hidden="true" className="size-4" />
        Concluida
      </span>
    );
  }

  if (status === "progress") {
    return (
      <span className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full bg-[#fff0de] px-4 text-sm font-black text-[#e96d00]">
        <Clock aria-hidden="true" className="size-4" />
        Em progresso
      </span>
    );
  }

  return (
    <span className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full bg-[#eef0f4] px-4 text-sm font-black text-[#667085]">
      <Lock aria-hidden="true" className="size-4" />
      Bloqueada
    </span>
  );
}

function getAchievementStatus(conquista: ConquistaProgresso) {
  if (conquista.unlocked) return "completed";
  if (isAchievementInProgress(conquista)) return "progress";

  return "locked";
}

function isAchievementInProgress(conquista: ConquistaProgresso) {
  return !conquista.unlocked && conquista.current > 0;
}

function matchesAchievementFilter(
  conquista: ConquistaProgresso,
  filter: AchievementFilter,
) {
  if (filter === "completed") return conquista.unlocked;
  if (filter === "progress") return isAchievementInProgress(conquista);
  if (filter === "locked") return getAchievementStatus(conquista) === "locked";

  return true;
}

function sortAchievements(items: ConquistaProgresso[], sort: AchievementSort) {
  return [...items].sort((first, second) => {
    if (sort === "progress") {
      return (
        getProgressPercent(second.current, second.goal) -
        getProgressPercent(first.current, first.goal)
      );
    }

    if (sort === "points") {
      return second.rewardPoints - first.rewardPoints;
    }

    if (sort === "xp") {
      return second.rewardXp - first.rewardXp;
    }

    return 0;
  });
}

function formatAchievementType(type: string) {
  return type.trim().replace(/[_-]/g, " ") || "Conquista";
}

function ProgressGrid<T>({
  emptyTitle,
  isPending,
  items,
  renderItem,
}: {
  emptyTitle: string;
  isPending: boolean;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}) {
  if (isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <section className="rounded-system border border-dashed border-slate-300 bg-white p-8 text-center">
        <Trophy className="mx-auto mb-3 size-10 text-brand-primary" />
        <p className="font-semibold text-text-primary">{emptyTitle}</p>
      </section>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-2">
      {items.map(renderItem)}
    </section>
  );
}

function MissionCard({ missao }: { missao: MissaoProgresso }) {
  const percent = getProgressPercent(missao.progress, missao.goal);

  return (
    <article className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand-primary">
            {missao.period}
          </p>
          <h2 className="mt-1 text-lg font-bold text-text-primary">
            {missao.title}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {missao.description}
          </p>
        </div>
        <StatusPill
          done={missao.completed}
          doneLabel="Concluida"
          pendingLabel="Em andamento"
        />
      </div>
      <ProgressLine
        current={missao.progress}
        goal={missao.goal}
        percent={percent}
      />
      <RewardLine points={missao.rewardPoints} xp={missao.rewardXp} />
    </article>
  );
}

function StatusPill({
  done,
  doneLabel,
  pendingLabel,
}: {
  done: boolean;
  doneLabel: string;
  pendingLabel: string;
}) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
        done
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-text-secondary"
      }`}
    >
      {done ? doneLabel : pendingLabel}
    </span>
  );
}

function ProgressLine({
  current,
  goal,
  percent,
}: {
  current: number;
  goal: number;
  percent: number;
}) {
  return (
    <div className="mt-5">
      <div className="flex justify-between text-sm font-semibold text-text-secondary">
        <span>Progresso</span>
        <span>
          {current}/{goal}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-primary"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function RewardLine({ points, xp }: { points: number; xp: number }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-text-secondary">
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary-soft px-2.5 py-1 text-brand-primary">
        <Star aria-hidden="true" className="size-3.5" />+{points} pontos
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
        <Zap aria-hidden="true" className="size-3.5" />+{xp} XP
      </span>
    </div>
  );
}

function CharacterInventory({
  isEquipping,
  isPending,
  items,
  onEquip,
  storeItems,
}: {
  isEquipping: boolean;
  isPending: boolean;
  items: AlunoPersonagem[];
  onEquip: (id: number) => void;
  storeItems: PersonagemLoja[];
}) {
  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 max-w-xl" />
        <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr_1fr]">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="text-4xl font-black tracking-normal text-[#4b18dc]">
            Personagens
          </h1>
          <p className="mt-1 text-base font-medium text-[#4f4b80]">
            Equipe e evolua seus companheiros para te ajudar nas aventuras!
          </p>
        </div>
        <div className="rounded-[18px] border border-dashed border-[#d9cdf8] bg-white p-8 text-center shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
          <PackageCheck className="mx-auto mb-3 size-10 text-[#6d2ee8]" />
          <p className="font-black text-[#101044]">
            Voce ainda nao possui personagens
          </p>
          <Link
            href="/estudantes/loja"
            className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[#6d2ee8] px-5 font-black text-white transition hover:bg-[#5f22d7]"
          >
            <ShoppingBag aria-hidden="true" className="size-5" />
            Ver loja de personagens
          </Link>
        </div>
      </section>
    );
  }

  const equippedCharacter =
    items.find((personagem) => personagem.equipped) ?? items[0];
  const lockedCharacters = storeItems
    .filter((personagem) => !personagem.owned)
    .filter(
      (personagem) =>
        !items.some((item) => item.personagemId === personagem.id),
    );
  const totalCharacters = items.length + lockedCharacters.length;

  return (
    <section className="space-y-7">
      <div>
        <h1 className="text-4xl font-black tracking-normal text-[#4b18dc]">
          Personagens
        </h1>
        <p className="mt-1 text-base font-medium text-[#4f4b80]">
          Equipe e evolua seus companheiros para te ajudar nas aventuras!
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr_1fr]">
        <EquippedCharacterPanel personagem={equippedCharacter} />
        <CharacterEvolutionPanel personagem={equippedCharacter} />
        <CharacterCollectionPanel
          equippedId={equippedCharacter.personagemId}
          items={items}
          lockedItems={lockedCharacters}
          totalCharacters={totalCharacters}
        />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <ShoppingBag aria-hidden="true" className="size-7 text-[#6d2ee8]" />
            <h2 className="text-lg font-black text-[#101044]">Sua colecao</h2>
          </div>
          <p className="mt-1 text-sm font-medium text-[#4f4b80]">
            Conheca todos os seus companheiros e descubra novos aliados.
          </p>
        </div>

        <Link
          href="/estudantes/loja"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] bg-white px-5 font-black text-[#6d2ee8] shadow-[0_12px_35px_rgba(72,35,137,0.1)] transition hover:bg-[#f6f0ff]"
        >
          <ShoppingBag aria-hidden="true" className="size-5" />
          Ver loja de personagens
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {items.map((personagem) => (
          <InventoryCharacterCard
            key={personagem.personagemId}
            personagem={personagem}
            isEquipping={isEquipping}
            onEquip={onEquip}
          />
        ))}
      </div>

      <div className="mx-auto flex max-w-[780px] items-center gap-3 rounded-[12px] bg-white px-5 py-3 text-sm font-semibold text-[#5e18e6] shadow-[0_12px_35px_rgba(72,35,137,0.1)]">
        <Info aria-hidden="true" className="size-5 shrink-0 fill-[#6d2ee8]" />
        <span>
          Dica: Responda questoes todos os dias para ganhar pontos de
          experiencia e evoluir seus personagens!
        </span>
      </div>
    </section>
  );
}

function EquippedCharacterPanel({
  personagem,
}: {
  personagem: AlunoPersonagem;
}) {
  const tier = formatTier(personagem.tier);
  const tierTone = getTierTone(tier);

  return (
    <article className="overflow-hidden rounded-[18px] border border-[#e3d9f8] bg-white shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
      <div className="bg-gradient-to-r from-[#6d2ee8] to-[#8a3df2] px-5 py-4 font-semibold text-white">
        Personagem equipado
      </div>
      <div className="grid gap-4 p-6 sm:grid-cols-[44%_1fr] sm:items-center">
        <div className="flex justify-center">
          <Image
            src={getAvatarImage(personagem.image)}
            alt={personagem.name}
            className="max-h-[230px] w-auto object-contain"
            priority
          />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-black uppercase ${tierTone.badge}`}
            >
              {tier}
            </span>
            <span className="inline-flex min-h-10 items-center gap-2 rounded-[10px] bg-[#f0e7ff] px-4 text-sm font-black text-[#6d2ee8]">
              <CheckCircle2 aria-hidden="true" className="size-5" />
              Equipado
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-black text-[#101044]">
            {personagem.name}
          </h2>
          <p className="mt-5 text-lg font-black text-[#4f4b80]">
            Nivel {personagem.level}/{personagem.maxLevel}
          </p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#eee8fb]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6d2ee8] to-[#8a3df2]"
              style={{
                width: `${getProgressPercent(
                  personagem.level,
                  personagem.maxLevel,
                )}%`,
              }}
            />
          </div>
          <p className="mt-3 text-sm font-medium text-[#4f4b80]">
            {personagem.nextLevelIn
              ? `${personagem.nextLevelIn} questoes para evoluir`
              : "Nivel maximo"}
          </p>
          <Button
            type="button"
            className="mt-6 min-h-12 w-full rounded-[10px] bg-gradient-to-r from-[#6d2ee8] to-[#8a3df2] px-5 text-white hover:from-[#5f22d7] hover:to-[#7a30e6]"
          >
            Ver detalhes do personagem
            <ArrowRight aria-hidden="true" className="size-5" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function CharacterEvolutionPanel({
  personagem,
}: {
  personagem: AlunoPersonagem;
}) {
  const progressGoal = personagem.nextLevelIn
    ? personagem.answeredQuestions + personagem.nextLevelIn
    : personagem.answeredQuestions;
  const progressPercent = getProgressPercent(
    personagem.answeredQuestions,
    progressGoal || 1,
  );

  return (
    <article className="rounded-[18px] border border-[#e3d9f8] bg-white p-6 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
      <div className="flex items-center gap-4">
        <span className="flex size-12 items-center justify-center rounded-[10px] bg-[#f0e7ff] text-[#6d2ee8]">
          <TrendingUp aria-hidden="true" className="size-7" />
        </span>
        <h2 className="text-xl font-black text-[#101044]">
          Evolucao do personagem
        </h2>
      </div>
      <p className="mt-5 text-sm font-medium leading-6 text-[#4f4b80]">
        Ajude o {personagem.name} a evoluir respondendo questoes corretamente.
      </p>
      <div className="mt-10 flex items-center gap-4">
        <span className="flex size-10 items-center justify-center rounded-[10px] bg-[#fff3c4] text-[#ffb900] ring-1 ring-[#ffd56d]">
          <Star aria-hidden="true" className="size-6 fill-[#ffb900]" />
        </span>
        <span className="font-black text-[#4f4b80]">
          {personagem.answeredQuestions}/{progressGoal || 1} questoes concluidas
        </span>
      </div>
      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5">
        <div className="h-3 overflow-hidden rounded-full bg-[#eee8fb]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#6d2ee8] to-[#8a3df2]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="font-black text-[#4f4b80]">{progressPercent}%</span>
      </div>
      <Button
        type="button"
        className="mt-10 min-h-12 w-full rounded-[10px] border border-[#6d2ee8] bg-white px-5 font-black text-[#5e18e6] hover:bg-[#f6f0ff]"
      >
        Ver evolucao completa
      </Button>
    </article>
  );
}

function CharacterCollectionPanel({
  equippedId,
  items,
  lockedItems,
  totalCharacters,
}: {
  equippedId: number;
  items: AlunoPersonagem[];
  lockedItems: PersonagemLoja[];
  totalCharacters: number;
}) {
  return (
    <article className="rounded-[18px] border border-[#e3d9f8] bg-white p-5 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
      <div className="flex items-start gap-4">
        <span className="flex size-12 items-center justify-center rounded-[10px] bg-[#f0e7ff] text-[#6d2ee8]">
          <UserRound aria-hidden="true" className="size-7" />
        </span>
        <div>
          <h2 className="text-xl font-black text-[#101044]">
            Colecao desbloqueada
          </h2>
          <p className="text-sm font-medium text-[#4f4b80]">
            {items.length}/{totalCharacters || items.length} personagens
            desbloqueados
          </p>
        </div>
      </div>

      <div className="mt-5 max-h-[250px] space-y-2 overflow-y-auto pr-2">
        {items.map((personagem) => (
          <CollectionRow
            key={personagem.personagemId}
            image={personagem.image}
            isEquipped={personagem.personagemId === equippedId}
            isLocked={false}
            level={`Lv ${personagem.level}/${personagem.maxLevel}`}
            name={personagem.name}
          />
        ))}
        {lockedItems.map((personagem) => (
          <CollectionRow
            key={personagem.id}
            image={personagem.image}
            isEquipped={false}
            isLocked
            level="Lv 0"
            name={personagem.name}
          />
        ))}
      </div>
    </article>
  );
}

function CollectionRow({
  image,
  isEquipped,
  isLocked,
  level,
  name,
}: {
  image: string;
  isEquipped: boolean;
  isLocked: boolean;
  level: string;
  name: string;
}) {
  return (
    <div
      className={`grid min-h-12 grid-cols-[42px_1fr_auto] items-center gap-3 rounded-[10px] border px-3 py-2 ${
        isEquipped
          ? "border-[#cdb8ff] bg-[#fbf8ff]"
          : "border-[#e3d9f8] bg-white"
      }`}
    >
      <Image
        src={getAvatarImage(image)}
        alt={name}
        className={`size-10 rounded-[8px] object-contain ${isLocked ? "grayscale" : ""}`}
      />
      <p className="min-w-0 truncate font-black text-[#4f4b80]">{name}</p>
      <div className="flex items-center gap-3 text-sm font-semibold text-[#4f4b80]">
        {isEquipped && (
          <span className="hidden items-center gap-2 rounded-[8px] bg-[#f0e7ff] px-3 py-1 text-xs font-black text-[#6d2ee8] sm:inline-flex">
            <CheckCircle2 aria-hidden="true" className="size-4" />
            Equipado
          </span>
        )}
        <span>{level}</span>
        {isLocked && <Lock aria-hidden="true" className="size-4" />}
      </div>
    </div>
  );
}

function InventoryCharacterCard({
  isEquipping,
  onEquip,
  personagem,
}: {
  isEquipping: boolean;
  onEquip: (id: number) => void;
  personagem: AlunoPersonagem;
}) {
  const tier = formatTier(personagem.tier);
  const tierTone = getTierTone(tier);

  return (
    <article
      className={`relative flex min-h-[265px] flex-col overflow-hidden rounded-[14px] border bg-white p-4 shadow-[0_18px_50px_rgba(72,35,137,0.08)] ${
        personagem.equipped ? "border-[#6d2ee8]" : "border-[#e3d9f8]"
      }`}
    >
      {personagem.equipped && (
        <span className="absolute right-0 top-0 flex size-12 items-start justify-end bg-gradient-to-bl from-[#6d2ee8] to-[#8a3df2] p-2 text-white [clip-path:polygon(100%_0,100%_100%,0_0)]">
          <Star aria-hidden="true" className="size-4 fill-white" />
        </span>
      )}
      <span
        className={`w-fit rounded-full px-3 py-1 text-xs font-black uppercase ${tierTone.badge}`}
      >
        {tier}
      </span>
      <div className="mt-2 flex flex-1 justify-center">
        <Image
          src={getAvatarImage(personagem.image)}
          alt={personagem.name}
          className="max-h-[120px] w-auto object-contain"
        />
      </div>
      <h3 className="mt-2 text-lg font-black text-[#101044]">
        {personagem.name}
      </h3>
      <p className="mt-1 min-h-10 text-sm font-medium text-[#4f4b80]">
        Nivel {personagem.level}/{personagem.maxLevel}
      </p>
      <Button
        type="button"
        disabled={personagem.equipped || isEquipping}
        onClick={() => onEquip(personagem.personagemId)}
        className="mt-3 min-h-10 w-full rounded-[8px] bg-gradient-to-r from-[#6d2ee8] to-[#8a3df2] px-4 text-white hover:from-[#5f22d7] hover:to-[#7a30e6]"
      >
        <CheckCircle2 aria-hidden="true" className="size-5" />
        {personagem.equipped ? "Equipado" : "Equipar"}
      </Button>
    </article>
  );
}

function CharacterStore({
  buyingCharacterId,
  isPending,
  isPointsPending,
  items,
  onBuy,
  points,
}: {
  buyingCharacterId: number | null;
  isPending: boolean;
  isPointsPending: boolean;
  items: PersonagemLoja[];
  onBuy: (id: number) => void;
  points: number;
}) {
  const [selectedTier, setSelectedTier] = useState("Todos");
  const tiers = [
    "Todos",
    ...Array.from(new Set(items.map((item) => formatTier(item.tier)))).filter(
      (tier) => !isFreeTier(tier),
    ),
  ];
  const visibleItems =
    selectedTier === "Todos"
      ? items
      : items.filter((item) => formatTier(item.tier) === selectedTier);

  if (isPending) {
    return (
      <div className="space-y-7">
        <StoreHeader
          tiers={["Todos", "Comum", "Raro", "Epico"]}
          selectedTier="Todos"
          points={points}
          isPointsPending={isPointsPending}
          onSelectTier={() => undefined}
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-7">
      <StoreHeader
        tiers={tiers}
        selectedTier={selectedTier}
        points={points}
        isPointsPending={isPointsPending}
        onSelectTier={setSelectedTier}
      />

      {items.length === 0 ? (
        <div className="rounded-[18px] border border-dashed border-[#d9cdf8] bg-white p-8 text-center shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
          <ShoppingBag className="mx-auto mb-3 size-10 text-[#7c35e8]" />
          <p className="font-black text-[#101044]">
            Nenhum item disponivel na loja
          </p>
          <p className="mt-1 text-sm font-medium text-[#5d5a89]">
            Novos personagens aparecerao aqui quando forem liberados.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {visibleItems.map((personagem) => (
            <StoreCharacterCard
              key={personagem.id}
              personagem={personagem}
              canBuy={points >= personagem.price && !personagem.owned}
              isBuying={buyingCharacterId === personagem.id}
              isBuyingDisabled={buyingCharacterId !== null}
              onBuy={onBuy}
            />
          ))}
        </div>
      )}

      <div className="mx-auto flex max-w-[1280px] flex-col gap-4 rounded-[18px] border border-[#e3d9f8] bg-white px-5 py-4 shadow-[0_18px_50px_rgba(72,35,137,0.08)] sm:flex-row sm:items-center">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-[#f1e8ff] text-[#6d2ee8]">
          <Gift aria-hidden="true" className="size-7" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-black text-[#101044]">
            Novos personagens em breve!
          </p>
          <p className="text-sm font-medium text-[#5d5a89]">
            Continue cumprindo desafios e acumulando pontos para descobrir
            novidades incriveis na loja.
          </p>
        </div>
        <Link
          href="/estudantes/desafios"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] border border-[#e3d9f8] bg-white px-5 font-semibold text-[#6d2ee8] transition hover:bg-[#f6f0ff]"
        >
          Ver desafios
          <ArrowRight aria-hidden="true" className="size-5" />
        </Link>
      </div>
    </section>
  );
}

function StoreHeader({
  isPointsPending,
  onSelectTier,
  points,
  selectedTier,
  tiers,
}: {
  isPointsPending: boolean;
  onSelectTier: (tier: string) => void;
  points: number;
  selectedTier: string;
  tiers: string[];
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(260px,1fr)_minmax(520px,0.95fr)] xl:items-center">
      <div className="flex items-center gap-5">
        <span className="flex size-20 shrink-0 items-center justify-center rounded-[22px] bg-[#f0e7ff] text-[#6d2ee8] ring-1 ring-[#dfd2fb]">
          <ShoppingBag aria-hidden="true" className="size-10" />
        </span>
        <div className="min-w-0">
          <h1 className="text-4xl font-black tracking-normal text-[#101044]">
            Loja
          </h1>
          <p className="mt-1 text-base font-medium text-[#5d5a89]">
            Troque seus pontos por personagens e itens especiais.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-[18px] border border-[#e3d9f8] bg-white p-4 shadow-[0_18px_50px_rgba(72,35,137,0.08)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#f2edff]">
            <Star
              aria-hidden="true"
              className="size-9 fill-[#ffb900] text-[#ffb900]"
            />
          </span>
          <div>
            {isPointsPending ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className="text-2xl font-black text-[#5e18e6]">
                {points.toLocaleString("pt-BR")} pontos
              </p>
            )}
            <p className="text-sm font-semibold text-[#5d5a89]">
              Seu saldo atual
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tiers.map((tier) => {
            const isSelected = tier === selectedTier;

            return (
              <Button
                key={tier}
                type="button"
                onClick={() => onSelectTier(tier)}
                className={`min-h-11 rounded-[14px] border px-5 text-sm ${
                  isSelected
                    ? "border-transparent bg-gradient-to-r from-[#6d2ee8] to-[#8a3df2] text-white shadow-[0_12px_24px_rgba(109,46,232,0.22)]"
                    : "border-[#e3d9f8] bg-white text-[#4f4b80] hover:bg-[#f6f0ff]"
                }`}
              >
                {tier}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StoreCharacterCard({
  canBuy,
  isBuying,
  isBuyingDisabled,
  onBuy,
  personagem,
}: {
  canBuy: boolean;
  isBuying: boolean;
  isBuyingDisabled: boolean;
  onBuy: (id: number) => void;
  personagem: PersonagemLoja;
}) {
  const tier = formatTier(personagem.tier);
  const tierTone = getTierTone(tier);

  return (
    <article className="flex min-h-[288px] flex-col rounded-[18px] border border-[#e3d9f8] bg-white p-4 shadow-[0_18px_50px_rgba(72,35,137,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_58px_rgba(72,35,137,0.13)]">
      <span
        className={`mb-2 w-fit rounded-full px-3 py-1 text-xs font-black uppercase ${tierTone.badge}`}
      >
        {tier}
      </span>

      <div className="grid flex-1 grid-cols-[44%_1fr] items-center gap-3">
        <div className="flex min-h-[150px] items-center justify-center">
          <Image
            src={getAvatarImage(personagem.image)}
            alt={personagem.name}
            className="max-h-[150px] w-auto object-contain"
          />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-black text-[#101044]">
            {personagem.name}
          </h2>
          <p className="mt-2 text-sm font-medium leading-6 text-[#5d5a89]">
            {personagem.description}
          </p>
          <p className="mt-2 text-xs font-bold text-[#7c35e8]">
            Ate nivel {personagem.maxLevel}
          </p>
        </div>
      </div>

      <Button
        type="button"
        disabled={!canBuy || isBuyingDisabled}
        onClick={() => onBuy(personagem.id)}
        className={`mt-4 min-h-12 w-full rounded-[10px] px-4 text-base font-black ${tierTone.price}`}
      >
        {isBuying ? (
          <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
        ) : (
          <Star
            aria-hidden="true"
            className="size-5 fill-[#ffb900] text-[#ffb900]"
          />
        )}
        {isBuying
          ? "Comprando"
          : personagem.owned
            ? "Ja possui"
            : `${personagem.price.toLocaleString("pt-BR")} pontos`}
      </Button>
    </article>
  );
}

function formatTier(tier: string) {
  const normalized = normalizeTier(tier);

  if (normalized.includes("legendary") || normalized.includes("lendario")) {
    return "Lendario";
  }

  if (normalized.includes("epic") || normalized.includes("epico")) {
    return "Epico";
  }

  if (normalized.includes("rare") || normalized.includes("raro")) {
    return "Raro";
  }

  if (normalized.includes("common") || normalized.includes("comum")) {
    return "Comum";
  }

  if (normalized.includes("free") || normalized.includes("gratis")) {
    return "Free";
  }

  return tier.trim() || "Comum";
}

function isFreeTier(tier: string) {
  const normalized = normalizeTier(tier);

  return normalized === "free" || normalized === "gratis";
}

function normalizeTier(tier: string) {
  return tier
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getTierTone(tier: string) {
  if (tier === "Free") {
    return {
      badge: "bg-[#f1f3f5] text-[#5f6670]",
      price: "bg-[#f4f5f7] text-[#5f6670] hover:bg-[#eceff2]",
    };
  }

  if (tier === "Raro") {
    return {
      badge: "bg-[#e9efff] text-[#1769e8]",
      price: "bg-[#edf2ff] text-[#1769e8] hover:bg-[#e5edff]",
    };
  }

  if (tier === "Epico") {
    return {
      badge: "bg-[#f2ddff] text-[#8b20ef]",
      price: "bg-[#f8e6ff] text-[#8b20ef] hover:bg-[#f3dcff]",
    };
  }

  if (tier === "Lendario") {
    return {
      badge: "bg-[#fff3c4] text-[#9a6a00]",
      price: "bg-[#fff5cf] text-[#9a6a00] hover:bg-[#ffedaa]",
    };
  }

  return {
    badge: "bg-[#e7f8ec] text-[#16823a]",
    price: "bg-[#ecfbf0] text-[#16823a] hover:bg-[#dcf6e5]",
  };
}
