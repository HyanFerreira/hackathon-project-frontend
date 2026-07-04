"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [token, setToken] = useState<string>();
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);

  useEffect(() => {
    const storedToken = getAuthToken();

    if (!storedToken) {
      router.replace("/login");
      return;
    }

    setToken(storedToken);
    setIsCheckingStorage(false);
  }, [router]);

  const meQuery = useQuery<User | Aluno>({
    queryKey: ["auth", "me", getAuthActor()],
    queryFn: () =>
      getAuthActor() === "aluno" ? gamificationApi.alunoMe() : authApi.me(),
    enabled: Boolean(token),
    retry: false,
  });

  useEffect(() => {
    if (!meQuery.isError) {
      return;
    }

    removeAuthToken();
    router.replace("/login");
  }, [meQuery.isError, router]);

  if (isCheckingStorage || meQuery.isPending || meQuery.isError) {
    return <AppShellSkeleton />;
  }

  return children;
}
