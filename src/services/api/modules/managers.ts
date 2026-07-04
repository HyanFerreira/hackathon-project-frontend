import type { User } from "@/types/user";
import { api } from "../api";
import { managerEndpoints } from "../endpoints/managerEndpoints";
import { normalizeUser, type UserApi } from "./users";

type ManagerResponse = {
  data: UserApi;
};

type ManagerListResponse = {
  data: UserApi[];
};

export type CreateManagerPayload = {
  escola_id: number;
  name: string;
  cpf: string;
  email: string;
  password: string;
};

export const managersApi = {
  async list(): Promise<User[]> {
    const { data } = await api.get<ManagerListResponse>(managerEndpoints.list);

    return data.data.map(normalizeUser);
  },

  async create(payload: CreateManagerPayload): Promise<User> {
    const { data } = await api.post<ManagerResponse>(
      managerEndpoints.create,
      payload,
    );

    return normalizeUser(data.data);
  },

  async remove(id: number): Promise<void> {
    await api.delete(managerEndpoints.remove(id));
  },
};
