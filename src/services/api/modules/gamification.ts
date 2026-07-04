import type {
  Aluno,
  AlunoPersonagem,
  ConquistaProgresso,
  DisciplinaProgresso,
  MissaoProgresso,
  PerfilAluno,
  PersonagemFeedback,
  PersonagemLoja,
  RankingItem,
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
  escola_id: number;
  nome: string;
  codigo: string;
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
  aluno?: AlunoApi;
};

type RankingItemApi = {
  posicao: number;
  aluno: AlunoApi;
  pontos: number;
  xp: number;
  nivel: number;
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
};

type PersonagemFeedbackApi = {
  chave: string;
  nome: string;
  nivel: number;
  subiu_nivel: boolean;
  imagem: string;
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
      };
      posicao_turma?: number | null;
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
    schoolId: aluno.escola_id,
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
    aluno: perfil.aluno ? normalizeAluno(perfil.aluno) : undefined,
  };
}

function normalizeRankingItem(item: RankingItemApi): RankingItem {
  return {
    position: item.posicao,
    aluno: normalizeAluno(item.aluno),
    points: item.pontos,
    xp: item.xp,
    level: item.nivel,
  };
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

function normalizeConquista(
  conquista: ConquistaProgressoApi,
): ConquistaProgresso {
  return {
    id: conquista.id,
    name: conquista.nome,
    description: conquista.descricao,
    icon: conquista.icone,
    type: conquista.tipo,
    goal: conquista.meta,
    current: conquista.atual,
    unlocked: conquista.desbloqueada,
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
  async loginAluno(codigo: string): Promise<{ aluno: Aluno; token: string }> {
    const { data } = await api.post<{
      aluno: Resource<AlunoApi> | AlunoApi;
      token: string;
    }>(gamificationEndpoints.alunoLogin, { codigo });

    const aluno = "data" in data.aluno ? data.aluno.data : data.aluno;

    return { aluno: normalizeAluno(aluno), token: data.token };
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
    const { data } = await api.post<{
      correta: boolean;
      mensagem: string;
      gabarito: { id: number; texto: string };
      pontos_ganhos: number;
      xp_ganho: number;
      energia_gasta: number;
      conquistas_desbloqueadas: Collection<SimpleConquistaApi>;
      missoes_concluidas: Collection<SimpleMissaoApi>;
      personagem?: PersonagemFeedbackApi | null;
      perfil: Resource<PerfilAlunoApi>;
    }>(gamificationEndpoints.alunoResponder(questaoId), {
      alternativa_id: alternativaId,
    });

    return {
      ...data,
      gabarito: { id: data.gabarito.id, text: data.gabarito.texto },
      conquistas_desbloqueadas: data.conquistas_desbloqueadas.data.map(
        normalizeSimpleConquista,
      ),
      missoes_concluidas: data.missoes_concluidas.data.map(
        normalizeSimpleMissao,
      ),
      personagem: data.personagem
        ? normalizePersonagemFeedback(data.personagem)
        : null,
      perfil: normalizePerfil(data.perfil.data),
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
    const { data } = await api.post<{
      message: string;
      perfil: Resource<PerfilAlunoApi>;
      inventario: Collection<AlunoPersonagemApi>;
    }>(gamificationEndpoints.alunoComprarPersonagem(id));

    return {
      message: data.message,
      perfil: normalizePerfil(data.perfil.data),
      inventario: data.inventario.data.map(normalizeAlunoPersonagem),
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
};
