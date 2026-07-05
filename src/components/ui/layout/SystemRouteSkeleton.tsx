"use client";

import { usePathname } from "next/navigation";
import { Skeleton, TableSkeleton } from "@/components/loading";
import { PerformanceDashboardSkeleton } from "@/components/ui/dashboard/PerformanceDashboardShared";

const FILL = "bg-slate-200";

function skeletonKeys(prefix: string, amount: number) {
  return Array.from({ length: amount }, (_, itemIndex) => {
    return `${prefix}-${itemIndex + 1}`;
  });
}

function PageHeaderSkeleton({
  action = true,
  descriptionWidth = "w-[440px]",
  titleWidth = "w-48",
}: {
  action?: boolean;
  descriptionWidth?: string;
  titleWidth?: string;
}) {
  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="w-full">
        <Skeleton className={`h-9 max-w-full rounded-lg ${titleWidth}`} />
        <Skeleton
          className={`mt-3 h-4 max-w-full rounded-full ${descriptionWidth}`}
        />
      </div>
      {action && (
        <Skeleton className="h-11 w-36 shrink-0 rounded-system sm:w-40" />
      )}
    </section>
  );
}

function PanelHeaderSkeleton() {
  return (
    <div className="flex items-center gap-3 border-slate-200 border-b p-5">
      <Skeleton className={`size-12 rounded-system ${FILL}`} />
      <div>
        <Skeleton className={`h-5 w-44 rounded-full ${FILL}`} />
        <Skeleton className={`mt-2 h-4 w-28 rounded-full ${FILL}`} />
      </div>
    </div>
  );
}

function TablePageSkeleton({
  action = true,
  columns = 5,
  descriptionWidth,
  rows = 5,
  titleWidth,
}: {
  action?: boolean;
  columns?: number;
  descriptionWidth?: string;
  rows?: number;
  titleWidth?: string;
}) {
  return (
    <div className="space-y-6" role="status" aria-label="Carregando pagina">
      <PageHeaderSkeleton
        action={action}
        titleWidth={titleWidth}
        descriptionWidth={descriptionWidth}
      />
      <section className="rounded-system border border-slate-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <PanelHeaderSkeleton />
        <div className="p-5">
          <TableSkeleton rows={rows} columns={columns} />
        </div>
      </section>
    </div>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Carregando painel">
      <PageHeaderSkeleton action={false} titleWidth="w-44" />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {skeletonKeys("admin-stat", 4).map((key) => (
          <Skeleton key={key} className="h-28 rounded-system" />
        ))}
      </section>
    </div>
  );
}

function TurmaLinksSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Carregando vinculos">
      <section>
        <Skeleton className="h-5 w-36 rounded-full" />
        <Skeleton className="mt-5 h-9 w-56 rounded-lg" />
        <Skeleton className="mt-3 h-4 w-44 rounded-full" />
      </section>
      <div className="grid gap-6 xl:grid-cols-2">
        {skeletonKeys("turma-links-panel", 2).map((key) => (
          <section
            key={key}
            className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
          >
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="mt-4 h-11 w-full rounded-system" />
            <div className="mt-4 space-y-2">
              {skeletonKeys(`${key}-row`, 4).map((rowKey) => (
                <Skeleton key={rowKey} className="h-12 w-full rounded-system" />
              ))}
            </div>
          </section>
        ))}
      </div>
      <Skeleton className="h-5 w-80 max-w-full rounded-full" />
    </div>
  );
}

function QuestionsRouteSkeleton() {
  return (
    <TablePageSkeleton
      titleWidth="w-36"
      descriptionWidth="w-[520px]"
      columns={4}
    />
  );
}

function LiveSessionsRouteSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Carregando sessoes ao vivo"
    >
      <PageHeaderSkeleton
        action={false}
        titleWidth="w-56"
        descriptionWidth="w-[560px]"
      />
      <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <Skeleton className="h-72 rounded-system" />
          <Skeleton className="h-36 rounded-system" />
        </aside>
        <section className="rounded-system border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <Skeleton className="h-8 w-64 rounded-full" />
          <Skeleton className="mt-5 h-24 rounded-system" />
          <div className="mt-5 grid gap-4 sm:grid-cols-4">
            {skeletonKeys("live-session-metric", 4).map((key) => (
              <Skeleton key={key} className="h-24 rounded-system" />
            ))}
          </div>
          <Skeleton className="mt-5 h-56 rounded-system" />
        </section>
      </section>
    </div>
  );
}

function RankingRouteSkeleton() {
  return (
    <TablePageSkeleton
      action={false}
      titleWidth="w-40"
      descriptionWidth="w-[380px]"
      columns={5}
      rows={8}
    />
  );
}

export function SystemRouteSkeleton() {
  const pathname = usePathname();

  if (pathname === "/dashboard") {
    return <AdminDashboardSkeleton />;
  }

  if (pathname === "/usuarios") {
    return (
      <TablePageSkeleton
        titleWidth="w-40"
        descriptionWidth="w-[420px]"
        columns={5}
      />
    );
  }

  if (pathname === "/escolas") {
    return (
      <TablePageSkeleton
        titleWidth="w-36"
        descriptionWidth="w-[400px]"
        columns={5}
      />
    );
  }

  if (pathname === "/turmas") {
    return (
      <TablePageSkeleton
        titleWidth="w-32"
        descriptionWidth="w-[360px]"
        columns={3}
      />
    );
  }

  if (pathname.startsWith("/turmas/")) {
    return <TurmaLinksSkeleton />;
  }

  if (pathname === "/professores") {
    return (
      <TablePageSkeleton
        titleWidth="w-48"
        descriptionWidth="w-[420px]"
        columns={5}
      />
    );
  }

  if (pathname === "/alunos") {
    return (
      <TablePageSkeleton
        titleWidth="w-32"
        descriptionWidth="w-[420px]"
        columns={4}
      />
    );
  }

  if (pathname === "/questoes") {
    return <QuestionsRouteSkeleton />;
  }

  if (pathname === "/sessoes-ao-vivo") {
    return <LiveSessionsRouteSkeleton />;
  }

  if (pathname === "/ranking") {
    return <RankingRouteSkeleton />;
  }

  return <PerformanceDashboardSkeleton />;
}
