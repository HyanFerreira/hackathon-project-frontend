"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  CircleDotDashed,
  FlaskConical,
  Globe2,
  Home,
  Landmark,
  LogOut,
  Medal,
  MoreVertical,
  Settings,
  Shuffle,
  Sigma,
  Sparkles,
  Target,
  Trophy,
  UserRound,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import avatarDemo from "@/assets/images/avatar-demo.png";
import mascotEstudante from "@/assets/images/mascot-estudante.png";
import paideiaLogoIconWhite from "@/assets/images/paideiaLogoIconWhiteV3.svg";
import { Button } from "@/components/buttons";
import { authApi } from "@/services/api/modules/auth";
import { gamificationApi } from "@/services/api/modules/gamification";
import { getAuthActor, removeAuthToken } from "@/services/api/tokenStorage";

const subjects = [
  {
    name: "Matematica",
    progress: "227 / 550",
    color: "bg-[#7c35e8]",
    icon: Sigma,
    bar: "bg-[#7c35e8]",
    width: "42%",
  },
  {
    name: "Lingua Portuguesa",
    progress: "180 / 450",
    color: "bg-[#55bf45]",
    icon: BookOpen,
    bar: "bg-[#55bf45]",
    width: "40%",
  },
  {
    name: "Ciencias da Natureza",
    progress: "135 / 450",
    color: "bg-[#50aaf4]",
    icon: FlaskConical,
    bar: "bg-[#50aaf4]",
    width: "30%",
  },
  {
    name: "Historia",
    progress: "110 / 450",
    color: "bg-[#f5aa00]",
    icon: Landmark,
    bar: "bg-[#f5aa00]",
    width: "25%",
  },
  {
    name: "Geografia",
    progress: "90 / 450",
    color: "bg-[#50bec8]",
    icon: Globe2,
    bar: "bg-[#50bec8]",
    width: "22%",
  },
];

const achievements = [
  {
    title: "Dez de Dez",
    description: "Acertou 10 questoes seguidas",
    date: "04/07/2026",
    color: "bg-[#7c35e8]",
    icon: "10",
  },
  {
    title: "Estudioso",
    description: "Praticou por 7 dias consecutivos",
    date: "03/07/2026",
    color: "bg-[#55bf45]",
    icon: "EP",
  },
  {
    title: "Foco Total",
    description: "Completou 5 desafios de Matematica",
    date: "02/07/2026",
    color: "bg-[#ff6b12]",
    icon: "↗",
  },
];

function ProgressBar({
  className,
  valueClassName,
}: {
  className?: string;
  valueClassName: string;
}) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#ebe6f8]">
      <div className={`h-full rounded-full ${valueClassName} ${className}`} />
    </div>
  );
}

function getInitials(name?: string) {
  if (!name) return "ES";

  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase()).join("") || "ES";
}

export function StudentLobby() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const actor = getAuthActor();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const meQuery = useQuery({
    queryKey: ["auth", "me", actor],
    queryFn: gamificationApi.alunoMe,
    enabled: actor === "aluno",
    retry: false,
  });

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", "aluno"],
    queryFn: gamificationApi.alunoDashboard,
    enabled: actor === "aluno",
  });

  const studentName =
    dashboardQuery.data?.kind === "aluno"
      ? dashboardQuery.data.aluno.nome
      : meQuery.data?.name;
  const initials = getInitials(studentName);
  const profile =
    dashboardQuery.data?.kind === "aluno" ? dashboardQuery.data.perfil : null;
  const level = profile?.nivel ?? 1;
  const xp = profile?.xp ?? 0;
  const points = profile?.pontos ?? 0;
  const energy = profile?.energia ?? 0;
  const maxEnergy = profile?.energia_maxima ?? 10;
  const rank =
    dashboardQuery.data?.kind === "aluno"
      ? dashboardQuery.data.posicao_turma
      : null;

  useEffect(() => {
    if (actor !== "aluno") {
      router.replace("/dashboard");
    }
  }, [actor, router]);

  async function handleLogout() {
    try {
      await authApi.logout();
    } finally {
      removeAuthToken();
      queryClient.clear();
      router.replace("/login/estudante");
    }
  }

  if (actor !== "aluno") return null;

  return (
    <main className="min-h-screen overflow-hidden bg-[#fbf7ff] text-[#101044]">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-[#6d2ee8] via-[#8738f2] to-[#7029dc] text-white shadow-[0_10px_35px_rgba(110,46,232,0.25)]">
        <div className="mx-auto flex h-[86px] max-w-[1740px] items-center justify-between px-5 lg:px-8">
          <Link href="/lobby" className="flex items-center gap-3">
            <Image
              src={paideiaLogoIconWhite}
              alt="Paideia"
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            <StudentNavItem active icon={Home} label="Inicio" href="/lobby" />
            <StudentNavItem icon={Target} label="Desafios" href="/responder" />
            <StudentNavItem icon={Trophy} label="Conquistas" href="/perfil" />
            <StudentNavItem
              icon={UserRound}
              label="Personagem"
              href="/perfil"
            />
          </nav>

          <div className="relative">
            <Button
              type="button"
              onClick={() => setIsUserMenuOpen((current) => !current)}
              aria-expanded={isUserMenuOpen}
              aria-haspopup="menu"
              className="h-12 min-w-[184px] justify-start rounded-system border border-white/50 bg-white px-3 text-[#101044] shadow-sm hover:bg-[#fbf8ff]"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f1e8ff] text-sm font-black text-[#7c35e8] ring-1 ring-[#d9c6ff]">
                {initials}
              </span>
              <span className="hidden min-w-0 flex-1 truncate text-sm font-bold sm:block">
                {studentName ?? "Estudante"}
              </span>
              <ChevronDown
                aria-hidden="true"
                className={`hidden size-4 shrink-0 text-[#7c35e8] transition sm:block ${
                  isUserMenuOpen ? "rotate-180" : ""
                }`}
              />
            </Button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] z-40 w-56 overflow-hidden rounded-system border border-[#e3d9f8] bg-white py-2 text-[#101044] shadow-[0_18px_45px_rgba(37,19,83,0.18)]">
                <Link
                  href="/perfil"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex min-h-11 items-center gap-3 px-4 text-sm font-semibold transition hover:bg-[#f6f0ff]"
                >
                  <UserRound
                    aria-hidden="true"
                    className="size-4 text-[#7c35e8]"
                  />
                  Meu perfil
                </Link>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex min-h-11 w-full items-center gap-3 px-4 text-left text-sm font-semibold transition hover:bg-[#f6f0ff]"
                >
                  <Settings
                    aria-hidden="true"
                    className="size-4 text-[#7c35e8]"
                  />
                  Configurações
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex min-h-11 w-full items-center gap-3 border-[#efe7ff] border-t px-4 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <LogOut aria-hidden="true" className="size-4" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-[1740px] px-5 py-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-[-12%] bottom-[-120px] h-72 rounded-[50%] bg-[#e6d9ff]" />
        <div className="relative grid gap-5">
          <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[18px] border border-[#e3d9f8] bg-white p-6 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
              <div className="grid gap-5 sm:grid-cols-[210px_1fr]">
                <div className="relative flex items-end justify-center">
                  <Image
                    src={avatarDemo}
                    alt="Avatar do estudante"
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
                    Explorador do Conhecimento
                    <Sparkles className="size-4 fill-[#7c35e8] text-[#7c35e8]" />
                  </p>

                  <div className="mt-5 grid grid-cols-[max-content_minmax(140px,1fr)] items-center gap-4">
                    <span className="flex items-center gap-2 whitespace-nowrap text-xl font-black">
                      <span className="text-[#ffb000]">★</span>
                      {xp.toLocaleString("pt-BR")} XP
                    </span>
                    <ProgressBar
                      className="w-[68%]"
                      valueClassName="bg-[#7c35e8]"
                    />
                  </div>

                  <div className="mt-3 flex justify-between gap-4 text-xs font-medium text-[#5d5a89]">
                    <span className="whitespace-nowrap">
                      Proximo nivel: 550 XP
                    </span>
                    <span className="whitespace-nowrap">
                      227 para o Nivel {level + 1}
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
                      value={points.toLocaleString("pt-BR")}
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
                <p className="mt-8 text-2xl font-black">Matematica</p>
                <p className="mt-2 text-lg text-[#4f4b80]">
                  Fracoes e Numeros Decimais
                </p>
                <p className="mt-8 text-sm font-medium text-[#5d5a89]">
                  Progresso
                </p>
                <div className="mt-3 grid grid-cols-[minmax(0,1fr)_max-content] items-center gap-5">
                  <ProgressBar
                    className="w-[56%]"
                    valueClassName="bg-[#7c35e8]"
                  />
                  <span className="whitespace-nowrap font-semibold text-[#4f4b80]">
                    227 / 550
                  </span>
                </div>
                <Link
                  href="/responder"
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
                href="/responder"
                tone="purple"
              />
              <ChallengeCard
                icon={<Shuffle className="size-9" />}
                title="Questoes aleatorias"
                description="Responda questoes de diversas disciplinas aleatoriamente."
                href="/responder"
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
                {subjects.map((subject) => (
                  <SubjectCard key={subject.name} {...subject} />
                ))}
              </div>
            </div>

            <div className="rounded-[18px] border border-[#e3d9f8] bg-white p-7 shadow-[0_18px_50px_rgba(72,35,137,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Trophy className="size-7 text-[#7c35e8]" />
                  <h2 className="text-xl font-black">Conquistas recentes</h2>
                </div>
                <Link
                  href="/perfil"
                  className="text-sm font-black text-[#7c35e8] underline"
                >
                  Ver todas
                </Link>
              </div>
              <div className="mt-4 overflow-hidden rounded-[12px] border border-[#e3d9f8]">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.title}
                    className="grid grid-cols-[48px_1fr_auto] items-center gap-4 border-[#e3d9f8] border-b px-4 py-3 last:border-b-0"
                  >
                    <span
                      className={`flex size-11 items-center justify-center rounded-full text-sm font-black text-white ${achievement.color}`}
                    >
                      {achievement.icon}
                    </span>
                    <div>
                      <p className="font-black">{achievement.title}</p>
                      <p className="text-sm text-[#5d5a89]">
                        {achievement.description}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-[#5d5a89]">
                      {achievement.date}
                    </span>
                  </div>
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
      </div>
    </main>
  );
}

type StudentNavItemProps = {
  active?: boolean;
  href: string;
  icon: typeof Home;
  label: string;
};

function StudentNavItem({
  active,
  href,
  icon: Icon,
  label,
}: StudentNavItemProps) {
  return (
    <Link
      href={href}
      className={`flex min-h-12 items-center gap-3 rounded-full px-6 text-base font-semibold transition ${
        active ? "bg-[#4f20b5]/60 shadow-inner" : "hover:bg-white/10"
      }`}
    >
      <Icon aria-hidden="true" className="size-6" />
      {label}
    </Link>
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

type SubjectCardProps = {
  bar: string;
  color: string;
  icon: typeof Sigma;
  name: string;
  progress: string;
  width: string;
};

function SubjectCard({
  bar,
  color,
  icon: Icon,
  name,
  progress,
  width,
}: SubjectCardProps) {
  return (
    <Link
      href="/responder"
      className="flex min-h-[150px] flex-col items-center justify-between rounded-[12px] border border-[#e3d9f8] bg-white p-4 text-center transition hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgba(72,35,137,0.1)]"
    >
      <span
        className={`flex size-12 items-center justify-center rounded-[8px] text-white ${color}`}
      >
        <Icon aria-hidden="true" className="size-7" />
      </span>
      <span className="text-xs font-black leading-4">{name}</span>
      <span className="text-sm font-medium text-[#4f4b80]">{progress}</span>
      <ProgressBar className={width} valueClassName={bar} />
    </Link>
  );
}
