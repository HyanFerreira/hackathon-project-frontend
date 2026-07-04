"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type BookOpen,
  ChevronDown,
  Home,
  LogOut,
  Settings,
  Target,
  Trophy,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import paideiaLogoIconWhite from "@/assets/images/paideiaLogoIconWhite.svg";
import { Button } from "@/components/buttons";
import { authApi } from "@/services/api/modules/auth";
import { gamificationApi } from "@/services/api/modules/gamification";
import { removeAuthToken } from "@/services/api/tokenStorage";

type StudentShellProps = {
  children: ReactNode;
};

function getInitials(name?: string) {
  if (!name) return "ES";

  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase()).join("") || "ES";
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StudentShell({ children }: StudentShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const meQuery = useQuery({
    queryKey: ["auth", "me", "aluno"],
    queryFn: gamificationApi.alunoMe,
    retry: false,
  });

  const studentName = meQuery.data?.name ?? "Estudante";
  const initials = getInitials(studentName);

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
            <StudentNavItem
              active={isActive(pathname, "/lobby")}
              icon={Home}
              label="Inicio"
              href="/lobby"
            />
            <StudentNavItem
              active={isActive(pathname, "/responder")}
              icon={Target}
              label="Desafios"
              href="/responder"
            />
            <StudentNavItem
              active={isActive(pathname, "/ranking")}
              icon={Trophy}
              label="Conquistas"
              href="/ranking"
            />
            <StudentNavItem
              active={isActive(pathname, "/perfil")}
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
                {studentName}
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
      className={`flex min-h-12 items-center gap-3 rounded-full px-6 text-base font-semibold transition ${
        active ? "bg-[#4f20b5]/60 shadow-inner" : "hover:bg-white/10"
      }`}
    >
      <Icon aria-hidden="true" className="size-6" />
      {label}
    </Link>
  );
}
