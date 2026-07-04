import type { Aluno } from "@/types/aluno";
import type { User } from "@/types/user";
import { api } from "../api";
import { impersonateEndpoints } from "../endpoints/impersonateEndpoints";
import { normalizeAluno } from "./gamification";
import { normalizeUser, type UserApi } from "./users";

type ImpersonateUserResponse = {
  impersonando: boolean;
  tipo: "user";
  token: string;
  user?: UserApi | { data: UserApi };
  usuario?: UserApi | { data: UserApi };
};

type ImpersonateAlunoResponse = {
  impersonando: boolean;
  tipo: "aluno";
  token: string;
  aluno:
    | {
        data: {
          id: number;
          escola_id: number;
          nome: string;
          codigo: string;
        };
      }
    | {
        id: number;
        escola_id: number;
        nome: string;
        codigo: string;
      };
};

function unwrapData<T extends object>(
  resource: T | { data: T } | undefined,
  resourceName: string,
): T {
  if (!resource) {
    throw new Error(`Resposta de impersonacao sem ${resourceName}.`);
  }

  return "data" in resource ? resource.data : resource;
}

export const impersonateApi = {
  async user(id: number): Promise<{ token: string; user: User }> {
    const { data } = await api.post<ImpersonateUserResponse>(
      impersonateEndpoints.user(id),
    );
    const user = unwrapData(data.user ?? data.usuario, "usuario");

    return {
      token: data.token,
      user: normalizeUser(user),
    };
  },

  async aluno(id: number): Promise<{ token: string; aluno: Aluno }> {
    const { data } = await api.post<ImpersonateAlunoResponse>(
      impersonateEndpoints.aluno(id),
    );
    const aluno = unwrapData(data.aluno, "aluno");

    return {
      token: data.token,
      aluno: normalizeAluno(aluno),
    };
  },

  async stop(): Promise<void> {
    await api.post(impersonateEndpoints.stop);
  },
};
