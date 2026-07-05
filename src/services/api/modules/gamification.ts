import type {
  Aluno,
  AlunoPersonagem,
  ColegaAluno,
  ConquistaProgresso,
  CriarDesafioPayload,
  CriarSessaoAoVivoPayload,
  Desafio,
  DesafioEstado,
  DesafioParticipante,
  DisciplinaProgresso,
  LoginStreakReward,
  MissaoProgresso,
  PerfilAluno,
  PersonagemFeedback,
  PersonagemLoja,
  RankingItem,
  SessaoAoVivoAlunoEstado,
  SessaoAoVivoPerformance,
  SessaoAoVivoProfessorEstado,
  SessaoAoVivoQuestao,
  SessaoAoVivoRankingItem,
  SessaoAoVivoResumo,
  SessaoAoVivoStatus,
} from "@/types/aluno";
import type {
  Disciplina,
  Habilidade,
  Questao,
  QuestaoAlternativa,
  RespostaAluno,
} from "@/types/pedagogico";
import type { Turma } from "@/types/turma";
import type { User } from "@/types/user";
import { api } from "../api";
import { gamificationEndpoints } from "../endpoints/gamificationEndpoints";
import { normalizeUser, type UserApi } from "./users";

type Collection<T> = { data: T[] };
type Resource<T> = { data: T };

type AlunoApi = {
  id: number;
  escola_id?: number;
  turma_id?: number;
  nome: string;
  codigo: string;
  personagem?: RankingCharacterApi | Resource<RankingCharacterApi> | null;
  personagem_atual?: RankingCharacterApi | Resource<RankingCharacterApi> | null;
  personagem_equipado?:
    | RankingCharacterApi
    | Resource<RankingCharacterApi>
    | null;
  personagemEquipado?:
    | RankingCharacterApi
    | Resource<RankingCharacterApi>
    | null;
};

type RankingCharacterApi = {
  avatar?: string;
  chave?: string;
  imagem?: string;
  key?: string;
  personagem?: RankingCharacterApi | Resource<RankingCharacterApi> | null;
};

type TurmaApi = {
  id: number;
  escola_id: number;
  nome: string;
  ano?: string;
  turno?: string;
  status?: string;
  professores?: UserApi[];
  alunos?: AlunoApi[];
};

type DisciplinaApi = {
  id: number;
  nome: string;
  sigla: string;
  area?: string;
};

type DisciplinaProgressoApi = DisciplinaApi & {
  total: number;
  respondidas: number;
  disponiveis: number;
};

type HabilidadeApi = {
  id: number;
  disciplina_id: number;
  codigo: string;
  descricao: string;
  etapa?: string;
  ano?: string;
  disciplina?: DisciplinaApi;
};

type QuestaoApi = {
  id: number;
  escola_id?: number;
  professor_id?: number;
  enunciado: string;
  dificuldade: "facil" | "media" | "dificil";
  pontos: number;
  status?: string;
  habilidades?: HabilidadeApi[];
  alternativas?: Array<{
    id?: number;
    texto: string;
    correta?: boolean;
  }>;
};

type PerfilAlunoApi = {
  pontos: number;
  pontuacao_total?: number;
  xp: number;
  nivel: number;
  xp_para_proximo_nivel?: number;
  energia: number;
  energia_maxima: number;
  streak?: {
    dias_seguidos: number;
    maior_dias_seguidos: number;
    ultimo_login_em?: string | null;
    proximo_bonus_em_dias: number;
  };
  aluno?: AlunoApi;
};

type RankingItemApi = {
  posicao: number;
  aluno: AlunoApi;
  pontos: number;
  xp: number;
  nivel: number;
  imagem?: string;
  avatar?: string;
  personagem?: RankingCharacterApi | Resource<RankingCharacterApi> | null;
  personagem_atual?: RankingCharacterApi | Resource<RankingCharacterApi> | null;
  personagem_equipado?:
    | RankingCharacterApi
    | Resource<RankingCharacterApi>
    | null;
  personagemEquipado?:
    | RankingCharacterApi
    | Resource<RankingCharacterApi>
    | null;
};

type RespostaAlunoApi = {
  id: number;
  questao_id: number;
  alternativa_id: number;
  correta: boolean;
  pontos_ganhos: number;
  xp_ganho: number;
  energia_gasta: number;
  respondido_em?: string;
  enunciado?: string;
};

type ResponderQuestaoApi = {
  correta?: boolean;
  mensagem?: string;
  gabarito?: {
    id?: number;
    alternativa_id?: number;
    texto?: string;
    text?: string;
  } | null;
  alternativa_correta?: {
    id?: number;
    alternativa_id?: number;
    texto?: string;
    text?: string;
  } | null;
  alternativa_correta_id?: number;
  pontos_ganhos?: number;
  xp_ganho?: number;
  energia_gasta?: number;
  conquistas_desbloqueadas?:
    | Collection<SimpleConquistaApi>
    | SimpleConquistaApi[];
  missoes_concluidas?: Collection<SimpleMissaoApi> | SimpleMissaoApi[];
  personagem?: PersonagemFeedbackApi | Resource<PersonagemFeedbackApi> | null;
  perfil?: Resource<PerfilAlunoApi> | PerfilAlunoApi;
};

type ComprarPersonagemApi = {
  message?: string;
  mensagem?: string;
  perfil?: Resource<PerfilAlunoApi> | PerfilAlunoApi;
  inventario?: Collection<AlunoPersonagemApi> | AlunoPersonagemApi[];
};

type ConquistaProgressoApi = {
  id: number;
  nome: string;
  descricao: string;
  icone?: string;
  tipo: string;
  meta: number;
  atual: number;
  desbloqueada: boolean;
  desbloqueada_em?: string;
  recompensa_pontos: number;
  recompensa_xp: number;
};

type MissaoProgressoApi = {
  id: number;
  titulo: string;
  descricao: string;
  icone?: string;
  tipo: string;
  periodo: string;
  meta: number;
  progresso: number;
  concluida: boolean;
  concluida_em?: string;
  recompensa_pontos: number;
  recompensa_xp: number;
};

type PersonagemLojaApi = {
  id: number;
  chave: string;
  nome: string;
  descricao: string;
  tier: string;
  preco: number;
  nivel_maximo: number;
  imagem: string;
  avatar?: string;
  ja_possui: boolean;
};

type AlunoPersonagemApi = {
  personagem_id: number;
  chave: string;
  nome: string;
  tier: string;
  nivel: number;
  nivel_maximo: number;
  questoes_respondidas: number;
  proximo_nivel_em?: number | null;
  equipado: boolean;
  imagem: string;
  avatar?: string;
};

type PersonagemFeedbackApi = {
  chave: string;
  nome: string;
  nivel: number;
  subiu_nivel: boolean;
  imagem: string;
  avatar?: string;
};

type SessaoAoVivoResumoApi = {
  id: number;
  titulo?: string | null;
  status: SessaoAoVivoStatus;
  turma?: {
    id?: number | null;
    nome?: string | null;
    ano?: string | null;
    turno?: string | null;
  } | null;
  professor?: {
    id?: number | null;
    nome?: string | null;
  } | null;
  questoes_total?: number;
  questao_ids?: number[];
  iniciada_em?: string | null;
  pausada_em?: string | null;
  finalizada_em?: string | null;
  professor_online_em?: string | null;
  motivo_encerramento?: string | null;
};

type SessaoAoVivoQuestaoApi = {
  id: number;
  questao_id: number;
  ordem: number;
  enviada_em?: string | null;
  encerrada_em?: string | null;
  questao: {
    id: number;
    enunciado: string;
    dificuldade: "facil" | "media" | "dificil";
    pontos: number;
    alternativas: Array<{
      id: number;
      texto: string;
    }>;
  };
};

type SessaoAoVivoRankingItemApi = {
  posicao: number;
  aluno: AlunoApi;
  respostas: number;
  acertos: number;
  pontos: number;
  xp: number;
  tempo_total_ms: number;
  percentual_acerto: number;
};

type SessaoAoVivoPerformanceApi = {
  alunos_total: number;
  participantes: number;
  respostas_total: number;
  questao_atual: {
    respondidas: number;
    corretas: number;
    pendentes: number;
  };
  ranking: SessaoAoVivoRankingItemApi[];
};

type SessaoAoVivoProfessorEstadoApi = {
  sessao: SessaoAoVivoResumoApi;
  questao_atual?: SessaoAoVivoQuestaoApi | null;
  desempenho: SessaoAoVivoPerformanceApi;
};

type SessaoAoVivoAlunoEstadoApi = {
  sessao: SessaoAoVivoResumoApi;
  questao_atual?: SessaoAoVivoQuestaoApi | null;
  eu_respondi: boolean;
  minha_resposta?: {
    alternativa_id: number;
    correta: boolean;
    pontos_ganhos: number;
    xp_ganho: number;
    respondido_em?: string | null;
  } | null;
  ranking: SessaoAoVivoRankingItemApi[];
};

type DesafioParticipanteApi = {
  id: number;
  nome: string;
  codigo: string;
};

type DesafioApi = {
  id: number;
  tipo: "amistoso" | "valendo";
  status: "pendente" | "em_andamento" | "finalizado" | "recusado" | "expirado";
  disciplina_id?: number | null;
  quantidade_questoes: number;
  questao_atual: number;
  vencedor_id?: number | null;
  iniciado_em?: string | null;
  finalizado_em?: string | null;
  desafiante?: DesafioParticipanteApi | null;
  desafiado?: DesafioParticipanteApi | null;
};

type DesafioEstadoApi =
  | {
      desafio_id: number;
      status: "em_andamento";
      ordem: number;
      total: number;
      segundos: number;
      iniciada_em?: string | null;
      expira_em?: string | null;
      questao: {
        id: number;
        enunciado: string;
        dificuldade: "facil" | "media" | "dificil";
        alternativas: Array<{
          id: number;
          texto: string;
        }>;
      };
      eu_respondi?: boolean;
      oponente_respondeu?: boolean;
    }
  | {
      desafio_id: number;
      status: "pendente" | "finalizado" | "recusado" | "expirado";
      vencedor_id?: number | null;
      empate: boolean;
      placar: {
        desafiante: {
          aluno_id: number;
          acertos: number;
          tempo_total_ms: number;
        };
        desafiado: {
          aluno_id: number;
          acertos: number;
          tempo_total_ms: number;
        };
      };
    };

type SimpleConquistaApi = {
  id: number;
  nome: string;
  descricao: string;
  icone?: string;
  tipo: string;
  meta: number;
  recompensa_pontos: number;
  recompensa_xp: number;
};

type SimpleMissaoApi = {
  id: number;
  titulo: string;
  descricao: string;
  icone?: string;
  tipo: string;
  periodo: string;
  meta: number;
  recompensa_pontos: number;
  recompensa_xp: number;
};

export type DashboardSummary =
  | {
      kind: "admin";
      escolas: number;
      gestores: number;
      professores: number;
      alunos: number;
    }
  | { kind: "gestor"; turmas: number; professores: number; alunos: number }
  | {
      kind: "professor";
      minhas_turmas: number;
      alunos: number;
      questoes: number;
      ultimas_questoes: Array<{
        id: number;
        enunciado: string;
        dificuldade: string;
        created_at?: string;
      }>;
    }
  | {
      kind: "aluno";
      aluno: { id: number; nome: string; codigo: string };
      turma?: { id: number; nome: string };
      perfil: {
        pontos: number;
        pontuacao_total?: number;
        xp: number;
        nivel: number;
        energia: number;
        energia_maxima: number;
        streak?: {
          dias_seguidos: number;
          maior_dias_seguidos: number;
          ultimo_login_em?: string | null;
          proximo_bonus_em_dias: number;
        };
      };
      posicao_turma?: number | null;
    };

export type DesempenhoResumo = {
  turmas: number;
  alunos: number;
  alunos_ativos: number;
  respostas: number;
  acertos: number;
  taxa_acerto: number;
  professores?: number;
  questoes_criadas?: number;
};

export type DesempenhoTurma = {
  turma_id: number;
  nome: string;
  alunos: number;
  respostas: number;
  taxa_acerto: number;
};

export type DesempenhoHabilidade = {
  codigo: string;
  descricao: string;
  disciplina: string;
  respostas: number;
  acertos: number;
  taxa_acerto: number;
};

export type DesempenhoDisciplina = {
  id: number;
  nome: string;
  respostas: number;
  taxa_acerto: number;
};

export type AlunoComDificuldade = {
  id: number;
  nome: string;
  respostas: number;
  taxa_acerto: number;
};

export type ProfessorDesempenho = {
  resumo: DesempenhoResumo;
  por_turma: DesempenhoTurma[];
  habilidades_dificeis: DesempenhoHabilidade[];
  disciplinas: DesempenhoDisciplina[];
  questoes_mais_erradas: Array<{
    id: number;
    enunciado: string;
    respostas: number;
    acertos: number;
    taxa_acerto: number;
  }>;
  alunos_com_dificuldade: AlunoComDificuldade[];
};

export type GestorDesempenho = {
  resumo: DesempenhoResumo;
  por_turma: DesempenhoTurma[];
  habilidades_dificeis: DesempenhoHabilidade[];
  disciplinas: DesempenhoDisciplina[];
  professores_ativos: Array<{
    id: number;
    nome: string;
    questoes: number;
  }>;
  top_alunos: Array<{
    id: number;
    nome: string;
    pontuacao: number;
    nivel: number;
  }>;
  alunos_com_dificuldade: AlunoComDificuldade[];
};

export type CreateTurmaPayload = {
  nome: string;
  ano?: string;
  turno?: string;
  status?: string;
};

export type CreateProfessorPayload = {
  name: string;
  cpf: string;
  email: string;
  password: string;
};

export type CreateAlunoPayload = {
  nome: string;
};

export type CreateQuestaoPayload = {
  enunciado: string;
  dificuldade: string;
  pontos: number;
  status: string;
  habilidades: number[];
  alternativas: Array<{ texto: string; correta: boolean }>;
};

export function normalizeAluno(aluno: AlunoApi): Aluno {
  return {
    id: aluno.id,
    schoolId: aluno.escola_id ?? 0,
    name: aluno.nome,
    code: aluno.codigo,
    turmaId: aluno.turma_id,
  };
}

function normalizeColega(aluno: AlunoApi): ColegaAluno {
  return {
    id: aluno.id,
    name: aluno.nome,
    code: aluno.codigo,
  };
}

export function normalizeTurma(turma: TurmaApi): Turma {
  return {
    id: turma.id,
    schoolId: turma.escola_id,
    name: turma.nome,
    year: turma.ano,
    shift: turma.turno,
    status: turma.status,
    teachers: turma.professores?.map(normalizeUser),
    students: turma.alunos?.map(normalizeAluno),
  };
}

export function normalizeDisciplina(disciplina: DisciplinaApi): Disciplina {
  return {
    id: disciplina.id,
    name: disciplina.nome,
    acronym: disciplina.sigla,
    area: disciplina.area,
  };
}

function normalizeDisciplinaProgresso(
  disciplina: DisciplinaProgressoApi,
): DisciplinaProgresso {
  return {
    id: disciplina.id,
    name: disciplina.nome,
    acronym: disciplina.sigla,
    area: disciplina.area,
    total: disciplina.total,
    answered: disciplina.respondidas,
    available: disciplina.disponiveis,
  };
}

export function normalizeHabilidade(habilidade: HabilidadeApi): Habilidade {
  return {
    id: habilidade.id,
    disciplinaId: habilidade.disciplina_id,
    code: habilidade.codigo,
    description: habilidade.descricao,
    stage: habilidade.etapa,
    year: habilidade.ano,
    disciplina: habilidade.disciplina
      ? normalizeDisciplina(habilidade.disciplina)
      : undefined,
  };
}

export function normalizeQuestao(questao: QuestaoApi): Questao {
  return {
    id: questao.id,
    schoolId: questao.escola_id,
    teacherId: questao.professor_id,
    statement: questao.enunciado,
    difficulty: questao.dificuldade,
    points: questao.pontos,
    status: questao.status,
    habilidades: questao.habilidades?.map(normalizeHabilidade),
    alternatives: questao.alternativas?.map((alternativa) => ({
      id: alternativa.id,
      text: alternativa.texto,
      correct: alternativa.correta,
    })),
  };
}

export function normalizePerfil(perfil: PerfilAlunoApi): PerfilAluno {
  return {
    points: perfil.pontos,
    totalPoints: perfil.pontuacao_total ?? perfil.pontos,
    xp: perfil.xp,
    level: perfil.nivel,
    xpToNextLevel: perfil.xp_para_proximo_nivel,
    energy: perfil.energia,
    maxEnergy: perfil.energia_maxima,
    streak: {
      currentDays: perfil.streak?.dias_seguidos ?? 0,
      longestDays: perfil.streak?.maior_dias_seguidos ?? 0,
      lastLoginAt: perfil.streak?.ultimo_login_em,
      daysUntilNextBonus: perfil.streak?.proximo_bonus_em_dias ?? 7,
    },
    aluno: perfil.aluno ? normalizeAluno(perfil.aluno) : undefined,
  };
}

function normalizeRankingItem(item: RankingItemApi): RankingItem {
  const personagem = getRankingCharacter(item);

  return {
    position: item.posicao,
    aluno: normalizeAluno(item.aluno),
    points: item.pontos,
    xp: item.xp,
    level: item.nivel,
    image:
      item.imagem ?? personagem?.imagem ?? personagem?.chave ?? personagem?.key,
    avatar:
      item.avatar ?? personagem?.avatar ?? personagem?.chave ?? personagem?.key,
  };
}

function getRankingCharacter(item: RankingItemApi) {
  const candidates = [
    item.personagem,
    item.personagem_atual,
    item.personagem_equipado,
    item.personagemEquipado,
    item.aluno.personagem,
    item.aluno.personagem_atual,
    item.aluno.personagem_equipado,
    item.aluno.personagemEquipado,
  ];

  for (const candidate of candidates) {
    const character = unwrapRankingCharacter(candidate);

    if (
      character?.avatar ||
      character?.imagem ||
      character?.chave ||
      character?.key
    ) {
      return character;
    }
  }

  return undefined;
}

function unwrapRankingCharacter(
  value?: RankingCharacterApi | Resource<RankingCharacterApi> | null,
): RankingCharacterApi | undefined {
  const character = unwrapResource(value ?? undefined);
  const nestedCharacter = unwrapResource(character?.personagem ?? undefined);

  return nestedCharacter ?? character;
}

function normalizeResposta(resposta: RespostaAlunoApi): RespostaAluno {
  return {
    id: resposta.id,
    questionId: resposta.questao_id,
    alternativeId: resposta.alternativa_id,
    correct: resposta.correta,
    pointsEarned: resposta.pontos_ganhos,
    xpEarned: resposta.xp_ganho,
    energySpent: resposta.energia_gasta,
    answeredAt: resposta.respondido_em,
    statement: resposta.enunciado,
  };
}

function unwrapCollection<T>(value?: Collection<T> | T[]) {
  if (!value) return [];

  return Array.isArray(value) ? value : value.data;
}

function isResource<T>(value: Resource<T> | T): value is Resource<T> {
  return typeof value === "object" && value !== null && "data" in value;
}

function unwrapResource<T>(value?: Resource<T> | T): T | undefined {
  if (!value) return undefined;

  return isResource(value) ? value.data : value;
}

function normalizeConquista(
  conquista: ConquistaProgressoApi,
): ConquistaProgresso {
  const unlocked = conquista.desbloqueada || conquista.atual >= conquista.meta;

  return {
    id: conquista.id,
    name: conquista.nome,
    description: conquista.descricao,
    icon: conquista.icone,
    type: conquista.tipo,
    goal: conquista.meta,
    current: conquista.atual,
    unlocked,
    unlockedAt: conquista.desbloqueada_em,
    rewardPoints: conquista.recompensa_pontos,
    rewardXp: conquista.recompensa_xp,
  };
}

function normalizeMissao(missao: MissaoProgressoApi): MissaoProgresso {
  return {
    id: missao.id,
    title: missao.titulo,
    description: missao.descricao,
    icon: missao.icone,
    type: missao.tipo,
    period: missao.periodo,
    goal: missao.meta,
    progress: missao.progresso,
    completed: missao.concluida,
    completedAt: missao.concluida_em,
    rewardPoints: missao.recompensa_pontos,
    rewardXp: missao.recompensa_xp,
  };
}

function normalizeLojaPersonagem(
  personagem: PersonagemLojaApi,
): PersonagemLoja {
  return {
    id: personagem.id,
    key: personagem.chave,
    name: personagem.nome,
    description: personagem.descricao,
    tier: personagem.tier,
    price: personagem.preco,
    maxLevel: personagem.nivel_maximo,
    image: personagem.imagem,
    avatar: personagem.avatar,
    owned: personagem.ja_possui,
  };
}

function normalizeAlunoPersonagem(
  personagem: AlunoPersonagemApi,
): AlunoPersonagem {
  return {
    personagemId: personagem.personagem_id,
    key: personagem.chave,
    name: personagem.nome,
    tier: personagem.tier,
    level: personagem.nivel,
    maxLevel: personagem.nivel_maximo,
    answeredQuestions: personagem.questoes_respondidas,
    nextLevelIn: personagem.proximo_nivel_em,
    equipped: personagem.equipado,
    image: personagem.imagem,
    avatar: personagem.avatar,
  };
}

function normalizePersonagemFeedback(
  personagem: PersonagemFeedbackApi,
): PersonagemFeedback {
  return {
    key: personagem.chave,
    name: personagem.nome,
    level: personagem.nivel,
    leveledUp: personagem.subiu_nivel,
    image: personagem.imagem,
    avatar: personagem.avatar,
  };
}

function normalizeSessaoResumo(
  sessao: SessaoAoVivoResumoApi,
): SessaoAoVivoResumo {
  return {
    id: sessao.id,
    title: sessao.titulo,
    status: sessao.status,
    turma: sessao.turma
      ? {
          id: sessao.turma.id,
          name: sessao.turma.nome,
          year: sessao.turma.ano,
          shift: sessao.turma.turno,
        }
      : null,
    professor: sessao.professor
      ? {
          id: sessao.professor.id,
          name: sessao.professor.nome,
        }
      : null,
    totalQuestions: sessao.questoes_total ?? 0,
    questionIds: sessao.questao_ids ?? [],
    startedAt: sessao.iniciada_em,
    pausedAt: sessao.pausada_em,
    finishedAt: sessao.finalizada_em,
    teacherOnlineAt: sessao.professor_online_em,
    endReason: sessao.motivo_encerramento,
  };
}

function normalizeSessaoQuestao(
  questao?: SessaoAoVivoQuestaoApi | null,
): SessaoAoVivoQuestao | null {
  if (!questao) return null;

  return {
    id: questao.id,
    questionId: questao.questao_id,
    order: questao.ordem,
    sentAt: questao.enviada_em,
    closedAt: questao.encerrada_em,
    question: {
      id: questao.questao.id,
      statement: questao.questao.enunciado,
      difficulty: questao.questao.dificuldade,
      points: questao.questao.pontos,
      alternatives: questao.questao.alternativas.map((alternativa) => ({
        id: alternativa.id,
        text: alternativa.texto,
      })),
    },
  };
}

function normalizeSessaoRankingItem(
  item: SessaoAoVivoRankingItemApi,
): SessaoAoVivoRankingItem {
  return {
    position: item.posicao,
    aluno: normalizeAluno(item.aluno),
    answers: item.respostas,
    correct: item.acertos,
    points: item.pontos,
    xp: item.xp,
    totalTimeMs: item.tempo_total_ms,
    accuracy: item.percentual_acerto,
  };
}

function normalizeSessaoPerformance(
  desempenho: SessaoAoVivoPerformanceApi,
): SessaoAoVivoPerformance {
  return {
    totalStudents: desempenho.alunos_total,
    participants: desempenho.participantes,
    totalAnswers: desempenho.respostas_total,
    currentQuestion: {
      answered: desempenho.questao_atual.respondidas,
      correct: desempenho.questao_atual.corretas,
      pending: desempenho.questao_atual.pendentes,
    },
    ranking: desempenho.ranking.map(normalizeSessaoRankingItem),
  };
}

function normalizeSessaoProfessorEstado(
  estado: SessaoAoVivoProfessorEstadoApi,
): SessaoAoVivoProfessorEstado {
  return {
    session: normalizeSessaoResumo(estado.sessao),
    currentQuestion: normalizeSessaoQuestao(estado.questao_atual),
    performance: normalizeSessaoPerformance(estado.desempenho),
  };
}

function normalizeSessaoAlunoEstado(
  estado: SessaoAoVivoAlunoEstadoApi,
): SessaoAoVivoAlunoEstado {
  return {
    session: normalizeSessaoResumo(estado.sessao),
    currentQuestion: normalizeSessaoQuestao(estado.questao_atual),
    answeredByMe: estado.eu_respondi,
    myAnswer: estado.minha_resposta
      ? {
          alternativeId: estado.minha_resposta.alternativa_id,
          correct: estado.minha_resposta.correta,
          pointsEarned: estado.minha_resposta.pontos_ganhos,
          xpEarned: estado.minha_resposta.xp_ganho,
          answeredAt: estado.minha_resposta.respondido_em,
        }
      : null,
    ranking: estado.ranking.map(normalizeSessaoRankingItem),
  };
}

function normalizeDesafioParticipante(
  participante?: DesafioParticipanteApi | null,
): DesafioParticipante | null {
  if (!participante) return null;

  return {
    id: participante.id,
    name: participante.nome,
    code: participante.codigo,
  };
}

function normalizeDesafio(desafio: DesafioApi): Desafio {
  return {
    id: desafio.id,
    type: desafio.tipo,
    status: desafio.status,
    disciplinaId: desafio.disciplina_id,
    totalQuestions: desafio.quantidade_questoes,
    currentQuestion: desafio.questao_atual,
    winnerId: desafio.vencedor_id,
    startedAt: desafio.iniciado_em,
    finishedAt: desafio.finalizado_em,
    challenger: normalizeDesafioParticipante(desafio.desafiante),
    challenged: normalizeDesafioParticipante(desafio.desafiado),
  };
}

function normalizeDesafioEstado(estado: DesafioEstadoApi): DesafioEstado {
  if (estado.status === "em_andamento") {
    return {
      challengeId: estado.desafio_id,
      status: estado.status,
      order: estado.ordem,
      total: estado.total,
      seconds: estado.segundos,
      startedAt: estado.iniciada_em,
      expiresAt: estado.expira_em,
      question: {
        id: estado.questao.id,
        statement: estado.questao.enunciado,
        difficulty: estado.questao.dificuldade,
        alternatives: estado.questao.alternativas.map((alternativa) => ({
          id: alternativa.id,
          text: alternativa.texto,
        })),
      },
      answeredByMe: estado.eu_respondi,
      answeredByOpponent: estado.oponente_respondeu,
    };
  }

  return {
    challengeId: estado.desafio_id,
    status: estado.status,
    winnerId: estado.vencedor_id,
    draw: estado.empate,
    scoreboard: {
      challenger: {
        alunoId: estado.placar.desafiante.aluno_id,
        correct: estado.placar.desafiante.acertos,
        totalTimeMs: estado.placar.desafiante.tempo_total_ms,
      },
      challenged: {
        alunoId: estado.placar.desafiado.aluno_id,
        correct: estado.placar.desafiado.acertos,
        totalTimeMs: estado.placar.desafiado.tempo_total_ms,
      },
    },
  };
}

function normalizeSimpleConquista(
  conquista: SimpleConquistaApi,
): ConquistaProgresso {
  return {
    id: conquista.id,
    name: conquista.nome,
    description: conquista.descricao,
    icon: conquista.icone,
    type: conquista.tipo,
    goal: conquista.meta,
    current: conquista.meta,
    unlocked: true,
    rewardPoints: conquista.recompensa_pontos,
    rewardXp: conquista.recompensa_xp,
  };
}

function normalizeSimpleMissao(missao: SimpleMissaoApi): MissaoProgresso {
  return {
    id: missao.id,
    title: missao.titulo,
    description: missao.descricao,
    icon: missao.icone,
    type: missao.tipo,
    period: missao.periodo,
    goal: missao.meta,
    progress: missao.meta,
    completed: true,
    rewardPoints: missao.recompensa_pontos,
    rewardXp: missao.recompensa_xp,
  };
}

export const gamificationApi = {
  async loginAluno(
    codigo: string,
  ): Promise<{ aluno: Aluno; token: string; streak?: LoginStreakReward }> {
    const { data } = await api.post<{
      aluno: Resource<AlunoApi> | AlunoApi;
      token: string;
      streak?: {
        dias_seguidos: number;
        maior_dias_seguidos: number;
        ultimo_login_em?: string | null;
        atualizado: boolean;
        pontos_ganhos: number;
        bonus_semanal: boolean;
        proximo_bonus_em_dias: number;
        mensagem?: string | null;
      };
    }>(gamificationEndpoints.alunoLogin, { codigo });

    const aluno = "data" in data.aluno ? data.aluno.data : data.aluno;

    return {
      aluno: normalizeAluno(aluno),
      token: data.token,
      streak: data.streak
        ? {
            currentDays: data.streak.dias_seguidos,
            longestDays: data.streak.maior_dias_seguidos,
            lastLoginAt: data.streak.ultimo_login_em,
            daysUntilNextBonus: data.streak.proximo_bonus_em_dias,
            updated: data.streak.atualizado,
            pointsEarned: data.streak.pontos_ganhos,
            weeklyBonus: data.streak.bonus_semanal,
            message: data.streak.mensagem,
          }
        : undefined,
    };
  },

  async alunoMe(): Promise<Aluno> {
    const { data } = await api.get<Resource<AlunoApi>>(
      gamificationEndpoints.alunoMe,
    );

    return normalizeAluno(data.data);
  },

  async adminDashboard(): Promise<DashboardSummary> {
    const { data } = await api.get<Omit<DashboardSummary, "kind">>(
      gamificationEndpoints.adminDashboard,
    );

    return { kind: "admin", ...data } as DashboardSummary;
  },

  async gestorDashboard(): Promise<DashboardSummary> {
    const { data } = await api.get<Omit<DashboardSummary, "kind">>(
      gamificationEndpoints.gestorDashboard,
    );

    return { kind: "gestor", ...data } as DashboardSummary;
  },

  async professorDashboard(): Promise<DashboardSummary> {
    const { data } = await api.get<Omit<DashboardSummary, "kind">>(
      gamificationEndpoints.professorDashboard,
    );

    return { kind: "professor", ...data } as DashboardSummary;
  },

  async professorDesempenho(): Promise<ProfessorDesempenho> {
    const { data } = await api.get<ProfessorDesempenho>(
      gamificationEndpoints.professorDesempenho,
    );

    return data;
  },

  async gestorDesempenho(): Promise<GestorDesempenho> {
    const { data } = await api.get<GestorDesempenho>(
      gamificationEndpoints.gestorDesempenho,
    );

    return data;
  },

  async professorTurmas(): Promise<Turma[]> {
    const { data } = await api.get<Collection<TurmaApi>>(
      gamificationEndpoints.professorTurmas,
    );

    return data.data.map(normalizeTurma);
  },

  async alunoDashboard(): Promise<DashboardSummary> {
    const { data } = await api.get<Omit<DashboardSummary, "kind">>(
      gamificationEndpoints.alunoDashboard,
    );

    return { kind: "aluno", ...data } as DashboardSummary;
  },

  async turmas(): Promise<Turma[]> {
    const { data } = await api.get<Collection<TurmaApi>>(
      gamificationEndpoints.gestorTurmas,
    );

    return data.data.map(normalizeTurma);
  },

  async turma(id: number): Promise<Turma> {
    const { data } = await api.get<Resource<TurmaApi>>(
      gamificationEndpoints.gestorTurma(id),
    );

    return normalizeTurma(data.data);
  },

  async saveTurma(payload: CreateTurmaPayload, id?: number): Promise<Turma> {
    const request = id
      ? api.put<Resource<TurmaApi>>(
          gamificationEndpoints.gestorTurma(id),
          payload,
        )
      : api.post<Resource<TurmaApi>>(
          gamificationEndpoints.gestorTurmas,
          payload,
        );
    const { data } = await request;

    return normalizeTurma(data.data);
  },

  async removeTurma(id: number): Promise<void> {
    await api.delete(gamificationEndpoints.gestorTurma(id));
  },

  async professores(): Promise<User[]> {
    const { data } = await api.get<Collection<UserApi>>(
      gamificationEndpoints.gestorProfessores,
    );

    return data.data.map(normalizeUser);
  },

  async saveProfessor(
    payload: Partial<CreateProfessorPayload>,
    id?: number,
  ): Promise<User> {
    const request = id
      ? api.put<Resource<UserApi>>(
          gamificationEndpoints.gestorProfessor(id),
          payload,
        )
      : api.post<Resource<UserApi>>(
          gamificationEndpoints.gestorProfessores,
          payload,
        );
    const { data } = await request;

    return normalizeUser(data.data);
  },

  async removeProfessor(id: number): Promise<void> {
    await api.delete(gamificationEndpoints.gestorProfessor(id));
  },

  async alunos(): Promise<Aluno[]> {
    const { data } = await api.get<Collection<AlunoApi>>(
      gamificationEndpoints.gestorAlunos,
    );

    return data.data.map(normalizeAluno);
  },

  async saveAluno(payload: CreateAlunoPayload, id?: number): Promise<Aluno> {
    const request = id
      ? api.put<Resource<AlunoApi>>(
          gamificationEndpoints.gestorAluno(id),
          payload,
        )
      : api.post<Resource<AlunoApi>>(
          gamificationEndpoints.gestorAlunos,
          payload,
        );
    const { data } = await request;

    return normalizeAluno(data.data);
  },

  async removeAluno(id: number): Promise<void> {
    await api.delete(gamificationEndpoints.gestorAluno(id));
  },

  async vincularProfessor(turmaId: number, professorId: number): Promise<void> {
    await api.post(gamificationEndpoints.vincularProfessor(turmaId), {
      professor_id: professorId,
    });
  },

  async desvincularProfessor(
    turmaId: number,
    professorId: number,
  ): Promise<void> {
    await api.delete(
      gamificationEndpoints.desvincularProfessor(turmaId, professorId),
    );
  },

  async vincularAluno(turmaId: number, alunoId: number): Promise<void> {
    await api.post(gamificationEndpoints.vincularAluno(turmaId), {
      aluno_id: alunoId,
    });
  },

  async desvincularAluno(turmaId: number, alunoId: number): Promise<void> {
    await api.delete(gamificationEndpoints.desvincularAluno(turmaId, alunoId));
  },

  async disciplinas(): Promise<Disciplina[]> {
    const { data } = await api.get<Collection<DisciplinaApi>>(
      gamificationEndpoints.disciplinas,
    );

    return data.data.map(normalizeDisciplina);
  },

  async habilidades(params?: {
    disciplina_id?: number;
    ano?: string;
    busca?: string;
  }): Promise<Habilidade[]> {
    const { data } = await api.get<Collection<HabilidadeApi>>(
      gamificationEndpoints.habilidades,
      { params },
    );

    return data.data.map(normalizeHabilidade);
  },

  async professorQuestoes(): Promise<Questao[]> {
    const { data } = await api.get<Collection<QuestaoApi>>(
      gamificationEndpoints.professorQuestoes,
    );

    return data.data.map(normalizeQuestao);
  },

  async saveQuestao(
    payload: CreateQuestaoPayload,
    id?: number,
  ): Promise<Questao> {
    const request = id
      ? api.put<Resource<QuestaoApi>>(
          gamificationEndpoints.professorQuestao(id),
          payload,
        )
      : api.post<Resource<QuestaoApi>>(
          gamificationEndpoints.professorQuestoes,
          payload,
        );
    const { data } = await request;

    return normalizeQuestao(data.data);
  },

  async removeQuestao(id: number): Promise<void> {
    await api.delete(gamificationEndpoints.professorQuestao(id));
  },

  async professorSessoesAoVivo(): Promise<SessaoAoVivoResumo[]> {
    const { data } = await api.get<Collection<SessaoAoVivoResumoApi>>(
      gamificationEndpoints.professorSessoesAoVivo,
    );

    return data.data.map(normalizeSessaoResumo);
  },

  async criarSessaoAoVivo(
    payload: CriarSessaoAoVivoPayload,
  ): Promise<SessaoAoVivoProfessorEstado> {
    const { data } = await api.post<SessaoAoVivoProfessorEstadoApi>(
      gamificationEndpoints.professorSessoesAoVivo,
      {
        turma_id: payload.turmaId,
        titulo: payload.title,
      },
    );

    return normalizeSessaoProfessorEstado(data);
  },

  async professorSessaoAoVivo(
    id: number,
  ): Promise<SessaoAoVivoProfessorEstado> {
    const { data } = await api.get<SessaoAoVivoProfessorEstadoApi>(
      gamificationEndpoints.professorSessaoAoVivo(id),
    );

    return normalizeSessaoProfessorEstado(data);
  },

  async iniciarSessaoAoVivo(id: number): Promise<SessaoAoVivoProfessorEstado> {
    const { data } = await api.post<SessaoAoVivoProfessorEstadoApi>(
      gamificationEndpoints.professorIniciarSessaoAoVivo(id),
    );

    return normalizeSessaoProfessorEstado(data);
  },

  async pausarSessaoAoVivo(id: number): Promise<SessaoAoVivoProfessorEstado> {
    const { data } = await api.post<SessaoAoVivoProfessorEstadoApi>(
      gamificationEndpoints.professorPausarSessaoAoVivo(id),
    );

    return normalizeSessaoProfessorEstado(data);
  },

  async retomarSessaoAoVivo(id: number): Promise<SessaoAoVivoProfessorEstado> {
    const { data } = await api.post<SessaoAoVivoProfessorEstadoApi>(
      gamificationEndpoints.professorRetomarSessaoAoVivo(id),
    );

    return normalizeSessaoProfessorEstado(data);
  },

  async heartbeatSessaoAoVivo(
    id: number,
  ): Promise<SessaoAoVivoProfessorEstado> {
    const { data } = await api.post<SessaoAoVivoProfessorEstadoApi>(
      gamificationEndpoints.professorHeartbeatSessaoAoVivo(id),
    );

    return normalizeSessaoProfessorEstado(data);
  },

  async encerrarSessaoAoVivo(id: number): Promise<SessaoAoVivoProfessorEstado> {
    const { data } = await api.post<SessaoAoVivoProfessorEstadoApi>(
      gamificationEndpoints.professorEncerrarSessaoAoVivo(id),
    );

    return normalizeSessaoProfessorEstado(data);
  },

  async proximaQuestaoSessaoAoVivo(
    id: number,
  ): Promise<SessaoAoVivoProfessorEstado> {
    const { data } = await api.post<SessaoAoVivoProfessorEstadoApi>(
      gamificationEndpoints.professorProximaSessaoAoVivo(id),
    );

    return normalizeSessaoProfessorEstado(data);
  },

  async enviarQuestaoSessaoAoVivo(
    sessionId: number,
    questionId: number,
  ): Promise<SessaoAoVivoProfessorEstado> {
    const { data } = await api.post<SessaoAoVivoProfessorEstadoApi>(
      gamificationEndpoints.professorEnviarQuestaoSessaoAoVivo(
        sessionId,
        questionId,
      ),
    );

    return normalizeSessaoProfessorEstado(data);
  },

  async alunoPerfil(): Promise<PerfilAluno> {
    const { data } = await api.get<Resource<PerfilAlunoApi>>(
      gamificationEndpoints.alunoPerfil,
    );

    return normalizePerfil(data.data);
  },

  async alunoDisciplinas(): Promise<DisciplinaProgresso[]> {
    const { data } = await api.get<Collection<DisciplinaProgressoApi>>(
      gamificationEndpoints.alunoDisciplinas,
    );

    return data.data.map(normalizeDisciplinaProgresso);
  },

  async alunoQuestoes(params?: {
    disciplinaId?: number;
    aleatorio?: boolean;
    limite?: number;
  }): Promise<Questao[]> {
    const { data } = await api.get<Collection<QuestaoApi>>(
      gamificationEndpoints.alunoQuestoes,
      {
        params: {
          ...(params?.disciplinaId
            ? { disciplina_id: params.disciplinaId }
            : {}),
          ...(params?.aleatorio ? { aleatorio: true } : {}),
          ...(params?.limite ? { limite: params.limite } : {}),
        },
      },
    );

    return data.data.map(normalizeQuestao);
  },

  async responderQuestao(
    questaoId: number,
    alternativaId: number,
  ): Promise<{
    correta: boolean;
    mensagem: string;
    gabarito: QuestaoAlternativa;
    pontos_ganhos: number;
    xp_ganho: number;
    energia_gasta: number;
    conquistas_desbloqueadas: ConquistaProgresso[];
    missoes_concluidas: MissaoProgresso[];
    personagem?: PersonagemFeedback | null;
    perfil: PerfilAluno;
  }> {
    const { data } = await api.post<ResponderQuestaoApi>(
      gamificationEndpoints.alunoResponder(questaoId),
      {
        alternativa_id: alternativaId,
      },
    );

    const gabarito = data.gabarito ?? data.alternativa_correta;
    const correctAlternativeId =
      gabarito?.id ?? gabarito?.alternativa_id ?? data.alternativa_correta_id;
    const perfil = unwrapResource(data.perfil);
    const personagem = unwrapResource(data.personagem ?? undefined);

    if (correctAlternativeId === undefined) {
      throw new Error("A resposta da API nao informou o gabarito da questao.");
    }

    if (!perfil) {
      throw new Error("A resposta da API nao informou o perfil atualizado.");
    }

    return {
      correta: Boolean(data.correta),
      mensagem:
        data.mensagem ??
        (data.correta ? "Resposta correta!" : "Resposta incorreta."),
      gabarito: {
        id: correctAlternativeId,
        text: gabarito?.texto ?? gabarito?.text ?? "Alternativa correta",
      },
      pontos_ganhos: data.pontos_ganhos ?? 0,
      xp_ganho: data.xp_ganho ?? 0,
      energia_gasta: data.energia_gasta ?? 0,
      conquistas_desbloqueadas: unwrapCollection(
        data.conquistas_desbloqueadas,
      ).map(normalizeSimpleConquista),
      missoes_concluidas: unwrapCollection(data.missoes_concluidas).map(
        normalizeSimpleMissao,
      ),
      personagem: personagem ? normalizePersonagemFeedback(personagem) : null,
      perfil: normalizePerfil(perfil),
    };
  },

  async respostas(): Promise<RespostaAluno[]> {
    const { data } = await api.get<Collection<RespostaAlunoApi>>(
      gamificationEndpoints.alunoRespostas,
    );

    return data.data.map(normalizeResposta);
  },

  async rankingAlunoTurma(): Promise<RankingItem[]> {
    const { data } = await api.get<Collection<RankingItemApi>>(
      gamificationEndpoints.alunoRankingTurma,
    );

    return data.data.map(normalizeRankingItem);
  },

  async rankingAlunoEscola(): Promise<RankingItem[]> {
    const { data } = await api.get<Collection<RankingItemApi>>(
      gamificationEndpoints.alunoRankingEscola,
    );

    return data.data.map(normalizeRankingItem);
  },

  async rankingGestorEscola(): Promise<RankingItem[]> {
    const { data } = await api.get<Collection<RankingItemApi>>(
      gamificationEndpoints.gestorRankingEscola,
    );

    return data.data.map(normalizeRankingItem);
  },

  async rankingGestorTurma(turmaId: number): Promise<RankingItem[]> {
    const { data } = await api.get<Collection<RankingItemApi>>(
      gamificationEndpoints.gestorRankingTurma(turmaId),
    );

    return data.data.map(normalizeRankingItem);
  },

  async rankingProfessorTurma(turmaId: number): Promise<RankingItem[]> {
    const { data } = await api.get<Collection<RankingItemApi>>(
      gamificationEndpoints.professorRankingTurma(turmaId),
    );

    return data.data.map(normalizeRankingItem);
  },

  async conquistas(): Promise<ConquistaProgresso[]> {
    const { data } = await api.get<Collection<ConquistaProgressoApi>>(
      gamificationEndpoints.alunoConquistas,
    );

    return data.data.map(normalizeConquista);
  },

  async missoes(): Promise<MissaoProgresso[]> {
    const { data } = await api.get<Collection<MissaoProgressoApi>>(
      gamificationEndpoints.alunoMissoes,
    );

    return data.data.map(normalizeMissao);
  },

  async colegas(): Promise<ColegaAluno[]> {
    const { data } = await api.get<Collection<AlunoApi>>(
      gamificationEndpoints.alunoColegas,
    );

    return data.data.map(normalizeColega);
  },

  async desafios(): Promise<Desafio[]> {
    const { data } = await api.get<Collection<DesafioApi>>(
      gamificationEndpoints.alunoDesafios,
    );

    return data.data.map(normalizeDesafio);
  },

  async criarDesafio(payload: CriarDesafioPayload): Promise<Desafio> {
    const { data } = await api.post<Resource<DesafioApi>>(
      gamificationEndpoints.alunoDesafios,
      {
        desafiado_id: payload.challengedId,
        ...(payload.disciplinaId
          ? { disciplina_id: payload.disciplinaId }
          : {}),
        ...(payload.type ? { tipo: payload.type } : {}),
        ...(payload.totalQuestions
          ? { quantidade_questoes: payload.totalQuestions }
          : {}),
      },
    );

    return normalizeDesafio(data.data);
  },

  async aceitarDesafio(id: number): Promise<Desafio> {
    const { data } = await api.post<Resource<DesafioApi>>(
      gamificationEndpoints.alunoAceitarDesafio(id),
    );

    return normalizeDesafio(data.data);
  },

  async recusarDesafio(id: number): Promise<Desafio> {
    const { data } = await api.post<Resource<DesafioApi>>(
      gamificationEndpoints.alunoRecusarDesafio(id),
    );

    return normalizeDesafio(data.data);
  },

  async desafioAtual(id: number): Promise<DesafioEstado> {
    const { data } = await api.get<DesafioEstadoApi>(
      gamificationEndpoints.alunoDesafioAtual(id),
    );

    return normalizeDesafioEstado(data);
  },

  async responderDesafio(
    id: number,
    alternativaId: number,
  ): Promise<DesafioEstado> {
    const { data } = await api.post<DesafioEstadoApi>(
      gamificationEndpoints.alunoResponderDesafio(id),
      { alternativa_id: alternativaId },
    );

    return normalizeDesafioEstado(data);
  },

  async loja(): Promise<PersonagemLoja[]> {
    const { data } = await api.get<Collection<PersonagemLojaApi>>(
      gamificationEndpoints.alunoLoja,
    );

    return data.data.map(normalizeLojaPersonagem);
  },

  async personagens(): Promise<AlunoPersonagem[]> {
    const { data } = await api.get<Collection<AlunoPersonagemApi>>(
      gamificationEndpoints.alunoPersonagens,
    );

    return data.data.map(normalizeAlunoPersonagem);
  },

  async comprarPersonagem(id: number): Promise<{
    message: string;
    perfil: PerfilAluno;
    inventario: AlunoPersonagem[];
  }> {
    const { data } = await api.post<ComprarPersonagemApi>(
      gamificationEndpoints.alunoComprarPersonagem(id),
    );

    const perfil = unwrapResource(data.perfil);

    if (!perfil) {
      throw new Error("A resposta da API nao informou o perfil atualizado.");
    }

    return {
      message: data.message ?? data.mensagem ?? "Personagem comprado.",
      perfil: normalizePerfil(perfil),
      inventario: unwrapCollection(data.inventario).map(
        normalizeAlunoPersonagem,
      ),
    };
  },

  async equiparPersonagem(id: number): Promise<{
    message: string;
    inventario: AlunoPersonagem[];
  }> {
    const { data } = await api.post<{
      message: string;
      inventario: Collection<AlunoPersonagemApi>;
    }>(gamificationEndpoints.alunoEquiparPersonagem(id));

    return {
      message: data.message,
      inventario: data.inventario.data.map(normalizeAlunoPersonagem),
    };
  },

  async sessaoAoVivoAtiva(): Promise<SessaoAoVivoAlunoEstado | null> {
    const { data } = await api.get<{
      data: SessaoAoVivoAlunoEstadoApi | null;
    }>(gamificationEndpoints.alunoSessaoAoVivoAtiva);

    return data.data ? normalizeSessaoAlunoEstado(data.data) : null;
  },

  async entrarSessaoAoVivo(id: number): Promise<SessaoAoVivoAlunoEstado> {
    const { data } = await api.post<SessaoAoVivoAlunoEstadoApi>(
      gamificationEndpoints.alunoEntrarSessaoAoVivo(id),
    );

    return normalizeSessaoAlunoEstado(data);
  },

  async sessaoAoVivoAtual(id: number): Promise<SessaoAoVivoAlunoEstado> {
    const { data } = await api.get<SessaoAoVivoAlunoEstadoApi>(
      gamificationEndpoints.alunoSessaoAoVivoAtual(id),
    );

    return normalizeSessaoAlunoEstado(data);
  },

  async responderSessaoAoVivo(
    id: number,
    alternativaId: number,
  ): Promise<{
    correta: boolean;
    pontos_ganhos: number;
    xp_ganho: number;
    estado: SessaoAoVivoAlunoEstado;
  }> {
    const { data } = await api.post<{
      correta: boolean;
      pontos_ganhos: number;
      xp_ganho: number;
      estado: SessaoAoVivoAlunoEstadoApi;
    }>(gamificationEndpoints.alunoResponderSessaoAoVivo(id), {
      alternativa_id: alternativaId,
    });

    return {
      correta: data.correta,
      pontos_ganhos: data.pontos_ganhos,
      xp_ganho: data.xp_ganho,
      estado: normalizeSessaoAlunoEstado(data.estado),
    };
  },
};
