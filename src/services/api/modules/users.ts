import type { User } from "@/types/user";
import { api } from "../api";
import { userEndpoints } from "../endpoints/userEndpoints";
import { normalizeRole } from "./roles";
import { normalizeSchool } from "./schools";

type RoleApi = {
  id: number;
  name: string;
  guard_name: string;
};

export type UserApi = {
  id: number;
  name: string;
  email: string;
  cpf?: string;
  roles?: RoleApi[];
  escola_id?: number;
  school?: {
    id: number;
    nome: string;
    cidade?: string;
    estado?: string;
    status?: string;
  };
  school_id?: number;
};

type UserResponse = {
  data: UserApi;
};

type UserListResponse = {
  data: UserApi[];
};

export type CreateUserPayload = {
  name: string;
  cpf: string;
  email: string;
  password: string;
  roles: string[];
  school_id?: number;
};

export type UpdateUserPayload = {
  name: string;
  cpf: string;
  email: string;
  password?: string;
  roles: string[];
  school_id?: number;
};

export function normalizeUser(user: UserApi): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    cpf: user.cpf,
    roles: user.roles?.map(normalizeRole),
    school: user.school ? normalizeSchool(user.school) : undefined,
    schoolId: user.escola_id ?? user.school_id ?? user.school?.id,
  };
}

export const usersApi = {
  async list(): Promise<User[]> {
    const { data } = await api.get<UserListResponse>(userEndpoints.list);

    return data.data.map(normalizeUser);
  },

  async create(payload: CreateUserPayload): Promise<User> {
    const { data } = await api.post<UserResponse>(
      userEndpoints.create,
      payload,
    );

    return normalizeUser(data.data);
  },

  async update(id: number, payload: UpdateUserPayload): Promise<User> {
    const { data } = await api.put<UserResponse>(
      userEndpoints.update(id),
      payload,
    );

    return normalizeUser(data.data);
  },

  async remove(id: number): Promise<void> {
    await api.delete(userEndpoints.remove(id));
  },
};
