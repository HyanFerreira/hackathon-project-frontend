# AGENTS.md

## Objetivo

Este projeto é uma aplicação React/Next.js com TypeScript e Tailwind CSS.  
O Codex deve seguir a arquitetura existente do sistema, respeitando os padrões de organização, componetização, estilização, tipagem, integração com API e reutilização de componentes globais.

Antes de criar, alterar ou remover qualquer arquivo, analise a estrutura atual do projeto e procure exemplos semelhantes já implementados.

---

## Regras principais

- Siga sempre o padrão já existente no projeto.
- Não crie uma nova arquitetura sem necessidade.
- Não duplique lógica, estilos ou componentes que já existem.
- Priorize código limpo, tipado, reutilizável e fácil de manter.
- Use TypeScript corretamente.
- Use Tailwind CSS seguindo o padrão visual atual do sistema.
- Respeite os arquivos e pastas já existentes.
- Não altere arquivos de build, cache ou dependências.
- Nunca edite manualmente `.next`, `node_modules`, arquivos compilados ou arquivos gerados automaticamente.
- Não exponha dados sensíveis, tokens, senhas, `.env` ou informações privadas.

---

## Estrutura base do projeto

A estrutura principal do projeto segue este padrão:

```txt
src/
├── app/
│   ├── (auth)/
│   ├── (sistema)/
│   ├── globals.css
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
├── assets/
├── components/
│   ├── assets/
│   ├── buttons/
│   ├── feedback/
│   ├── form/
│   ├── guard/
│   ├── loading/
│   ├── modal/
│   ├── pagination/
│   └── ui/
├── contexts/
├── hooks/
├── services/
├── types/
└── utils/
```
