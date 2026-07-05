import type { Role } from "@/types/role";
import type { School } from "@/types/school";
import type { Turma } from "@/types/turma";

export type User = {
  id: number;
  name: string;
  email: string;
  cpf?: string;
  roles?: Role[];
  school?: School;
  schoolId?: number;
  turmas?: Turma[];
};
