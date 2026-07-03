import { Skeleton } from "./Skeleton";

type ListSkeletonProps = {
  rows?: number;
  withActions?: boolean;
};

/**
 * Placeholder de carregamento com aparência de lista de cards
 * (avatar + texto + ações). Reutilizável em listagens não tabulares.
 */
export function ListSkeleton({
  rows = 4,
  withActions = true,
}: ListSkeletonProps) {
  const rowKeys = Array.from({ length: rows }, (_, index) => index);

  return (
    <ul className="grid gap-3" role="status" aria-label="Carregando dados">
      {rowKeys.map((row) => (
        <li
          key={`row-${row}`}
          className="flex items-center justify-between gap-4 rounded-system border border-slate-200 bg-white p-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>

          {withActions && (
            <div className="flex gap-2">
              <Skeleton className="size-9" />
              <Skeleton className="size-9" />
            </div>
          )}
        </li>
      ))}

      <span className="sr-only">Carregando...</span>
    </ul>
  );
}
