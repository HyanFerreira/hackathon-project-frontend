export const managerEndpoints = {
  list: "/admin/gestores",
  create: "/admin/gestores",
  detail: (id: number) => `/admin/gestores/${id}`,
  update: (id: number) => `/admin/gestores/${id}`,
  remove: (id: number) => `/admin/gestores/${id}`,
};
