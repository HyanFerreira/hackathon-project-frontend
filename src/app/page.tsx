"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#6d2ee8] via-[#8738f2] to-[#7029dc] text-white">
      <LoaderCircle
        aria-hidden="true"
        className="size-12 animate-spin"
        strokeWidth={2.4}
      />
      <span className="sr-only">Redirecionando para o login...</span>
    </main>
  );
}
