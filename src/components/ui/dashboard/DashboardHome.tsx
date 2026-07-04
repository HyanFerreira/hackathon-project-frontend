"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, Users } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/loading";
import { schoolsApi } from "@/services/api/modules/schools";
import { usersApi } from "@/services/api/modules/users";

type StatCardProps = {
  label: string;
  value?: number;
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
        <p className="text-sm font-semibold text-text-secondary">{label}</p>
        {isLoading ? (
          <Skeleton className="mt-1 h-8 w-12" />
        ) : (
          <p className="text-3xl font-bold text-text-primary">{value ?? 0}</p>
        )}
      </div>
    </div>
  );
}

type QuickLinkProps = {
  href: string;
  title: string;
  description: string;
  icon: typeof Users;
};

function QuickLink({ href, title, description, icon: Icon }: QuickLinkProps) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition hover:border-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-input-border-focus"
    >
      <div className="flex items-center gap-4">
        <div className="rounded-system bg-brand-primary-soft p-3 text-brand-primary">
          <Icon aria-hidden="true" className="size-6" />
        </div>
        <div>
          <p className="font-bold text-text-primary">{title}</p>
          <p className="text-sm text-text-secondary">{description}</p>
        </div>
      </div>
      <ArrowRight
        aria-hidden="true"
        className="size-5 text-text-secondary transition group-hover:translate-x-1 group-hover:text-brand-primary"
      />
    </Link>
  );
}

export function DashboardHome() {
  const schoolsQuery = useQuery({
    queryKey: ["schools"],
    queryFn: schoolsApi.list,
  });
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: usersApi.list });

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold text-brand-primary">Painel admin</h1>
        <p className="mt-1 text-base text-text-secondary">
          Comece criando escolas, gestores e o vinculo entre eles.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Escolas cadastradas"
          value={schoolsQuery.data?.length}
          isLoading={schoolsQuery.isPending}
          icon={Building2}
        />
        <StatCard
          label="Usuarios cadastrados"
          value={usersQuery.data?.length}
          isLoading={usersQuery.isPending}
          icon={Users}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-text-primary">Acesso rapido</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <QuickLink
            href="/escolas"
            title="Escolas"
            description="Cadastre escolas e vincule gestores."
            icon={Building2}
          />
          <QuickLink
            href="/usuarios"
            title="Usuarios"
            description="Consulte os usuarios cadastrados."
            icon={Users}
          />
        </div>
      </section>
    </div>
  );
}
