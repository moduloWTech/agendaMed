# Documento de Handoff (Transição de Ambiente/IDE)
**Projeto:** AgendaMed
**Última Atualização:** Julho 2026

Este documento foi criado para garantir que você possa trocar de IDE, computador ou Agente de IA sem perder o contexto do que já foi construído, das decisões arquiteturais tomadas e dos próximos passos.

---

## 1. Visão Geral do Estado Atual
O **AgendaMed** está com o frontend estruturado em **React + Vite** e estilizado com **Tailwind CSS**. A interface segue um padrão visual de *Glassmorphism* (focado em mobile) e usabilidade voltada para usuários de baixa fluência tecnológica (botões grandes, ícones claros, navegação indolor).

## 2. Funcionalidades de Frontend Entregues
- **Módulo de Agenda (`AgendaScreen.tsx`):**
  - Carrossel dinâmico de semanas com navegação passado/futuro (`WeeklyCarousel.tsx`).
  - Lista adaptativa de medicamentos (`MedicationList.tsx`) com *Empty States* amigáveis (ex: "Dia Livre").
  - Títulos mutáveis conforme a data ("Medicamentos de Hoje", "Histórico do Dia", "Agendados").
- **Assistente de Medicamentos (`AddMedicationWizard.tsx`):**
  - Modal otimizado passo-a-passo.
  - Lógica robusta de recorrência de horários (Única, Diário, Semanal, Mensal, Manual).
- **Prontuário / Cofre (`VaultScreen.tsx`):**
  - `AddDocumentModal.tsx`: Modal integrado (single-page) para anexar receitas, laudos e exames de forma extremamente rápida. Possui área de destaque para foto.

## 3. Arquitetura MWT e Regras de Negócio Estabelecidas
Nós sincronizamos a base de conhecimento com os documentos do Notion da MWT, o que resultou nas seguintes diretrizes absolutas para o **Backend**:
1. **Padrão R-U-R (Router, UseCase, Repositorie):** Todo backend Node.js será dividido nestas 3 camadas.
2. **Frameworks:** Fastify (Rotas), Zod (Validação Fail-fast) e Prisma (ORM/PostgreSQL).
3. **Segurança Extrema (Secure by Design):** Uso de Helmet, limitação de requests, JWT curto (15min) e checagem rígida contra IDOR.
4. **Infraestrutura Stateless:** Conexões trafegam por `.env`. Deploys ocorrem via GitHub Actions construindo contêineres Docker para envio ao GCP (Google Cloud Platform) via GHCR.
5. **Prevenção de OOM (Memória):** O upload de arquivos (ex: fotos de receitas) **deve** ser comprimido no frontend (React) antes de ser enviado. O backend será apenas um repassador para o S3/Storage.

## 4. Integrações de Inteligência Artificial
- **Skill do Supabase:** Foi gerada a skill local do Supabase em `.agents/skills/supabase/SKILL.md` para forçar a IA a seguir regras rigorosas de banco (Row-Level Security ativo, indexação, e tipagem Typescript).
- **Servidor MCP:** O servidor MCP do Supabase foi testado. O JSON exige o parâmetro `SUPABASE_ACCESS_TOKEN` para comunicação bem sucedida com o banco.

## 5. Próximos Passos Imediatos (Para onde ir agora?)
1. **Configurar Servidor MCP do Supabase:** Gerar o Token no painel do Supabase e inseri-lo no `mcp_config.json` do seu novo editor para habilitar queries autônomas pela IA.
2. **Inicialização do Backend:** Criar a pasta do backend (ex: `/api`), dar o `npm init`, instalar as dependências base (`fastify`, `zod`, `prisma`) e configurar a casca R-U-R.
3. **Linkar Front e Back:** Finalizar a lógica de login/auth do Supabase e fazer os componentes visuais baterem nas rotas reais do Fastify.
