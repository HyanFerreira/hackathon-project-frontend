import type { Role } from "@/types/role";
import type { School } from "@/types/school";

export type User = {
  id: number;
  name: string;
  email: string;
  cpf?: string;
  roles?: Role[];
  school?: School;
  schoolId?: number;
};
