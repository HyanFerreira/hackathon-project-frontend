export const roleEndpoints = {
  list: "/roles",
  create: "/roles",
  detail: (id: number) => `/roles/${id}`,
  update: (id: number) => `/roles/${id}`,
  remove: (id: number) => `/roles/${id}`,
} as const;
