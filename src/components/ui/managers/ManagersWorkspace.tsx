"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Pencil, Plus, Trash2, UserCog } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/buttons";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { CpfInput } from "@/components/form/CpfInput";
import { Input } from "@/components/form/Input";
import { PasswordInput } from "@/components/form/PasswordInput";
import { Select } from "@/components/form/Select";
import { TableSkeleton } from "@/components/loading";
import { Modal } from "@/components/modal";
import {
  getApiErrorMessage,
  getApiValidationErrors,
} from "@/services/api/errors/getApiErrorMessage";
import { managersApi } from "@/services/api/modules/managers";
import { schoolsApi } from "@/services/api/modules/schools";
import type { User } from "@/types/user";
import { formatCpf, onlyCpfDigits } from "@/utils/cpf/cpf";

type FormState = {
  schoolId: string;
  name: string;
  cpf: string;
  email: string;
  password: string;
};

type FieldErrors = Partial<Record<keyof FormState | "escola_id", string>>;

const EMPTY_FORM: FormState = {
  schoolId: "",
  name: "",
  cpf: "",
  email: "",
  password: "",
};

export function ManagersWorkspace() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<User>();
  const [managerToDelete, setManagerToDelete] = useState<User>();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string>();

  const managersQuery = useQuery({
    queryKey: ["managers"],
    queryFn: managersApi.list,
  });
  const schoolsQuery = useQuery({
    queryKey: ["schools"],
    queryFn: schoolsApi.list,
  });

  const schoolOptions = useMemo(
    () =>
      schoolsQuery.data?.map((school) => ({
        label: school.name,
        value: String(school.id),
      })) ?? [],
    [schoolsQuery.data],
  );

  useEffect(() => {
    if (!isFormOpen) return;

    setError(undefined);
    setFieldErrors({});
    setForm({
      schoolId: editingManager?.schoolId ? String(editingManager.schoolId) : "",
      name: editingManager?.name ?? "",
      cpf: editingManager?.cpf ?? "",
      email: editingManager?.email ?? "",
      password: "",
    });
  }, [editingManager, isFormOpen]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        escola_id: Number(form.schoolId),
        name: form.name,
        cpf: onlyCpfDigits(form.cpf),
        email: form.email,
        ...(form.password ? { password: form.password } : {}),
      };

      if (editingManager) return managersApi.update(editingManager.id, payload);

      return managersApi.create({
        ...payload,
        password: form.password,
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["managers"] }),
        queryClient.invalidateQueries({ queryKey: ["schools"] }),
      ]);
      setIsFormOpen(false);
    },
    onError: (requestError) => {
      const validationErrors = getApiValidationErrors(requestError);

      if (validationErrors) {
        setFieldErrors(validationErrors);
      } else {
        setError(getApiErrorMessage(requestError));
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => managersApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["managers"] });
      setManagerToDelete(undefined);
    },
  });

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Gestores</h1>
          <p className="mt-1 text-base text-text-secondary">
            Cadastre e acompanhe gestores vinculados as escolas.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditingManager(undefined);
            setIsFormOpen(true);
          }}
          className="min-h-11 self-start bg-brand-primary px-5 py-3 text-white hover:bg-brand-primary-hover"
        >
          <Plus aria-hidden="true" className="size-5" />
          Novo gestor
        </Button>
      </section>

      <section className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        {(managersQuery.isPending || schoolsQuery.isPending) && (
          <TableSkeleton rows={5} columns={5} />
        )}

        {(managersQuery.isError || schoolsQuery.isError) && (
          <div
            role="alert"
            className="flex gap-3 rounded-system border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <p>
              {getApiErrorMessage(managersQuery.error ?? schoolsQuery.error)}
            </p>
          </div>
        )}

        {managersQuery.data && managersQuery.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-slate-200 border-b text-xs font-bold uppercase tracking-wide text-text-secondary">
                  <th className="px-3 py-3">Nome</th>
                  <th className="px-3 py-3">CPF</th>
                  <th className="px-3 py-3">E-mail</th>
                  <th className="px-3 py-3">Escola</th>
                  <th className="px-3 py-3 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {managersQuery.data.map((manager) => (
                  <tr
                    key={manager.id}
                    className="border-slate-100 border-b last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-3 py-3 font-semibold text-text-primary">
                      {manager.name}
                    </td>
                    <td className="px-3 py-3 text-text-secondary">
                      {manager.cpf ? formatCpf(manager.cpf) : "-"}
                    </td>
                    <td className="px-3 py-3 text-text-secondary">
                      {manager.email}
                    </td>
                    <td className="px-3 py-3 text-text-secondary">
                      {manager.school?.name ?? "-"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          aria-label={`Editar ${manager.name}`}
                          onClick={() => {
                            setEditingManager(manager);
                            setIsFormOpen(true);
                          }}
                          className="size-9 border border-slate-200 bg-white p-0 text-brand-primary hover:bg-brand-primary-soft"
                        >
                          <Pencil aria-hidden="true" className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          aria-label={`Excluir ${manager.name}`}
                          onClick={() => setManagerToDelete(manager)}
                          className="size-9 border border-red-200 bg-white p-0 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          managersQuery.isSuccess && (
            <div className="rounded-system border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <UserCog className="mx-auto mb-3 size-10 text-brand-primary" />
              <p className="font-semibold text-text-primary">
                Nenhum gestor cadastrado
              </p>
            </div>
          )
        )}
      </section>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingManager ? "Editar gestor" : "Novo gestor"}
        footer={
          <>
            <Button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="min-h-11 border border-slate-200 bg-white px-5 py-2.5 text-text-primary hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="manager-page-form"
              disabled={saveMutation.isPending}
              className="min-h-11 bg-brand-primary px-5 py-2.5 text-white hover:bg-brand-primary-hover"
            >
              Salvar
            </Button>
          </>
        }
      >
        <form
          id="manager-page-form"
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            saveMutation.mutate();
          }}
        >
          <Select
            label="Escola"
            value={form.schoolId}
            options={schoolOptions}
            error={fieldErrors.schoolId ?? fieldErrors.escola_id}
            searchable
            onChange={(value) =>
              setForm((current) => ({ ...current, schoolId: value }))
            }
          />
          <Input
            label="Nome"
            value={form.name}
            error={fieldErrors.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
          />
          <CpfInput
            label="CPF"
            value={form.cpf}
            error={fieldErrors.cpf}
            onChange={(value) =>
              setForm((current) => ({ ...current, cpf: value }))
            }
          />
          <Input
            label="E-mail"
            type="email"
            value={form.email}
            error={fieldErrors.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
          />
          <PasswordInput
            label={editingManager ? "Nova senha (opcional)" : "Senha"}
            value={form.password}
            error={fieldErrors.password}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
          />

          {error && (
            <div
              role="alert"
              className="rounded-system border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(managerToDelete)}
        title="Excluir gestor"
        message={`Tem certeza que deseja excluir "${managerToDelete?.name}"?`}
        confirmLabel="Excluir"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (managerToDelete) deleteMutation.mutate(managerToDelete.id);
        }}
        onClose={() => setManagerToDelete(undefined)}
      />
    </div>
  );
}
