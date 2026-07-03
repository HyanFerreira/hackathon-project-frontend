"use client";

import { LogOut, Menu, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type CSSProperties,
  type PointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/buttons";
import { Skeleton } from "@/components/loading";
import { authApi } from "@/services/api/modules/auth";
import { removeAuthToken } from "@/services/api/tokenStorage";

export type UserMenuItem = {
  danger?: boolean;
  icon?: "profile" | "settings" | "logout";
  key: string;
  label: string;
};

type AppHeaderProps = {
  isLoadingUser?: boolean;
  onOpenMobileSidebar?: () => void;
  sidebarWidth: number;
  userMenuItems: UserMenuItem[];
  userName: string;
};

function getMenuIcon(icon?: UserMenuItem["icon"]) {
  switch (icon) {
    case "profile":
      return <User aria-hidden="true" className="size-4" />;
    case "settings":
      return <Settings aria-hidden="true" className="size-4" />;
    case "logout":
      return <LogOut aria-hidden="true" className="size-4" />;
    default:
      return null;
  }
}

export function AppHeader({
  isLoadingUser = false,
  onOpenMobileSidebar,
  sidebarWidth,
  userMenuItems,
  userName,
}: AppHeaderProps) {
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (!userDropdownRef.current?.contains(target)) {
        setIsUserMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function toggleUserDropdown() {
    setIsUserMenuOpen((current) => !current);
  }

  function handleUserButtonPointerDown(event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    toggleUserDropdown();
  }

  function handleUserButtonKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    toggleUserDropdown();
  }

  async function handleUserMenuAction(key: string) {
    setIsUserMenuOpen(false);

    if (key !== "logout") {
      return;
    }

    try {
      await authApi.logout();
    } finally {
      removeAuthToken();
      router.replace("/login");
    }
  }

  return (
    <header
      className="fixed top-0 right-0 left-0 z-30 flex h-24 items-center justify-between bg-white px-5 shadow-[0_4px_18px_rgba(0,0,0,0.08)] transition-[left] duration-300 ease-in-out lg:left-[var(--header-left)] lg:px-8"
      style={
        {
          "--header-left": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <Button
        aria-label="Abrir menu"
        className="size-11 bg-brand-primary p-0 text-white hover:bg-brand-primary-hover lg:hidden"
        onClick={onOpenMobileSidebar}
        type="button"
      >
        <Menu aria-hidden="true" className="size-5" />
      </Button>

      <div className="ml-auto" ref={userDropdownRef}>
        <div className="relative z-30 flex items-center">
          <Button
            type="button"
            onPointerDown={handleUserButtonPointerDown}
            onKeyDown={handleUserButtonKeyDown}
            className="h-12 rounded-system border border-slate-200 bg-white px-3 text-brand-primary shadow-sm hover:bg-slate-50 focus-visible:bg-slate-50"
            aria-haspopup="menu"
            aria-expanded={isUserMenuOpen}
            title={userName}
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
              <User aria-hidden="true" className="size-5" />
            </span>
            {isLoadingUser ? (
              <Skeleton className="hidden h-4 w-24 sm:block" />
            ) : (
              <span className="hidden max-w-44 truncate text-sm font-semibold text-text-primary sm:inline">
                {userName}
              </span>
            )}
          </Button>

          {isUserMenuOpen && (
            <div className="absolute top-[calc(100%+12px)] right-0 z-40 min-w-56 overflow-hidden rounded-system border border-slate-200 bg-white py-2 shadow-[0_18px_40px_rgba(0,0,0,0.14)]">
              {userMenuItems.map((item) => (
                <Button
                  key={item.key}
                  type="button"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void handleUserMenuAction(item.key);
                  }}
                  className={`w-full justify-start rounded-none bg-white px-4 py-3 text-left text-sm font-normal ${
                    item.danger
                      ? "text-red-600 hover:bg-red-50 focus-visible:bg-red-50 focus-visible:outline-red-600"
                      : "text-slate-700 hover:bg-slate-50 focus-visible:bg-slate-50"
                  }`}
                  role="menuitem"
                >
                  <span className="shrink-0">{getMenuIcon(item.icon)}</span>
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
