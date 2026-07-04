import type { School } from "@/types/school";
import { api } from "../api";
import { schoolEndpoints } from "../endpoints/schoolEndpoints";

type SchoolApi = {
  id: number;
  nome: string;
  cidade?: string;
  estado?: string;
  status?: string;
};

type SchoolResponse = {
  data: SchoolApi;
};

type SchoolListResponse = {
  data: SchoolApi[];
};

type SchoolPayloadApi = {
  nome: string;
  cidade?: string;
  estado?: string;
  status?: string;
};

export type CreateSchoolPayload = {
  name: string;
  city?: string;
  state?: string;
  status?: string;
};

export type UpdateSchoolPayload = CreateSchoolPayload;

export function normalizeSchool(school: SchoolApi): School {
  return {
    id: school.id,
    name: school.nome,
    city: school.cidade,
    state: school.estado,
    status: school.status,
  };
}

function serializeSchool(payload: CreateSchoolPayload): SchoolPayloadApi {
  return {
    nome: payload.name,
    cidade: payload.city,
    estado: payload.state,
    status: payload.status,
  };
}

export const schoolsApi = {
  async list(): Promise<School[]> {
    const { data } = await api.get<SchoolListResponse>(schoolEndpoints.list);

    return data.data.map(normalizeSchool);
  },

  async create(payload: CreateSchoolPayload): Promise<School> {
    const { data } = await api.post<SchoolResponse>(
      schoolEndpoints.create,
      serializeSchool(payload),
    );

    return normalizeSchool(data.data);
  },

  async update(id: number, payload: UpdateSchoolPayload): Promise<School> {
    const { data } = await api.put<SchoolResponse>(
      schoolEndpoints.update(id),
      serializeSchool(payload),
    );

    return normalizeSchool(data.data);
  },

  async remove(id: number): Promise<void> {
    await api.delete(schoolEndpoints.remove(id));
  },
};
