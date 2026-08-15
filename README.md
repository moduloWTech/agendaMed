# 🏥 AgendaMed v1.0

> **AgendaMed** é uma plataforma moderna e inteligente (PWA & Web Desktop) desenvolvida para gerenciar o cuidado contínuo de pacientes. Criada com foco em cuidadores, familiares e profissionais de saúde, a aplicação centraliza rotinas médicas, lembretes de medicamentos minuto a minuto, gestão de documentos e históricos de consultas em uma única interface fluida, responsiva e com experiência premium multi-dispositivo.

Desenvolvido por **MWTech** 🚀

---

## 📖 Índice

- [Visão Geral do Produto](#-visão-geral-do-produto)
- [Principais Funcionalidades](#-principais-funcionalidades)
- [Arquitetura Multi-Dispositivo & Infraestrutura](#-arquitetura-multi-dispositivo--infraestrutura)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Como Executar o Projeto Localmente](#-como-executar-o-projeto-localmente)
- [Notificações Push e PWA](#-notificações-push-e-pwa)
- [Automação e Deploy (CI/CD)](#-automação-e-deploy-cicd)

---

## 🎯 Visão Geral do Produto

O cuidado com a saúde exige precisão e organização. O **AgendaMed** atua como um assistente digital para cuidadores. 
Ele substitui as antigas planilhas e alarmes de celular confusos por um ecossistema unificado onde você cadastra pacientes, gerencia o estoque de remédios e recebe **alertas instantâneos e insistentes** sempre que for a hora exata de ministrar uma medicação.

Através de uma interface limpa, focada em UX (com modais elegantes, feedback não intrusivo e zero `alert()` nativo), o sistema garante que nenhuma rotina seja esquecida.

---

## ✨ Principais Funcionalidades

1. **Gestão de Pacientes e Equipe de Cuidados:** 
   - Perfis completos para múltiplos pacientes.
   - Gestão de equipe com níveis de permissão (Admin vs. Cuidador) e convites seguros.
2. **Controle de Medicamentos & Alertas Escaláveis (Smart Cron):** 
   - Cadastro detalhado de medicamentos (frequência diária, horários pontuais ou intervalos de 4h/6h/8h/12h).
   - Motor de Cron automatizado via **Google Cloud Scheduler** + **Google Cloud Run** acionado minuto a minuto.
   - **Alertas Escaláveis e Insistentes:**
     - *Minuto 0:* Notificação pontual de dose.
     - *Minutos 1 a 4:* Lembretes de insistência com contagem de atraso.
     - *Minuto 5 a 30:* Alerta crítico de segurança.
     - *Cancelamento Automático:* Para no exato segundo em que qualquer familiar confirma a dose no app.
3. **Agenda Médica & Consultas:** 
   - Cadastro, histórico e timeline de consultas médicas, retornos e especialistas com alertas de horário.
4. **Cofre Médico Digital (Vault):** 
   - Armazenamento em nuvem de receitas, atestados e laudos com busca em tempo real e filtros por categoria.
5. **Relatórios Médicos Inteligentes (PDF):** 
   - Exportação em 1 clique de relatórios clínicos completos de adesão ao tratamento (7, 15, 30 e 60 dias) com estatísticas, tabelas e espaço para carimbo médico.
6. **Experiência Multi-Dispositivo (PWA Mobile & Desktop/Tablet Dedicado):** 
   - **Mobile:** Experiência de app nativo PWA/TWA instalável com Bottom Navigation Bar.
   - **Desktop/Tablet:** Layout split-screen dedicado em 12 colunas, Header horizontal com Dark Mode switcher, cards em grid e modais amplos.

---

## 🏗 Arquitetura Multi-Dispositivo & Infraestrutura

O sistema foi arquitetado dividindo as responsabilidades de interface, regras de negócio e persistência na nuvem com **Custo Zero ($0.00/mês)**:

```
                  ┌─────────────────────────────────────┐
                  │    Frontend PWA & Web (Vercel)      │
                  │  CDN Global, HTTPS, PWA / Desktop   │
                  └──────────────────┬──────────────────┘
                                     │ HTTPS
                                     ▼
┌────────────────────────┐      ┌─────────────────────────────────────┐
│ Google Cloud Scheduler │ ────▶│     Backend API (Google Cloud Run)   │
│ (Ping a cada 1 minuto) │ HTTPS│  Fastify, Clean Arch (R-U-R), Zod   │
└────────────────────────┘      └──────────────────┬──────────────────┘
                                                   │
                        ┌──────────────────────────┴──────────────────────────┐
                        ▼                                                     ▼
        ┌───────────────────────────────┐                     ┌───────────────────────────────┐
        │   Supabase PostgreSQL DB      │                     │    Supabase Cloud Storage     │
        │   Prisma ORM (Modelos de Dados)│                    │    Receitas, Laudos e PDFs    │
        └───────────────────────────────┘                     └───────────────────────────────┘
```

- **Frontend (Vite + React PWA):** Hospedado na Vercel com carregamento ultra-rápido via CDN global, service worker com cache inteligente e PWA instalável.
- **Backend (Node.js + Fastify no Google Cloud Run):** Container Docker escalável operando no *Always Free Tier* do Google Cloud (`us-central1`), com tempo de resposta em milissegundos e SSL automático.
- **Despertador Contínuo (Google Cloud Scheduler):** Executa o endpoint de cron minuto a minuto no fuso horário `America/Fortaleza` sem necessidade de servidores caros ligados 24/7.
- **Banco de Dados & Storage (Supabase):** PostgreSQL relacional com tipagem estrita via Prisma ORM e bucket seguro para imagens e documentos médicos.

---

## 💻 Tecnologias Utilizadas

### Frontend
- **React 19** (Hooks, Context API)
- **TypeScript** (Tipagem estrita de ponta a ponta)
- **Vite** (Build ultra-rápido)
- **Tailwind CSS** (Design System responsivo Mobile/Desktop)
- **Lucide React** (Ícones modernos)
- **Vite PWA** (Service Worker, Manifest, Ícones de instalação)
- **jsPDF & jspdf-autotable** (Geração de relatórios médicos A4)

### Backend (API)
- **Node.js** com **Fastify** (Roteamento veloz)
- **TypeScript**
- **Arquitetura Limpa (Clean Architecture):** Interfaces ➔ Repositories ➔ UseCases ➔ Routers
- **Prisma ORM** (Modelagem de dados)
- **PostgreSQL** (via Supabase)
- **Web-Push** (Criptografia RFC 8292 e disparo de notificações push)
- **Google Cloud Run & Cloud Scheduler** (Infraestrutura de nuvem Serverless)

---

## 📁 Estrutura do Repositório

```text
agendaMed/
│
├── frontend/             # Aplicação Web / PWA (React)
│   ├── src/
│   │   ├── components/   # Componentes isolados (UI, Navbar Desktop, Modais)
│   │   ├── contexts/     # Contextos globais (AuthContext, FeedbackContext, PwaUpdateContext)
│   │   ├── hooks/        # Hooks customizados (useTheme, usePwaInstall)
│   │   ├── screens/      # Telas (Agenda, Appointments, Vault, Profile, Login)
│   │   └── services/     # Clientes de API e push notifications
│   └── package.json
│
├── api/                  # Servidor Backend (Node.js)
│   ├── prisma/           # Schema do Prisma (schema.prisma)
│   ├── src/
│   │   ├── interfaces/   # Contratos e DTOs (OOP)
│   │   ├── repositories/ # Camada de acesso a dados (Prisma)
│   │   ├── usecases/     # Regras de negócio e validações
│   │   ├── routes/       # Adaptadores HTTP (Fastify Routers)
│   │   ├── services/     # Serviços de infra (Push, Cron, WhatsApp)
│   │   └── app.ts        # Injeção de dependências e inicialização
│   ├── Dockerfile        # Container multi-stage Alpine para Cloud Run
│   └── package.json
│
└── README.md
```

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js (v18+)
- PostgreSQL rodando localmente ou link de banco em nuvem (ex: Supabase)

### 1. Configurando o Backend (API)
```bash
cd api
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 2. Configurando o Frontend
Em um novo terminal:
```bash
cd frontend
npm install
npm run dev
```
Acesse `http://localhost:5173` no navegador.

---

## 🔔 Notificações Push e PWA

### Motor de Fuso Horário (Timezone Engine)
Utilizando `Intl.DateTimeFormat` configurado para `America/Fortaleza`, a API calcula o disparo correto dos medicamentos garantindo que pacientes brasileiros sejam notificados na exata hora local cadastrada, mesmo se o servidor estiver em UTC nos EUA.

### Notificações Push & Chaves VAPID
O sistema utiliza o padrão W3C **VAPID** (*Voluntary Application Server Identification*):
- **`VAPID_PUBLIC_KEY` (Pública):** Utilizada no Frontend para registrar a permissão de notificação nos servidores do Google (FCM) ou Apple (APNs).
- **`VAPID_PRIVATE_KEY` (Privada):** Armazenada no Cloud Run, utilizada pelo `CronUseCase` para assinar e entregar alertas na tela de bloqueio com custo zero.

---

## ⚙️ Automação e Deploy (CI/CD)

1. **Frontend na Vercel:** Deploy contínuo a cada `push` na branch `main`.
2. **Backend no Google Cloud Run:** Compilação automática do `api/Dockerfile` pelo Cloud Build a cada commit na `main`.
3. **Google Cloud Scheduler:** Job agendado `* * * * *` chamando `GET /api/cron/check-medications`.
4. **Validação Contínua (GitHub Actions):** `.github/workflows/ci.yml` executa Typecheck (`tsc`), linting (`oxlint`), testes (`vitest`) e build antes de cada release.
5. **Migrações de Banco:** `.github/workflows/prisma-migrate.yml` aplica migrações Prisma automaticamente no Supabase.

---
*Documentação mantida e atualizada pela equipe da MWTech.*
