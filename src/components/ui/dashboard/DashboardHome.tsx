"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BookOpenCheck,
  Building2,
  GraduationCap,
  School,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/loading";
import { authApi } from "@/services/api/modules/auth";
import {
  type DashboardSummary,
  gamificationApi,
} from "@/services/api/modules/gamification";
import { getAuthActor } from "@/services/api/tokenStorage";
import type { Aluno } from "@/types/aluno";
import type { User } from "@/types/user";
import { ManagerDashboard } from "./ManagerDashboard";
import { ProfessorDashboard } from "./ProfessorDashboard";

type StatCardProps = {
  label: string;
  value?: number | string | null;
  isLoading: boolean;
  icon: typeof Users;
};

function StatCard({ label, value, isLoading, icon: Icon }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
      <div className="rounded-system bg-brand-primary-soft p-3 text-brand-primary">
        <Icon aria-hidden="true" className="size-6" />
      </div>
      <div>
        <p className="text-sm font-bold text-text-secondary">{label}</p>
        {isLoading ? (
          <Skeleton className="mt-1 h-8 w-16" />
        ) : (
          <p className="text-3xl font-bold text-text-primary">{value ?? 0}</p>
        )}
      </div>
    </div>
  );
}

function getDashboardQuery(role?: string) {
  const actor = getAuthActor();

  if (actor === "aluno") return gamificationApi.alunoDashboard;
  if (role === "gestor") return gamificationApi.gestorDashboard;
  if (role === "professor") return gamificationApi.professorDashboard;

  return gamificationApi.adminDashboard;
}

function renderStats(
  data: DashboardSummary | undefined,
  isLoading: boolean,
  professorTurmas?: {
    count?: number;
    isError: boolean;
    isLoading: boolean;
  },
) {
  if (!data || data.kind === "admin") {
    return (
      <>
        <StatCard
          label="Escolas"
          value={data?.kind === "admin" ? data.escolas : undefined}
          isLoading={isLoading}
          icon={Building2}
        />
        <StatCard
          label="Gestores"
          value={data?.kind === "admin" ? data.gestores : undefined}
          isLoading={isLoading}
          icon={Users}
        />
        <StatCard
          label="Professores"
          value={data?.kind === "admin" ? data.professores : undefined}
          isLoading={isLoading}
          icon={GraduationCap}
        />
        <StatCard
          label="Alunos"
          value={data?.kind === "admin" ? data.alunos : undefined}
          isLoading={isLoading}
          icon={School}
        />
      </>
    );
  }

  if (data.kind === "gestor") {
    return (
      <>
        <StatCard
          label="Turmas"
          value={data.turmas}
          isLoading={isLoading}
          icon={School}
        />
        <StatCard
          label="Professores"
          value={data.professores}
          isLoading={isLoading}
          icon={GraduationCap}
        />
        <StatCard
          label="Alunos"
          value={data.alunos}
          isLoading={isLoading}
          icon={Users}
        />
      </>
    );
  }

  if (data.kind === "professor") {
    return (
      <>
        <StatCard
          label="Minhas turmas"
          value={professorTurmas?.isError ? "—" : professorTurmas?.count}
          isLoading={Boolean(professorTurmas?.isLoading)}
          icon={School}
        />
        <StatCard
          label="Alunos"
          value={data.alunos}
          isLoading={isLoading}
          icon={Users}
        />
        <StatCard
          label="Questões"
          value={data.questoes}
          isLoading={isLoading}
          icon={BookOpenCheck}
        />
      </>
    );
  }

  return (
    <>
      <StatCard
        label="Pontos"
        value={data.perfil.pontos}
        isLoading={isLoading}
        icon={Trophy}
      />
      <StatCard
        label="Nível"
        value={data.perfil.nivel}
        isLoading={isLoading}
        icon={GraduationCap}
      />
      <StatCard
        label="Energia"
        value={`${data.perfil.energia}/${data.perfil.energia_maxima}`}
        isLoading={isLoading}
        icon={Zap}
      />
      <StatCard
        label="Ranking da turma"
        value={data.posicao_turma ? `${data.posicao_turma}º` : "-"}
        isLoading={isLoading}
        icon={Trophy}
      />
    </>
  );
}

export function DashboardHome() {
  const actor = getAuthActor();
  const meQuery = useQuery<User | Aluno>({
    queryKey: ["auth", "me", actor],
    queryFn: () =>
      actor === "aluno" ? gamificationApi.alunoMe() : authApi.me(),
    retry: false,
  });
  const role =
    meQuery.data && "roles" in meQuery.data
      ? meQuery.data.roles?.[0]?.name
      : undefined;

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", actor, role],
    queryFn: getDashboardQuery(role),
    enabled:
      actor === "aluno" ||
      (Boolean(role) && role !== "gestor" && role !== "professor"),
  });
  const professorTurmasQuery = useQuery({
    queryKey: ["professor", "turmas"],
    queryFn: gamificationApi.professorTurmas,
    enabled: role === "professor",
  });

  const title =
    actor === "aluno"
      ? "Painel do aluno"
      : role === "gestor"
        ? "Painel do gestor"
        : role === "professor"
          ? "Painel do professor"
          : "Painel admin";

  return (
    <div className="space-y-6">
      {role !== "gestor" && role !== "professor" && (
        <section>
          <h1 className="text-3xl font-bold text-brand-primary">{title}</h1>
          <p className="mt-1 text-base text-text-secondary">
            Acompanhe os principais numeros disponibilizados pelo backend.
          </p>
        </section>
      )}

      {role === "gestor" ? (
        <ManagerDashboard userName={meQuery.data?.name ?? "Gestor"} />
      ) : role === "professor" ? (
        <ProfessorDashboard />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {renderStats(dashboardQuery.data, dashboardQuery.isPending, {
            count: professorTurmasQuery.data?.length,
            isError: professorTurmasQuery.isError,
            isLoading: professorTurmasQuery.isPending,
          })}
        </section>
      )}

      {role === "professor" &&
        professorTurmasQuery.isSuccess &&
        professorTurmasQuery.data.length === 0 && (
          <p className="rounded-system border border-slate-200 bg-white p-4 text-sm text-text-secondary">
            Nenhuma turma vinculada ao seu usuário.
          </p>
        )}

      {role === "professor" && professorTurmasQuery.isError && (
        <p
          role="alert"
          className="rounded-system border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          Não foi possível carregar suas turmas.
        </p>
      )}
    </div>
  );
}
