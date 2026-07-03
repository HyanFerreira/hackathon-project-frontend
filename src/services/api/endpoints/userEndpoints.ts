export const userEndpoints = {
  list: "/users",
  create: "/users",
  detail: (id: number) => `/users/${id}`,
  update: (id: number) => `/users/${id}`,
  remove: (id: number) => `/users/${id}`,
} as const;
