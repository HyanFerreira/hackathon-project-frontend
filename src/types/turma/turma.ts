import type { Aluno } from "@/types/aluno";
import type { User } from "@/types/user";

export type Turma = {
  id: number;
  schoolId: number;
  name: string;
  year?: string;
  shift?: string;
  status?: string;
  teachers?: User[];
  students?: Aluno[];
};
