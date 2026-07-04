"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { AppHeader, type UserMenuItem } from "@/components/ui/layout/AppHeader";
import {
  AppSidebar,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_EXPANDED_WIDTH,
} from "@/components/ui/layout/AppSidebar";
import { authApi } from "@/services/api/modules/auth";
import { gamificationApi } from "@/services/api/modules/gamification";
import { getAuthActor, isImpersonating } from "@/services/api/tokenStorage";
import type { Aluno } from "@/types/aluno";
import type { User } from "@/types/user";

type SystemShellProps = {
  children: ReactNode;
};

const BASE_USER_MENU_ITEMS: UserMenuItem[] = [
  { key: "profile", label: "Meu perfil", icon: "profile" },
  { key: "settings", label: "Configurações", icon: "settings" },
  { key: "logout", label: "Sair", icon: "logout", danger: true },
];

export function SystemShell({ children }: SystemShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarWidth = isSidebarOpen
    ? SIDEBAR_EXPANDED_WIDTH
    : SIDEBAR_COLLAPSED_WIDTH;

  const meQuery = useQuery<User | Aluno>({
    queryKey: ["auth", "me", getAuthActor()],
    queryFn: () =>
      getAuthActor() === "aluno" ? gamificationApi.alunoMe() : authApi.me(),
    retry: false,
  });

  const actor = getAuthActor();
  const role =
    meQuery.data && "roles" in meQuery.data
      ? meQuery.data.roles?.[0]?.name
      : undefined;
  const userMenuItems: UserMenuItem[] = isImpersonating()
    ? [
        {
          key: "stop-impersonation",
          label: "Encerrar impersonacao",
          icon: "return",
        },
        ...BASE_USER_MENU_ITEMS,
      ]
    : BASE_USER_MENU_ITEMS;

  return (
    <div className="min-h-screen bg-slate-100 text-text-primary">
      <AppSidebar
        actor={actor}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((current) => !current)}
        role={role}
      />

      <div
        className="min-h-screen transition-[padding-left] duration-300 ease-in-out lg:pl-[var(--sidebar-width)]"
        style={
          {
            "--sidebar-width": `${sidebarWidth}px`,
          } as React.CSSProperties
        }
      >
        <AppHeader
          sidebarWidth={sidebarWidth}
          userName={meQuery.data?.name ?? "Usuário"}
          isLoadingUser={meQuery.isPending}
          userMenuItems={userMenuItems}
        />

        <main className="px-5 pt-32 pb-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
