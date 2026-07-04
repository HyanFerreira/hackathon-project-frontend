import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type InputProps = ComponentPropsWithoutRef<"input"> & {
  error?: string;
  icon?: ReactNode;
  inputClassName?: string;
  label?: string;
  rightElement?: ReactNode;
};

export function Input({
  className,
  error,
  icon,
  id,
  inputClassName,
  label,
  rightElement,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;
  const errorId = error && inputId ? `${inputId}-error` : undefined;

  return (
    <div className={twMerge("space-y-2", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-text-primary"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 flex size-5 items-center justify-center text-text-secondary">
            {icon}
          </span>
        )}

        <input
          id={inputId}
          aria-describedby={errorId}
          aria-invalid={Boolean(error)}
          className={twMerge(
            "h-11 w-full rounded-system border border-input-border px-3 py-2.5 text-sm font-light text-text-primary outline-0 placeholder:text-placeholder focus:border-transparent focus:outline-2 focus:outline-offset-1 focus:outline-input-border-focus disabled:cursor-default disabled:bg-input-disabled",
            icon && "pl-10",
            rightElement && "pr-12",
            error && "border-red-500 focus:outline-red-600",
            inputClassName,
          )}
          {...props}
        />

        {rightElement && (
          <div className="-translate-y-1/2 absolute top-1/2 right-1 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
