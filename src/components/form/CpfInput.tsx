"use client";

import { IdCard } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { useState } from "react";
import { Input } from "@/components/form/Input";
import { formatCpf, isValidCpf, onlyCpfDigits } from "@/utils/cpf/cpf";

type CpfInputProps = Omit<
  ComponentPropsWithoutRef<typeof Input>,
  "onChange"
> & {
  onChange?: (value: string) => void;
};

export function CpfInput({
  error: externalError,
  onBlur,
  onChange,
  value,
  ...props
}: CpfInputProps) {
  const [error, setError] = useState<string>();
  const formattedValue = typeof value === "string" ? formatCpf(value) : value;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = formatCpf(event.target.value);
    setError(undefined);
    onChange?.(nextValue);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const digits = onlyCpfDigits(event.target.value);

    if (digits.length > 0 && !isValidCpf(digits)) {
      setError("Informe um CPF válido.");
    }

    onBlur?.(event);
  };

  return (
    <Input
      autoComplete="username"
      error={externalError ?? error}
      icon={<IdCard aria-hidden="true" className="size-5" />}
      inputMode="numeric"
      maxLength={14}
      onBlur={handleBlur}
      onChange={handleChange}
      placeholder="000.000.000-00"
      value={formattedValue}
      {...props}
    />
  );
}
