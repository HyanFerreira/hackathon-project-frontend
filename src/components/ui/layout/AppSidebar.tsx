"use client";

import type { LucideIcon } from "lucide-react";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  LayoutDashboard,
  Menu,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "@/components/buttons";

export const SIDEBAR_COLLAPSED_WIDTH = 80;
export const SIDEBAR_EXPANDED_WIDTH = 280;

type SidebarSubItem = {
  key: string;
  label: string;
  href: string;
};

type SidebarSection = {
  key: string;
  label: string;
  links: SidebarSubItem[];
};

type SidebarItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  sections?: SidebarSection[];
};

type AppSidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
};

type FloatingMenuPosition = {
  left: number;
  maxHeight: number;
  top: number;
};

const sidebarItems: SidebarItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    key: "gestao",
    label: "Gestão",
    icon: Users,
    sections: [
      {
        key: "cadastros",
        label: "Cadastros",
        links: [
          { key: "usuarios", label: "Usuários", href: "/dashboard/usuarios" },
          {
            key: "perfis",
            label: "Perfis de acesso",
            href: "/dashboard/perfis",
          },
        ],
      },
      {
        key: "relatorios",
        label: "Relatórios",
        links: [
          {
            key: "auditoria",
            label: "Auditoria",
            href: "/dashboard/auditoria",
          },
        ],
      },
    ],
  },
];

function isPathActive(pathname: string, href: string) {
  if (href === "/") return pathname === href;

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getBestActiveHref(pathname: string, links: SidebarSubItem[]) {
  return links
    .filter((link) => isPathActive(pathname, link.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
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

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const pathname = usePathname();
  const [openGroupKey, setOpenGroupKey] = useState<string | null>(null);
  const [floatingMenuPosition, setFloatingMenuPosition] =
    useState<FloatingMenuPosition | null>(null);
  const [hasNavOverflow, setHasNavOverflow] = useState(false);
  const [navAction, setNavAction] = useState<"down" | "up">("down");
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);

  const sidebarRef = useRef<HTMLElement | null>(null);
  const submenuRef = useRef<HTMLDivElement | null>(null);
  const navViewportRef = useRef<HTMLDivElement | null>(null);
  const groupButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const openGroup = useMemo(() => {
    return sidebarItems.find(
      (item) => item.key === openGroupKey && item.sections?.length,
    );
  }, [openGroupKey]);

  const activeSubmenuHref = useMemo(() => {
    if (!openGroup?.sections) return undefined;

    return getBestActiveHref(
      pathname,
      openGroup.sections.flatMap((section) => section.links),
    );
  }, [openGroup, pathname]);

  const closeFloatingMenu = useCallback(() => {
    setOpenGroupKey(null);
    setFloatingMenuPosition(null);
  }, []);

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

  const updateFloatingMenuPosition = useCallback(
    (itemKey: string) => {
      const trigger = groupButtonRefs.current[itemKey];

      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const viewportPadding = 12;
      const menuWidth = 360;
      const gapFromSidebar = 12;
      const desiredLeft =
        (isOpen ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH) +
        gapFromSidebar;
      const maxLeft = Math.max(
        viewportPadding,
        window.innerWidth - menuWidth - viewportPadding,
      );
      const top = Math.max(viewportPadding, rect.top);

      setFloatingMenuPosition({
        left: Math.min(desiredLeft, maxLeft),
        maxHeight: Math.max(220, window.innerHeight - top - viewportPadding),
        top,
      });
    },
    [isOpen],
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const clickedInsideSidebar =
        sidebarRef.current?.contains(target) ?? false;
      const clickedInsideSubmenu =
        submenuRef.current?.contains(target) ?? false;

      if (!clickedInsideSidebar && !clickedInsideSubmenu) {
        closeFloatingMenu();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeFloatingMenu();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [closeFloatingMenu]);

  useEffect(() => {
    void pathname;
    closeFloatingMenu();
  }, [pathname, closeFloatingMenu]);

  useEffect(() => {
    const viewport = navViewportRef.current;

    if (!viewport) return;

    const handleViewportChange = () => {
      updateScrollState();

      if (openGroupKey) {
        updateFloatingMenuPosition(openGroupKey);
      }
    };

    handleViewportChange();
    viewport.addEventListener("scroll", handleViewportChange);
    window.addEventListener("resize", handleViewportChange);

    return () => {
      viewport.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [openGroupKey, updateFloatingMenuPosition, updateScrollState]);

  useLayoutEffect(() => {
    if (!openGroupKey) return;

    updateFloatingMenuPosition(openGroupKey);
  }, [openGroupKey, updateFloatingMenuPosition]);

  function toggleGroup(itemKey: string) {
    setOpenGroupKey((current) => {
      const next = current === itemKey ? null : itemKey;

      if (!next) {
        setFloatingMenuPosition(null);
      }

      return next;
    });
  }

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
  const submenuActiveClass =
    "bg-brand-primary-soft font-semibold text-brand-primary hover:bg-brand-primary-soft focus-visible:bg-brand-primary-soft";
  const submenuInactiveClass =
    "text-slate-700 hover:bg-slate-100 focus-visible:bg-slate-100";

  return (
    <>
      <aside
        ref={sidebarRef}
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
                  {sidebarItems.map((item) => {
                    const hasSections = Boolean(item.sections?.length);
                    const isItemActive = hasSections
                      ? Boolean(
                          getBestActiveHref(
                            pathname,
                            item.sections?.flatMap(
                              (section) => section.links,
                            ) ?? [],
                          ),
                        )
                      : item.href
                        ? isPathActive(pathname, item.href)
                        : false;
                    const isGroupOpen = openGroupKey === item.key;

                    if (hasSections) {
                      return (
                        <Button
                          key={item.key}
                          ref={(node) => {
                            groupButtonRefs.current[item.key] = node;
                          }}
                          type="button"
                          onClick={() => toggleGroup(item.key)}
                          className={twMerge(
                            itemBaseClass,
                            isItemActive
                              ? sidebarActiveClass
                              : sidebarInactiveClass,
                          )}
                          aria-haspopup="menu"
                          aria-expanded={isGroupOpen}
                          title={isOpen ? undefined : item.label}
                        >
                          <SidebarRow
                            icon={item.icon}
                            label={item.label}
                            isOpen={isOpen}
                            rightSlot={
                              <ChevronRight
                                aria-hidden="true"
                                className={twMerge(
                                  "size-4 shrink-0 transition-all duration-200",
                                  isOpen
                                    ? `opacity-100 ${isGroupOpen ? "rotate-90" : ""}`
                                    : "opacity-0",
                                )}
                              />
                            }
                          />
                        </Button>
                      );
                    }

                    return (
                      <Link
                        className={twMerge(
                          itemBaseClass,
                          isItemActive
                            ? sidebarActiveClass
                            : sidebarInactiveClass,
                        )}
                        href={item.href ?? "#"}
                        key={item.key}
                        title={isOpen ? undefined : item.label}
                      >
                        <SidebarRow
                          icon={item.icon}
                          label={item.label}
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

          <div className="my-4 h-px w-full bg-white/20" />
        </div>
      </aside>

      {openGroup?.sections && floatingMenuPosition && (
        <div
          ref={submenuRef}
          className="fixed z-[60] w-[360px] max-w-[calc(100vw-24px)] overflow-y-auto rounded-system border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition-[left] duration-300 ease-in-out"
          style={{
            left: floatingMenuPosition.left,
            maxHeight: floatingMenuPosition.maxHeight,
            top: floatingMenuPosition.top,
          }}
        >
          <div className="space-y-4">
            {openGroup.sections.map((section) => (
              <div key={section.key}>
                <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-slate-400">
                  {section.label}
                </p>

                <div className="space-y-1">
                  {section.links.map((link) => {
                    const isSubItemActive = link.href === activeSubmenuHref;

                    return (
                      <Link
                        key={link.key}
                        href={link.href}
                        onClick={closeFloatingMenu}
                        className={twMerge(
                          "flex min-h-10 items-center rounded-system px-4 py-2.5 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-input-border-focus",
                          isSubItemActive
                            ? submenuActiveClass
                            : submenuInactiveClass,
                        )}
                      >
                        <span className="break-words">{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
