import type { AuthActor } from "@/services/api/tokenStorage";

type RouteAccess = {
  actor?: AuthActor;
  roles?: string[];
};

export type NavigationItem = {
  href: string;
  key: string;
};

const ROUTE_ACCESS: Record<string, RouteAccess> = {
  "/dashboard": {},
  "/escolas": { actor: "user", roles: ["admin"] },
  "/gestores": { actor: "user", roles: ["admin"] },
  "/usuarios": { actor: "user", roles: ["admin"] },
  "/turmas": { actor: "user", roles: ["gestor"] },
  "/professores": { actor: "user", roles: ["gestor"] },
  "/alunos": { actor: "user", roles: ["gestor"] },
  "/questoes": { actor: "user", roles: ["professor"] },
  "/estudantes": { actor: "aluno" },
  "/ranking": {},
};

function getBaseRoute(pathname: string) {
  const matchingRoute = Object.keys(ROUTE_ACCESS)
    .sort((a, b) => b.length - a.length)
    .find((route) => pathname === route || pathname.startsWith(`${route}/`));

  return matchingRoute;
}

export function canAccessRoute(
  pathname: string,
  role?: string,
  actor: AuthActor = "user",
) {
  const baseRoute = getBaseRoute(pathname);

  if (!baseRoute) return true;
  if (baseRoute === "/ranking") {
    return role === "gestor" || role === "professor";
  }

  const access = ROUTE_ACCESS[baseRoute];
  const allowedRoles = access.roles;

  if (access.actor && access.actor !== actor) return false;
  if (allowedRoles) {
    if (!role) return false;

    return allowedRoles.includes(role);
  }

  return true;
}

export function canShowNavigationItem(
  item: NavigationItem,
  role?: string,
  actor: AuthActor = "user",
) {
  return canAccessRoute(item.href, role, actor);
}
