"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
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
import { useEffect, useState } from "react";
import paideiaLogoWhite from "@/assets/images/logotipo/paideia_branco.svg";
import { Button, buttonVariants } from "@/components/buttons";
import { Skeleton } from "@/components/loading";
import { useMinimumVisibleLoading } from "@/hooks/useMinimumVisibleLoading";
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
  const showUserSkeleton = useMinimumVisibleLoading(
    meQuery.isPending || personagensQuery.isPending,
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

  useEffect(() => {
    if (!pathname) return;

    setIsMobileNavOpen(false);
  }, [pathname]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#fbf7ff] text-[#101044]">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-[#6d2ee8] via-[#8738f2] to-[#7029dc] text-white shadow-[0_10px_35px_rgba(110,46,232,0.25)]">
        <div className="mx-auto flex h-[72px] max-w-[1740px] items-center justify-between gap-2 px-4 sm:px-5 xl:grid xl:h-[86px] xl:grid-cols-[150px_minmax(0,1fr)_auto] xl:px-5 min-[1536px]:grid-cols-[180px_minmax(0,1fr)_auto] min-[1680px]:grid-cols-[220px_minmax(0,1fr)_auto] min-[1680px]:px-8">
          <Button
            aria-label="Abrir navegação"
            className="order-last ml-auto size-11 shrink-0 border border-white/20 bg-white/10 p-0 text-white hover:bg-white/20 xl:hidden"
            onClick={() => setIsMobileNavOpen((current) => !current)}
            type="button"
          >
            <Menu aria-hidden="true" className="size-5" />
          </Button>
          <Link
            href="/estudantes"
            className="order-first flex items-center gap-3"
          >
            <Image
              src={paideiaLogoWhite}
              alt="Paideia"
              className="h-8 w-auto max-w-[112px] object-contain sm:h-10 sm:max-w-[156px] xl:h-12 xl:max-w-[140px] min-[1536px]:max-w-[160px] min-[1680px]:max-w-[180px]"
              priority
            />
          </Link>

          <nav className="hidden min-w-0 items-center justify-center gap-1 justify-self-center xl:flex min-[1536px]:gap-2 min-[1680px]:gap-3">
            <StudentNavItem
              active={isActive(pathname, "/estudantes")}
              icon={Home}
              label="Início"
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

          <div className="ml-auto hidden h-14 min-w-0 items-center overflow-hidden rounded-[14px] bg-white text-[#7c35e8] shadow-[0_12px_26px_rgba(55,22,118,0.16)] ring-1 ring-[#e9ddff] xl:flex xl:ml-0 xl:justify-self-end">
            {showUserSkeleton ? (
              <div className="flex h-full min-w-0 items-center gap-3 px-3 pr-4 sm:min-w-[168px]">
                <Skeleton className="size-10 shrink-0 rounded-full bg-[#e8ddfb]" />
                <Skeleton className="hidden h-4 w-28 rounded-full bg-[#e8ddfb] sm:block" />
              </div>
            ) : (
              <div className="flex h-full min-w-0 items-center gap-3 px-3 pr-4 text-[#101044] sm:min-w-[168px]">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f1e8ff] text-sm font-bold text-[#7c35e8] ring-1 ring-[#dcc9ff]">
                  {equippedCharacter ? (
                    <Image
                      src={getAvatarProfileImage(
                        equippedCharacter.avatar,
                        equippedCharacter.image,
                      )}
                      alt={`Avatar ${equippedCharacter.name}`}
                      className="size-10 rounded-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </span>
                <span className="hidden min-w-0 flex-1 truncate text-sm font-bold sm:block">
                  {studentName}
                </span>
              </div>
            )}

            <Button
              type="button"
              onClick={handleLogout}
              aria-label="Sair"
              title="Sair"
              className="h-full w-14 shrink-0 !rounded-none border-[#e3d9f8] border-l bg-transparent p-0 text-[#7c35e8] transition hover:bg-[#f5efff]"
            >
              <LogOut aria-hidden="true" className="size-5" />
            </Button>
          </div>
        </div>

        <div
          className={`absolute top-full right-0 left-0 z-40 overflow-hidden border-white/15 border-t bg-[#6827d9] shadow-[0_18px_36px_rgba(45,18,94,0.3)] transition-all duration-300 ease-out xl:hidden ${
            isMobileNavOpen
              ? "max-h-[calc(100vh-72px)] translate-y-0 opacity-100"
              : "pointer-events-none max-h-0 -translate-y-3 opacity-0"
          }`}
        >
          <div className="grid max-h-[calc(100vh-72px)] gap-4 overflow-y-auto p-4">
            <div className="flex h-14 min-w-0 items-center overflow-hidden rounded-[14px] bg-white text-[#7c35e8] shadow-[0_12px_26px_rgba(55,22,118,0.16)] ring-1 ring-[#e9ddff]">
              {showUserSkeleton ? (
                <div className="flex h-full min-w-0 flex-1 items-center gap-3 px-3 pr-4">
                  <Skeleton className="size-10 shrink-0 rounded-full bg-[#e8ddfb]" />
                  <Skeleton className="h-4 w-28 rounded-full bg-[#e8ddfb]" />
                </div>
              ) : (
                <div className="flex h-full min-w-0 flex-1 items-center gap-3 px-3 pr-4 text-[#101044]">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f1e8ff] text-sm font-bold text-[#7c35e8] ring-1 ring-[#dcc9ff]">
                    {equippedCharacter ? (
                      <Image
                        src={getAvatarProfileImage(
                          equippedCharacter.avatar,
                          equippedCharacter.image,
                        )}
                        alt={`Avatar ${equippedCharacter.name}`}
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">
                    {studentName}
                  </span>
                </div>
              )}

              <Button
                type="button"
                onClick={handleLogout}
                aria-label="Sair"
                title="Sair"
                className="h-full w-14 shrink-0 !rounded-none border-[#e3d9f8] border-l bg-transparent p-0 text-[#7c35e8] transition hover:bg-[#f5efff]"
              >
                <LogOut aria-hidden="true" className="size-5" />
              </Button>
            </div>

            <nav className="grid grid-cols-2 gap-2">
              <StudentNavItem
                active={isActive(pathname, "/estudantes")}
                icon={Home}
                label="Início"
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
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-[1740px] px-4 py-5 sm:px-5 lg:px-8 lg:py-6">
        {activeChallenge && pathname !== "/estudantes/desafios" && (
          <aside className="mb-5 flex flex-col gap-3 rounded-[16px] border border-[#d7c3ff] bg-white p-4 shadow-[0_12px_32px_rgba(72,35,137,0.12)] sm:flex-row sm:items-center">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#fff4d6] text-[#8f5c00]">
              <Sparkles aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[#101044]">Desafio iniciado!</p>
              <p className="truncate text-sm font-medium text-[#5d5a89]">
                Sua partida com{" "}
                {activeChallenge.challenger?.id === meQuery.data?.id
                  ? (activeChallenge.challenged?.name ?? "um colega")
                  : (activeChallenge.challenger?.name ?? "um colega")}{" "}
                está em andamento.
              </p>
            </div>
            <Link
              className={buttonVariants({ variant: "primary" })}
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
                <p className="font-bold text-[#101044]">
                  Você recebeu um desafio!
                </p>
                <p className="truncate text-sm font-medium text-[#5d5a89]">
                  {newestChallenge.challenger?.name ?? "Um colega"} chamou você
                  para jogar.
                </p>
              </div>
              <Link
                className={buttonVariants({ variant: "primary" })}
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
      className={`flex min-h-12 items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold transition min-[1536px]:gap-2 min-[1536px]:px-3 min-[1680px]:gap-3 min-[1680px]:px-4 min-[1680px]:text-base ${
        active ? "bg-[#4f20b5]/60 shadow-inner" : "hover:bg-white/10"
      }`}
    >
      <Icon aria-hidden="true" className="size-6 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
