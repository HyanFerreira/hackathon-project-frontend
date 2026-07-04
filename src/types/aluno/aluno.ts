export type Aluno = {
  id: number;
  schoolId: number;
  name: string;
  code: string;
};

export type PerfilAluno = {
  points: number;
  xp: number;
  level: number;
  xpToNextLevel?: number;
  energy: number;
  maxEnergy: number;
  aluno?: Aluno;
};

export type RankingItem = {
  position: number;
  aluno: Aluno;
  points: number;
  xp: number;
  level: number;
};
