export type Aluno = {
  id: number;
  schoolId: number;
  name: string;
  code: string;
};

export type PerfilAluno = {
  points: number;
  totalPoints: number;
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

export type ConquistaProgresso = {
  id: number;
  name: string;
  description: string;
  icon?: string;
  type: string;
  goal: number;
  current: number;
  unlocked: boolean;
  unlockedAt?: string;
  rewardPoints: number;
  rewardXp: number;
};

export type MissaoProgresso = {
  id: number;
  title: string;
  description: string;
  icon?: string;
  type: string;
  period: string;
  goal: number;
  progress: number;
  completed: boolean;
  completedAt?: string;
  rewardPoints: number;
  rewardXp: number;
};

export type PersonagemLoja = {
  id: number;
  key: string;
  name: string;
  description: string;
  tier: string;
  price: number;
  maxLevel: number;
  image: string;
  owned: boolean;
};

export type AlunoPersonagem = {
  personagemId: number;
  key: string;
  name: string;
  tier: string;
  level: number;
  maxLevel: number;
  answeredQuestions: number;
  nextLevelIn?: number | null;
  equipped: boolean;
  image: string;
};

export type PersonagemFeedback = {
  key: string;
  name: string;
  level: number;
  leveledUp: boolean;
  image: string;
};

export type DisciplinaProgresso = {
  id: number;
  name: string;
  acronym: string;
  area?: string;
  total: number;
  answered: number;
  available: number;
};
