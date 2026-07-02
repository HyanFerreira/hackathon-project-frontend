"use client";

import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { authApi } from "@/services/api/modules/auth";
import { getAuthToken, removeAuthToken } from "@/services/api/tokenStorage";

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

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
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
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 text-brand-primary">
        <LoaderCircle aria-hidden="true" className="size-8 animate-spin" />
      </main>
    );
  }

  return children;
}
