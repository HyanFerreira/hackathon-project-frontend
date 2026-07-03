import type { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

type SkeletonProps = ComponentPropsWithoutRef<"div">;

/**
 * Bloco base de skeleton. Use a prop `className` para definir tamanho e forma
 * (ex.: `h-4 w-32`, `size-10 rounded-full`).
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={twMerge(
        "animate-pulse rounded-system bg-slate-200",
        className,
      )}
      {...props}
    />
  );
}
