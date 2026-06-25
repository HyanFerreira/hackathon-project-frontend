import type { User } from "@/types/user";
import { api } from "../api";
import { userEndpoints } from "../endpoints/userEndpoints";

type UserApi = {
  id: number;
  name: string;
  email: string;
};

type UserListResponse = {
  data: UserApi[];
};

function normalizeUser(user: UserApi): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export const usersApi = {
  async list(): Promise<User[]> {
    const { data } = await api.get<UserListResponse>(userEndpoints.list);

    return data.data.map(normalizeUser);
  },
};
