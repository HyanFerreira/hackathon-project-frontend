"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, LoaderCircle, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/buttons";
import { CpfInput } from "@/components/form/CpfInput";
import { Input } from "@/components/form/Input";
import { Modal } from "@/components/modal";
import {
  getApiErrorMessage,
  getApiValidationErrors,
} from "@/services/api/errors/getApiErrorMessage";
import { managersApi } from "@/services/api/modules/managers";
import type { School } from "@/types/school";
import { DEFAULT_USER_PASSWORD } from "@/utils/auth/defaultUserPassword";
import { onlyCpfDigits } from "@/utils/cpf/cpf";

type ManagerFormModalProps = {
  isOpen: boolean;
  school?: School;
  onClose: () => void;
};

type ManagerFieldErrors = {
  name?: string;
  cpf?: string;
  email?: string;
  password?: string;
  school_id?: string;
  roles?: string;
};

type FormState = {
  name: string;
  cpf: string;
  email: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  cpf: "",
  email: "",
};

export function ManagerFormModal({
  isOpen,
  school,
  onClose,
}: ManagerFormModalProps) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<ManagerFieldErrors>({});
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!isOpen) return;

    setForm(EMPTY_FORM);
    setFieldErrors({});
    setError(undefined);
  }, [isOpen]);

  const mutation = useMutation({
    mutationFn: () =>
      managersApi.create({
        name: form.name,
        cpf: onlyCpfDigits(form.cpf),
        email: form.email,
        password: DEFAULT_USER_PASSWORD,
        escola_id: school?.id ?? 0,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["managers"] }),
        queryClient.invalidateQueries({ queryKey: ["schools"] }),
      ]);
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
      title="Novo gestor"
      description={
        school
          ? `Crie um gestor vinculado a ${school.name}.`
          : "Selecione uma escola para criar o gestor."
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
            form="manager-form"
            disabled={mutation.isPending || !school}
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
            Cadastrar
          </Button>
        </>
      }
    >
      <form id="manager-form" className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Escola"
          name="school"
          value={school?.name ?? ""}
          disabled
        />

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

        {(fieldErrors.password ||
          fieldErrors.school_id ||
          fieldErrors.roles ||
          error) && (
          <div
            role="alert"
            className="flex gap-2 rounded-system border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
          >
            <AlertCircle
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />
            <p>
              {fieldErrors.password ??
                fieldErrors.school_id ??
                fieldErrors.roles ??
                error}
            </p>
          </div>
        )}
      </form>
    </Modal>
  );
}
