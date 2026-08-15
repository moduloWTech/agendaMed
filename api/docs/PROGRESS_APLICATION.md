# Relatório de Progresso: AgendaMed

Este documento registra o histórico de desenvolvimento, a situação atual da aplicação (em qual "pé" estamos) e os próximos passos para a evolução do produto.

---

## 1. O que já foi feito (Concluído) ✅

### 🖥️ Design Multi-Dispositivo (Desktop & Tablet Dedicado)
- **Regra de Ouro do Mobile Mantida:** O layout mobile PWA/TWA permaneceu 100% homologado e intocado.
- **Login Split-Screen (60/40):** Hero de branding à esquerda com card institucional e formulário limpo à direita com suporte a OAuth do Google.
- **Desktop Navbar & AuthLayout:** Header superior integrado com alternador de tema Dark/Light, badge do paciente ativo, links de navegação e menu de usuário com logout. Ocultação automática da BottomNav no desktop (`md:hidden`).
- **Agenda Médica Desktop:** Split-grid de 2 colunas com widget de calendário semanal interativo à esquerda e linha do tempo de medicamentos à direita.
- **Consultas Médicas & Exames:** Hero banner institucional, cards em grid de 3 colunas, badges de alerta intensivo pulsante e modal de agendamento expandido em 2 colunas (`max-w-2xl`).
- **Prontuário & Cofre Digital:** Busca em tempo real por título, filtros rápidos por categoria (*Todos, Receitas, Exames, Laudos*), grid de 3 colunas com visualizador de anexos e atalho direto para download do relatório médico em PDF.
- **Equipe de Cuidados & Perfil:** Split-grid de 2 colunas distribuindo 7/12 para Paciente + Cuidadores e 5/12 para Minha Conta + Configurações e PWA.

### 🏗️ Arquitetura Limpa & Motor de Cron
- **Padrão Strict Clean Architecture (R-U-R):** Interfaces ➔ Repositories ➔ UseCases ➔ Routers.
- **Cron Engine Desacoplado:**
  - `ICronRepository` e `CronRepository` encapsulando as consultas ao Prisma ORM.
  - `ICronUseCase` e `CronUseCase` centralizando a regra de fuso horário `America/Fortaleza`, cálculo de intervalos de medicamentos (`single`, `daily`, `manual`, `4h`, `6h`, `8h`, `12h`) e validação de `CRON_SECRET`.
  - `CronRouter` atuando como puro adaptador HTTP (`GET` e `POST /api/cron/check-medications`).
- **Alertas Escaláveis e Insistentes:**
  - *Minuto 0:* Notificação pontual de dose.
  - *Minutos 1 a 4:* Lembretes de insistência com contagem de atraso.
  - *Minuto 5 a 30:* `🚨 ALERTA DE SEGURANÇA 🚨` avisando sobre o atraso crítico.
  - *Cancelamento Automático:* Para no exato segundo em que qualquer familiar/cuidador confirmar a dose no app.

### 🚀 Infraestrutura & Nuvem (Custo $0,00/mês)
- **Frontend (Vercel):** Hospedado no domínio `agendamed.moduloweb.com.br` com CDN global e PWA Service Worker.
- **Backend (Google Cloud Run):** Container Docker escalável operando no *Always Free Tier* do Google Cloud (`us-central1`), com tempo de resposta em milissegundos e SSL nativo.
- **Disparador Automático (Google Cloud Scheduler):** Job `agendamed-cron-remedios` rodando a cada 1 minuto (`* * * * *`) no fuso `America/Fortaleza`.
- **Banco de Dados & Storage (Supabase):** PostgreSQL relacional com tipagem Prisma e bucket seguro para fotos de receitas e documentos.
- **Esteira de CI/CD (GitHub Actions):** Validação de qualidade contínua com Typecheck TypeScript, Oxlint e testes unitários Vitest.

### 📄 Relatório Médico Inteligente em PDF (Adesão & Histórico)
- **Endpoint Dedicado na API:** `GET /api/patients/:id/report-data` com cálculo do índice de adesão (%), contagem de doses previstas vs. tomadas e histórico clínico.
- **Gerador (`jsPDF` + `jspdf-autotable`):** Exportação em folha A4 com cabeçalho oficial do AgendaMed, estatísticas, tabelas clínicas e espaço para anotações/carimbo médico.
- **Modal Responsivo (`MedicalReportModal.tsx`):** Seleção de períodos de 7, 15, 30 e 60 dias.

---

## 2. Em que "pé" estamos (Situação Atual) 📍
O sistema está **100% completo, em produção, homologado em Mobile, Desktop e Tablet, com infraestrutura de custo zero ativa no Google Cloud Run + Cloud Scheduler + Vercel**.

---

## 3. O que ainda podemos evoluir (Futuras Melhorias) 🚀
- [ ] Implementação de gráficos visuais (ApexCharts/Recharts) no relatório médico web.
- [ ] Envio de alertas de estoque baixo de medicamentos via Notificação Push.
