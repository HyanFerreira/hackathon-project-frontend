"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  type BookOpen,
  Home,
  LogOut,
  Medal,
  Menu,
  Radio,
  ShoppingBag,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import paideiaLogoWhite from "@/assets/images/logotipo/paideia_branco.svg";
import { Button } from "@/components/buttons";
import { authApi } from "@/services/api/modules/auth";
import { gamificationApi } from "@/services/api/modules/gamification";
import { removeAuthToken } from "@/services/api/tokenStorage";
import {
  markEquippedCharacter,
  readStoredEquippedCharacterId,
  resolveEquippedCharacterId,
} from "@/utils/student/equippedCharacter";
import { getAvatarProfileImage } from "./studentVisualAssets";

type StudentShellProps = {
  children: ReactNode;
};

function getInitials(name?: string) {
  if (!name) return "ES";

  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase()).join("") || "ES";
}

function isActive(pathname: string, href: string) {
  if (href === "/estudantes") return pathname === href;

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StudentShell({ children }: StudentShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const meQuery = useQuery({
    queryKey: ["auth", "me", "aluno"],
    queryFn: gamificationApi.alunoMe,
    retry: false,
  });
  const personagensQuery = useQuery({
    queryKey: ["aluno", "personagens"],
    queryFn: gamificationApi.personagens,
  });
  const desafiosQuery = useQuery({
    queryKey: ["aluno", "desafios"],
    queryFn: gamificationApi.desafios,
    refetchInterval: 5000,
  });

  const studentName = meQuery.data?.name ?? "Estudante";
  const initials = getInitials(studentName);
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
  const pendingChallenges = (desafiosQuery.data ?? []).filter(
    (challenge) =>
      challenge.status === "pendente" &&
      challenge.challenged?.id === meQuery.data?.id,
  );
  const newestChallenge = pendingChallenges[0];
  const activeChallenge = (desafiosQuery.data ?? []).find(
    (challenge) =>
      challenge.status === "em_andamento" &&
      (challenge.challenger?.id === meQuery.data?.id ||
        challenge.challenged?.id === meQuery.data?.id),
  );

  async function handleLogout() {
    try {
      await authApi.logout();
    } finally {
      removeAuthToken();
      queryClient.clear();
      router.replace("/login/estudante");
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#fbf7ff] text-[#101044]">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-[#6d2ee8] via-[#8738f2] to-[#7029dc] text-white shadow-[0_10px_35px_rgba(110,46,232,0.25)]">
        <div className="mx-auto flex h-[72px] max-w-[1740px] items-center justify-between gap-2 px-4 sm:px-5 lg:grid lg:h-[86px] lg:grid-cols-[220px_minmax(0,1fr)_auto] lg:px-8">
          <Button
            aria-label="Abrir navegação"
            className="size-11 shrink-0 border border-white/20 bg-white/10 p-0 text-white hover:bg-white/20 lg:hidden"
            onClick={() => setIsMobileNavOpen((current) => !current)}
            type="button"
          >
            <Menu aria-hidden="true" className="size-5" />
          </Button>
          <Link href="/estudantes" className="flex items-center gap-3">
            <Image
              src={paideiaLogoWhite}
              alt="Paideia"
              className="h-8 w-auto max-w-[112px] object-contain sm:h-10 sm:max-w-[156px] lg:h-12 lg:max-w-[180px]"
              priority
            />
          </Link>

          <nav className="hidden min-w-0 items-center justify-center gap-2 justify-self-center lg:flex xl:gap-3">
            <StudentNavItem
              active={isActive(pathname, "/estudantes")}
              icon={Home}
              label="Inicio"
              href="/estudantes"
            />
            <StudentNavItem
              active={isActive(pathname, "/estudantes/ranking")}
              icon={Medal}
              label="Ranking"
              href="/estudantes/ranking"
            />
            <StudentNavItem
              active={isActive(pathname, "/estudantes/desafios")}
              icon={Sparkles}
              label="Desafios"
              href="/estudantes/desafios"
            />
            <StudentNavItem
              active={isActive(pathname, "/estudantes/ao-vivo")}
              icon={Radio}
              label="Ao vivo"
              href="/estudantes/ao-vivo"
            />
            <StudentNavItem
              active={isActive(pathname, "/estudantes/conquistas")}
              icon={Trophy}
              label="Conquistas"
              href="/estudantes/conquistas"
            />
            <StudentNavItem
              active={isActive(pathname, "/estudantes/personagens")}
              icon={UserRound}
              label="Personagens"
              href="/estudantes/personagens"
            />
            <StudentNavItem
              active={isActive(pathname, "/estudantes/loja")}
              icon={ShoppingBag}
              label="Loja"
              href="/estudantes/loja"
            />
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-0 lg:justify-self-end">
            <div className="flex h-11 min-w-0 items-center gap-2 px-1.5 text-white sm:h-12">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f1e8ff] text-sm font-black text-[#7c35e8] ring-1 ring-white/40">
                {equippedCharacter ? (
                  <Image
                    src={getAvatarProfileImage(
                      equippedCharacter.avatar,
                      equippedCharacter.image,
                    )}
                    alt={`Avatar ${equippedCharacter.name}`}
                    className="size-9 rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </span>
              <span className="hidden min-w-0 flex-1 truncate text-sm font-bold sm:block">
                {studentName}
              </span>
            </div>

            <Link
              aria-label={
                pendingChallenges.length > 0
                  ? `${pendingChallenges.length} convite(s) de desafio`
                  : "Nenhum convite de desafio"
              }
              className="relative flex size-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/10 sm:size-12"
              href="/estudantes/desafios"
            >
              <Bell aria-hidden="true" className="size-5" />
              {pendingChallenges.length > 0 && (
                <span className="absolute -top-1 -right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#ffb703] px-1 text-[11px] font-black text-[#2d1655] ring-2 ring-[#7c35e8]">
                  {pendingChallenges.length > 9
                    ? "9+"
                    : pendingChallenges.length}
                </span>
              )}
            </Link>

            <Button
              type="button"
              onClick={handleLogout}
              aria-label="Sair"
              title="Sair"
              className="size-11 shrink-0 rounded-full bg-transparent p-0 text-white hover:bg-white/10 sm:size-12"
            >
              <LogOut aria-hidden="true" className="size-5" />
            </Button>
          </div>
        </div>

        {isMobileNavOpen && (
          <nav className="grid max-h-[calc(100vh-72px)] grid-cols-2 gap-2 overflow-y-auto border-white/15 border-t bg-[#6827d9] p-4 lg:hidden">
            <StudentNavItem
              active={isActive(pathname, "/estudantes")}
              icon={Home}
              label="Inicio"
              href="/estudantes"
            />
            <StudentNavItem
              active={isActive(pathname, "/estudantes/ranking")}
              icon={Medal}
              label="Ranking"
              href="/estudantes/ranking"
            />
            <StudentNavItem
              active={isActive(pathname, "/estudantes/desafios")}
              icon={Sparkles}
              label="Desafios"
              href="/estudantes/desafios"
            />
            <StudentNavItem
              active={isActive(pathname, "/estudantes/ao-vivo")}
              icon={Radio}
              label="Ao vivo"
              href="/estudantes/ao-vivo"
            />
            <StudentNavItem
              active={isActive(pathname, "/estudantes/conquistas")}
              icon={Trophy}
              label="Conquistas"
              href="/estudantes/conquistas"
            />
            <StudentNavItem
              active={isActive(pathname, "/estudantes/personagens")}
              icon={UserRound}
              label="Personagens"
              href="/estudantes/personagens"
            />
            <StudentNavItem
              active={isActive(pathname, "/estudantes/loja")}
              icon={ShoppingBag}
              label="Loja"
              href="/estudantes/loja"
            />
          </nav>
        )}
      </header>

      <div className="relative mx-auto max-w-[1740px] px-4 py-5 sm:px-5 lg:px-8 lg:py-6">
        {activeChallenge && pathname !== "/estudantes/desafios" && (
          <aside className="mb-5 flex flex-col gap-3 rounded-[16px] border border-[#d7c3ff] bg-white p-4 shadow-[0_12px_32px_rgba(72,35,137,0.12)] sm:flex-row sm:items-center">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#fff4d6] text-[#8f5c00]">
              <Sparkles aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-black text-[#101044]">Desafio iniciado!</p>
              <p className="truncate text-sm font-medium text-[#5d5a89]">
                Sua partida com{" "}
                {activeChallenge.challenger?.id === meQuery.data?.id
                  ? (activeChallenge.challenged?.name ?? "um colega")
                  : (activeChallenge.challenger?.name ?? "um colega")}{" "}
                esta em andamento.
              </p>
            </div>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-[12px] bg-[#6d2ee8] px-5 text-sm font-black text-white transition hover:bg-[#5b22ca]"
              href="/estudantes/desafios"
            >
              Entrar
            </Link>
          </aside>
        )}

        {!activeChallenge &&
          newestChallenge &&
          pathname !== "/estudantes/desafios" && (
            <aside className="mb-5 flex flex-col gap-3 rounded-[16px] border border-[#d7c3ff] bg-white p-4 shadow-[0_12px_32px_rgba(72,35,137,0.12)] sm:flex-row sm:items-center">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#f0e7ff] text-[#6d2ee8]">
                <Sparkles aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-black text-[#101044]">
                  Você recebeu um desafio!
                </p>
                <p className="truncate text-sm font-medium text-[#5d5a89]">
                  {newestChallenge.challenger?.name ?? "Um colega"} chamou você
                  para jogar.
                </p>
              </div>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-[12px] bg-[#6d2ee8] px-5 text-sm font-black text-white transition hover:bg-[#5b22ca]"
                href="/estudantes/desafios"
              >
                Ver convite
              </Link>
            </aside>
          )}
        <div className="relative">{children}</div>
      </div>
    </main>
  );
}

type StudentNavItemProps = {
  active?: boolean;
  href: string;
  icon: typeof BookOpen;
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
      className={`flex min-h-12 items-center gap-2 rounded-full px-3 text-sm font-semibold transition xl:gap-3 xl:px-4 xl:text-base ${
        active ? "bg-[#4f20b5]/60 shadow-inner" : "hover:bg-white/10"
      }`}
    >
      <Icon aria-hidden="true" className="size-6" />
      {label}
    </Link>
  );
}
