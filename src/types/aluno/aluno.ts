export type Aluno = {
  id: number;
  schoolId: number;
  name: string;
  code: string;
};

export type ColegaAluno = Pick<Aluno, "id" | "name" | "code">;

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

export type DesafioStatus =
  | "pendente"
  | "em_andamento"
  | "finalizado"
  | "recusado"
  | "expirado";

export type DesafioTipo = "amistoso" | "valendo";

export type DesafioParticipante = {
  id: number;
  name: string;
  code: string;
};

export type Desafio = {
  id: number;
  type: DesafioTipo;
  status: DesafioStatus;
  disciplinaId?: number | null;
  totalQuestions: number;
  currentQuestion: number;
  winnerId?: number | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  challenger?: DesafioParticipante | null;
  challenged?: DesafioParticipante | null;
};

export type CriarDesafioPayload = {
  challengedId: number;
  disciplinaId?: number;
  type?: DesafioTipo;
  totalQuestions?: number;
};

export type DesafioQuestaoAtual = {
  challengeId: number;
  status: "em_andamento";
  order: number;
  total: number;
  seconds: number;
  startedAt?: string | null;
  expiresAt?: string | null;
  question: {
    id: number;
    statement: string;
    difficulty: "facil" | "media" | "dificil";
    alternatives: Array<{
      id: number;
      text: string;
    }>;
  };
  answeredByMe?: boolean;
  answeredByOpponent?: boolean;
};

export type DesafioResultado = {
  challengeId: number;
  status: Exclude<DesafioStatus, "em_andamento">;
  winnerId?: number | null;
  draw: boolean;
  scoreboard: {
    challenger: {
      alunoId: number;
      correct: number;
      totalTimeMs: number;
    };
    challenged: {
      alunoId: number;
      correct: number;
      totalTimeMs: number;
    };
  };
};

export type DesafioEstado = DesafioQuestaoAtual | DesafioResultado;
