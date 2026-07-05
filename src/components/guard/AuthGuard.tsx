"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { AppShellSkeleton } from "@/components/loading";
import { authApi } from "@/services/api/modules/auth";
import { gamificationApi } from "@/services/api/modules/gamification";
import {
  getAuthActor,
  getAuthToken,
  removeAuthToken,
} from "@/services/api/tokenStorage";
import type { Aluno } from "@/types/aluno";
import type { User } from "@/types/user";

type AuthGuardProps = {
  children: ReactNode;
  loadingFallback?: ReactNode;
};

export function AuthGuard({ children, loadingFallback }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string>();
  const [actor, setActor] = useState(getAuthActor());
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);

  useEffect(() => {
    const storedToken = getAuthToken();
    const storedActor = getAuthActor();

    if (!storedToken) {
      router.replace(storedActor === "aluno" ? "/login/estudante" : "/login");
      return;
    }

    setActor(storedActor);
    setToken(storedToken);
    setIsCheckingStorage(false);
  }, [router]);

  useEffect(() => {
    if (actor === "aluno" && pathname === "/dashboard") {
      router.replace("/estudantes");
    }
  }, [actor, pathname, router]);

  const meQuery = useQuery<User | Aluno>({
    queryKey: ["auth", "me", actor],
    queryFn: () =>
      actor === "aluno" ? gamificationApi.alunoMe() : authApi.me(),
    enabled: Boolean(token),
    retry: false,
  });

  useEffect(() => {
    if (!meQuery.isError) {
      return;
    }

    removeAuthToken();
    router.replace(actor === "aluno" ? "/login/estudante" : "/login");
  }, [actor, meQuery.isError, router]);

  if (isCheckingStorage || meQuery.isPending || meQuery.isError) {
    return (
      loadingFallback ?? (
        <AppShellSkeleton variant={actor === "aluno" ? "student" : "system"} />
      )
    );
  }

  return children;
}
