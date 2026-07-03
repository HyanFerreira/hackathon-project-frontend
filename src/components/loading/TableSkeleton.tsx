import { Skeleton } from "./Skeleton";

type TableSkeletonProps = {
  rows?: number;
  columns?: number;
  minWidth?: number;
};

/**
 * Placeholder de carregamento com aparência de tabela.
 * Reutilizável em qualquer listagem tabular.
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  minWidth = 640,
}: TableSkeletonProps) {
  const columnKeys = Array.from({ length: columns }, (_, index) => index);
  const rowKeys = Array.from({ length: rows }, (_, index) => index);

  return (
    <div
      className="overflow-x-auto"
      role="status"
      aria-label="Carregando dados"
    >
      <div className="space-y-3" style={{ minWidth }}>
        <div className="flex gap-4 border-slate-200 border-b pb-3">
          {columnKeys.map((column) => (
            <Skeleton key={`head-${column}`} className="h-3 flex-1" />
          ))}
        </div>

        {rowKeys.map((row) => (
          <div key={`row-${row}`} className="flex items-center gap-4 py-1.5">
            {columnKeys.map((column) => (
              <Skeleton key={`cell-${row}-${column}`} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>

      <span className="sr-only">Carregando...</span>
    </div>
  );
}
