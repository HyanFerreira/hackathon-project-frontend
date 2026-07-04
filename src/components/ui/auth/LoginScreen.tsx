"use client";

import {
  AlertCircle,
  ArrowRight,
  LoaderCircle,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import loginBorda from "@/assets/images/login-borda.png";
import loginMascot from "@/assets/images/login-mascot.png";
import { Button } from "@/components/buttons";
import { CpfInput } from "@/components/form/CpfInput";
import { Input } from "@/components/form/Input";
import { PasswordInput } from "@/components/form/PasswordInput";
import {
  getApiErrorMessage,
  getApiValidationErrors,
} from "@/services/api/errors/getApiErrorMessage";
import { authApi } from "@/services/api/modules/auth";
import { gamificationApi } from "@/services/api/modules/gamification";
import {
  getAuthToken,
  setAuthActor,
  setAuthToken,
} from "@/services/api/tokenStorage";
import { isValidCpf, onlyCpfDigits } from "@/utils/cpf/cpf";

type LoginFieldErrors = {
  cpf?: string;
  codigo?: string;
  password?: string;
};

export function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"user" | "aluno">("user");
  const [cpf, setCpf] = useState("");
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (getAuthToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const validateForm = () => {
    if (mode === "aluno") {
      const nextErrors: LoginFieldErrors = {};

      if (!codigo.trim()) {
        nextErrors.codigo = "Informe o codigo de acesso.";
      }

      setFieldErrors(nextErrors);

      return Object.keys(nextErrors).length === 0;
    }

    const cpfDigits = onlyCpfDigits(cpf);
    const nextErrors: LoginFieldErrors = {};

    if (!cpfDigits) {
      nextErrors.cpf = "Informe o CPF.";
    } else if (cpfDigits.length !== 11) {
      nextErrors.cpf = "Informe um CPF com 11 digitos.";
    } else if (!isValidCpf(cpfDigits)) {
      nextErrors.cpf = "Informe um CPF valido.";
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "aluno") {
        const response = await gamificationApi.loginAluno(codigo.trim());

        setAuthToken(response.token, false);
        setAuthActor("aluno", false);
        router.replace("/dashboard");
        return;
      }

      const response = await authApi.login({
        cpf: onlyCpfDigits(cpf),
        password,
      });

      setAuthToken(response.token, false);
      setAuthActor("user", false);
      router.replace("/dashboard");
    } catch (requestError) {
      const validationErrors = getApiValidationErrors(requestError);

      if (validationErrors) {
        setFieldErrors({
          cpf: validationErrors.cpf,
          codigo: validationErrors.codigo,
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
    <main className="relative min-h-screen overflow-hidden bg-palette-60-50 text-text-primary">
      <div className="absolute right-0 bottom-0">
        <Image
          src={loginBorda}
          alt=""
          priority
          sizes="w-56"
        />
      </div>

      <section className="relative z-10 grid min-h-screen gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)] lg:items-stretch lg:px-16 xl:px-20">
        <div className="flex min-h-[52vh] flex-col justify-end lg:min-h-[calc(100vh-4rem)]">
          <div className="relative flex flex-1 items-end justify-center pb-6 lg:items-center lg:pb-10">
            <Image
              src={loginMascot}
              alt="Mascote educacional roxo com elementos de estudo"
              priority
              sizes="(min-width: 1024px) 50vw, 90vw"
              className="relative z-10 w-full max-w-[680px] object-contain"
            />
          </div>

          <div className="grid gap-4 rounded-[18px] border border-white/80 bg-white/90 p-5 shadow-2xl shadow-brand-primary-dark/10 backdrop-blur sm:grid-cols-3">
            <LoginBenefit
              icon={<ShieldCheck aria-hidden="true" className="size-8" />}
              title="Ambiente seguro"
              description="Seus dados protegidos com seguranca."
            />
            <LoginBenefit
              icon={<Users aria-hidden="true" className="size-8" />}
              title="Acesso inteligente"
              description="Para Admin, Gestor e Professor."
            />
            <LoginBenefit
              icon={<Trophy aria-hidden="true" className="size-8" />}
              title="Educacao que transforma"
              description="Ferramentas para ensinar e inspirar."
            />
          </div>
        </div>

        <div className="flex items-end justify-center lg:min-h-[calc(100vh-4rem)]">
          <section className="w-full max-w-[550px] rounded-[28px] border border-slate-200/80 bg-white/95 px-6 py-10 shadow-2xl shadow-brand-primary-dark/12 backdrop-blur sm:px-10 lg:px-12 lg:py-14">
            <div className="mb-10 text-center">
              <p className="mb-10 bg-gradient-to-r from-brand-primary to-palette-30-700 bg-clip-text text-4xl font-black tracking-normal text-transparent">
                LOGO
              </p>
              <h1 className="text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
                Bem-vindo de volta!
              </h1>
              <span className="mx-auto mt-5 block h-1 w-12 rounded-full bg-palette-10-yellow" />
              <p className="mt-6 text-base font-medium text-text-secondary">
                Acesse como equipe escolar ou aluno
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 rounded-[14px] bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setMode("user")}
                  className={`min-h-11 rounded-[12px] text-sm font-bold transition ${
                    mode === "user"
                      ? "bg-white text-brand-primary shadow-sm"
                      : "text-text-secondary"
                  }`}
                >
                  Equipe escolar
                </button>
                <button
                  type="button"
                  onClick={() => setMode("aluno")}
                  className={`min-h-11 rounded-[12px] text-sm font-bold transition ${
                    mode === "aluno"
                      ? "bg-white text-brand-primary shadow-sm"
                      : "text-text-secondary"
                  }`}
                >
                  Aluno
                </button>
              </div>

              {mode === "user" ? (
                <>
                  <CpfInput
                    error={fieldErrors.cpf}
                    inputClassName="h-14 rounded-[14px] text-base font-medium shadow-sm shadow-slate-200/50"
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
                    inputClassName="h-14 rounded-[14px] text-base font-medium shadow-sm shadow-slate-200/50"
                    label="Senha"
                    name="password"
                    onChange={(event) => {
                      setPassword(event.target.value);
                      clearFieldError("password");
                    }}
                    value={password}
                  />
                </>
              ) : (
                <Input
                  error={fieldErrors.codigo}
                  inputClassName="h-14 rounded-[14px] text-base font-medium uppercase shadow-sm shadow-slate-200/50"
                  label="Codigo de acesso"
                  name="codigo"
                  placeholder="Ex.: ALU12345"
                  value={codigo}
                  onChange={(event) => {
                    setCodigo(event.target.value.toUpperCase());
                    clearFieldError("codigo");
                  }}
                />
              )}

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

              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-h-14 w-full justify-between rounded-[14px] bg-brand-primary px-6 text-lg font-black text-white shadow-xl shadow-brand-primary/25 hover:bg-brand-primary-hover"
              >
                <span className="flex-1 text-center">
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </span>
                {isSubmitting ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-6 animate-spin"
                  />
                ) : (
                  <ArrowRight aria-hidden="true" className="size-7" />
                )}
              </Button>
            </form>

            <div className="mt-14 border-t border-slate-200 pt-8">
              <div className="flex items-center gap-5">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
                  <ShieldCheck aria-hidden="true" className="size-7" />
                </span>
                <p className="text-base leading-7 text-text-secondary">
                  Plataforma educacional desenvolvida{" "}
                  <strong className="font-bold text-text-primary">
                    para apoiar escolas e educadores.
                  </strong>
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

type LoginBenefitProps = {
  description: string;
  icon: ReactNode;
  title: string;
};

function LoginBenefit({ description, icon, title }: LoginBenefitProps) {
  return (
    <div className="flex gap-4 sm:border-r sm:border-slate-200 sm:pr-4 last:sm:border-r-0 last:sm:pr-0">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
        {icon}
      </span>
      <div>
        <h2 className="text-sm font-black leading-5 text-text-primary">
          {title}
        </h2>
        <p className="mt-1 text-xs font-medium leading-5 text-text-secondary">
          {description}
        </p>
      </div>
    </div>
  );
}
