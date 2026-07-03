"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, LoaderCircle, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/buttons";
import { CpfInput } from "@/components/form/CpfInput";
import { Input } from "@/components/form/Input";
import { PasswordInput } from "@/components/form/PasswordInput";
import { Skeleton } from "@/components/loading";
import { Modal } from "@/components/modal";
import {
  getApiErrorMessage,
  getApiValidationErrors,
} from "@/services/api/errors/getApiErrorMessage";
import { rolesApi } from "@/services/api/modules/roles";
import { usersApi } from "@/services/api/modules/users";
import type { User } from "@/types/user";
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
};

type FormState = {
  name: string;
  cpf: string;
  email: string;
  password: string;
  roles: string[];
};

const EMPTY_FORM: FormState = {
  name: "",
  cpf: "",
  email: "",
  password: "",
  roles: [],
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

  useEffect(() => {
    if (!isOpen) return;

    setFieldErrors({});
    setError(undefined);
    setForm({
      name: user?.name ?? "",
      cpf: user?.cpf ?? "",
      email: user?.email ?? "",
      password: "",
      roles: user?.roles?.map((role) => role.name) ?? [],
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
          roles: form.roles,
          ...(form.password ? { password: form.password } : {}),
        });
      }

      return usersApi.create({
        name: form.name,
        cpf: cpfDigits,
        email: form.email,
        password: form.password,
        roles: form.roles,
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

  const toggleRole = (roleName: string) => {
    setForm((current) => ({
      ...current,
      roles: current.roles.includes(roleName)
        ? current.roles.filter((name) => name !== roleName)
        : [...current.roles, roleName],
    }));
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

        <PasswordInput
          label={isEditing ? "Nova senha (opcional)" : "Senha"}
          name="password"
          autoComplete="new-password"
          value={form.password}
          error={fieldErrors.password}
          onChange={(event) =>
            setForm((current) => ({ ...current, password: event.target.value }))
          }
        />

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-text-primary">
            Perfis
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
            <div className="grid gap-2 sm:grid-cols-2">
              {rolesQuery.data.map((role) => (
                <label
                  key={role.id}
                  className="flex cursor-pointer items-center gap-2 rounded-system border border-slate-200 px-3 py-2 text-sm text-text-primary transition hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    className="size-4"
                    checked={form.roles.includes(role.name)}
                    onChange={() => toggleRole(role.name)}
                  />
                  {role.name}
                </label>
              ))}
            </div>
          )}

          {fieldErrors.roles && (
            <p className="text-sm font-medium text-red-600">
              {fieldErrors.roles}
            </p>
          )}
        </fieldset>

        {error && (
          <div
            role="alert"
            className="flex gap-2 rounded-system border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
          >
            <AlertCircle
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />
            <p>{error}</p>
          </div>
        )}
      </form>
    </Modal>
  );
}
