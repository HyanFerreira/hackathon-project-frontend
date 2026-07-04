"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, LoaderCircle, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/buttons";
import { Input } from "@/components/form/Input";
import { Select } from "@/components/form/Select";
import { Modal } from "@/components/modal";
import {
  getApiErrorMessage,
  getApiValidationErrors,
} from "@/services/api/errors/getApiErrorMessage";
import { schoolsApi } from "@/services/api/modules/schools";
import type { School } from "@/types/school";

type SchoolFormModalProps = {
  isOpen: boolean;
  school?: School;
  onClose: () => void;
};

type SchoolFieldErrors = {
  name?: string;
  city?: string;
  state?: string;
  status?: string;
};

type FormState = {
  name: string;
  city: string;
  state: string;
  status: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  city: "",
  state: "",
  status: "ativa",
};

const SCHOOL_STATUS_OPTIONS = [
  { label: "Ativa", value: "ativa" },
  { label: "Inativa", value: "inativa" },
];

export function SchoolFormModal({
  isOpen,
  school,
  onClose,
}: SchoolFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(school);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<SchoolFieldErrors>({});
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!isOpen) return;

    setFieldErrors({});
    setError(undefined);
    setForm({
      name: school?.name ?? "",
      city: school?.city ?? "",
      state: school?.state ?? "",
      status: school?.status ?? "ativa",
    });
  }, [isOpen, school]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        city: form.city || undefined,
        state: form.state || undefined,
        status: form.status || undefined,
      };

      if (isEditing && school) {
        return schoolsApi.update(school.id, payload);
      }

      return schoolsApi.create(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["schools"] });
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
      title={isEditing ? "Editar escola" : "Nova escola"}
      description={
        isEditing
          ? "Atualize os dados da escola selecionada."
          : "Cadastre a escola antes de vincular um gestor."
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
            form="school-form"
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
      <form id="school-form" className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Nome"
          name="name"
          placeholder="Nome da escola"
          value={form.name}
          error={fieldErrors.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
        />

        <div className="grid gap-4 sm:grid-cols-[1fr_96px]">
          <Input
            label="Cidade"
            name="city"
            placeholder="Cidade"
            value={form.city}
            error={fieldErrors.city}
            onChange={(event) =>
              setForm((current) => ({ ...current, city: event.target.value }))
            }
          />

          <Input
            label="UF"
            name="state"
            placeholder="SP"
            maxLength={2}
            value={form.state}
            error={fieldErrors.state}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                state: event.target.value.toUpperCase(),
              }))
            }
          />
        </div>

        <Select
          label="Status"
          name="status"
          value={form.status}
          error={fieldErrors.status}
          options={SCHOOL_STATUS_OPTIONS}
          onChange={(value) =>
            setForm((current) => ({ ...current, status: value }))
          }
        />

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
