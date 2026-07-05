"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  BookOpen,
  ChevronRight,
  CircleDotDashed,
  FlaskConical,
  Globe2,
  Landmark,
  Medal,
  MoreVertical,
  Shuffle,
  Sigma,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import mascotEstudante from "@/assets/images/mascot-estudante.png";
import { gamificationApi } from "@/services/api/modules/gamification";
import type { ConquistaProgresso } from "@/types/aluno";
import {
  markEquippedCharacter,
  readStoredEquippedCharacterId,
  resolveEquippedCharacterId,
} from "@/utils/student/equippedCharacter";
import { getAchievementImage, getAvatarImage } from "./studentVisualAssets";

const subjectColor = "bg-[#7c35e8]";
const subjectSkeletonKeys = [
  "math",
  "language",
  "science",
  "history",
  "geography",
];

function ProgressBar({
  className,
  style,
  valueClassName,
}: {
  className?: string;
  style?: React.CSSProperties;
  valueClassName: string;
}) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#ebe6f8]">
      <div
        className={`h-full rounded-full ${valueClassName} ${className ?? ""}`}
        style={style}
      />
    </div>
  );
}

function formatAchievementDate(value?: string) {
  if (!value) return "";

  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getSubjectIcon(name: string, acronym?: string) {
  const subject = normalizeText(`${name} ${acronym ?? ""}`);

  if (subject.includes("matematica") || subject.includes("mat")) {
    return Sigma;
  }

  if (
    subject.includes("lingua") ||
    subject.includes("portugues") ||
    subject.includes("por")
  ) {
    return BookOpen;
  }

  if (subject.includes("ciencia") || subject.includes("cie")) {
    return FlaskConical;
  }

  if (subject.includes("historia") || subject.includes("his")) {
    return Landmark;
  }

  if (subject.includes("geografia") || subject.includes("geo")) {
    return Globe2;
  }

  return BookOpen;
}

export function StudentLobby() {
  const meQuery = useQuery({
    queryKey: ["auth", "me", "aluno"],
    queryFn: gamificationApi.alunoMe,
    retry: false,
  });

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", "aluno"],
    queryFn: gamificationApi.alunoDashboard,
  });
  const disciplinasQuery = useQuery({
    queryKey: ["aluno", "disciplinas"],
    queryFn: gamificationApi.alunoDisciplinas,
  });
  const perfilQuery = useQuery({
    queryKey: ["aluno", "perfil"],
    queryFn: gamificationApi.alunoPerfil,
  });
  const conquistasQuery = useQuery({
    queryKey: ["aluno", "conquistas"],
    queryFn: gamificationApi.conquistas,
  });
  const personagensQuery = useQuery({
    queryKey: ["aluno", "personagens"],
    queryFn: gamificationApi.personagens,
  });

  const studentName =
    dashboardQuery.data?.kind === "aluno"
      ? dashboardQuery.data.aluno.nome
      : meQuery.data?.name;
  const profile =
    dashboardQuery.data?.kind === "aluno" ? dashboardQuery.data.perfil : null;
  const level = perfilQuery.data?.level ?? profile?.nivel ?? 1;
  const xp = perfilQuery.data?.xp ?? profile?.xp ?? 0;
  const points = perfilQuery.data?.points ?? profile?.pontos ?? 0;
  const totalPoints =
    perfilQuery.data?.totalPoints ?? profile?.pontuacao_total ?? points;
  const energy = perfilQuery.data?.energy ?? profile?.energia ?? 0;
  const maxEnergy =
    perfilQuery.data?.maxEnergy ?? profile?.energia_maxima ?? 10;
  const xpInLevel = xp % 100;
  const xpToNextLevel = perfilQuery.data?.xpToNextLevel ?? 100 - xpInLevel;
  const rank =
    dashboardQuery.data?.kind === "aluno"
      ? dashboardQuery.data.posicao_turma
      : null;
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
  const challengeDiscipline =
    disciplinasQuery.data?.find((disciplina) => disciplina.available > 0) ??
    disciplinasQuery.data?.[0];
  const challengeHref = challengeDiscipline
    ? `/estudantes/responder?disciplina=${challengeDiscipline.id}`
    : "/estudantes/responder";
  const challengeProgress = challengeDiscipline
    ? `${challengeDiscipline.answered} / ${challengeDiscipline.total}`
    : "0 / 0";
  const challengeProgressPercent = challengeDiscipline
    ? Math.round(
        (challengeDiscipline.answered /
          Math.max(challengeDiscipline.total, 1)) *
          100,
      )
    : 0;
  const recentAchievements =
    conquistasQuery.data
      ?.filter((conquista) => conquista.unlocked)
      .sort((a, b) => {
        const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
        const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;

        return dateB - dateA;
      })
      .slice(0, 3) ?? [];

  return (
    <div className="grid gap-5">
      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[18px] border border-[#e3d9f8] bg-white p-6 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
          <div className="grid gap-5 sm:grid-cols-[210px_1fr]">
            <div className="relative flex items-end justify-center">
              <Image
                src={getAvatarImage(equippedCharacter?.image)}
                alt={
                  equippedCharacter
                    ? `Personagem ${equippedCharacter.name}`
                    : "Avatar do estudante"
                }
                className="h-[250px] w-auto object-contain"
                priority
              />
            </div>

            <div className="flex flex-col justify-center">
              <h1 className="text-3xl font-black tracking-normal">
                {studentName ?? "Estudante"}
              </h1>
              <p className="mt-2 text-lg font-black text-[#7c35e8]">
                Nivel {level}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[#4c4a79]">
                {equippedCharacter
                  ? `${equippedCharacter.name} equipado`
                  : "Explorador do Conhecimento"}
                <Sparkles className="size-4 fill-[#7c35e8] text-[#7c35e8]" />
              </p>

              <div className="mt-5 grid grid-cols-[max-content_minmax(140px,1fr)] items-center gap-4">
                <span className="flex items-center gap-2 whitespace-nowrap text-xl font-black">
                  <span className="text-[#ffb000]">★</span>
                  {xp.toLocaleString("pt-BR")} XP
                </span>
                <ProgressBar
                  style={{ width: `${xpInLevel}%` }}
                  valueClassName="bg-[#7c35e8]"
                />
              </div>

              <div className="mt-3 flex justify-between gap-4 text-xs font-medium text-[#5d5a89]">
                <span className="whitespace-nowrap">
                  Proximo nivel: {level + 1}
                </span>
                <span className="whitespace-nowrap">
                  {xpToNextLevel} XP para o Nivel {level + 1}
                </span>
              </div>

              <div className="mt-6 grid rounded-[14px] border border-[#e3d9f8] bg-white py-4 sm:grid-cols-3">
                <StudentMetric
                  icon={<Zap className="size-9 fill-[#7c35e8]" />}
                  label="Energia"
                  value={`${energy} / ${maxEnergy}`}
                />
                <StudentMetric
                  icon={<Trophy className="size-9 fill-[#ff6b12]" />}
                  label="Pontuacao"
                  value={totalPoints.toLocaleString("pt-BR")}
                />
                <StudentMetric
                  icon={<Medal className="size-9" />}
                  label="Ranking"
                  value={rank ? `Top ${rank}` : "Top 12"}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[18px] border border-[#e3d9f8] bg-white p-8 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
          <MoreVertical className="absolute right-8 top-7 size-6 text-[#5f5a89]" />
          <div className="relative z-10 max-w-[58%]">
            <div className="flex items-center gap-4">
              <BookOpen className="size-8 text-[#7c35e8]" />
              <h2 className="text-lg font-black">Continue praticando</h2>
            </div>
            <p className="mt-8 text-2xl font-black">
              {challengeDiscipline?.name ?? "Questoes"}
            </p>
            <p className="mt-2 text-lg text-[#4f4b80]">
              {challengeDiscipline?.area ??
                challengeDiscipline?.acronym ??
                "Pratica geral"}
            </p>
            <p className="mt-8 text-sm font-medium text-[#5d5a89]">Progresso</p>
            <div className="mt-3 grid grid-cols-[minmax(0,1fr)_max-content] items-center gap-5">
              <ProgressBar
                style={{ width: `${challengeProgressPercent}%` }}
                valueClassName="bg-[#7c35e8]"
              />
              <span className="whitespace-nowrap font-semibold text-[#4f4b80]">
                {challengeProgress}
              </span>
            </div>
            <Link
              href={challengeHref}
              className="mt-8 inline-flex min-h-14 w-full max-w-[285px] items-center justify-center gap-8 rounded-[8px] bg-gradient-to-r from-[#7c35e8] to-[#833af0] text-lg font-black text-white shadow-[0_14px_24px_rgba(124,53,232,0.25)]"
            >
              Continuar
              <ChevronRight aria-hidden="true" className="size-7" />
            </Link>
          </div>
          <Image
            src={mascotEstudante}
            alt="Mascote Edu lendo"
            className="absolute bottom-4 right-8 h-[250px] w-auto object-contain"
            priority
          />
        </div>
      </section>

      <section className="rounded-[18px] border border-[#e3d9f8] bg-white p-7 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
        <div className="flex items-center gap-3">
          <Target className="size-7 text-[#7c35e8]" />
          <h2 className="text-xl font-black">Escolha um desafio</h2>
        </div>

        <div className="mt-4 grid gap-7 lg:grid-cols-2">
          <ChallengeCard
            icon={<BookOpen className="size-9" />}
            title="Questoes por disciplina"
            description="Escolha uma disciplina da BNCC e pratique temas especificos."
            href="/estudantes/responder"
            tone="purple"
          />
          <ChallengeCard
            icon={<Shuffle className="size-9" />}
            title="Questoes aleatorias"
            description="Responda questoes de diversas disciplinas aleatoriamente."
            href="/estudantes/responder?aleatorio=1"
            tone="orange"
          />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.9fr]">
        <div className="rounded-[18px] border border-[#e3d9f8] bg-white p-7 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
          <div className="flex items-center gap-3">
            <CircleDotDashed className="size-7 text-[#7c35e8]" />
            <h2 className="text-xl font-black">Disciplinas (BNCC)</h2>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">
            {disciplinasQuery.isPending &&
              subjectSkeletonKeys.map((key) => (
                <div
                  key={`disciplina-skeleton-${key}`}
                  className="min-h-[150px] animate-pulse rounded-[12px] border border-[#e3d9f8] bg-[#f7f2ff]"
                />
              ))}

            {disciplinasQuery.isError && (
              <div className="col-span-full flex min-h-[110px] items-center gap-3 rounded-[12px] border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700">
                <AlertCircle aria-hidden="true" className="size-5" />
                Nao foi possivel carregar as disciplinas.
              </div>
            )}

            {disciplinasQuery.data?.map((disciplina) => {
              return (
                <SubjectCard
                  key={disciplina.id}
                  bar={subjectColor}
                  color={subjectColor}
                  href={`/estudantes/responder?disciplina=${disciplina.id}`}
                  icon={getSubjectIcon(disciplina.name, disciplina.acronym)}
                  name={disciplina.name}
                  detail={disciplina.area ?? disciplina.acronym}
                  progress={`${disciplina.answered} / ${disciplina.total}`}
                  width={`${Math.round(
                    (disciplina.answered / Math.max(disciplina.total, 1)) * 100,
                  )}%`}
                />
              );
            })}
          </div>
        </div>

        <div className="rounded-[18px] border border-[#e3d9f8] bg-white p-7 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Trophy className="size-7 text-[#7c35e8]" />
              <h2 className="text-xl font-black">Conquistas recentes</h2>
            </div>
            <Link
              href="/estudantes/conquistas"
              className="text-sm font-black text-[#7c35e8] underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="mt-4 overflow-hidden rounded-[12px] border border-[#e3d9f8]">
            {conquistasQuery.isPending &&
              [1, 2, 3].map((item) => (
                <div
                  key={`achievement-skeleton-${item}`}
                  className="h-[74px] animate-pulse border-[#e3d9f8] border-b bg-[#f7f2ff] last:border-b-0"
                />
              ))}

            {!conquistasQuery.isPending && recentAchievements.length === 0 && (
              <div className="px-4 py-6 text-sm font-semibold text-[#5d5a89]">
                Suas conquistas desbloqueadas aparecem aqui.
              </div>
            )}

            {recentAchievements.map((achievement) => (
              <AchievementRow key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative flex min-h-16 items-center gap-5 overflow-hidden rounded-[18px] border border-[#e3d9f8] bg-white px-7 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
        <Image
          src={mascotEstudante}
          alt=""
          className="h-14 w-14 rounded-full object-cover"
        />
        <div>
          <p className="text-lg font-black text-[#7c35e8]">Dica do Edu</p>
          <p className="font-medium">
            Pratique um pouco todos os dias e evolua sempre!
          </p>
        </div>
        <div className="ml-auto hidden items-center gap-2 sm:flex">
          <span className="size-3 rounded-full bg-[#d1c1f4]" />
          <span className="size-3 rounded-full bg-[#7c35e8]" />
          <span className="size-3 rounded-full bg-[#d1c1f4]" />
        </div>
      </section>
    </div>
  );
}

function StudentMetric({
  detail,
  icon,
  label,
  value,
}: {
  detail?: string;
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-center gap-3 border-[#e3d9f8] px-4 text-[#7c35e8] sm:border-r sm:last:border-r-0">
      <span className="shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="whitespace-nowrap text-sm font-medium text-[#4f4b80]">
          {label}
        </p>
        <p className="whitespace-nowrap text-xl font-black text-[#101044]">
          {value}
        </p>
        {detail && (
          <p className="whitespace-nowrap text-xs text-[#5d5a89]">{detail}</p>
        )}
      </div>
    </div>
  );
}

function ChallengeCard({
  description,
  href,
  icon,
  title,
  tone,
}: {
  description: string;
  href: string;
  icon: React.ReactNode;
  title: string;
  tone: "purple" | "orange";
}) {
  const color =
    tone === "purple"
      ? "border-[#cdb8ff] text-[#7c35e8]"
      : "border-[#ffd0a8] text-[#ff6b12]";
  const fill =
    tone === "purple"
      ? "bg-gradient-to-br from-[#7c35e8] to-[#8e44f2]"
      : "bg-gradient-to-br from-[#ff6b12] to-[#ff7f1a]";

  return (
    <Link
      href={href}
      className={`grid min-h-[100px] grid-cols-[72px_1fr_48px] items-center gap-5 rounded-[12px] border px-6 transition hover:shadow-[0_14px_28px_rgba(72,35,137,0.1)] ${color}`}
    >
      <span
        className={`flex size-16 items-center justify-center rounded-[10px] text-white ${fill}`}
      >
        {icon}
      </span>
      <span>
        <span className="block text-lg font-black">{title}</span>
        <span className="mt-1 block max-w-[350px] text-sm font-medium text-[#101044]">
          {description}
        </span>
      </span>
      <span
        className={`flex size-12 items-center justify-center rounded-[8px] text-white ${fill}`}
      >
        <ChevronRight aria-hidden="true" className="size-7" />
      </span>
    </Link>
  );
}

function AchievementRow({ achievement }: { achievement: ConquistaProgresso }) {
  const achievementImage = getAchievementImage(achievement.icon);

  return (
    <div className="grid grid-cols-[48px_1fr_auto] items-center gap-4 border-[#e3d9f8] border-b px-4 py-3 last:border-b-0">
      <span className="flex size-11 items-center justify-center rounded-[8px] bg-[#f1e8ff] text-sm font-black text-[#7c35e8]">
        {achievementImage ? (
          <Image
            src={achievementImage}
            alt=""
            className="size-10 object-contain"
          />
        ) : (
          achievement.name.slice(0, 2).toUpperCase()
        )}
      </span>
      <div className="min-w-0">
        <p className="truncate font-black">{achievement.name}</p>
        <p className="truncate text-sm text-[#5d5a89]">
          {achievement.description}
        </p>
      </div>
      <span className="whitespace-nowrap text-sm font-medium text-[#5d5a89]">
        {formatAchievementDate(achievement.unlockedAt)}
      </span>
    </div>
  );
}

type SubjectCardProps = {
  bar: string;
  color: string;
  detail?: string;
  href: string;
  icon: typeof Sigma;
  name: string;
  progress: string;
  width: string;
};

function SubjectCard({
  bar,
  color,
  detail,
  href,
  icon: Icon,
  name,
  progress,
  width,
}: SubjectCardProps) {
  return (
    <Link
      href={href}
      className="flex min-h-[150px] flex-col items-center justify-between rounded-[12px] border border-[#e3d9f8] bg-white p-4 text-center transition hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgba(72,35,137,0.1)]"
    >
      <span
        className={`flex size-12 items-center justify-center rounded-[8px] text-white ${color}`}
      >
        <Icon aria-hidden="true" className="size-7" />
      </span>
      <span className="text-xs font-black leading-4">{name}</span>
      <span className="min-h-5 text-sm font-medium text-[#4f4b80]">
        {progress}
      </span>
      {detail && <span className="sr-only">{detail}</span>}
      <ProgressBar className={width} valueClassName={bar} />
    </Link>
  );
}
