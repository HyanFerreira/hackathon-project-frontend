export type Aluno = {
  id: number;
  schoolId: number;
  name: string;
  code: string;
  turmaId?: number;
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
  image?: string;
  avatar?: string;
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
  avatar?: string;
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
  avatar?: string;
};

export type PersonagemFeedback = {
  key: string;
  name: string;
  level: number;
  leveledUp: boolean;
  image: string;
  avatar?: string;
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

export type SessaoAoVivoStatus =
  | "aguardando"
  | "em_andamento"
  | "pausada"
  | "finalizada"
  | "cancelada";

export type SessaoAoVivoResumo = {
  id: number;
  title?: string | null;
  status: SessaoAoVivoStatus;
  turma?: {
    id?: number | null;
    name?: string | null;
    year?: string | null;
    shift?: string | null;
  } | null;
  professor?: {
    id?: number | null;
    name?: string | null;
  } | null;
  totalQuestions: number;
  startedAt?: string | null;
  pausedAt?: string | null;
  finishedAt?: string | null;
  teacherOnlineAt?: string | null;
  endReason?: string | null;
};

export type SessaoAoVivoQuestao = {
  id: number;
  questionId: number;
  order: number;
  sentAt?: string | null;
  closedAt?: string | null;
  question: {
    id: number;
    statement: string;
    difficulty: "facil" | "media" | "dificil";
    points: number;
    alternatives: Array<{
      id: number;
      text: string;
    }>;
  };
};

export type SessaoAoVivoRankingItem = {
  position: number;
  aluno: Aluno;
  answers: number;
  correct: number;
  points: number;
  xp: number;
  totalTimeMs: number;
  accuracy: number;
};

export type SessaoAoVivoPerformance = {
  totalStudents: number;
  participants: number;
  totalAnswers: number;
  currentQuestion: {
    answered: number;
    correct: number;
    pending: number;
  };
  ranking: SessaoAoVivoRankingItem[];
};

export type SessaoAoVivoProfessorEstado = {
  session: SessaoAoVivoResumo;
  currentQuestion?: SessaoAoVivoQuestao | null;
  performance: SessaoAoVivoPerformance;
};

export type SessaoAoVivoAlunoEstado = {
  session: SessaoAoVivoResumo;
  currentQuestion?: SessaoAoVivoQuestao | null;
  answeredByMe: boolean;
  myAnswer?: {
    alternativeId: number;
    correct: boolean;
    pointsEarned: number;
    xpEarned: number;
    answeredAt?: string | null;
  } | null;
  ranking: SessaoAoVivoRankingItem[];
};

export type CriarSessaoAoVivoPayload = {
  turmaId: number;
  title?: string;
  questionIds: number[];
};
