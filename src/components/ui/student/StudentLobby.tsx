"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  BookOpen,
  Calculator,
  ChevronRight,
  Drama,
  Dumbbell,
  Eye,
  Flame,
  FlaskConical,
  Globe2,
  Landmark,
  Languages,
  type LucideIcon,
  Medal,
  Radio,
  Shuffle,
  Sparkles,
  Star,
  Target,
  Trophy,
  Type,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import mascotEstudante from "@/assets/images/mascot-estudante.png";
import mascotPaideia from "@/assets/images/mascote/mascote_feliz.svg";
import { buttonVariants } from "@/components/buttons";
import { Toast } from "@/components/feedback";
import { useMinimumVisibleLoading } from "@/hooks/useMinimumVisibleLoading";
import { gamificationApi } from "@/services/api/modules/gamification";
import type {
  ConquistaProgresso,
  DisciplinaProgresso,
  LoginStreakReward,
  RankingItem,
} from "@/types/aluno";
import {
  markEquippedCharacter,
  readStoredEquippedCharacterId,
  resolveEquippedCharacterId,
} from "@/utils/student/equippedCharacter";
import { StudentLobbySkeleton } from "./StudentWorkspaceSkeletons";
import {
  getAchievementImage,
  getAvatarImage,
  getAvatarProfileImage,
} from "./studentVisualAssets";

const subjectColor = "bg-[#7c35e8]";
const subjectSkeletonKeys = [
  "disciplina-skeleton-1",
  "disciplina-skeleton-2",
  "disciplina-skeleton-3",
  "disciplina-skeleton-4",
  "disciplina-skeleton-5",
  "disciplina-skeleton-6",
];
const rankingSkeletonKeys = [
  "ranking-skeleton-1",
  "ranking-skeleton-2",
  "ranking-skeleton-3",
  "ranking-skeleton-4",
  "ranking-skeleton-5",
];
const paideiaTips = [
  "Pratique um pouco todos os dias e evolua sempre!",
  "Revise as disciplinas com mais questões disponíveis primeiro.",
  "Mantenha sua sequência para chegar mais rápido no próximo bônus.",
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

  if (subject.includes("arte")) {
    return Drama;
  }

  if (subject.includes("matematica") || subject.includes("mat")) {
    return Calculator;
  }

  if (subject.includes("ingles") || subject.includes("ing")) {
    return Languages;
  }

  if (
    subject.includes("lingua") ||
    subject.includes("portugues") ||
    subject.includes("por")
  ) {
    return Type;
  }

  if (subject.includes("ciencia") || subject.includes("cie")) {
    return FlaskConical;
  }

  if (subject.includes("educacao fisica") || subject.includes("fisica")) {
    return Dumbbell;
  }

  if (subject.includes("religioso") || subject.includes("religiao")) {
    return Eye;
  }

  if (subject.includes("historia") || subject.includes("his")) {
    return Landmark;
  }

  if (subject.includes("geografia") || subject.includes("geo")) {
    return Globe2;
  }

  return BookOpen;
}

function getDisciplineProgressPercent(disciplina: DisciplinaProgresso) {
  if (disciplina.total <= 0) return 0;

  return Math.round((disciplina.answered / disciplina.total) * 100);
}

function getDisciplineProgressText(disciplina: DisciplinaProgresso) {
  if (disciplina.total <= 0) return "Sem questões";

  return `${disciplina.answered} / ${disciplina.total}`;
}

function getDisciplineProgressWidth(disciplina: DisciplinaProgresso) {
  return `${getDisciplineProgressPercent(disciplina)}%`;
}

function getAchievementPercent(achievement: ConquistaProgresso) {
  if (achievement.goal <= 0) return 0;

  return Math.min(
    Math.round((achievement.current / achievement.goal) * 100),
    100,
  );
}

export function StudentLobby() {
  const [loginStreakReward, setLoginStreakReward] =
    useState<LoginStreakReward>();
  const [activeTipIndex, setActiveTipIndex] = useState(0);

  useEffect(() => {
    const storedReward = window.sessionStorage.getItem(
      "student_login_streak_reward",
    );
    window.sessionStorage.removeItem("student_login_streak_reward");

    if (!storedReward) return;

    try {
      setLoginStreakReward(JSON.parse(storedReward) as LoginStreakReward);
    } catch {
      setLoginStreakReward(undefined);
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveTipIndex((current) => (current + 1) % paideiaTips.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

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
  const allDisciplinasQuery = useQuery({
    queryKey: ["disciplinas"],
    queryFn: gamificationApi.disciplinas,
  });
  const rankingQuery = useQuery({
    queryKey: ["aluno", "ranking", "turma", "top-5"],
    queryFn: gamificationApi.rankingAlunoTurma,
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
  const liveSessionQuery = useQuery({
    queryKey: ["aluno", "sessoes-ao-vivo", "ativa"],
    queryFn: gamificationApi.sessaoAoVivoAtiva,
    refetchInterval: 5000,
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
  const streak = perfilQuery.data?.streak ?? {
    currentDays: profile?.streak?.dias_seguidos ?? 0,
    longestDays: profile?.streak?.maior_dias_seguidos ?? 0,
    lastLoginAt: profile?.streak?.ultimo_login_em,
    daysUntilNextBonus: profile?.streak?.proximo_bonus_em_dias ?? 7,
  };
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
  const disciplineItems =
    allDisciplinasQuery.data?.map((disciplina) => {
      const progress = disciplinasQuery.data?.find(
        (item) => item.id === disciplina.id,
      );

      return {
        ...disciplina,
        total: progress?.total ?? 0,
        answered: progress?.answered ?? 0,
        available: progress?.available ?? 0,
      };
    }) ??
    disciplinasQuery.data ??
    [];
  const isDisciplinesPending =
    allDisciplinasQuery.isPending && disciplineItems.length === 0;
  const isDisciplinesError =
    allDisciplinasQuery.isError && disciplinasQuery.isError;
  const challengeDiscipline =
    disciplineItems.find((disciplina) => disciplina.available > 0) ??
    disciplineItems[0];
  const challengeHref = challengeDiscipline
    ? `/estudantes/responder?disciplina=${challengeDiscipline.id}`
    : "/estudantes/responder";
  const challengeProgress = challengeDiscipline
    ? getDisciplineProgressText(challengeDiscipline)
    : "Sem questões";
  const challengeProgressPercent = challengeDiscipline
    ? getDisciplineProgressPercent(challengeDiscipline)
    : 0;
  const recentAchievements =
    conquistasQuery.data
      ?.filter(isAchievementCompleted)
      .sort((a, b) => {
        const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
        const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;

        return dateB - dateA || b.id - a.id;
      })
      .slice(0, 3) ?? [];
  const achievementsInProgress =
    conquistasQuery.data
      ?.filter((achievement) => !isAchievementCompleted(achievement))
      .sort(
        (a, b) =>
          getAchievementPercent(b) - getAchievementPercent(a) || b.id - a.id,
      )
      .slice(0, 3) ?? [];
  const currentTip = paideiaTips[activeTipIndex];
  const topRanking = rankingQuery.data?.slice(0, 5) ?? [];
  const currentStudentAvatar = equippedCharacter
    ? {
        avatar: equippedCharacter.avatar,
        image: equippedCharacter.image,
        studentId: meQuery.data?.id,
      }
    : undefined;
  const showInitialSkeleton = useMinimumVisibleLoading(
    meQuery.isPending ||
      dashboardQuery.isPending ||
      disciplinasQuery.isPending ||
      allDisciplinasQuery.isPending ||
      rankingQuery.isPending ||
      perfilQuery.isPending ||
      conquistasQuery.isPending ||
      personagensQuery.isPending ||
      liveSessionQuery.isPending,
  );

  if (showInitialSkeleton) {
    return <StudentLobbySkeleton />;
  }

  return (
    <div className="grid gap-5">
      {loginStreakReward?.message && (
        <Toast
          variant="success"
          title={
            loginStreakReward.weeklyBonus
              ? "Bônus semanal!"
              : "Sequência mantida!"
          }
          message={loginStreakReward.message}
          duration={7000}
          onClose={() => setLoginStreakReward(undefined)}
        />
      )}

      {liveSessionQuery.data &&
        liveSessionQuery.data.session.status !== "finalizada" && (
          <section className="flex flex-col gap-4 rounded-[18px] border border-[#cdb8ff] bg-[#f7f2ff] p-5 shadow-[0_18px_50px_rgba(72,35,137,0.08)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#7c35e8] text-white">
                <Radio aria-hidden="true" className="size-6" />
              </span>
              <div>
                <p className="text-sm font-bold uppercase text-[#7c35e8]">
                  Sessão ao vivo disponível
                </p>
                <h2 className="text-xl font-bold text-[#101044]">
                  {liveSessionQuery.data.session.title ??
                    "Atividade com o professor"}
                </h2>
                <p className="text-sm font-bold text-[#5d5a89]">
                  {liveSessionQuery.data.session.turma?.name ?? "Sua turma"}{" "}
                  está respondendo em tempo real.
                </p>
              </div>
            </div>
            <Link
              href="/estudantes/ao-vivo"
              className={buttonVariants({
                className:
                  "min-h-12 shadow-[0_14px_24px_rgba(124,53,232,0.25)]",
                variant: "primary",
              })}
            >
              Entrar
              <ChevronRight aria-hidden="true" className="size-5" />
            </Link>
          </section>
        )}

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[18px] border border-[#e3d9f8] bg-white p-5 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
          <div className="grid gap-5 sm:grid-cols-[210px_1fr] sm:items-center">
            <div className="relative flex items-center justify-center">
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
              <h1 className="text-3xl font-bold tracking-normal">
                {studentName ?? "Estudante"}
              </h1>
              <p className="mt-2 text-lg font-bold text-[#7c35e8]">
                Nível {level}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[#4c4a79]">
                {equippedCharacter
                  ? `${equippedCharacter.name} equipado`
                  : "Explorador do Conhecimento"}
                <Sparkles className="size-4 fill-[#7c35e8] text-[#7c35e8]" />
              </p>

              <div className="mt-5 grid grid-cols-[max-content_minmax(140px,1fr)] items-center gap-4">
                <span className="flex items-center gap-2 whitespace-nowrap text-xl font-bold">
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
                  Próximo nível: {level + 1}
                </span>
                <span className="whitespace-nowrap">
                  {xpToNextLevel} XP para o Nível {level + 1}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid w-full rounded-[14px] border border-[#e3d9f8] bg-white py-3 sm:grid-cols-4">
            <StudentMetric
              icon={<Zap className="size-9 fill-[#7c35e8]" />}
              label="Energia"
              value={`${energy} / ${maxEnergy}`}
            />
            <StudentMetric
              icon={<Star className="size-9 fill-[#ffb000] text-[#ffb000]" />}
              label="Pontuação"
              value={totalPoints.toLocaleString("pt-BR")}
            />
            <StudentMetric
              icon={<RankingMedalIcon />}
              label="Ranking"
              value={rank ? `Top ${rank}` : "—"}
            />
            <StudentMetric
              icon={<Flame className="size-9 fill-[#ff7a1a] text-[#ff7a1a]" />}
              label="Sequência"
              value={`${streak.currentDays} dia${streak.currentDays === 1 ? "" : "s"}`}
            />
          </div>
          <p className="mt-2 text-center text-xs font-bold text-[#5d5a89]">
            Recorde: {streak.longestDays} dia(s) · Próximo bônus em{" "}
            {streak.daysUntilNextBonus} dia(s)
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[18px] border border-[#e3d9f8] bg-white p-6 shadow-[0_18px_50px_rgba(72,35,137,0.08)] md:min-h-[375px] md:pb-[108px]">
          <div className="flex min-w-0 flex-col md:max-w-[calc(100%-280px)] xl:mt-5 xl:max-w-[58%]">
            <div className="flex items-center gap-4">
              <BookOpen className="size-8 text-[#7c35e8]" />
              <h2 className="text-lg font-bold">Continue praticando</h2>
            </div>
            <p className="mt-5 text-2xl font-bold">
              {challengeDiscipline?.name ?? "Questões"}
            </p>
            <p className="mt-2 text-lg text-[#4f4b80]">
              {challengeDiscipline?.area ??
                challengeDiscipline?.acronym ??
                "Pratica geral"}
            </p>
            <p className="mt-5 text-sm font-medium text-[#5d5a89]">Progresso</p>
            <div className="mt-3 grid grid-cols-[minmax(0,1fr)_max-content] items-center gap-5">
              <ProgressBar
                style={{ width: `${challengeProgressPercent}%` }}
                valueClassName="bg-[#7c35e8]"
              />
              <span className="whitespace-nowrap font-bold text-[#4f4b80]">
                {challengeProgress}
              </span>
            </div>
            <Link
              href={challengeHref}
              className={buttonVariants({
                className:
                  "mt-5 w-full max-w-[285px] md:absolute md:bottom-11 md:left-6 md:mt-0",
                variant: "primary",
              })}
            >
              Continuar
              <ChevronRight aria-hidden="true" className="size-5" />
            </Link>
          </div>
          <div className="hidden md:block">
            <Image
              src={mascotEstudante}
              alt="Mascote Edu lendo"
              className="absolute bottom-11 right-6 h-[180px] w-auto object-contain xl:h-[220px]"
              priority
            />
          </div>
        </div>
      </section>

      <section className="rounded-[18px] border border-[#e3d9f8] bg-white p-7 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
        <div className="flex items-center gap-3">
          <Target className="size-7 text-[#7c35e8]" />
          <h2 className="text-xl font-bold">Escolha um desafio</h2>
        </div>

        <div className="mt-4 grid gap-7 lg:grid-cols-2">
          <ChallengeCard
            icon={<BookOpen className="size-9" />}
            title="Questões por disciplina"
            description="Escolha uma disciplina da BNCC e pratique temas especificos."
            href="/estudantes/responder"
            tone="purple"
          />
          <ChallengeCard
            icon={<Shuffle className="size-9" />}
            title="Questões aleatórias"
            description="Responda questões de diversas disciplinas aleatoriamente."
            href="/estudantes/responder?aleatorio=1"
            tone="orange"
          />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.9fr] xl:items-stretch">
        <div className="flex h-full flex-col rounded-[18px] border border-[#e3d9f8] bg-white p-7 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
          <div className="flex items-center gap-3">
            <BookOpen className="size-7 text-[#7c35e8]" />
            <h2 className="text-xl font-bold">Disciplinas</h2>
          </div>
          <div className="mt-4 grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {isDisciplinesPending &&
              subjectSkeletonKeys.map((key) => (
                <div
                  key={key}
                  className="min-h-[150px] animate-pulse rounded-[12px] border border-[#e3d9f8] bg-[#f7f2ff]"
                />
              ))}

            {isDisciplinesError && (
              <div className="col-span-full flex min-h-[110px] items-center gap-3 rounded-[12px] border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700">
                <AlertCircle aria-hidden="true" className="size-5" />
                Não foi possível carregar as disciplinas.
              </div>
            )}

            {disciplineItems.map((disciplina) => {
              return (
                <SubjectCard
                  key={disciplina.id}
                  bar={subjectColor}
                  color={subjectColor}
                  href={`/estudantes/responder?disciplina=${disciplina.id}`}
                  icon={getSubjectIcon(disciplina.name, disciplina.acronym)}
                  name={disciplina.name}
                  detail={disciplina.area ?? disciplina.acronym}
                  progress={getDisciplineProgressText(disciplina)}
                  width={getDisciplineProgressWidth(disciplina)}
                />
              );
            })}
          </div>
        </div>

        <div className="flex h-full flex-col rounded-[18px] border border-[#e3d9f8] bg-white p-7 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Medal className="size-7 text-[#7c35e8]" />
              <h2 className="text-xl font-bold">Top 5 da turma</h2>
            </div>
            <Link
              href="/estudantes/ranking"
              className="text-sm font-bold text-[#7c35e8] underline"
            >
              Ver ranking
            </Link>
          </div>
          <div className="mt-4 flex-1 overflow-hidden rounded-[12px] border border-[#e3d9f8]">
            {rankingQuery.isPending &&
              rankingSkeletonKeys.map((key) => (
                <div
                  key={key}
                  className="h-[64px] animate-pulse border-[#e3d9f8] border-b bg-[#f7f2ff] last:border-b-0"
                />
              ))}

            {rankingQuery.isError && (
              <div className="flex min-h-[96px] items-center gap-3 px-4 text-sm font-bold text-red-700">
                <AlertCircle aria-hidden="true" className="size-5" />
                Não foi possível carregar o ranking.
              </div>
            )}

            {!rankingQuery.isPending &&
              !rankingQuery.isError &&
              topRanking.length === 0 && (
                <div className="px-4 py-6 text-sm font-bold text-[#5d5a89]">
                  O ranking da turma aparece aqui.
                </div>
              )}

            {topRanking.map((item) => (
              <RankingTopRow
                key={item.aluno.id}
                currentStudentAvatar={currentStudentAvatar}
                item={item}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-[18px] border border-[#e3d9f8] bg-white p-7 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Trophy className="size-7 text-[#7c35e8]" />
              <h2 className="text-xl font-bold">Conquistas recentes</h2>
            </div>
            <Link
              href="/estudantes/conquistas"
              className="text-sm font-bold text-[#7c35e8] underline"
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
              <div className="px-4 py-6 text-sm font-bold text-[#5d5a89]">
                Suas conquistas desbloqueadas aparecem aqui.
              </div>
            )}

            {recentAchievements.map((achievement) => (
              <AchievementRow key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>

        <div className="rounded-[18px] border border-[#e3d9f8] bg-white p-7 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Trophy className="size-7 text-[#7c35e8]" />
              <h2 className="text-xl font-bold">Conquistas em progresso</h2>
            </div>
            <Link
              href="/estudantes/conquistas"
              className="text-sm font-bold text-[#7c35e8] underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="mt-4 overflow-hidden rounded-[12px] border border-[#e3d9f8]">
            {conquistasQuery.isPending &&
              [1, 2, 3].map((item) => (
                <div
                  key={`achievement-progress-skeleton-${item}`}
                  className="h-[74px] animate-pulse border-[#e3d9f8] border-b bg-[#f7f2ff] last:border-b-0"
                />
              ))}

            {!conquistasQuery.isPending &&
              achievementsInProgress.length === 0 && (
                <div className="px-4 py-6 text-sm font-bold text-[#5d5a89]">
                  Conquistas em andamento aparecem aqui.
                </div>
              )}

            {achievementsInProgress.map((achievement) => (
              <AchievementProgressRow
                key={achievement.id}
                achievement={achievement}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="relative flex min-h-16 items-center gap-5 overflow-hidden rounded-[18px] border border-[#e3d9f8] bg-white px-7 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
        <Image
          src={mascotPaideia}
          alt=""
          className="h-14 w-14 object-contain"
        />
        <div>
          <p className="text-lg font-bold text-[#7c35e8]">Dica do Paideia</p>
          <p className="font-medium">{currentTip}</p>
        </div>
        <div className="ml-auto hidden items-center gap-2 sm:flex">
          {paideiaTips.map((tip, index) => (
            <span
              key={tip}
              className={`size-3 rounded-full ${
                index === activeTipIndex ? "bg-[#7c35e8]" : "bg-[#d1c1f4]"
              }`}
            />
          ))}
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
        <p className="whitespace-nowrap text-xl font-bold text-[#101044]">
          {value}
        </p>
        {detail && (
          <p className="whitespace-nowrap text-xs text-[#5d5a89]">{detail}</p>
        )}
      </div>
    </div>
  );
}

function RankingMedalIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-9"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13 2h5l3 12h-6L13 2Z" fill="#f47f1f" />
      <path d="M23 2h-5l-3 12h6L23 2Z" fill="#d94f23" />
      <path d="M16 2h4l-2 11-2-11Z" fill="#c73b2f" />
      <circle cx="18" cy="22" r="11" fill="#ffdc4d" />
      <circle cx="18" cy="22" r="7.5" fill="#ffc414" />
      <path
        d="M18 16.8l1.7 3.3 3.7.6-2.7 2.6.6 3.7-3.3-1.8-3.3 1.8.6-3.7-2.7-2.6 3.7-.6 1.7-3.3Z"
        fill="#f5821f"
      />
    </svg>
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
      className={`grid min-h-[100px] grid-cols-[56px_1fr] items-center gap-4 rounded-[12px] border px-4 py-4 transition hover:shadow-[0_14px_28px_rgba(72,35,137,0.1)] sm:grid-cols-[72px_1fr_48px] sm:gap-5 sm:px-6 ${color}`}
    >
      <span
        className={`flex size-14 items-center justify-center rounded-[10px] text-white sm:size-16 ${fill}`}
      >
        {icon}
      </span>
      <span>
        <span className="block text-lg font-bold">{title}</span>
        <span className="mt-1 block max-w-[350px] text-sm font-medium text-[#101044]">
          {description}
        </span>
      </span>
      <span
        className={`hidden size-12 items-center justify-center rounded-[8px] text-white sm:flex ${fill}`}
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
      <span className="flex size-11 items-center justify-center rounded-[8px] bg-[#f1e8ff] text-sm font-bold text-[#7c35e8]">
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
        <p className="truncate font-bold">{achievement.name}</p>
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

function AchievementProgressRow({
  achievement,
}: {
  achievement: ConquistaProgresso;
}) {
  const achievementImage = getAchievementImage(achievement.icon);
  const percent = getAchievementPercent(achievement);

  return (
    <div className="grid grid-cols-[48px_1fr_auto] items-center gap-4 border-[#e3d9f8] border-b px-4 py-3 last:border-b-0">
      <span className="flex size-11 items-center justify-center rounded-[8px] bg-[#f1e8ff] text-sm font-bold text-[#7c35e8]">
        {achievementImage ? (
          <Image
            src={achievementImage}
            alt=""
            className="size-10 object-contain opacity-80"
          />
        ) : (
          achievement.name.slice(0, 2).toUpperCase()
        )}
      </span>
      <div className="min-w-0">
        <p className="truncate font-bold">{achievement.name}</p>
        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_max-content] items-center gap-3">
          <ProgressBar
            style={{ width: `${percent}%` }}
            valueClassName="bg-[#7c35e8]"
          />
          <span className="text-xs font-bold text-[#5d5a89]">
            {achievement.current} / {achievement.goal}
          </span>
        </div>
      </div>
      <span className="whitespace-nowrap text-sm font-bold text-[#7c35e8]">
        {percent}%
      </span>
    </div>
  );
}

function isAchievementCompleted(achievement: ConquistaProgresso) {
  return achievement.unlocked || achievement.current >= achievement.goal;
}

function RankingTopRow({
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
  const avatar =
    currentStudentAvatar?.studentId === item.aluno.id
      ? currentStudentAvatar.avatar
      : item.avatar;
  const image =
    currentStudentAvatar?.studentId === item.aluno.id
      ? currentStudentAvatar.image
      : item.image;

  return (
    <Link
      href="/estudantes/ranking"
      className="grid min-h-[66px] grid-cols-[42px_48px_1fr_auto] items-center gap-3 border-[#e3d9f8] border-b px-4 py-3 transition last:border-b-0 hover:bg-[#fbf7ff]"
    >
      <span
        className={`flex size-9 items-center justify-center rounded-full text-sm font-bold ${
          item.position === 1
            ? "bg-[#fff0b8] text-[#d98300]"
            : item.position === 2
              ? "bg-[#eef0f4] text-[#707889]"
              : item.position === 3
                ? "bg-[#ffe5d3] text-[#b85d20]"
                : "bg-[#efe7ff] text-[#7c35e8]"
        }`}
      >
        {item.position}
      </span>
      <span className="flex size-11 items-center justify-center overflow-hidden rounded-full bg-[#f1e8ff] ring-1 ring-[#d9c6ff]">
        <Image
          src={getAvatarProfileImage(avatar, image)}
          alt=""
          aria-hidden="true"
          className="size-full object-cover"
        />
      </span>
      <div className="min-w-0">
        <p className="truncate font-bold text-[#101044]">{item.aluno.name}</p>
        <p className="truncate text-sm font-bold text-[#5d5a89]">
          Nível {item.level}
        </p>
      </div>
      <span className="flex items-center gap-1 whitespace-nowrap text-sm font-bold text-[#101044]">
        {item.points.toLocaleString("pt-BR")}
        <span className="text-[#ffb000]">★</span>
      </span>
    </Link>
  );
}

type SubjectCardProps = {
  bar: string;
  color: string;
  detail?: string;
  href: string;
  icon: LucideIcon;
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
      <span className="text-xs font-bold leading-4">{name}</span>
      <span className="min-h-5 text-sm font-medium text-[#4f4b80]">
        {progress}
      </span>
      {detail && <span className="sr-only">{detail}</span>}
      <ProgressBar className={width} valueClassName={bar} />
    </Link>
  );
}
