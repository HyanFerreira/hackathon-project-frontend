"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, LoaderCircle, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/buttons";
import { Input } from "@/components/form/Input";
import { Modal } from "@/components/modal";
import {
  getApiErrorMessage,
  getApiValidationErrors,
} from "@/services/api/errors/getApiErrorMessage";
import { rolesApi } from "@/services/api/modules/roles";
import type { Role } from "@/types/role";

type RoleFormModalProps = {
  isOpen: boolean;
  role?: Role;
  onClose: () => void;
};

export function RoleFormModal({ isOpen, role, onClose }: RoleFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(role);

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!isOpen) return;

    setName(role?.name ?? "");
    setNameError(undefined);
    setError(undefined);
  }, [isOpen, role]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEditing && role) {
        return rolesApi.update(role.id, { name });
      }

      return rolesApi.create({ name });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
      onClose();
    },
    onError: (requestError) => {
      const validationErrors = getApiValidationErrors(requestError);

      if (validationErrors?.name) {
        setNameError(validationErrors.name);
      } else {
        setError(getApiErrorMessage(requestError));
      }
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNameError(undefined);
    setError(undefined);
    mutation.mutate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar perfil" : "Novo perfil"}
      description={
        isEditing
          ? "Atualize o nome do perfil selecionado."
          : "Informe o nome do novo perfil de acesso."
      }
      className="max-w-md"
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
            form="role-form"
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
      <form id="role-form" className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Nome do perfil"
          name="name"
          placeholder="Ex.: admin, professor, aluno"
          value={name}
          error={nameError}
          onChange={(event) => setName(event.target.value)}
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
