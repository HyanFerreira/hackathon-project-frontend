"use client";

import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  LayoutDashboard,
  Menu,
  School,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "@/components/buttons";

export const SIDEBAR_COLLAPSED_WIDTH = 80;
export const SIDEBAR_EXPANDED_WIDTH = 280;

type SidebarItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
};

type AppSidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
  role?: string;
  actor?: "user" | "aluno";
};

const sidebarItems: SidebarItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    key: "escolas",
    label: "Escolas",
    icon: Building2,
    href: "/escolas",
  },
  {
    key: "gestores",
    label: "Usuários",
    icon: Users,
    href: "/gestores",
  },
  {
    key: "usuarios",
    label: "Usuarios",
    icon: Users,
    href: "/usuarios",
  },
  {
    key: "turmas",
    label: "Turmas",
    icon: School,
    href: "/turmas",
  },
  {
    key: "professores",
    label: "Professores",
    icon: UserRound,
    href: "/professores",
  },
  {
    key: "alunos",
    label: "Alunos",
    icon: Users,
    href: "/alunos",
  },
  {
    key: "questoes",
    label: "Questoes",
    icon: ClipboardList,
    href: "/questoes",
  },
  {
    key: "responder",
    label: "Responder",
    icon: ClipboardList,
    href: "/responder",
  },
  {
    key: "ranking",
    label: "Ranking",
    icon: Trophy,
    href: "/ranking",
  },
];

function canShowItem(
  item: SidebarItem,
  role?: string,
  actor?: "user" | "aluno",
) {
  if (item.key === "dashboard") return true;
  if (actor === "aluno") return ["responder", "ranking"].includes(item.key);
  if (!role) return false;
  if (role === "admin") {
    return ["escolas", "gestores", "usuarios"].includes(item.key);
  }
  if (role === "gestor") {
    return ["turmas", "professores", "alunos", "ranking"].includes(item.key);
  }
  if (role === "professor") return ["questoes", "ranking"].includes(item.key);

  return false;
}

function isPathActive(pathname: string, href: string) {
  if (href === "/" || href === "/dashboard") return pathname === href;

  return pathname === href || pathname.startsWith(`${href}/`);
}

type SidebarRowProps = {
  icon: LucideIcon;
  isOpen: boolean;
  label: string;
  rightSlot?: ReactNode;
};

function SidebarRow({ icon: Icon, isOpen, label, rightSlot }: SidebarRowProps) {
  return (
    <span className="flex min-w-0 w-full items-center">
      <span className="flex size-5 shrink-0 items-center justify-center">
        <Icon aria-hidden="true" className="size-[18px]" />
      </span>

      <span
        className={twMerge(
          "ml-3 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300",
          isOpen
            ? "max-w-[160px] translate-x-0 opacity-100"
            : "max-w-0 -translate-x-2 opacity-0",
        )}
      >
        {label}
      </span>

      <span
        className={twMerge(
          "ml-auto flex items-center justify-center transition-all duration-200",
          isOpen ? "size-5 opacity-100" : "size-0 opacity-0",
        )}
      >
        {rightSlot}
      </span>
    </span>
  );
}

export function AppSidebar({ actor, isOpen, onToggle, role }: AppSidebarProps) {
  const pathname = usePathname();
  const [hasNavOverflow, setHasNavOverflow] = useState(false);
  const [navAction, setNavAction] = useState<"down" | "up">("down");
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);

  const navViewportRef = useRef<HTMLDivElement | null>(null);

  const updateScrollState = useCallback(() => {
    const viewport = navViewportRef.current;

    if (!viewport) return;

    const { clientHeight, scrollHeight, scrollTop } = viewport;
    const isAtTop = scrollTop <= 4;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 4;
    const overflowExists = scrollHeight > clientHeight + 4;

    setHasNavOverflow(overflowExists);
    setShowTopFade(overflowExists && !isAtTop);
    setShowBottomFade(overflowExists && !isAtBottom);

    if (!overflowExists) {
      setNavAction("down");
      return;
    }

    setNavAction((current) => {
      if (isAtBottom) return "up";
      if (isAtTop) return "down";
      return current;
    });
  }, []);

  useEffect(() => {
    const viewport = navViewportRef.current;

    if (!viewport) return;

    const handleViewportChange = () => {
      updateScrollState();
    };

    handleViewportChange();
    viewport.addEventListener("scroll", handleViewportChange);
    window.addEventListener("resize", handleViewportChange);

    return () => {
      viewport.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [updateScrollState]);

  function moveNav() {
    const viewport = navViewportRef.current;

    if (!viewport || !hasNavOverflow) return;

    viewport.scrollTo({
      behavior: "smooth",
      top: navAction === "down" ? viewport.scrollHeight : 0,
    });
  }

  const itemBaseClass =
    "flex h-12 w-full items-center justify-start rounded-system px-4 text-left transition";
  const sidebarActiveClass =
    "bg-white text-brand-primary hover:bg-white focus-visible:bg-white focus-visible:outline-white";
  const sidebarInactiveClass =
    "bg-transparent text-white hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-white";

  return (
    <aside
      className="fixed top-0 left-0 z-40 hidden h-screen bg-brand-primary text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition-[width] duration-300 ease-in-out lg:block"
      style={{
        width: isOpen ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
      }}
    >
      <div className="flex h-full flex-col py-4">
        <div className="flex items-center px-4">
          <Button
            type="button"
            onClick={onToggle}
            className="size-12 shrink-0 bg-transparent p-0 text-white hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-white"
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          >
            <Menu aria-hidden="true" className="size-5" />
          </Button>

          <span
            className={twMerge(
              "ml-3 overflow-hidden whitespace-nowrap text-sm font-semibold uppercase tracking-[0.2em] text-white/80 transition-all duration-300",
              isOpen
                ? "max-w-[140px] translate-x-0 opacity-100"
                : "max-w-0 -translate-x-2 opacity-0",
            )}
          >
            Sistema
          </span>
        </div>

        <div className="my-4 h-px w-full bg-white/20" />

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1">
            <div className="relative h-full">
              <div
                ref={navViewportRef}
                className="flex h-full flex-col gap-2 overflow-y-auto px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {sidebarItems
                  .filter((item) => canShowItem(item, role, actor))
                  .map((item) => {
                    const isItemActive = isPathActive(pathname, item.href);
                    const itemLabel =
                      item.key === "gestores" ? "Gestores" : item.label;

                    return (
                      <Link
                        className={twMerge(
                          itemBaseClass,
                          isItemActive
                            ? sidebarActiveClass
                            : sidebarInactiveClass,
                        )}
                        href={item.href}
                        key={item.key}
                        title={isOpen ? undefined : itemLabel}
                      >
                        <SidebarRow
                          icon={item.icon}
                          label={itemLabel}
                          isOpen={isOpen}
                          rightSlot={<span className="size-4 opacity-0" />}
                        />
                      </Link>
                    );
                  })}
              </div>

              <div
                className={twMerge(
                  "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-brand-primary to-transparent transition-opacity duration-200",
                  showTopFade ? "opacity-100" : "opacity-0",
                )}
              />

              <div
                className={twMerge(
                  "pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-brand-primary to-transparent transition-opacity duration-200",
                  showBottomFade ? "opacity-100" : "opacity-0",
                )}
              />
            </div>
          </div>

          {hasNavOverflow && (
            <div className="mt-4 px-4">
              <Button
                type="button"
                onClick={moveNav}
                className="h-12 w-full border border-white/20 bg-transparent p-0 text-white hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-white"
                aria-label={
                  navAction === "down"
                    ? "Mover menu para baixo"
                    : "Mover menu para cima"
                }
              >
                {navAction === "down" ? (
                  <ChevronDown aria-hidden="true" className="size-[18px]" />
                ) : (
                  <ChevronUp aria-hidden="true" className="size-[18px]" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
