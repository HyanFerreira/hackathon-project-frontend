import type { User } from "@/types/user";
import { api } from "../api";
import { authEndpoints } from "../endpoints/authEndpoints";

type LoginRequest = {
  cpf: string;
  password: string;
};

type UserApi = {
  id: number;
  name: string;
  cpf: string;
  email: string;
  roles?: Array<{
    id: number;
    name: string;
    guard_name: string;
  }>;
  escola_id?: number;
  school_id?: number;
};

type LoginResponseApi = {
  user: UserApi | { data: UserApi };
  token: string;
};

type LoginResponse = {
  user: User;
  token: string;
};

function normalizeUser(user: UserApi): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    cpf: user.cpf,
    schoolId: user.escola_id ?? user.school_id,
    roles: user.roles?.map((role) => ({
      id: role.id,
      name: role.name,
      guardName: role.guard_name,
    })),
  };
}

function getUserFromResponse(user: LoginResponseApi["user"]) {
  return "data" in user ? user.data : user;
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponseApi>(
      authEndpoints.login,
      credentials,
    );

    return {
      user: normalizeUser(getUserFromResponse(data.user)),
      token: data.token,
    };
  },

  async me(): Promise<User> {
    const { data } = await api.get<UserApi | { data: UserApi }>(
      authEndpoints.me,
    );

    return normalizeUser(getUserFromResponse(data));
  },

  async logout(): Promise<void> {
    await api.post(authEndpoints.logout);
  },
};
