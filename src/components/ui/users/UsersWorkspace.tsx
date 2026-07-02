"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, LoaderCircle, UserRound, Users } from "lucide-react";
import { Button } from "@/components/buttons";
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
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold text-brand-primary">Bem-vindo(a)!</h1>
        <p className="mt-1 text-base text-text-secondary">
          Visão geral do sistema
        </p>
      </section>

      <section className="rounded-system border border-slate-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-4 border-slate-200 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-system bg-brand-primary-soft p-3 text-brand-primary">
              <Users aria-hidden="true" className="size-6" />
            </div>
            <div>
              <p className="text-sm font-extrabold tracking-wide text-brand-primary uppercase">
                Usuários
              </p>
              <h2 className="mt-1 text-xl font-bold text-text-primary">
                Listagem de usuários da API
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-text-secondary">
                Consulte os usuários cadastrados no backend autenticado.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleLoadUsers}
            disabled={usersQuery.isFetching}
            className="min-h-11 bg-brand-primary px-5 py-3 text-white hover:bg-brand-primary-hover"
          >
            {usersQuery.isFetching ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-5 animate-spin"
              />
            ) : (
              <Users aria-hidden="true" className="size-5" />
            )}
            {usersQuery.isFetching ? "Buscando..." : "Listar usuários"}
          </Button>
        </div>

        <div className="p-5" aria-live="polite">
          {!usersQuery.data && !usersQuery.isError && (
            <div className="rounded-system border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <UserRound
                aria-hidden="true"
                className="mx-auto mb-3 size-10 text-brand-primary"
              />
              <p className="font-semibold text-text-primary">
                Nenhuma consulta realizada
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Clique em listar usuários para carregar os dados.
              </p>
            </div>
          )}

          {usersQuery.isError && (
            <div
              role="alert"
              className="flex gap-3 rounded-system border border-red-200 bg-red-50 p-4 text-red-700"
            >
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0"
              />
              <p>{getApiErrorMessage(usersQuery.error)}</p>
            </div>
          )}

          {usersQuery.isSuccess && usersQuery.data.length === 0 && (
            <p className="rounded-system border border-slate-200 bg-slate-50 p-5 text-text-secondary">
              A API respondeu corretamente, mas ainda não há usuários
              cadastrados.
            </p>
          )}

          {usersQuery.data && usersQuery.data.length > 0 && (
            <ul className="grid gap-3">
              {usersQuery.data.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center gap-4 rounded-system border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="rounded-full bg-brand-primary-soft p-2.5 text-brand-primary">
                    <UserRound aria-hidden="true" className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary">
                      {user.name}
                    </p>
                    <p className="truncate text-sm text-text-secondary">
                      {user.email}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
