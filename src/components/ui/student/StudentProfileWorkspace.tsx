"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  CircleX,
  History,
  PackageCheck,
  Star,
  Trophy,
  UserRound,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/buttons";
import { Skeleton, TableSkeleton } from "@/components/loading";
import { getApiErrorMessage } from "@/services/api/errors/getApiErrorMessage";
import { gamificationApi } from "@/services/api/modules/gamification";
import type {
  AlunoPersonagem,
  ConquistaProgresso,
  MissaoProgresso,
  PersonagemLoja,
} from "@/types/aluno";
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
    onSuccess: async (result) => {
      setFeedback(result.message);
      await queryClient.invalidateQueries({ queryKey: ["aluno"] });
    },
  });

  const equiparMutation = useMutation({
    mutationFn: gamificationApi.equiparPersonagem,
    onSuccess: async (result) => {
      setFeedback(result.message);
      await queryClient.invalidateQueries({
        queryKey: ["aluno", "personagens"],
      });
    },
  });

  const equippedCharacter = personagensQuery.data?.find(
    (personagem) => personagem.equipped,
  );

  return (
    <div className="space-y-6">
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

      {feedback && (
        <div
          role="status"
          className="flex gap-3 rounded-system border border-emerald-200 bg-emerald-50 p-4 text-emerald-700"
        >
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          <p>{feedback}</p>
        </div>
      )}

      {(perfilQuery.isError ||
        missoesQuery.isError ||
        conquistasQuery.isError ||
        personagensQuery.isError ||
        lojaQuery.isError) && (
        <div
          role="alert"
          className="flex gap-3 rounded-system border border-red-200 bg-red-50 p-4 text-red-700"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          <p>
            {getApiErrorMessage(
              perfilQuery.error ??
                missoesQuery.error ??
                conquistasQuery.error ??
                personagensQuery.error ??
                lojaQuery.error,
            )}
          </p>
        </div>
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
        <ProgressGrid
          isPending={conquistasQuery.isPending}
          emptyTitle="Nenhuma conquista disponivel"
          items={conquistasQuery.data ?? []}
          renderItem={(conquista) => (
            <AchievementCard key={conquista.id} conquista={conquista} />
          )}
        />
      )}

      {view === "personagens" && (
        <CharacterInventory
          items={personagensQuery.data ?? []}
          isPending={personagensQuery.isPending}
          isEquipping={equiparMutation.isPending}
          onEquip={(id) => equiparMutation.mutate(id)}
        />
      )}

      {view === "loja" && (
        <CharacterStore
          items={lojaQuery.data ?? []}
          points={perfilQuery.data?.points ?? 0}
          isPending={lojaQuery.isPending}
          isBuying={comprarMutation.isPending}
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
  xp: number;
}) {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-4">
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

function AchievementCard({ conquista }: { conquista: ConquistaProgresso }) {
  const percent = getProgressPercent(conquista.current, conquista.goal);
  const achievementImage = getAchievementImage(conquista.icon);

  return (
    <article className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-4">
          {achievementImage && (
            <Image
              src={achievementImage}
              alt=""
              className={`size-14 shrink-0 rounded-[8px] object-contain ${
                conquista.unlocked ? "" : "grayscale"
              }`}
            />
          )}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-primary">
              {conquista.type}
            </p>
            <h2 className="mt-1 text-lg font-bold text-text-primary">
              {conquista.name}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {conquista.description}
            </p>
          </div>
        </div>
        <StatusPill
          done={conquista.unlocked}
          doneLabel="Liberada"
          pendingLabel="Bloqueada"
        />
      </div>
      <ProgressLine
        current={conquista.current}
        goal={conquista.goal}
        percent={percent}
      />
      <RewardLine points={conquista.rewardPoints} xp={conquista.rewardXp} />
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
}: {
  isEquipping: boolean;
  isPending: boolean;
  items: AlunoPersonagem[];
  onEquip: (id: number) => void;
}) {
  if (isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <section className="rounded-system border border-dashed border-slate-300 bg-white p-8 text-center">
        <PackageCheck className="mx-auto mb-3 size-10 text-brand-primary" />
        <p className="font-semibold text-text-primary">
          Voce ainda nao possui personagens
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((personagem) => (
        <CharacterCard
          key={personagem.personagemId}
          action={
            <Button
              type="button"
              disabled={personagem.equipped || isEquipping}
              onClick={() => onEquip(personagem.personagemId)}
              className="min-h-11 w-full bg-brand-primary px-4 text-white hover:bg-brand-primary-hover"
            >
              {personagem.equipped ? "Equipado" : "Equipar"}
            </Button>
          }
          image={personagem.image}
          name={personagem.name}
          tier={personagem.tier}
          detail={`Nivel ${personagem.level}/${personagem.maxLevel}`}
          progress={
            personagem.nextLevelIn
              ? `${personagem.nextLevelIn} questoes para evoluir`
              : "Nivel maximo"
          }
        />
      ))}
    </section>
  );
}

function CharacterStore({
  isBuying,
  isPending,
  items,
  onBuy,
  points,
}: {
  isBuying: boolean;
  isPending: boolean;
  items: PersonagemLoja[];
  onBuy: (id: number) => void;
  points: number;
}) {
  if (isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((personagem) => {
        const canBuy = points >= personagem.price && !personagem.owned;

        return (
          <CharacterCard
            key={personagem.id}
            action={
              <Button
                type="button"
                disabled={!canBuy || isBuying}
                onClick={() => onBuy(personagem.id)}
                className="min-h-11 w-full bg-brand-primary px-4 text-white hover:bg-brand-primary-hover"
              >
                {personagem.owned
                  ? "Ja possui"
                  : `${personagem.price.toLocaleString("pt-BR")} pontos`}
              </Button>
            }
            image={personagem.image}
            name={personagem.name}
            tier={personagem.tier}
            detail={`Ate nivel ${personagem.maxLevel}`}
            progress={personagem.description}
          />
        );
      })}
    </section>
  );
}

function CharacterCard({
  action,
  detail,
  image,
  name,
  progress,
  tier,
}: {
  action: React.ReactNode;
  detail: string;
  image: string;
  name: string;
  progress: string;
  tier: string;
}) {
  return (
    <article className="flex min-h-[280px] flex-col rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
      <div className="flex justify-center">
        <Image
          src={getAvatarImage(image)}
          alt={name}
          className="h-32 w-auto object-contain"
        />
      </div>
      <div className="mt-4 flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-primary">
          {tier}
        </p>
        <h2 className="mt-1 text-xl font-bold text-text-primary">{name}</h2>
        <p className="mt-1 text-sm font-semibold text-text-secondary">
          {detail}
        </p>
        <p className="mt-2 text-sm text-text-secondary">{progress}</p>
      </div>
      <div className="mt-4">{action}</div>
    </article>
  );
}
