"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Loader2,
  LogIn,
  Pencil,
  Plus,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/buttons";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { TableSkeleton } from "@/components/loading";
import { getApiErrorMessage } from "@/services/api/errors/getApiErrorMessage";
import { authApi } from "@/services/api/modules/auth";
import { impersonateApi } from "@/services/api/modules/impersonate";
import { usersApi } from "@/services/api/modules/users";
import {
  getAuthActor,
  preserveOriginalAuth,
  setAuthActor,
  setAuthToken,
} from "@/services/api/tokenStorage";
import type { User } from "@/types/user";
import { formatCpf } from "@/utils/cpf/cpf";
import { UserFormModal } from "./UserFormModal";

export function UsersWorkspace() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User>();
  const [userToDelete, setUserToDelete] = useState<User>();

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: usersApi.list,
  });
  const currentUserQuery = useQuery({
    queryKey: ["auth", "me", getAuthActor()],
    queryFn: authApi.me,
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      setUserToDelete(undefined);
    },
  });

  const impersonateMutation = useMutation({
    mutationFn: (id: number) => impersonateApi.user(id),
    onSuccess: async (response) => {
      preserveOriginalAuth();
      setAuthToken(response.token, false);
      setAuthActor("user", false);
      queryClient.clear();
      router.replace("/dashboard");
      router.refresh();
    },
  });

  const openCreate = () => {
    setEditingUser(undefined);
    setIsFormOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Usuários</h1>
          <p className="mt-1 text-base text-text-secondary">
            Cadastre, edite e remova os usuários do sistema.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreate}
          className="min-h-11 self-start bg-brand-primary px-5 py-3 text-white hover:bg-brand-primary-hover sm:self-auto"
        >
          <Plus aria-hidden="true" className="size-5" />
          Novo usuário
        </Button>
      </section>

      {impersonateMutation.isError && (
        <div
          role="alert"
          className="flex gap-3 rounded-system border border-red-200 bg-red-50 p-4 text-red-700"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p>{getApiErrorMessage(impersonateMutation.error)}</p>
        </div>
      )}

      <section className="rounded-system border border-slate-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3 border-slate-200 border-b p-5">
          <div className="rounded-system bg-brand-primary-soft p-3 text-brand-primary">
            <Users aria-hidden="true" className="size-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              Usuários cadastrados
            </h2>
            <p className="text-sm text-text-secondary">
              {usersQuery.data
                ? `${usersQuery.data.length} usuário(s)`
                : "Carregando..."}
            </p>
          </div>
        </div>

        <div className="p-5" aria-live="polite">
          {usersQuery.isPending && <TableSkeleton rows={5} columns={5} />}

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
            <div className="rounded-system border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <UserRound
                aria-hidden="true"
                className="mx-auto mb-3 size-10 text-brand-primary"
              />
              <p className="font-semibold text-text-primary">
                Nenhum usuário cadastrado
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Clique em novo usuário para começar.
              </p>
            </div>
          )}

          {usersQuery.data && usersQuery.data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-slate-200 border-b text-xs font-bold uppercase tracking-wide text-text-secondary">
                    <th className="px-3 py-3">Nome</th>
                    <th className="px-3 py-3">CPF</th>
                    <th className="px-3 py-3">E-mail</th>
                    <th className="px-3 py-3">Perfis</th>
                    <th className="px-3 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usersQuery.data.map((user) => {
                    const isCurrentUser = user.id === currentUserQuery.data?.id;
                    const isImpersonateDisabled =
                      currentUserQuery.isPending ||
                      impersonateMutation.isPending ||
                      isCurrentUser;

                    return (
                      <tr
                        key={user.id}
                        className="border-slate-100 border-b last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-3 py-3 font-semibold text-text-primary">
                          {user.name}
                        </td>
                        <td className="px-3 py-3 text-text-secondary">
                          {user.cpf ? formatCpf(user.cpf) : "—"}
                        </td>
                        <td className="px-3 py-3 text-text-secondary">
                          {user.email}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {user.roles && user.roles.length > 0 ? (
                              user.roles.map((role) => (
                                <span
                                  key={role.id}
                                  className="rounded-full bg-brand-primary-soft px-2.5 py-0.5 text-xs font-semibold text-brand-primary"
                                >
                                  {role.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-text-secondary">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              aria-label={`Impersonar ${user.name}`}
                              title={
                                isCurrentUser
                                  ? "Nao e possivel impersonar seu proprio usuario"
                                  : "Impersonar"
                              }
                              disabled={isImpersonateDisabled}
                              onClick={() =>
                                impersonateMutation.mutate(user.id)
                              }
                              className="size-9 border border-slate-200 bg-white p-0 text-brand-primary hover:bg-brand-primary-soft"
                            >
                              {impersonateMutation.isPending ? (
                                <Loader2
                                  aria-hidden="true"
                                  className="size-4 animate-spin"
                                />
                              ) : (
                                <LogIn aria-hidden="true" className="size-4" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              aria-label={`Editar ${user.name}`}
                              onClick={() => openEdit(user)}
                              className="size-9 border border-slate-200 bg-white p-0 text-brand-primary hover:bg-brand-primary-soft"
                            >
                              <Pencil aria-hidden="true" className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              aria-label={`Excluir ${user.name}`}
                              onClick={() => setUserToDelete(user)}
                              className="size-9 border border-red-200 bg-white p-0 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 aria-hidden="true" className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <UserFormModal
        isOpen={isFormOpen}
        user={editingUser}
        onClose={() => setIsFormOpen(false)}
      />

      <ConfirmDialog
        isOpen={Boolean(userToDelete)}
        title="Excluir usuário"
        message={`Tem certeza que deseja excluir "${userToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (userToDelete) {
            deleteMutation.mutate(userToDelete.id);
          }
        }}
        onClose={() => setUserToDelete(undefined)}
      />
    </div>
  );
}
