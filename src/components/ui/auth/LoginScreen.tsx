"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import loginBorda from "@/assets/images/login-borda.png";
import loginMascot from "@/assets/images/login-mascot-v2.png";
import paideiaLogoPurple from "@/assets/images/logotipo/paideia_roxo.svg";
import { Button, buttonVariants } from "@/components/buttons";
import { Checkbox } from "@/components/form/Checkbox";
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

type LoginScreenProps = {
  mode?: "user" | "aluno";
  initialCodigo?: string;
};

const rememberedIdentifierKeys = {
  aluno: "paideia_remembered_student_code",
  user: "paideia_remembered_cpf",
} as const;

export function LoginScreen({
  mode = "user",
  initialCodigo,
}: LoginScreenProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const autoLoginDone = useRef(false);
  const [cpf, setCpf] = useState("");
  const [codigo, setCodigo] = useState((initialCodigo ?? "").toUpperCase());
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberUser, setRememberUser] = useState(false);

  useEffect(() => {
    if (getAuthToken()) {
      router.replace(mode === "aluno" ? "/estudantes" : "/dashboard");
    }
  }, [mode, router]);

  useEffect(() => {
    const rememberedIdentifier = window.localStorage.getItem(
      rememberedIdentifierKeys[mode],
    );

    if (!rememberedIdentifier) return;

    setRememberUser(true);

    if (mode === "aluno") {
      if (!initialCodigo) {
        setCodigo(rememberedIdentifier.toUpperCase());
      }
    } else {
      setCpf(rememberedIdentifier);
    }
  }, [initialCodigo, mode]);

  const persistRememberedIdentifier = useCallback(
    (identifier: string) => {
      const storageKey = rememberedIdentifierKeys[mode];

      if (rememberUser) {
        window.localStorage.setItem(storageKey, identifier);
      } else {
        window.localStorage.removeItem(storageKey);
      }
    },
    [mode, rememberUser],
  );

  const doAlunoLogin = useCallback(
    async (rawCodigo: string, persistIdentifier = true) => {
      const codigoValue = rawCodigo.trim().toUpperCase();

      if (!codigoValue) {
        setFieldErrors({ codigo: "Informe o codigo de acesso." });
        return;
      }

      setError(undefined);
      setIsSubmitting(true);

      try {
        const response = await gamificationApi.loginAluno(codigoValue);

        setAuthToken(response.token, false);
        setAuthActor("aluno", false);
        if (response.perfil) {
          queryClient.setQueryData(["aluno", "perfil"], response.perfil);
        }
        if (persistIdentifier) {
          persistRememberedIdentifier(codigoValue);
        }
        if (response.streak?.updated && response.streak.message) {
          window.sessionStorage.setItem(
            "student_login_streak_reward",
            JSON.stringify(response.streak),
          );
        }
        router.replace("/estudantes");
      } catch (requestError) {
        const validationErrors = getApiValidationErrors(requestError);

        if (validationErrors) {
          setFieldErrors({ codigo: validationErrors.codigo });
        } else {
          setError(getApiErrorMessage(requestError));
        }

        setIsSubmitting(false);
      }
    },
    [persistRememberedIdentifier, queryClient, router],
  );

  // Auto-login quando o codigo chega pela URL (QR code do cartao de acesso).
  useEffect(() => {
    if (autoLoginDone.current) {
      return;
    }

    if (mode === "aluno" && initialCodigo && !getAuthToken()) {
      autoLoginDone.current = true;
      void doAlunoLogin(initialCodigo, false);
    }
  }, [mode, initialCodigo, doAlunoLogin]);

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

    if (mode === "aluno") {
      if (!validateForm()) {
        return;
      }

      await doAlunoLogin(codigo);
      return;
    }

    setError(undefined);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authApi.login({
        cpf: onlyCpfDigits(cpf),
        password,
      });

      setAuthToken(response.token, false);
      setAuthActor("user", false);
      persistRememberedIdentifier(onlyCpfDigits(cpf));
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
    <main className="relative min-h-dvh overflow-x-hidden bg-palette-60-50 text-text-primary lg:h-dvh lg:overflow-hidden">
      <div className="pointer-events-none absolute right-0 bottom-0">
        <Image
          src={loginBorda}
          alt=""
          priority
          sizes="1100px"
          className="w-[1100px] max-w-none"
        />
      </div>

      <section className="relative z-10 mx-auto grid min-h-dvh w-full max-w-[1760px] grid-cols-[minmax(0,1fr)] gap-6 px-4 py-5 sm:px-8 sm:py-8 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] lg:items-center lg:gap-x-12 lg:px-12 xl:px-20">
        <div className="order-2 hidden min-h-0 items-center justify-center lg:order-1 lg:flex">
          <Image
            src={loginMascot}
            alt="Mascote Paideia"
            priority
            sizes="(min-width: 1024px) 50vw, 90vw"
            className="relative z-10 max-h-[800px] w-full max-w-[800px] object-contain"
          />
        </div>

        <div className="order-1 flex min-w-0 items-center justify-center lg:order-2">
          <section className="min-w-0 w-full max-w-[520px] rounded-[24px] border border-slate-200/80 bg-white/95 px-5 py-6 shadow-2xl shadow-brand-primary-dark/12 backdrop-blur sm:px-9 sm:py-7 lg:px-10">
            <div className="mb-6 text-center">
              <Image
                alt="Paideia"
                className="mx-auto mb-5 h-11 w-auto max-w-[200px] object-contain"
                priority
                src={paideiaLogoPurple}
              />
              <h1 className="text-3xl font-bold tracking-normal text-slate-950">
                Bem-vindo de volta!
              </h1>
              <span className="mx-auto mt-4 block h-1 w-12 rounded-full bg-palette-10-yellow" />
              <p className="mt-5 text-base font-medium text-text-secondary">
                {mode === "aluno"
                  ? "Acesse com o codigo gerado pela escola"
                  : "Acesse como equipe escolar"}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {mode === "user" ? (
                <>
                  <CpfInput
                    error={fieldErrors.cpf}
                    inputClassName="shadow-sm shadow-slate-200/50"
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
                    inputClassName="shadow-sm shadow-slate-200/50"
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
                  inputClassName="uppercase shadow-sm shadow-slate-200/50"
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

              <Checkbox
                checked={rememberUser}
                id={`remember-${mode}`}
                label="Lembrar usuário"
                onChange={(event) => {
                  const checked = event.target.checked;
                  setRememberUser(checked);

                  if (!checked) {
                    window.localStorage.removeItem(
                      rememberedIdentifierKeys[mode],
                    );
                  }
                }}
              />

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
                variant="primary"
                className="relative w-full"
              >
                <span>{isSubmitting ? "Entrando..." : "Entrar"}</span>
                {isSubmitting ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="absolute right-5 size-5 animate-spin"
                  />
                ) : (
                  <ArrowRight
                    aria-hidden="true"
                    className="absolute right-5 size-5"
                  />
                )}
              </Button>
            </form>

            <div className="mt-6 border-t border-slate-200 pt-5">
              <div className="flex items-center gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
                  <ShieldCheck aria-hidden="true" className="size-6" />
                </span>
                <p className="text-sm leading-6 text-text-secondary">
                  Plataforma educacional desenvolvida{" "}
                  <strong className="font-bold text-text-primary">
                    para apoiar escolas e educadores.
                  </strong>
                </p>
              </div>
              <Link
                href={mode === "aluno" ? "/login" : "/login/estudante"}
                className={buttonVariants({
                  className: "mt-5 w-full",
                  variant: "secondary",
                })}
              >
                {mode === "aluno"
                  ? "Entrar como equipe escolar"
                  : "Entrar como estudante"}
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
