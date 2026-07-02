"use client";

import { AlertCircle, LoaderCircle, LogIn } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import ifspFacade from "@/assets/images/ifspcaragua_faxada.png";
import { CpfInput } from "@/components/form/CpfInput";
import { PasswordInput } from "@/components/form/PasswordInput";
import {
  getApiErrorMessage,
  getApiValidationErrors,
} from "@/services/api/errors/getApiErrorMessage";
import { authApi } from "@/services/api/modules/auth";
import { setAuthToken } from "@/services/api/tokenStorage";
import { isValidCpf, onlyCpfDigits } from "@/utils/cpf/cpf";

type LoginFieldErrors = {
  cpf?: string;
  password?: string;
};

export function LoginScreen() {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const cpfDigits = onlyCpfDigits(cpf);
    const nextErrors: LoginFieldErrors = {};

    if (!cpfDigits) {
      nextErrors.cpf = "Informe o CPF.";
    } else if (cpfDigits.length !== 11) {
      nextErrors.cpf = "Informe um CPF com 11 dígitos.";
    } else if (!isValidCpf(cpfDigits)) {
      nextErrors.cpf = "Informe um CPF válido.";
    }

    if (!password) {
      nextErrors.password = "Informe a senha.";
    }

    setFieldErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const clearFieldError = (field: keyof LoginFieldErrors) => {
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);
    setSuccessMessage(undefined);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authApi.login({
        cpf: onlyCpfDigits(cpf),
        password,
      });

      setAuthToken(response.token, remember);
      setSuccessMessage(
        `Login realizado com sucesso. Olá, ${response.user.name}.`,
      );
    } catch (requestError) {
      const validationErrors = getApiValidationErrors(requestError);

      if (validationErrors) {
        setFieldErrors({
          cpf: validationErrors.cpf,
          password: validationErrors.password,
        });
      } else {
        setError(getApiErrorMessage(requestError));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-brand-primary text-slate-950 lg:grid-cols-[minmax(0,1.85fr)_minmax(420px,1fr)]">
      <section className="relative z-10 hidden overflow-hidden rounded-br-[180px] lg:block">
        <Image
          src={ifspFacade}
          alt="Fachada do IFSP Caraguatatuba"
          fill
          priority
          sizes="65vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/10" />
      </section>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-5 py-10 sm:px-8">
        <div className="absolute right-0 bottom-0 h-[30vh] w-full rounded-tl-[120px] bg-brand-primary" />

        <div className="relative z-10 w-full max-w-[512px] rounded-system bg-white px-5 py-8 shadow-2xl shadow-brand-primary-dark/12 sm:px-8 sm:py-10">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-brand-primary sm:text-4xl">
              Acessar sistema
            </h2>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <CpfInput
              error={fieldErrors.cpf}
              label="CPF"
              name="cpf"
              onChange={(value) => {
                setCpf(value);
                clearFieldError("cpf");
              }}
              value={cpf}
            />

            <PasswordInput
              error={fieldErrors.password}
              label="Senha"
              name="password"
              onChange={(event) => {
                setPassword(event.target.value);
                clearFieldError("password");
              }}
              value={password}
            />

            <div className="flex flex-col gap-3 text-sm font-semibold sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex cursor-pointer items-center gap-2 text-brand-primary">
                <input
                  type="checkbox"
                  name="remember"
                  className="size-4 border-input-border focus:ring-input-border-focus"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                Lembrar usuário
              </label>

              <a
                href="/forgot-password"
                className="text-brand-primary transition hover:text-brand-primary-hover hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-input-border-focus"
              >
                Esqueceu sua senha?
              </a>
            </div>

            {error && (
              <div
                role="alert"
                className="flex gap-2 rounded-system border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
              >
                <AlertCircle
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0"
                />
                <p>{error}</p>
              </div>
            )}

            {successMessage && (
              <p className="rounded-system border border-brand-primary/20 bg-brand-primary-soft p-3 text-sm font-medium text-brand-primary">
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-system bg-brand-primary px-5 py-3 text-lg font-bold text-white transition hover:bg-brand-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-input-border-focus disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-5 animate-spin"
                />
              ) : (
                <LogIn aria-hidden="true" className="size-5" />
              )}
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>

            <div className="flex items-center gap-3 text-sm font-semibold text-brand-primary">
              <span className="h-px flex-1 bg-brand-primary" />
              <span>ou</span>
              <span className="h-px flex-1 bg-brand-primary" />
            </div>

            <a
              href="/cadastro"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-system border border-brand-primary/20 px-5 py-3 font-bold text-brand-primary transition hover:bg-brand-primary-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-input-border-focus"
            >
              Cadastre-se
            </a>
          </form>
        </div>
      </section>
    </main>
  );
}
