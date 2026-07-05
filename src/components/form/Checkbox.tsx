import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type CheckboxProps = Omit<ComponentPropsWithoutRef<"input">, "type"> & {
  label: ReactNode;
};

export function Checkbox({
  className,
  disabled,
  id,
  label,
  name,
  ...props
}: CheckboxProps) {
  const inputId = id ?? name;

  return (
    <label
      htmlFor={inputId}
      className={`inline-flex w-fit items-center gap-2 text-sm font-normal text-text-secondary ${
        disabled ? "cursor-default" : "cursor-pointer"
      }`}
    >
      <input
        {...props}
        id={inputId}
        name={name}
        type="checkbox"
        disabled={disabled}
        className={twMerge("shrink-0", className)}
      />
      <span>{label}</span>
    </label>
  );
}
