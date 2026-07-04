export const impersonateEndpoints = {
  user: (id: number) => `/impersonate/user/${id}`,
  aluno: (id: number) => `/impersonate/aluno/${id}`,
  stop: "/impersonate/parar",
} as const;
