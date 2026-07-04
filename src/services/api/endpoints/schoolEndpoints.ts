export const schoolEndpoints = {
  list: "/admin/escolas",
  create: "/admin/escolas",
  detail: (id: number) => `/admin/escolas/${id}`,
  update: (id: number) => `/admin/escolas/${id}`,
  remove: (id: number) => `/admin/escolas/${id}`,
};
