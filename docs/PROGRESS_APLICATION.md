# Relatório de Progresso: AgendaMed

Este documento registra o histórico de desenvolvimento, a situação atual da aplicação (em qual "pé" estamos) e os próximos passos para a evolução do produto.

---

## 1. O que já foi feito (Concluído) ✅

### 🏗️ Infraestrutura e Backend
- **Configuração Inicial:** Configuração do ecossistema Monorepo (Frontend em Vite/React e Backend em Node.js/Fastify).
- **Banco de Dados Real:** Modelagem e implantação do banco de dados relacional (PostgreSQL) usando Prisma ORM (Tabelas: `User`, `Patient`, `Medication`, `MedicationHistory`, `Document`, `Appointment`, `PushSubscription`, `Tenant`).
- **Arquitetura Escalável:** Padrão rigoroso `Layered R-U-R` implementado (Router > UseCase > Repository), garantindo um código limpo e fácil de testar.
- **Segurança de APIs:** Zod para validação de dados de entrada e Middlewares de JWT para bloqueio de rotas protegidas.
- **CRUDS Completos:** Rotas de Criação, Leitura, Atualização e Deleção (CRUD) prontas para todas as entidades.
- **Cron Job & Timezone:** Motor interno agendado (`cron.service.ts`) operando a cada minuto. Cálculo de fuso horário blindado para `America/Fortaleza` (Brasília) garantindo precisão nos alertas, independentemente do local físico do servidor em nuvem.

### 🚀 Deploy, CI/CD e Infraestrutura
- **Servidor Backend (Vercel Serverless):** API migrada com sucesso da VM antiga da GCP para a arquitetura Serverless na Vercel no endereço `api-agenda-med-mwt.vercel.app`.
- **Frontend Vercel:** Hospedado no domínio `agendamed.moduloweb.com.br` apontando para a API Vercel Serverless.
- **Persistência de Sessão WhatsApp (Supabase Storage):** Criação e sincronização do bucket privado `whatsapp-auth` no Supabase Storage para armazenamento persistente de sessão do Baileys sem perdas em deploys stateless.
- **Segurança de Autenticação:** Validação com suporte a popups do Google OAuth (COOP) e sanitização automática de segredos JWT e Client IDs.
- **Esteira de CI/CD (GitHub Actions):**
  - [`.github/workflows/ci.yml`](file:///home/beth/Documentos/MWT/agendaMed/.github/workflows/ci.yml): Automação de validação contínua (Typecheck TypeScript `tsc`, Oxlint, testes unitários `vitest` e testes de build) a cada `push` na branch `main`.
  - [`.github/workflows/prisma-migrate.yml`](file:///home/beth/Documentos/MWT/agendaMed/.github/workflows/prisma-migrate.yml): Migrações automáticas do banco no Supabase via Prisma ORM ativadas em alterações de schema.

### 📄 Relatório Médico Inteligente em PDF (Adesão & Histórico)
- **Endpoint Dedicado na API:** `GET /api/patients/:id/report-data` com cálculo do índice de adesão (%), contagem de doses previstas vs. tomadas, medicamentos em uso e logs de check-ins no período.
- **Gerador Nascido da API (`jsPDF` + `jspdf-autotable`):** Geração e download direto do arquivo `.pdf` formatado em folha A4 com cabeçalho oficial do AgendaMed, fichas, estatísticas de adesão, tabelas clínicas e espaço para anotações/carimbo médico.
- **Interface Mobile Nativa (`MedicalReportModal.tsx`):** Acessível pelas telas de **Perfil** e **Prontuário**, permitindo seleção de período (7, 15, 30 e 60 dias) e download em 1 clique.

### 📱 Experiência de App (PWA & Notificações Push)
- **Notificações e Atualizações PWA:** Integração com Service Worker e detecção de updates via contexto (`PwaUpdateContext`).
- **Transformação para App Nativo:** Implementação do `vite-plugin-pwa`. Geração de manifest e ícones nativos.
- **Fluxo de Instalação (Install App):** Lógica inteligente de detecção do iOS (Safari) guiando o usuário a instalar manualmente, enquanto exibe o prompt nativo no Android.
- **Notificações Push (Substituindo o WhatsApp):** O usuário se loga e o Service Worker gera uma inscrição (Subscription) no servidor. O servidor envia o Push via internet direto para a tela de bloqueio do celular.
- **Feedback UI (Zero Alerts):** Criação de um `FeedbackContext` global. Todos os `alert()` nativos do navegador foram extirpados e substituídos por modais elegantes que seguem o Design System.

### 🔐 Autenticação (A "Mágica")
- **Fluxo "Magic Link":** Geração de Token JWT que envia um link seguro (Magic Link), autenticando o usuário no celular sem necessidade de senhas. 
- **Gestão de Sessão (LocalStorage):** Frontend mantém de forma segura as credenciais e força redirecionamentos quando o token expira.

### 🖼️ Frontend (Interface)
- **Tela de Perfil:** Atualização de dados, deleção de conta, gestão da equipe de cuidadores, alteração de cargos (Admin/Cuidador) e botão para "Relatório Médico em PDF".
- **Tela de Agenda:** Wizard avançado de medicação enviando dados diretamente para o Supabase. 
- **Tela do Cofre (Prontuário):** Upload real de imagens (`Multipart`) para o Storage do Supabase (bucket `agendamed`) e atalho direto para a geração do Relatório Médico.

---

## 2. Em que "pé" estamos (Situação Atual) 📍
O MVP principal (PWA + Vercel Serverless + Supabase DB/Storage) está **100% de pé, operando em produção e totalmente testado**.
O sistema conta com notificação de Web Push na tela de bloqueio, relatório em PDF nascido dos dados da API, esteira de CI/CD ativa no GitHub e workflow para geração do pacote Android APK via Bubblewrap (TWA).

---

## 3. O que ainda podemos evoluir (Futuras Melhorias) 🚀
- [ ] Implementação de gráficos visuais (ApexCharts/Recharts) no relatório médico web.
- [ ] Envio de alertas de estoque baixo de medicamentos via Notificação Push.
