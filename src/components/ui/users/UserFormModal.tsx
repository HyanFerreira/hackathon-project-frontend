"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, LoaderCircle, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/buttons";
import { CpfInput } from "@/components/form/CpfInput";
import { Input } from "@/components/form/Input";
import { Select } from "@/components/form/Select";
import { Skeleton } from "@/components/loading";
import { Modal } from "@/components/modal";
import {
  getApiErrorMessage,
  getApiValidationErrors,
} from "@/services/api/errors/getApiErrorMessage";
import { rolesApi } from "@/services/api/modules/roles";
import { schoolsApi } from "@/services/api/modules/schools";
import { usersApi } from "@/services/api/modules/users";
import type { User } from "@/types/user";
import { DEFAULT_USER_PASSWORD } from "@/utils/auth/defaultUserPassword";
import { onlyCpfDigits } from "@/utils/cpf/cpf";

type UserFormModalProps = {
  isOpen: boolean;
  user?: User;
  onClose: () => void;
};

type UserFieldErrors = {
  name?: string;
  cpf?: string;
  email?: string;
  password?: string;
  roles?: string;
  school_id?: string;
  escola_id?: string;
};

type FormState = {
  name: string;
  cpf: string;
  email: string;
  role: string;
  schoolId: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  cpf: "",
  email: "",
  role: "",
  schoolId: "",
};

export function UserFormModal({ isOpen, user, onClose }: UserFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(user);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<UserFieldErrors>({});
  const [error, setError] = useState<string>();

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: rolesApi.list,
    enabled: isOpen,
  });
  const schoolsQuery = useQuery({
    queryKey: ["schools"],
    queryFn: schoolsApi.list,
    enabled: isOpen && form.role === "gestor",
  });

  const roleOptions = useMemo(
    () =>
      rolesQuery.data?.map((role) => ({
        label: role.name,
        value: role.name,
      })) ?? [],
    [rolesQuery.data],
  );
  const schoolOptions = useMemo(
    () =>
      schoolsQuery.data?.map((school) => ({
        label: school.name,
        value: String(school.id),
      })) ?? [],
    [schoolsQuery.data],
  );
  const isManager = form.role === "gestor";

  useEffect(() => {
    if (!isOpen) return;

    setFieldErrors({});
    setError(undefined);
    setForm({
      name: user?.name ?? "",
      cpf: user?.cpf ?? "",
      email: user?.email ?? "",
      role: user?.roles?.[0]?.name ?? "",
      schoolId: user?.schoolId ? String(user.schoolId) : "",
    });
  }, [isOpen, user]);

  const mutation = useMutation({
    mutationFn: async () => {
      const cpfDigits = onlyCpfDigits(form.cpf);

      if (isEditing && user) {
        return usersApi.update(user.id, {
          name: form.name,
          cpf: cpfDigits,
          email: form.email,
          roles: form.role ? [form.role] : [],
          school_id:
            isManager && form.schoolId ? Number(form.schoolId) : undefined,
        });
      }

      return usersApi.create({
        name: form.name,
        cpf: cpfDigits,
        email: form.email,
        password: DEFAULT_USER_PASSWORD,
        roles: form.role ? [form.role] : [],
        school_id:
          isManager && form.schoolId ? Number(form.schoolId) : undefined,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);
    setFieldErrors({});
    mutation.mutate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar usuário" : "Novo usuário"}
      description={
        isEditing
          ? "Atualize os dados do usuário selecionado."
          : "Preencha os dados para cadastrar um novo usuário."
      }
      footer={
        <>
          <Button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="min-h-11 border border-slate-200 bg-white px-5 py-2.5 text-text-primary hover:bg-slate-50"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            form="user-form"
            disabled={mutation.isPending}
            className="min-h-11 bg-brand-primary px-5 py-2.5 text-white hover:bg-brand-primary-hover"
          >
            {mutation.isPending ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-5 animate-spin"
              />
            ) : (
              <Save aria-hidden="true" className="size-5" />
            )}
            {isEditing ? "Salvar" : "Cadastrar"}
          </Button>
        </>
      }
    >
      <form id="user-form" className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Nome"
          name="name"
          placeholder="Nome completo"
          value={form.name}
          error={fieldErrors.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
        />

        <CpfInput
          label="CPF"
          name="cpf"
          value={form.cpf}
          error={fieldErrors.cpf}
          autoComplete="off"
          onChange={(value) =>
            setForm((current) => ({ ...current, cpf: value }))
          }
        />

        <Input
          label="E-mail"
          name="email"
          type="email"
          placeholder="email@exemplo.com"
          value={form.email}
          error={fieldErrors.email}
          onChange={(event) =>
            setForm((current) => ({ ...current, email: event.target.value }))
          }
        />

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-text-primary">
            Perfil
          </legend>

          {rolesQuery.isPending && (
            <div className="grid gap-2 sm:grid-cols-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          )}

          {rolesQuery.isError && (
            <p className="text-sm text-red-600">
              Não foi possível carregar os perfis.
            </p>
          )}

          {rolesQuery.data && rolesQuery.data.length === 0 && (
            <p className="text-sm text-text-secondary">
              Nenhum perfil cadastrado ainda.
            </p>
          )}

          {rolesQuery.data && rolesQuery.data.length > 0 && (
            <Select
              name="role"
              value={form.role}
              error={fieldErrors.roles}
              options={roleOptions}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  role: value,
                  schoolId: value === "gestor" ? current.schoolId : "",
                }))
              }
            />
          )}
        </fieldset>

        {isManager && (
          <>
            {schoolsQuery.isPending && <Skeleton className="h-11" />}

            {schoolsQuery.isError && (
              <p className="text-sm text-red-600">
                NÃ£o foi possÃ­vel carregar as escolas.
              </p>
            )}

            {schoolsQuery.data && (
              <Select
                label="Escola"
                name="school_id"
                value={form.schoolId}
                error={fieldErrors.school_id ?? fieldErrors.escola_id}
                options={schoolOptions}
                placeholder="Selecione a escola"
                searchable
                onChange={(value) =>
                  setForm((current) => ({ ...current, schoolId: value }))
                }
              />
            )}
          </>
        )}

        {(fieldErrors.password || error) && (
          <div
            role="alert"
            className="flex gap-2 rounded-system border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
          >
            <AlertCircle
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />
            <p>{fieldErrors.password ?? error}</p>
          </div>
        )}
      </form>
    </Modal>
  );
}
