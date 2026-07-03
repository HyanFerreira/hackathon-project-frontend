"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/buttons";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { ListSkeleton } from "@/components/loading";
import { getApiErrorMessage } from "@/services/api/errors/getApiErrorMessage";
import { rolesApi } from "@/services/api/modules/roles";
import type { Role } from "@/types/role";
import { RoleFormModal } from "./RoleFormModal";

export function RolesWorkspace() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role>();
  const [roleToDelete, setRoleToDelete] = useState<Role>();

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: rolesApi.list,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rolesApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
      setRoleToDelete(undefined);
    },
  });

  const openCreate = () => {
    setEditingRole(undefined);
    setIsFormOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Perfis</h1>
          <p className="mt-1 text-base text-text-secondary">
            Gerencie os perfis de acesso do sistema.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreate}
          className="min-h-11 self-start bg-brand-primary px-5 py-3 text-white hover:bg-brand-primary-hover sm:self-auto"
        >
          <Plus aria-hidden="true" className="size-5" />
          Novo perfil
        </Button>
      </section>

      <section className="rounded-system border border-slate-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3 border-slate-200 border-b p-5">
          <div className="rounded-system bg-brand-primary-soft p-3 text-brand-primary">
            <ShieldCheck aria-hidden="true" className="size-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              Perfis cadastrados
            </h2>
            <p className="text-sm text-text-secondary">
              {rolesQuery.data
                ? `${rolesQuery.data.length} perfil(is)`
                : "Carregando..."}
            </p>
          </div>
        </div>

        <div className="p-5" aria-live="polite">
          {rolesQuery.isPending && <ListSkeleton rows={4} />}

          {rolesQuery.isError && (
            <div
              role="alert"
              className="flex gap-3 rounded-system border border-red-200 bg-red-50 p-4 text-red-700"
            >
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0"
              />
              <p>{getApiErrorMessage(rolesQuery.error)}</p>
            </div>
          )}

          {rolesQuery.isSuccess && rolesQuery.data.length === 0 && (
            <div className="rounded-system border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <ShieldCheck
                aria-hidden="true"
                className="mx-auto mb-3 size-10 text-brand-primary"
              />
              <p className="font-semibold text-text-primary">
                Nenhum perfil cadastrado
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Clique em novo perfil para começar.
              </p>
            </div>
          )}

          {rolesQuery.data && rolesQuery.data.length > 0 && (
            <ul className="grid gap-3">
              {rolesQuery.data.map((role) => (
                <li
                  key={role.id}
                  className="flex items-center justify-between gap-4 rounded-system border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-brand-primary-soft p-2.5 text-brand-primary">
                      <ShieldCheck aria-hidden="true" className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">
                        {role.name}
                      </p>
                      <p className="text-xs text-text-secondary">
                        guard: {role.guardName}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      aria-label={`Editar ${role.name}`}
                      onClick={() => openEdit(role)}
                      className="size-9 border border-slate-200 bg-white p-0 text-brand-primary hover:bg-brand-primary-soft"
                    >
                      <Pencil aria-hidden="true" className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      aria-label={`Excluir ${role.name}`}
                      onClick={() => setRoleToDelete(role)}
                      className="size-9 border border-red-200 bg-white p-0 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <RoleFormModal
        isOpen={isFormOpen}
        role={editingRole}
        onClose={() => setIsFormOpen(false)}
      />

      <ConfirmDialog
        isOpen={Boolean(roleToDelete)}
        title="Excluir perfil"
        message={`Tem certeza que deseja excluir o perfil "${roleToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (roleToDelete) {
            deleteMutation.mutate(roleToDelete.id);
          }
        }}
        onClose={() => setRoleToDelete(undefined)}
      />
    </div>
  );
}
