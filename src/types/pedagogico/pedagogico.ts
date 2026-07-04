export type Disciplina = {
  id: number;
  name: string;
  acronym: string;
  area?: string;
};

export type Habilidade = {
  id: number;
  disciplinaId: number;
  code: string;
  description: string;
  stage?: string;
  year?: string;
  disciplina?: Disciplina;
};

export type QuestaoAlternativa = {
  id?: number;
  key?: string;
  text: string;
  correct?: boolean;
};

export type Questao = {
  id: number;
  schoolId?: number;
  teacherId?: number;
  statement: string;
  difficulty: "facil" | "media" | "dificil";
  points: number;
  status?: string;
  habilidades?: Habilidade[];
  alternatives?: QuestaoAlternativa[];
};

export type RespostaAluno = {
  id: number;
  questionId: number;
  alternativeId: number;
  correct: boolean;
  pointsEarned: number;
  xpEarned: number;
  energySpent: number;
  answeredAt?: string;
  statement?: string;
};
