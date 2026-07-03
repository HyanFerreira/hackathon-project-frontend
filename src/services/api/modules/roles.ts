import type { Role } from "@/types/role";
import { api } from "../api";
import { roleEndpoints } from "../endpoints/roleEndpoints";

type RoleApi = {
  id: number;
  name: string;
  guard_name: string;
};

type RoleResponse = {
  data: RoleApi;
};

type RoleListResponse = {
  data: RoleApi[];
};

export type RolePayload = {
  name: string;
};

export function normalizeRole(role: RoleApi): Role {
  return {
    id: role.id,
    name: role.name,
    guardName: role.guard_name,
  };
}

export const rolesApi = {
  async list(): Promise<Role[]> {
    const { data } = await api.get<RoleListResponse>(roleEndpoints.list);

    return data.data.map(normalizeRole);
  },

  async create(payload: RolePayload): Promise<Role> {
    const { data } = await api.post<RoleResponse>(
      roleEndpoints.create,
      payload,
    );

    return normalizeRole(data.data);
  },

  async update(id: number, payload: RolePayload): Promise<Role> {
    const { data } = await api.put<RoleResponse>(
      roleEndpoints.update(id),
      payload,
    );

    return normalizeRole(data.data);
  },

  async remove(id: number): Promise<void> {
    await api.delete(roleEndpoints.remove(id));
  },
};
