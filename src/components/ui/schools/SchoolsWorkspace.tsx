"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Building2,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/buttons";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { TableSkeleton } from "@/components/loading";
import { getApiErrorMessage } from "@/services/api/errors/getApiErrorMessage";
import { managersApi } from "@/services/api/modules/managers";
import { schoolsApi } from "@/services/api/modules/schools";
import type { School } from "@/types/school";
import type { User } from "@/types/user";
import { ManagerFormModal } from "./ManagerFormModal";
import { SchoolFormModal } from "./SchoolFormModal";

export function SchoolsWorkspace() {
  const queryClient = useQueryClient();
  const [isSchoolFormOpen, setIsSchoolFormOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School>();
  const [managerSchool, setManagerSchool] = useState<School>();
  const [schoolToDelete, setSchoolToDelete] = useState<School>();

  const schoolsQuery = useQuery({
    queryKey: ["schools"],
    queryFn: schoolsApi.list,
  });

  const managersQuery = useQuery({
    queryKey: ["managers"],
    queryFn: managersApi.list,
  });

  const managersBySchool = useMemo(() => {
    const managers = new Map<number, User[]>();

    for (const user of managersQuery.data ?? []) {
      if (!user.schoolId) continue;

      const current = managers.get(user.schoolId) ?? [];
      current.push(user);
      managers.set(user.schoolId, current);
    }

    return managers;
  }, [managersQuery.data]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => schoolsApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["schools"] });
      setSchoolToDelete(undefined);
    },
  });

  const openCreate = () => {
    setEditingSchool(undefined);
    setIsSchoolFormOpen(true);
  };

  const openEdit = (school: School) => {
    setEditingSchool(school);
    setIsSchoolFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Escolas</h1>
          <p className="mt-1 text-base text-text-secondary">
            Cadastre escolas e vincule gestores para iniciar o fluxo admin.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreate}
          className="min-h-11 self-start bg-brand-primary px-5 py-3 text-white hover:bg-brand-primary-hover sm:self-auto"
        >
          <Plus aria-hidden="true" className="size-5" />
          Nova escola
        </Button>
      </section>

      <section className="rounded-system border border-slate-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3 border-slate-200 border-b p-5">
          <div className="rounded-system bg-brand-primary-soft p-3 text-brand-primary">
            <Building2 aria-hidden="true" className="size-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              Escolas cadastradas
            </h2>
            <p className="text-sm text-text-secondary">
              {schoolsQuery.data
                ? `${schoolsQuery.data.length} escola(s)`
                : "Carregando..."}
            </p>
          </div>
        </div>

        <div className="p-5" aria-live="polite">
          {(schoolsQuery.isPending || managersQuery.isPending) && (
            <TableSkeleton rows={5} columns={6} />
          )}

          {(schoolsQuery.isError || managersQuery.isError) && (
            <div
              role="alert"
              className="flex gap-3 rounded-system border border-red-200 bg-red-50 p-4 text-red-700"
            >
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0"
              />
              <p>
                {schoolsQuery.error
                  ? getApiErrorMessage(schoolsQuery.error)
                  : "Nao foi possivel carregar os gestores."}
              </p>
            </div>
          )}

          {schoolsQuery.isSuccess && schoolsQuery.data.length === 0 && (
            <div className="rounded-system border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <Building2
                aria-hidden="true"
                className="mx-auto mb-3 size-10 text-brand-primary"
              />
              <p className="font-semibold text-text-primary">
                Nenhuma escola cadastrada
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Clique em nova escola para comecar.
              </p>
            </div>
          )}

          {schoolsQuery.data && schoolsQuery.data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-slate-200 border-b text-xs font-bold uppercase tracking-wide text-text-secondary">
                    <th className="px-3 py-3">Escola</th>
                    <th className="px-3 py-3">Local</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Gestores</th>
                    <th className="px-3 py-3 text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {schoolsQuery.data.map((school) => {
                    const managers = managersBySchool.get(school.id) ?? [];

                    return (
                      <tr
                        key={school.id}
                        className="border-slate-100 border-b last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-3 py-3">
                          <p className="font-semibold text-text-primary">
                            {school.name}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-text-secondary">
                          {[school.city, school.state]
                            .filter(Boolean)
                            .join(" - ") || "-"}
                        </td>
                        <td className="px-3 py-3">
                          <span className="rounded-full bg-brand-primary-soft px-2.5 py-0.5 text-xs font-semibold text-brand-primary">
                            {school.status === "inativa" ? "Inativa" : "Ativa"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-text-secondary">
                          {managers.length > 0 ? (
                            <div className="space-y-1">
                              {managers.map((manager) => (
                                <p key={manager.id}>{manager.name}</p>
                              ))}
                            </div>
                          ) : (
                            "Sem gestor vinculado"
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              aria-label={`Criar gestor para ${school.name}`}
                              onClick={() => setManagerSchool(school)}
                              className="size-9 border border-slate-200 bg-white p-0 text-brand-primary hover:bg-brand-primary-soft"
                            >
                              <UserPlus aria-hidden="true" className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              aria-label={`Editar ${school.name}`}
                              onClick={() => openEdit(school)}
                              className="size-9 border border-slate-200 bg-white p-0 text-brand-primary hover:bg-brand-primary-soft"
                            >
                              <Pencil aria-hidden="true" className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              aria-label={`Excluir ${school.name}`}
                              onClick={() => setSchoolToDelete(school)}
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

      <SchoolFormModal
        isOpen={isSchoolFormOpen}
        school={editingSchool}
        onClose={() => setIsSchoolFormOpen(false)}
      />

      <ManagerFormModal
        isOpen={Boolean(managerSchool)}
        school={managerSchool}
        onClose={() => setManagerSchool(undefined)}
      />

      <ConfirmDialog
        isOpen={Boolean(schoolToDelete)}
        title="Excluir escola"
        message={`Tem certeza que deseja excluir "${schoolToDelete?.name}"? Esta acao nao pode ser desfeita.`}
        confirmLabel="Excluir"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (schoolToDelete) {
            deleteMutation.mutate(schoolToDelete.id);
          }
        }}
        onClose={() => setSchoolToDelete(undefined)}
      />
    </div>
  );
}
