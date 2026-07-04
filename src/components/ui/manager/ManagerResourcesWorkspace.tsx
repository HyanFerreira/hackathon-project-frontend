"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/buttons";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Input } from "@/components/form/Input";
import { Select } from "@/components/form/Select";
import { TableSkeleton } from "@/components/loading";
import { Modal } from "@/components/modal";
import { getApiErrorMessage } from "@/services/api/errors/getApiErrorMessage";
import { gamificationApi } from "@/services/api/modules/gamification";
import type { Aluno } from "@/types/aluno";
import type { Turma } from "@/types/turma";
import type { User } from "@/types/user";
import { onlyCpfDigits } from "@/utils/cpf/cpf";

type ResourceKind = "turmas" | "professores" | "alunos";
type ResourceItem = Turma | User | Aluno;

type Props = {
  kind: ResourceKind;
};

type FormState = {
  name: string;
  cpf: string;
  email: string;
  password: string;
  year: string;
  shift: string;
  status: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  cpf: "",
  email: "",
  password: "",
  year: "",
  shift: "",
  status: "ativa",
};

const TURNO_OPTIONS = [
  { label: "Manha", value: "manha" },
  { label: "Tarde", value: "tarde" },
  { label: "Noite", value: "noite" },
  { label: "Integral", value: "integral" },
];

const STATUS_OPTIONS = [
  { label: "Ativa", value: "ativa" },
  { label: "Inativa", value: "inativa" },
];

const CONFIG = {
  turmas: {
    title: "Turmas",
    description: "Gerencie as turmas da sua escola.",
    queryKey: ["gestor", "turmas"],
    list: gamificationApi.turmas,
    remove: gamificationApi.removeTurma,
  },
  professores: {
    title: "Professores",
    description: "Cadastre professores vinculados a sua escola.",
    queryKey: ["gestor", "professores"],
    list: gamificationApi.professores,
    remove: gamificationApi.removeProfessor,
  },
  alunos: {
    title: "Alunos",
    description: "Cadastre alunos e consulte o codigo de acesso.",
    queryKey: ["gestor", "alunos"],
    list: gamificationApi.alunos,
    remove: gamificationApi.removeAluno,
  },
} as const;

function getItemName(item?: ResourceItem) {
  if (!item) return "";
  return "name" in item ? item.name : "";
}

function getItemId(item: ResourceItem) {
  return item.id;
}

export function ManagerResourcesWorkspace({ kind }: Props) {
  const config = CONFIG[kind];
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ResourceItem>();
  const [itemToDelete, setItemToDelete] = useState<ResourceItem>();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string>();

  const listQuery = useQuery<ResourceItem[]>({
    queryKey: config.queryKey,
    queryFn: () => config.list() as Promise<ResourceItem[]>,
  });

  useEffect(() => {
    if (!isFormOpen) return;

    const turma =
      kind === "turmas" ? (editingItem as Turma | undefined) : undefined;
    const user =
      kind === "professores" ? (editingItem as User | undefined) : undefined;
    const aluno =
      kind === "alunos" ? (editingItem as Aluno | undefined) : undefined;

    setError(undefined);
    setForm({
      name: turma?.name ?? user?.name ?? aluno?.name ?? "",
      cpf: user?.cpf ?? "",
      email: user?.email ?? "",
      password: "",
      year: turma?.year ?? "",
      shift: turma?.shift ?? "",
      status: turma?.status ?? "ativa",
    });
  }, [editingItem, isFormOpen, kind]);

  const saveMutation = useMutation<ResourceItem>({
    mutationFn: () => {
      if (kind === "turmas") {
        return gamificationApi.saveTurma(
          {
            nome: form.name,
            ano: form.year || undefined,
            turno: form.shift || undefined,
            status: form.status || undefined,
          },
          editingItem?.id,
        );
      }

      if (kind === "professores") {
        return gamificationApi.saveProfessor(
          {
            name: form.name,
            cpf: onlyCpfDigits(form.cpf),
            email: form.email,
            ...(form.password ? { password: form.password } : {}),
          },
          editingItem?.id,
        );
      }

      return gamificationApi.saveAluno({ nome: form.name }, editingItem?.id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: config.queryKey });
      setIsFormOpen(false);
    },
    onError: (requestError) => setError(getApiErrorMessage(requestError)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => config.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: config.queryKey });
      setItemToDelete(undefined);
    },
  });

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">
            {config.title}
          </h1>
          <p className="mt-1 text-base text-text-secondary">
            {config.description}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditingItem(undefined);
            setIsFormOpen(true);
          }}
          className="min-h-11 self-start bg-brand-primary px-5 py-3 text-white hover:bg-brand-primary-hover"
        >
          <Plus aria-hidden="true" className="size-5" />
          Novo cadastro
        </Button>
      </section>

      <section className="rounded-system border border-slate-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <div className="p-5" aria-live="polite">
          {listQuery.isPending && <TableSkeleton rows={5} columns={5} />}

          {listQuery.isError && (
            <div
              role="alert"
              className="flex gap-3 rounded-system border border-red-200 bg-red-50 p-4 text-red-700"
            >
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
              <p>{getApiErrorMessage(listQuery.error)}</p>
            </div>
          )}

          {listQuery.data && listQuery.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-slate-200 border-b text-xs font-bold uppercase tracking-wide text-text-secondary">
                    <th className="px-3 py-3">Nome</th>
                    <th className="px-3 py-3">Detalhes</th>
                    <th className="px-3 py-3 text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {(listQuery.data as ResourceItem[]).map((item) => (
                    <tr
                      key={item.id}
                      className="border-slate-100 border-b last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-3 py-3 font-semibold text-text-primary">
                        {getItemName(item)}
                      </td>
                      <td className="px-3 py-3 text-text-secondary">
                        {kind === "turmas" &&
                          `${(item as Turma).year ?? "-"} - ${
                            (item as Turma).shift ?? "turno nao informado"
                          }`}
                        {kind === "professores" && (item as User).email}
                        {kind === "alunos" && `Codigo: ${(item as Aluno).code}`}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          {kind === "turmas" && (
                            <Link
                              href={`/turmas/${item.id}`}
                              className="inline-flex h-9 items-center justify-center rounded-system border border-slate-200 bg-white px-3 text-xs font-semibold text-brand-primary transition hover:bg-brand-primary-soft"
                            >
                              Vinculos
                            </Link>
                          )}
                          <Button
                            type="button"
                            aria-label={`Editar ${getItemName(item)}`}
                            onClick={() => {
                              setEditingItem(item);
                              setIsFormOpen(true);
                            }}
                            className="size-9 border border-slate-200 bg-white p-0 text-brand-primary hover:bg-brand-primary-soft"
                          >
                            <Pencil aria-hidden="true" className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            aria-label={`Excluir ${getItemName(item)}`}
                            onClick={() => setItemToDelete(item)}
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
            listQuery.isSuccess && (
              <div className="rounded-system border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="font-semibold text-text-primary">
                  Nenhum registro encontrado
                </p>
              </div>
            )
          )}
        </div>
      </section>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingItem ? "Editar cadastro" : "Novo cadastro"}
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
              form="manager-resource-form"
              disabled={saveMutation.isPending}
              className="min-h-11 bg-brand-primary px-5 py-2.5 text-white hover:bg-brand-primary-hover"
            >
              Salvar
            </Button>
          </>
        }
      >
        <form
          id="manager-resource-form"
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            saveMutation.mutate();
          }}
        >
          <Input
            label="Nome"
            name="name"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
          />

          {kind === "turmas" && (
            <>
              <Input
                label="Ano"
                name="year"
                value={form.year}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    year: event.target.value,
                  }))
                }
              />
              <Select
                label="Turno"
                name="shift"
                value={form.shift}
                options={TURNO_OPTIONS}
                onChange={(value) =>
                  setForm((current) => ({ ...current, shift: value }))
                }
              />
              <Select
                label="Status"
                name="status"
                value={form.status}
                options={STATUS_OPTIONS}
                onChange={(value) =>
                  setForm((current) => ({ ...current, status: value }))
                }
              />
            </>
          )}

          {kind === "professores" && (
            <>
              <Input
                label="CPF"
                name="cpf"
                value={form.cpf}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    cpf: event.target.value,
                  }))
                }
              />
              <Input
                label="E-mail"
                name="email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
              <Input
                label={editingItem ? "Nova senha (opcional)" : "Senha"}
                name="password"
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
              />
            </>
          )}

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
        isOpen={Boolean(itemToDelete)}
        title="Excluir cadastro"
        message={`Tem certeza que deseja excluir "${getItemName(itemToDelete)}"?`}
        confirmLabel="Excluir"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (itemToDelete) deleteMutation.mutate(getItemId(itemToDelete));
        }}
        onClose={() => setItemToDelete(undefined)}
      />
    </div>
  );
}
