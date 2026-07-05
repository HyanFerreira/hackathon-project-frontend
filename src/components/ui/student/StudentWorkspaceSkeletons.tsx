import { Skeleton } from "@/components/loading";

const CARD =
  "rounded-[18px] border border-[#e3d9f8] bg-white shadow-[0_18px_50px_rgba(72,35,137,0.08)]";
const FILL = "bg-[#efe9fb]";

function skeletonKeys(prefix: string, amount: number) {
  return Array.from({ length: amount }, (_, itemIndex) => {
    return `${prefix}-${itemIndex + 1}`;
  });
}

function SectionTitleSkeleton({
  action,
  titleWidth = "w-44",
}: {
  action?: boolean;
  titleWidth?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className={`size-7 rounded-lg ${FILL}`} />
        <Skeleton className={`h-6 ${titleWidth} ${FILL}`} />
      </div>
      {action && <Skeleton className={`h-4 w-20 rounded-full ${FILL}`} />}
    </div>
  );
}

function HeaderSkeleton({
  title = "w-48",
  description = "w-[460px]",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="w-full">
        <Skeleton className={`h-10 max-w-full rounded-lg ${title} ${FILL}`} />
        <Skeleton
          className={`mt-3 h-5 max-w-full rounded-full ${description} ${FILL}`}
        />
      </div>
    </section>
  );
}

function MetricSkeleton() {
  return (
    <div className="flex items-center justify-center gap-3 px-4">
      <Skeleton className={`size-9 rounded-lg ${FILL}`} />
      <div>
        <Skeleton className={`h-4 w-20 rounded-full ${FILL}`} />
        <Skeleton className={`mt-2 h-6 w-24 rounded-full ${FILL}`} />
      </div>
    </div>
  );
}

function RankingRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-[#e3d9f8]">
      {skeletonKeys("ranking-row-skeleton", rows).map((key) => (
        <div
          key={key}
          className="grid min-h-[66px] grid-cols-[42px_48px_1fr_auto] items-center gap-3 border-[#e3d9f8] border-b px-4 py-3 last:border-b-0"
        >
          <Skeleton className={`size-9 rounded-full ${FILL}`} />
          <Skeleton className={`size-11 rounded-full ${FILL}`} />
          <div>
            <Skeleton className={`h-4 w-36 max-w-full rounded-full ${FILL}`} />
            <Skeleton className={`mt-2 h-3 w-20 rounded-full ${FILL}`} />
          </div>
          <Skeleton className={`h-4 w-14 rounded-full ${FILL}`} />
        </div>
      ))}
    </div>
  );
}

function AchievementRowsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-[#e3d9f8]">
      {skeletonKeys("achievement-row-skeleton", rows).map((key) => (
        <div
          key={key}
          className="grid min-h-[74px] grid-cols-[48px_1fr_auto] items-center gap-4 border-[#e3d9f8] border-b px-4 py-3 last:border-b-0"
        >
          <Skeleton className={`size-11 rounded-[8px] ${FILL}`} />
          <div>
            <Skeleton className={`h-4 w-40 max-w-full rounded-full ${FILL}`} />
            <Skeleton
              className={`mt-2 h-3 w-56 max-w-full rounded-full ${FILL}`}
            />
          </div>
          <Skeleton className={`h-4 w-16 rounded-full ${FILL}`} />
        </div>
      ))}
    </div>
  );
}

export function StudentLobbySkeleton() {
  return (
    <div className="grid gap-5">
      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className={`${CARD} p-5`}>
          <div className="grid gap-5 sm:grid-cols-[210px_1fr] sm:items-center">
            <div className="flex items-center justify-center">
              <Skeleton
                className={`h-[250px] w-[170px] rounded-[18px] ${FILL}`}
              />
            </div>
            <div>
              <Skeleton className={`h-9 w-56 rounded-lg ${FILL}`} />
              <Skeleton className={`mt-3 h-6 w-24 rounded-full ${FILL}`} />
              <Skeleton className={`mt-3 h-4 w-48 rounded-full ${FILL}`} />
              <div className="mt-6 grid grid-cols-[max-content_minmax(140px,1fr)] items-center gap-4">
                <Skeleton className={`h-6 w-28 rounded-full ${FILL}`} />
                <Skeleton className={`h-2 w-full rounded-full ${FILL}`} />
              </div>
              <div className="mt-4 flex justify-between gap-4">
                <Skeleton className={`h-3 w-28 rounded-full ${FILL}`} />
                <Skeleton className={`h-3 w-36 rounded-full ${FILL}`} />
              </div>
            </div>
          </div>
          <div className="mt-4 grid rounded-[14px] border border-[#e3d9f8] py-3 sm:grid-cols-4">
            {skeletonKeys("metric-skeleton", 4).map((key) => (
              <MetricSkeleton key={key} />
            ))}
          </div>
          <Skeleton
            className={`mx-auto mt-3 h-3 w-72 max-w-full rounded-full ${FILL}`}
          />
        </div>

        <div
          className={`${CARD} relative overflow-hidden p-6 md:min-h-[375px]`}
        >
          <div className="md:max-w-[58%] xl:mt-5">
            <SectionTitleSkeleton titleWidth="w-48" />
            <Skeleton className={`mt-8 h-8 w-44 rounded-lg ${FILL}`} />
            <Skeleton className={`mt-4 h-5 w-36 rounded-full ${FILL}`} />
            <Skeleton className={`mt-8 h-4 w-20 rounded-full ${FILL}`} />
            <div className="mt-3 grid grid-cols-[minmax(0,1fr)_max-content] items-center gap-5">
              <Skeleton className={`h-2 w-full rounded-full ${FILL}`} />
              <Skeleton className={`h-4 w-16 rounded-full ${FILL}`} />
            </div>
            <Skeleton
              className={`mt-12 h-11 w-full max-w-[285px] rounded-[10px] ${FILL}`}
            />
          </div>
          <Skeleton
            className={`absolute right-8 bottom-11 hidden h-[220px] w-[240px] rounded-[18px] md:block ${FILL}`}
          />
        </div>
      </section>

      <section className={`${CARD} p-7`}>
        <SectionTitleSkeleton titleWidth="w-48" />
        <div className="mt-4 grid gap-7 lg:grid-cols-2">
          {skeletonKeys("challenge-card-skeleton", 2).map((key) => (
            <div
              key={key}
              className="grid min-h-[100px] grid-cols-[56px_1fr] items-center gap-4 rounded-[12px] border border-[#e3d9f8] px-4 py-4 sm:grid-cols-[72px_1fr_48px] sm:gap-5 sm:px-6"
            >
              <Skeleton
                className={`size-14 rounded-[10px] sm:size-16 ${FILL}`}
              />
              <div>
                <Skeleton
                  className={`h-5 w-56 max-w-full rounded-full ${FILL}`}
                />
                <Skeleton
                  className={`mt-3 h-4 w-72 max-w-full rounded-full ${FILL}`}
                />
              </div>
              <Skeleton
                className={`hidden size-12 rounded-[8px] sm:block ${FILL}`}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.9fr]">
        <div className={`${CARD} p-7`}>
          <SectionTitleSkeleton titleWidth="w-32" />
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {skeletonKeys("subject-card-skeleton", 5).map((key) => (
              <Skeleton
                key={key}
                className={`min-h-[150px] rounded-[12px] ${FILL}`}
              />
            ))}
          </div>
        </div>
        <div className={`${CARD} p-7`}>
          <SectionTitleSkeleton action titleWidth="w-44" />
          <div className="mt-4">
            <RankingRowsSkeleton />
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className={`${CARD} p-7`}>
          <SectionTitleSkeleton action titleWidth="w-48" />
          <div className="mt-4">
            <AchievementRowsSkeleton />
          </div>
        </div>
        <div className={`${CARD} p-7`}>
          <SectionTitleSkeleton action titleWidth="w-56" />
          <div className="mt-4">
            <AchievementRowsSkeleton />
          </div>
        </div>
      </section>
    </div>
  );
}

export function StudentProfileSkeleton({
  view,
}: {
  view: "resumo" | "missoes" | "conquistas" | "personagens" | "loja";
}) {
  if (view === "conquistas") {
    return (
      <div className="space-y-6">
        <HeaderSkeleton title="w-56" description="w-[520px]" />
        <div className="grid gap-4 md:grid-cols-3">
          {skeletonKeys("achievement-metric", 3).map((key) => (
            <Skeleton key={key} className={`h-32 rounded-[16px] ${FILL}`} />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {skeletonKeys("achievement-card", 6).map((key) => (
            <Skeleton key={key} className={`h-44 rounded-[16px] ${FILL}`} />
          ))}
        </div>
      </div>
    );
  }

  if (view === "personagens" || view === "loja") {
    return (
      <div className="space-y-6">
        <HeaderSkeleton
          title={view === "loja" ? "w-24" : "w-56"}
          description={view === "loja" ? "w-[430px]" : "w-[500px]"}
        />
        <section className={`${CARD} p-5`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Skeleton className={`h-6 w-48 rounded-full ${FILL}`} />
              <Skeleton
                className={`mt-3 h-4 w-72 max-w-full rounded-full ${FILL}`}
              />
            </div>
            <Skeleton className={`h-11 w-36 rounded-[10px] ${FILL}`} />
          </div>
        </section>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {skeletonKeys("character-card", 8).map((key) => (
            <Skeleton key={key} className={`h-72 rounded-[18px] ${FILL}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {skeletonKeys("profile-metric", 5).map((key) => (
          <Skeleton key={key} className={`h-32 rounded-[16px] ${FILL}`} />
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Skeleton className={`h-80 rounded-[18px] ${FILL}`} />
        <Skeleton className={`h-80 rounded-[18px] ${FILL}`} />
      </section>
      <section className={`${CARD} p-5`}>
        <Skeleton className={`h-6 w-44 rounded-full ${FILL}`} />
        <div className="mt-5">
          <RankingRowsSkeleton rows={5} />
        </div>
      </section>
    </div>
  );
}

export function StudentChallengesSkeleton() {
  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1fr_0.95fr] xl:items-start">
        <HeaderSkeleton title="w-44" description="w-[560px]" />
        <div className="grid gap-3 sm:grid-cols-3">
          {skeletonKeys("challenge-summary", 3).map((key) => (
            <Skeleton key={key} className={`h-24 rounded-[16px] ${FILL}`} />
          ))}
        </div>
      </section>
      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <article className={`${CARD} p-5`}>
          <SectionTitleSkeleton titleWidth="w-36" />
          <div className="mt-5 grid gap-4">
            <Skeleton className={`h-16 rounded-[10px] ${FILL}`} />
            <Skeleton className={`h-16 rounded-[10px] ${FILL}`} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className={`h-16 rounded-[10px] ${FILL}`} />
              <Skeleton className={`h-16 rounded-[10px] ${FILL}`} />
            </div>
          </div>
          <Skeleton className={`mt-5 h-11 w-full rounded-[10px] ${FILL}`} />
        </article>
        <article className={`${CARD} p-5`}>
          <SectionTitleSkeleton titleWidth="w-48" />
          <div className="mt-6 grid rounded-[12px] border border-[#d9cdf8] sm:grid-cols-3">
            {skeletonKeys("challenge-tab", 3).map((key) => (
              <Skeleton key={key} className={`h-12 rounded-none ${FILL}`} />
            ))}
          </div>
          <div className="mt-6 grid gap-3">
            {skeletonKeys("challenge-row", 3).map((key) => (
              <Skeleton key={key} className={`h-24 rounded-[12px] ${FILL}`} />
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

export function StudentQuestionsSkeleton() {
  return (
    <div className="flex min-h-[calc(100vh-150px)] flex-col gap-5">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <HeaderSkeleton title="w-44" description="w-[420px]" />
        <div className="flex flex-wrap gap-3">
          <Skeleton className={`h-12 w-32 rounded-[10px] ${FILL}`} />
          <Skeleton className={`h-12 w-32 rounded-[10px] ${FILL}`} />
        </div>
      </section>
      <section className={`${CARD} mx-auto w-full max-w-5xl p-6`}>
        <Skeleton className={`h-5 w-32 rounded-full ${FILL}`} />
        <Skeleton className={`mt-5 h-8 w-4/5 rounded-lg ${FILL}`} />
        <div className="mt-6 grid gap-3">
          {skeletonKeys("question-option", 4).map((key) => (
            <Skeleton key={key} className={`h-14 rounded-[10px] ${FILL}`} />
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Skeleton className={`h-11 w-36 rounded-[10px] ${FILL}`} />
        </div>
      </section>
    </div>
  );
}

export function StudentRankingSkeleton() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton title="w-40" description="w-[460px]" />
      <div className="grid gap-4 md:grid-cols-3">
        {skeletonKeys("ranking-podium", 3).map((key) => (
          <Skeleton key={key} className={`h-52 rounded-[18px] ${FILL}`} />
        ))}
      </div>
      <section className={`${CARD} p-5`}>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className={`h-6 w-44 rounded-full ${FILL}`} />
          <Skeleton className={`h-11 w-48 rounded-[10px] ${FILL}`} />
        </div>
        <RankingRowsSkeleton rows={8} />
      </section>
    </div>
  );
}

export function StudentLiveSkeleton() {
  return (
    <div className="space-y-6">
      <LiveOverviewSkeleton />
    </div>
  );
}

export function LiveOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton title="w-48" description="w-[500px]" />
      <section className="grid gap-4 md:grid-cols-3">
        {skeletonKeys("live-metric", 3).map((key) => (
          <Skeleton key={key} className={`h-[98px] rounded-[14px] ${FILL}`} />
        ))}
      </section>
      <Skeleton className={`min-h-[320px] rounded-[18px] ${FILL}`} />
      <section className={`${CARD} p-5`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className={`h-6 w-44 rounded-full ${FILL}`} />
            <Skeleton
              className={`mt-3 h-4 w-72 max-w-full rounded-full ${FILL}`}
            />
          </div>
          <Skeleton className={`h-11 w-52 rounded-[10px] ${FILL}`} />
        </div>
        <Skeleton className={`mt-5 h-48 rounded-[12px] ${FILL}`} />
      </section>
    </div>
  );
}
