"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  LoaderCircle,
  Server,
  UserRound,
  Users,
} from "lucide-react";
import { getApiErrorMessage } from "@/services/api/errors/getApiErrorMessage";
import { usersApi } from "@/services/api/modules/users";

export function UsersWorkspace() {
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: usersApi.list,
    enabled: false,
  });

  const handleLoadUsers = () => {
    void usersQuery.refetch();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <section className="w-full max-w-2xl rounded-system border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-brand-primary-dark/30 backdrop-blur sm:p-10">
        <div className="mb-8 flex items-start gap-4">
          <div className="rounded-system bg-brand-primary-soft/10 p-3 text-brand-accent">
            <Server aria-hidden="true" className="size-7" />
          </div>
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">
              Integração inicial
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frontend conectado à API
            </h1>
            <p className="mt-3 max-w-xl text-slate-400">
              Use o botão para consultar a rota pública do Laravel e listar os
              usuários cadastrados no banco.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLoadUsers}
          disabled={usersQuery.isFetching}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-system bg-brand-primary px-5 py-3 font-semibold text-white transition hover:bg-brand-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-input-border-focus disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {usersQuery.isFetching ? (
            <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
          ) : (
            <Users aria-hidden="true" className="size-5" />
          )}
          {usersQuery.isFetching ? "Buscando usuários..." : "Listar usuários"}
        </button>

        <div className="mt-8" aria-live="polite">
          {usersQuery.isError && (
            <div
              role="alert"
              className="flex gap-3 rounded-system border border-red-400/30 bg-red-400/10 p-4 text-red-200"
            >
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0"
              />
              <p>{getApiErrorMessage(usersQuery.error)}</p>
            </div>
          )}

          {usersQuery.isSuccess && usersQuery.data.length === 0 && (
            <p className="rounded-system border border-slate-700 bg-slate-800/60 p-5 text-slate-300">
              A API respondeu corretamente, mas ainda não há usuários
              cadastrados.
            </p>
          )}

          {usersQuery.data && usersQuery.data.length > 0 && (
            <ul className="grid gap-3">
              {usersQuery.data.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center gap-4 rounded-system border border-slate-800 bg-slate-950/60 p-4"
                >
                  <div className="rounded-full bg-slate-800 p-2.5 text-brand-accent">
                    <UserRound aria-hidden="true" className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-100">{user.name}</p>
                    <p className="truncate text-sm text-slate-400">
                      {user.email}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
