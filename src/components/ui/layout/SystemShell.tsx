"use client";

import { useQuery } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/buttons";
import { StatusPage } from "@/components/feedback/StatusPage";
import {
  AppSidebar,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_EXPANDED_WIDTH,
  type UserMenuItem,
} from "@/components/ui/layout/AppSidebar";
import { authApi } from "@/services/api/modules/auth";
import { getAuthActor, isImpersonating } from "@/services/api/tokenStorage";
import type { User } from "@/types/user";
import { canAccessRoute } from "@/utils/auth/routeAccess";

type SystemShellProps = {
  children: ReactNode;
  routeSkeleton?: ReactNode;
};

const SYSTEM_ROUTE_SKELETON_VISIBLE_MS = 800;
const visitedSystemSkeletonRoutes = new Set<string>();

const BASE_USER_MENU_ITEMS: UserMenuItem[] = [
  { key: "settings", label: "Configurações", icon: "settings" },
  { key: "logout", label: "Sair", icon: "logout", danger: true },
];

function useSystemRouteSkeleton(pathname: string, enabled: boolean) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled || visitedSystemSkeletonRoutes.has(pathname)) {
      setIsVisible(false);
      return;
    }

    visitedSystemSkeletonRoutes.add(pathname);
    setIsVisible(true);

    const timeoutId = window.setTimeout(() => {
      setIsVisible(false);
    }, SYSTEM_ROUTE_SKELETON_VISIBLE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [enabled, pathname]);

  return isVisible;
}

export function SystemShell({ children, routeSkeleton }: SystemShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const sidebarWidth = isSidebarOpen
    ? SIDEBAR_EXPANDED_WIDTH
    : SIDEBAR_COLLAPSED_WIDTH;

  const meQuery = useQuery<User>({
    queryKey: ["auth", "me", getAuthActor()],
    queryFn: authApi.me,
    retry: false,
  });

  const actor = getAuthActor();
  const role =
    meQuery.data && "roles" in meQuery.data
      ? meQuery.data.roles?.[0]?.name
      : undefined;

  const canAccessCurrentRoute = canAccessRoute(pathname, role, actor);
  const showInitialRouteSkeleton = useSystemRouteSkeleton(
    pathname,
    Boolean(routeSkeleton),
  );
  const showRouteSkeleton =
    Boolean(routeSkeleton) && (showInitialRouteSkeleton || meQuery.isPending);
  const userMenuItems: UserMenuItem[] = isImpersonating()
    ? [
        {
          key: "stop-impersonation",
          label: "Desconectar",
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
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onToggle={() => setIsSidebarOpen((current) => !current)}
        role={role}
        userName={meQuery.data?.name ?? "Usuário"}
        isLoadingUser={meQuery.isPending}
        userMenuItems={userMenuItems}
      />

      <div
        className="min-h-screen transition-[padding-left] duration-300 ease-in-out lg:pl-[var(--sidebar-width)]"
        style={
          {
            "--sidebar-width": `${sidebarWidth}px`,
          } as React.CSSProperties
        }
      >
        <Button
          aria-label="Abrir menu"
          className="fixed top-4 left-4 z-30 size-11 bg-brand-primary p-0 text-white shadow-lg hover:bg-brand-primary-hover lg:hidden"
          onClick={() => setIsMobileSidebarOpen(true)}
          type="button"
        >
          <Menu aria-hidden="true" className="size-5" />
        </Button>

        <main className="min-w-0 px-4 pt-20 pb-6 sm:px-5 lg:px-8 lg:pt-8 lg:pb-8">
          {showRouteSkeleton ? (
            routeSkeleton
          ) : canAccessCurrentRoute ? (
            children
          ) : (
            <StatusPage
              eyebrow="403"
              title="Acesso não autorizado"
              message="Seu perfil não tem permissão para acessar esta área."
              actionHref="/dashboard"
              actionLabel="Ir para dashboard"
            />
          )}
        </main>
      </div>
    </div>
  );
}
