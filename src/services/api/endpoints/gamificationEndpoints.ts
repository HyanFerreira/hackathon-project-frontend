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
  alunoLoja: "/aluno/loja",
  alunoComprarPersonagem: (id: number) => `/aluno/loja/${id}/comprar`,
  alunoPersonagens: "/aluno/personagens",
  alunoEquiparPersonagem: (id: number) => `/aluno/personagens/${id}/equipar`,

  adminDashboard: "/admin/dashboard",
  gestorDashboard: "/gestor/dashboard",
  professorDashboard: "/professor/dashboard",

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
  professorQuestoes: "/professor/questoes",
  professorQuestao: (id: number) => `/professor/questoes/${id}`,
  professorRankingTurma: (turmaId: number) =>
    `/professor/ranking/turmas/${turmaId}`,
  gestorRankingEscola: "/gestor/ranking/escola",
  gestorRankingTurma: (turmaId: number) => `/gestor/ranking/turmas/${turmaId}`,
} as const;
