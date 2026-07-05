"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ChevronRight,
  Crown,
  Medal,
  Shield,
  Star,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Select } from "@/components/form/Select";
import { TableSkeleton } from "@/components/loading";
import { getApiErrorMessage } from "@/services/api/errors/getApiErrorMessage";
import { authApi } from "@/services/api/modules/auth";
import { gamificationApi } from "@/services/api/modules/gamification";
import { getAuthActor } from "@/services/api/tokenStorage";
import type { Aluno, RankingItem } from "@/types/aluno";
import type { User } from "@/types/user";
import {
  markEquippedCharacter,
  readStoredEquippedCharacterId,
  resolveEquippedCharacterId,
} from "@/utils/student/equippedCharacter";
import { getAvatarProfileImage } from "../student/studentVisualAssets";

export function RankingWorkspace() {
  const actor = getAuthActor();
  const [selectedTurmaId, setSelectedTurmaId] = useState("");

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
  const professorTurmasQuery = useQuery({
    queryKey: ["professor", "turmas"],
    queryFn: gamificationApi.professorTurmas,
    enabled: role === "professor",
  });
  const professorSessionsQuery = useQuery({
    queryKey: ["professor", "sessoes-ao-vivo"],
    queryFn: gamificationApi.professorSessoesAoVivo,
    enabled: role === "professor",
  });
  const professorTurmas =
    meQuery.data && "roles" in meQuery.data ? (meQuery.data.turmas ?? []) : [];
  const turmaOptions = useMemo(() => {
    if (role === "professor") {
      const turmas = new Map<string, string>();

      for (const turma of professorTurmasQuery.data ?? professorTurmas) {
        turmas.set(String(turma.id), turma.name);
      }

      for (const session of professorSessionsQuery.data ?? []) {
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
    }

    const turmas = turmasQuery.data;

    return (
      turmas?.map((turma) => ({
        label: turma.name,
        value: String(turma.id),
      })) ?? []
    );
  }, [
    professorSessionsQuery.data,
    professorTurmas,
    professorTurmasQuery.data,
    role,
    turmasQuery.data,
  ]);

  useEffect(() => {
    if (
      (role !== "gestor" && role !== "professor") ||
      selectedTurmaId ||
      !turmaOptions[0]
    ) {
      return;
    }

    setSelectedTurmaId(turmaOptions[0].value);
  }, [role, selectedTurmaId, turmaOptions]);

  const selectedTurmaIsAvailable = turmaOptions.some(
    (option) => option.value === selectedTurmaId,
  );

  useEffect(() => {
    if (!selectedTurmaId || selectedTurmaIsAvailable) return;

    setSelectedTurmaId("");
  }, [selectedTurmaId, selectedTurmaIsAvailable]);

  const rankingQuery = useQuery({
    queryKey: ["ranking", actor, role, selectedTurmaId],
    queryFn: () => {
      if (actor === "aluno") {
        return gamificationApi.rankingAlunoTurma();
      }

      if (role === "professor" && selectedTurmaId) {
        return gamificationApi.rankingProfessorTurma(Number(selectedTurmaId));
      }

      if (role === "gestor" && selectedTurmaId) {
        return gamificationApi.rankingGestorTurma(Number(selectedTurmaId));
      }

      return Promise.resolve([]);
    },
    enabled:
      actor === "aluno" ||
      ((role === "gestor" || role === "professor") && Boolean(selectedTurmaId)),
  });
  const personagensQuery = useQuery({
    queryKey: ["aluno", "personagens"],
    queryFn: gamificationApi.personagens,
    enabled: actor === "aluno",
  });

  const personagens = markEquippedCharacter(
    personagensQuery.data,
    resolveEquippedCharacterId(
      personagensQuery.data,
      readStoredEquippedCharacterId(),
    ),
  );
  const equippedCharacter = personagens?.find(
    (personagem) => personagem.equipped,
  );

  if (actor === "aluno") {
    return (
      <StudentRankingView
        currentStudentAvatar={
          meQuery.data && !("roles" in meQuery.data) && equippedCharacter
            ? {
                avatar: equippedCharacter.avatar,
                image: equippedCharacter.image,
                studentId: meQuery.data.id,
              }
            : undefined
        }
        error={rankingQuery.error}
        isError={rankingQuery.isError}
        isFetching={rankingQuery.isFetching}
        isSuccess={rankingQuery.isSuccess}
        items={rankingQuery.data ?? []}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Ranking</h1>
          <p className="mt-1 text-base text-text-secondary">
            Classificacao por pontos, XP e nivel.
          </p>
        </div>

        {(role === "gestor" || role === "professor") && (
          <div className="lg:w-[360px]">
            <Select
              label="Turma"
              value={selectedTurmaId}
              disabled={
                (role === "gestor" && turmasQuery.isPending) ||
                (role === "professor" &&
                  professorTurmasQuery.isPending &&
                  professorSessionsQuery.isPending)
              }
              searchable
              placeholder={
                (role === "gestor" && turmasQuery.isPending) ||
                (role === "professor" &&
                  professorTurmasQuery.isPending &&
                  professorSessionsQuery.isPending)
                  ? "Carregando turmas..."
                  : "Selecionar turma"
              }
              emptyMessage="Nenhuma turma encontrada."
              options={turmaOptions}
              onChange={setSelectedTurmaId}
            />
          </div>
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

        {role === "professor" && !selectedTurmaId && (
          <div className="rounded-system border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <Medal className="mx-auto mb-3 size-10 text-brand-primary" />
            <p className="font-semibold text-text-primary">
              Nenhuma turma vinculada para consultar
            </p>
          </div>
        )}

        {role === "gestor" && !selectedTurmaId && !turmasQuery.isPending && (
          <div className="rounded-system border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <Medal className="mx-auto mb-3 size-10 text-brand-primary" />
            <p className="font-semibold text-text-primary">
              Nenhuma turma disponivel para consultar
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

type StudentRankingViewProps = {
  currentStudentAvatar?: {
    avatar?: string;
    image?: string;
    studentId?: number;
  };
  error: unknown;
  isError: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  items: RankingItem[];
};

function StudentRankingView({
  currentStudentAvatar,
  error,
  isError,
  isFetching,
  isSuccess,
  items,
}: StudentRankingViewProps) {
  const podiumSlots = [2, 1, 3].map((position) => ({
    position,
    item: items.find((rankingItem) => rankingItem.position === position),
  }));

  return (
    <div className="relative px-3 py-4 sm:px-6 lg:px-8">
      <RankingDecorations />

      <section className="relative z-10">
        <div>
          <h1 className="text-5xl font-black tracking-normal text-[#5b2bdc]">
            Ranking
          </h1>
          <p className="mt-2 text-lg font-medium text-[#656099]">
            Classificacao por pontos, XP e nivel.
          </p>
        </div>
      </section>

      {isFetching && (
        <section className="relative z-10 mt-10 rounded-[24px] border border-[#e3d9f8] bg-white/90 p-5 shadow-[0_22px_60px_rgba(72,35,137,0.08)]">
          <TableSkeleton rows={8} columns={5} />
        </section>
      )}

      {isError && (
        <div
          role="alert"
          className="relative z-10 mt-8 flex gap-3 rounded-[18px] border border-red-200 bg-red-50 p-4 text-red-700"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          <p>{getApiErrorMessage(error)}</p>
        </div>
      )}

      {!isFetching && (
        <>
          <section className="relative z-10 mx-auto mt-3 grid max-w-[900px] items-end justify-center gap-5 md:grid-cols-3">
            {podiumSlots.map(({ item, position }) => (
              <PodiumCard
                key={position}
                currentStudentAvatar={currentStudentAvatar}
                item={item}
                position={position}
              />
            ))}
          </section>

          {items.length > 0 && (
            <section className="relative z-10 mt-6 overflow-hidden rounded-[24px] border border-[#e3d9f8] bg-white/95 p-4 shadow-[0_22px_60px_rgba(72,35,137,0.1)]">
              <div className="hidden grid-cols-[120px_minmax(240px,1fr)_140px_130px_220px_32px] px-6 py-3 text-sm font-black text-[#5d5a89] lg:grid">
                <span>Posicao</span>
                <span>Aluno</span>
                <span className="inline-flex items-center gap-2">
                  <Star className="size-5 fill-[#ffb900] text-[#ffb900]" />
                  Pontos
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="rounded-full bg-[#7c35e8] px-1.5 py-0.5 text-[10px] font-black text-white">
                    XP
                  </span>
                  XP
                </span>
                <span className="inline-flex items-center gap-2">
                  <Shield className="size-5 fill-[#63bd47] text-[#4aa53c]" />
                  Nivel
                </span>
                <span />
              </div>

              <div className="space-y-2">
                {items.map((item) => (
                  <RankingRow
                    key={item.aluno.id}
                    currentStudentAvatar={currentStudentAvatar}
                    item={item}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {!isFetching && isSuccess && items.length === 0 && (
        <span className="sr-only">Ranking ainda sem dados</span>
      )}
    </div>
  );
}

function RankingDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <Star className="absolute left-[18%] top-[18%] size-5 fill-[#cdb9ff] text-[#cdb9ff] opacity-80" />
      <Star className="absolute right-[18%] top-[20%] size-5 fill-[#cdb9ff] text-[#cdb9ff] opacity-70" />
      <Star className="absolute left-[40%] top-[10%] size-4 fill-[#ffd891] text-[#ffd891] opacity-80" />
      <Star className="absolute right-[31%] top-[13%] size-4 fill-[#ffd891] text-[#ffd891] opacity-70" />
      <span className="absolute left-[23%] top-[8%] size-3 rotate-45 rounded-[3px] bg-[#cdb9ff]/70" />
      <span className="absolute right-[23%] top-[9%] size-3 rotate-45 rounded-[3px] bg-[#cdb9ff]/70" />
      <span className="absolute left-[33%] top-[25%] size-2 rotate-45 rounded-[2px] bg-[#ffd891]/80" />
      <span className="absolute right-[35%] top-[26%] size-2 rotate-45 rounded-[2px] bg-[#ffd891]/80" />
    </div>
  );
}

function PodiumCard({
  currentStudentAvatar,
  item,
  position,
}: {
  currentStudentAvatar?: {
    avatar?: string;
    image?: string;
    studentId?: number;
  };
  item?: RankingItem;
  position: number;
}) {
  const isFirst = position === 1;
  const cardTone =
    position === 1
      ? "border-[#ffd77a] bg-[#fffdf7] shadow-[0_20px_60px_rgba(255,185,0,0.18)]"
      : position === 2
        ? "border-[#d8d7ea] bg-white shadow-[0_18px_48px_rgba(72,35,137,0.12)]"
        : "border-[#f0c7ad] bg-white shadow-[0_18px_48px_rgba(197,105,42,0.12)]";

  return (
    <article
      className={`relative mx-auto flex w-full max-w-[260px] flex-col items-center rounded-[22px] border p-5 text-center ${cardTone} ${
        isFirst ? "min-h-[250px] md:order-2" : "min-h-[220px] md:mb-0"
      } ${position === 2 ? "md:order-1" : ""} ${
        position === 3 ? "md:order-3" : ""
      }`}
    >
      {isFirst && (
        <Crown className="-top-12 absolute size-14 fill-[#ffb900] text-[#ff9f1a]" />
      )}
      <PositionMedal position={position} />
      {item ? (
        <>
          <AvatarProfile
            currentStudentAvatar={currentStudentAvatar}
            item={item}
            className={isFirst ? "mt-0 size-24" : "mt-1 size-20"}
          />
          <h2 className="mt-3 line-clamp-1 text-xl font-black text-[#101044]">
            {item.aluno.name}
          </h2>
          <p className="mt-2 inline-flex items-center gap-2 text-2xl font-black text-[#101044]">
            {item.points}
            <Star className="size-6 fill-[#ffb900] text-[#ffb900]" />
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Pill tone="xp">XP {item.xp}</Pill>
            <Pill tone="level">Nivel {item.level}</Pill>
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center" aria-hidden="true" />
      )}
    </article>
  );
}

function RankingRow({
  currentStudentAvatar,
  item,
}: {
  currentStudentAvatar?: {
    avatar?: string;
    image?: string;
    studentId?: number;
  };
  item: RankingItem;
}) {
  const highlight =
    item.position === 1
      ? "bg-[#fff8e9]"
      : item.position === 2
        ? "bg-[#f8faff]"
        : item.position === 3
          ? "bg-[#fff3eb]"
          : "bg-white";

  return (
    <article
      className={`grid min-h-[64px] items-center gap-3 rounded-[12px] border border-transparent px-4 py-3 text-[#101044] transition hover:border-[#e3d9f8] hover:shadow-[0_12px_30px_rgba(72,35,137,0.08)] lg:grid-cols-[120px_minmax(240px,1fr)_140px_130px_220px_32px] ${highlight}`}
    >
      <div className="flex items-center">
        <PositionMedal position={item.position} compact />
      </div>

      <div className="flex min-w-0 items-center gap-4">
        <AvatarProfile
          currentStudentAvatar={currentStudentAvatar}
          item={item}
          className="size-11 shrink-0"
        />
        <p className="truncate text-lg font-black">{item.aluno.name}</p>
      </div>

      <p className="inline-flex items-center gap-2 font-black lg:justify-start">
        <span className="lg:hidden">Pontos</span>
        {item.points}
        <Star className="size-4 fill-[#ffb900] text-[#ffb900]" />
      </p>

      <p className="font-black text-[#101044]">
        <span className="mr-2 lg:hidden">XP</span>
        {item.xp}
      </p>

      <div className="grid grid-cols-[44px_1fr] items-center gap-3">
        <span className="relative flex size-8 items-center justify-center">
          <Shield className="absolute size-9 fill-[#63bd47] text-[#4aa53c]" />
          <span className="relative text-sm font-black text-white">
            {item.level}
          </span>
        </span>
        <div className="h-2.5 overflow-hidden rounded-full bg-[#ececf7]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#7c35e8] to-[#9d56ff]"
            style={{ width: `${getLevelProgress(item)}%` }}
          />
        </div>
      </div>

      <ChevronRight className="hidden size-6 text-[#1c2370] lg:block" />
    </article>
  );
}

function AvatarProfile({
  className,
  currentStudentAvatar,
  item,
}: {
  className?: string;
  currentStudentAvatar?: {
    avatar?: string;
    image?: string;
    studentId?: number;
  };
  item: RankingItem;
}) {
  const avatar =
    currentStudentAvatar?.studentId === item.aluno.id
      ? currentStudentAvatar.avatar
      : item.avatar;
  const image =
    currentStudentAvatar?.studentId === item.aluno.id
      ? currentStudentAvatar.image
      : item.image;

  return (
    <span
      className={`flex items-center justify-center overflow-hidden rounded-full bg-[#f1e8ff] ring-1 ring-[#d9c6ff] ${className ?? ""}`}
    >
      <Image
        src={getAvatarProfileImage(avatar, image)}
        alt=""
        aria-hidden="true"
        className="size-full object-cover"
      />
    </span>
  );
}

function PositionMedal({
  compact,
  position,
}: {
  compact?: boolean;
  position: number;
}) {
  if (position > 3) {
    return (
      <span className="text-lg font-black text-[#7c35e8]">#{position}</span>
    );
  }

  const tone =
    position === 1
      ? "from-[#ffcf43] to-[#ff7b2a] text-white"
      : position === 2
        ? "from-[#d8dce6] to-[#89909e] text-white"
        : "from-[#d88a4c] to-[#b75b24] text-white";

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${tone} font-black shadow-[0_8px_18px_rgba(0,0,0,0.16)] ${
        compact ? "size-9 text-base" : "absolute left-4 top-6 size-12 text-xl"
      }`}
    >
      {position}
    </span>
  );
}

function Pill({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "level" | "xp";
}) {
  return (
    <span
      className={`inline-flex min-h-8 items-center rounded-full px-4 text-sm font-black ${
        tone === "xp"
          ? "bg-[#efe7ff] text-[#6d2ee8] ring-1 ring-[#d9c6ff]"
          : "bg-[#e9f8e3] text-[#2f8d2f] ring-1 ring-[#c7edbc]"
      }`}
    >
      {children}
    </span>
  );
}

function getLevelProgress(item: RankingItem) {
  if (item.xp <= 0) return 0;

  const progress = item.xp % 100;

  return progress === 0 ? 100 : Math.max(18, progress);
}
