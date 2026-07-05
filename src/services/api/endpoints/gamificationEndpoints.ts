export const gamificationEndpoints = {
  alunoLogin: "/login/aluno",
  alunoMe: "/aluno/me",
  alunoPerfil: "/aluno/perfil",
  alunoDashboard: "/aluno/dashboard",
  alunoDisciplinas: "/aluno/disciplinas",
  alunoQuestoes: "/aluno/questoes",
  alunoResponder: (id: number) => `/aluno/questoes/${id}/responder`,
  alunoRespostas: "/aluno/respostas",
  alunoRankingTurma: "/aluno/ranking/turma",
  alunoRankingEscola: "/aluno/ranking/escola",
  alunoConquistas: "/aluno/conquistas",
  alunoMissoes: "/aluno/missoes",
  alunoColegas: "/aluno/colegas",
  alunoDesafios: "/aluno/desafios",
  alunoAceitarDesafio: (id: number) => `/aluno/desafios/${id}/aceitar`,
  alunoRecusarDesafio: (id: number) => `/aluno/desafios/${id}/recusar`,
  alunoDesafioAtual: (id: number) => `/aluno/desafios/${id}/atual`,
  alunoResponderDesafio: (id: number) => `/aluno/desafios/${id}/responder`,
  alunoLoja: "/aluno/loja",
  alunoComprarPersonagem: (id: number) => `/aluno/loja/${id}/comprar`,
  alunoPersonagens: "/aluno/personagens",
  alunoEquiparPersonagem: (id: number) => `/aluno/personagens/${id}/equipar`,
  alunoSessoesAoVivoResumo: "/aluno/sessoes-ao-vivo/resumo",
  alunoSessaoAoVivoAtiva: "/aluno/sessoes-ao-vivo/ativa",
  alunoEntrarSessaoAoVivo: (id: number) =>
    `/aluno/sessoes-ao-vivo/${id}/entrar`,
  alunoSessaoAoVivoAtual: (id: number) => `/aluno/sessoes-ao-vivo/${id}/atual`,
  alunoResponderSessaoAoVivo: (id: number) =>
    `/aluno/sessoes-ao-vivo/${id}/responder`,

  adminDashboard: "/admin/dashboard",
  gestorDashboard: "/gestor/dashboard",
  gestorDesempenho: "/gestor/desempenho",
  professorDashboard: "/professor/dashboard",
  professorDesempenho: "/professor/desempenho",

  gestorTurmas: "/gestor/turmas",
  gestorTurma: (id: number) => `/gestor/turmas/${id}`,
  gestorProfessores: "/gestor/professores",
  gestorProfessor: (id: number) => `/gestor/professores/${id}`,
  gestorAlunos: "/gestor/alunos",
  gestorAluno: (id: number) => `/gestor/alunos/${id}`,
  vincularProfessor: (turmaId: number) =>
    `/gestor/turmas/${turmaId}/professores`,
  desvincularProfessor: (turmaId: number, professorId: number) =>
    `/gestor/turmas/${turmaId}/professores/${professorId}`,
  vincularAluno: (turmaId: number) => `/gestor/turmas/${turmaId}/alunos`,
  desvincularAluno: (turmaId: number, alunoId: number) =>
    `/gestor/turmas/${turmaId}/alunos/${alunoId}`,

  disciplinas: "/disciplinas",
  habilidades: "/habilidades",
  professorTurmas: "/professor/turmas",
  professorQuestoes: "/professor/questoes",
  professorQuestao: (id: number) => `/professor/questoes/${id}`,
  professorSessoesAoVivo: "/professor/sessoes-ao-vivo",
  professorSessaoAoVivo: (id: number) => `/professor/sessoes-ao-vivo/${id}`,
  professorIniciarSessaoAoVivo: (id: number) =>
    `/professor/sessoes-ao-vivo/${id}/iniciar`,
  professorPausarSessaoAoVivo: (id: number) =>
    `/professor/sessoes-ao-vivo/${id}/pausar`,
  professorRetomarSessaoAoVivo: (id: number) =>
    `/professor/sessoes-ao-vivo/${id}/retomar`,
  professorHeartbeatSessaoAoVivo: (id: number) =>
    `/professor/sessoes-ao-vivo/${id}/heartbeat`,
  professorEncerrarSessaoAoVivo: (id: number) =>
    `/professor/sessoes-ao-vivo/${id}/encerrar`,
  professorProximaSessaoAoVivo: (id: number) =>
    `/professor/sessoes-ao-vivo/${id}/proxima`,
  professorEnviarQuestaoSessaoAoVivo: (sessionId: number, questionId: number) =>
    `/professor/sessoes-ao-vivo/${sessionId}/questoes/${questionId}/enviar`,
  professorDesempenhoSessaoAoVivo: (id: number) =>
    `/professor/sessoes-ao-vivo/${id}/desempenho`,
  professorRankingTurma: (turmaId: number) =>
    `/professor/ranking/turmas/${turmaId}`,
  gestorRankingEscola: "/gestor/ranking/escola",
  gestorRankingTurma: (turmaId: number) => `/gestor/ranking/turmas/${turmaId}`,
} as const;
