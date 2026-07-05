"use client";

import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { useState } from "react";
import { Button } from "@/components/buttons";
import { Input } from "@/components/form/Input";

type PasswordInputProps = Omit<ComponentPropsWithoutRef<typeof Input>, "type">;

export function PasswordInput(props: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Input
      autoComplete="current-password"
      icon={<LockKeyhole aria-hidden="true" className="size-5" />}
      rightElement={
        <Button
          type="button"
          aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
          className="inline-flex size-9 items-center justify-center rounded-system text-text-secondary transition hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-input-border-focus"
          onClick={() => setIsVisible((current) => !current)}
        >
          {isVisible ? (
            <EyeOff aria-hidden="true" className="size-5" />
          ) : (
            <Eye aria-hidden="true" className="size-5" />
          )}
        </Button>
      }
      placeholder="Senha"
      type={isVisible ? "text" : "password"}
      {...props}
    />
  );
}
