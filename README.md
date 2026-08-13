# 🏥 AgendaMed v1.0

> **AgendaMed** é uma plataforma moderna e inteligente (PWA) desenvolvida para gerenciar o cuidado contínuo de pacientes. Criada com foco em cuidadores, familiares e profissionais de saúde, a aplicação centraliza rotinas médicas, lembretes de medicamentos, gestão de documentos e históricos de consultas em uma única interface fluida, responsiva e com experiência de aplicativo nativo.

Desenvolvido por **MWTech** 🚀

---

## 📖 Índice

- [Visão Geral do Produto](#-visão-geral-do-produto)
- [Principais Funcionalidades](#-principais-funcionalidades)
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Como Executar o Projeto Localmente](#-como-executar-o-projeto-localmente)
- [Notificações Push e PWA](#-notificações-push-e-pwa)
- [Automação e Deploy (CI/CD)](#-automação-e-deploy-cicd)

---

## 🎯 Visão Geral do Produto

O cuidado com a saúde exige precisão e organização. O **AgendaMed** atua como um assistente digital para cuidadores. 
Ele substitui as antigas planilhas e alarmes de celular confusos por um ecossistema unificado onde você cadastra pacientes, gerencia o estoque de remédios e recebe **alertas instantâneos** sempre que for a hora exata de ministrar uma medicação.

Através de uma interface limpa, focada em UX (com modais elegantes e feedbacks não intrusivos), o sistema garante que nenhuma rotina seja esquecida.

---

## ✨ Principais Funcionalidades

1. **Gestão de Pacientes e Cuidadores:** 
   - Perfis completos para múltiplos pacientes.
   - Compartilhamento de dados com outros cuidadores (família ou enfermeiros).
2. **Controle de Medicamentos (Smart Cron):** 
   - Cadastro detalhado de medicamentos (frequência, dosagem, estoque).
   - Motor de Cron rodando no servidor que envia Lembretes (Push Notifications) automáticos no horário exato (ajustado para o fuso horário local, ex: Fortaleza).
3. **Agenda Médica:** 
   - Cadastro e histórico de consultas médicas, retornos e especialistas.
4. **Cofre Médico (Vault):** 
   - Armazenamento seguro de receitas, atestados e exames diretamente na nuvem.
5. **Relatórios Médicos Inteligentes (PDF):** 
   - Geração e exportação com 1 clique de relatórios médicos de adesão à medicação e histórico clínico.
   - Cálculo automático do percentual de sucesso do tratamento, doses tomadas vs. previstas e espaço para anotação/carimbo médico.
6. **Experiência Nativa (PWA):** 
   - Instalação direta na tela inicial de dispositivos iOS e Android.
   - Funciona como um app real sem precisar baixar pelas lojas de aplicativos convencionais.

---


## 🏗 Arquitetura do Sistema

O sistema foi arquitetado dividindo as responsabilidades de interface e regras de negócio:

- **Frontend (Vite + React):** Aplicação Single Page Application (SPA), transformada em PWA via `vite-plugin-pwa`. Comunica-se exclusivamente via API REST. Utiliza contextos globais (como o `FeedbackContext`) para um gerenciamento de estado UI eficiente.
- **Backend (Node.js + Fastify):** API de alta performance e baixa latência. Responsável pelas validações, comunicação com o banco e envio dos "Web Pushes". O motor de agendamento (Node-Cron) vive dentro da API, varrendo os horários minuto a minuto.
- **Banco de Dados (PostgreSQL + Prisma ORM):** Banco relacional hospedado na nuvem (Supabase). O Prisma garante tipagem estrita de ponta a ponta.

---

## 💻 Tecnologias Utilizadas

### Frontend
- **React.js** (Hooks, Context API)
- **TypeScript** (Tipagem forte)
- **Vite** (Build ultra-rápido)
- **Tailwind CSS** (Estilização utilitária e responsiva)
- **Lucide React** (Ícones modernos)
- **Vite PWA** (Service Workers, Manifest, Ícones de instalação)

### Backend (API)
- **Node.js** com **Fastify** (Roteamento veloz)
- **TypeScript**
- **Prisma ORM** (Modelagem de dados)
- **PostgreSQL** (via Supabase)
- **Node-Cron** (Agendamento de tarefas em background)
- **Web-Push** (Criptografia e disparo de notificações push)

---

## 📁 Estrutura do Repositório

O projeto adota uma estrutura de *Monorepo* simples:

```text
agendaMed/
│
├── frontend/             # Aplicação Web / PWA (React)
│   ├── src/
│   │   ├── components/   # Componentes isolados (UI, Modais, Cards)
│   │   ├── contexts/     # Contextos globais (FeedbackContext)
│   │   ├── hooks/        # Hooks customizados (ex: usePwaInstall)
│   │   ├── screens/      # Páginas principais da aplicação
│   │   └── main.tsx      # Ponto de entrada do React
│   └── package.json
│
├── api/                  # Servidor Backend (Node.js)
│   ├── prisma/           # Schema do Prisma (schema.prisma)
│   ├── src/
│   │   ├── services/     # Serviços de negócio (Cron, Push)
│   │   ├── usecases/     # Casos de uso (Regras de negócio)
│   │   └── server.ts     # Ponto de entrada da API
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
# Crie um arquivo .env com a variável DATABASE_URL
npx prisma generate
npx prisma db push
npm run dev
```

### 2. Configurando o Frontend
Em um novo terminal:
```bash
cd frontend
npm install
# Configure as variáveis de ambiente necessárias (.env) se aplicável
npm run dev
```
Acesse `http://localhost:5173` no navegador.

---

## 🔔 Notificações Push e PWA

### Motor de Fuso Horário (Timezone Engine)
O servidor backend foi projetado para ser resiliente a diferenças de fuso horário de servidores em nuvem. Utilizando `Intl.DateTimeFormat` configurado para `America/Fortaleza`, a API calcula o disparo correto dos medicamentos garantindo que pacientes brasileiros sejam notificados na exata hora local cadastrada, mesmo se o servidor estiver em UTC.

### Experiência de Instalação (PWA)
O aplicativo possui detecção inteligente de ambiente. Caso o usuário esteja no navegador Safari (iOS), o sistema identifica a ausência de prompts nativos automáticos e exibe instruções customizadas (Modal) instruindo a usar o botão "Compartilhar" -> "Adicionar à Tela de Início", resolvendo limitações históricas da Apple para PWAs.

---

## ⚙️ Automação e Deploy (CI/CD)

O ecossistema do AgendaMed foi projetado para operações modernas com o mínimo de fricção:

### 1. Frontend & Backend Serverless (Vercel)
A interface Web (PWA) e a API Backend (Node.js/Fastify Serverless) estão hospedadas na Vercel e integradas à branch `main`. Qualquer `git push` publicado aciona o deploy em produção em segundos.

### 2. Validação Contínua & Quality Gate (GitHub Actions)
Temos a esteira `.github/workflows/ci.yml` configurada para rodar a cada `push` ou `pull_request` na branch `main`, validando tipagens TypeScript (`tsc`), linting (`oxlint`), testes unitários (`vitest`) e compilação de build.

### 3. Migrações do Banco de Dados (Prisma + Supabase)
O workflow `.github/workflows/prisma-migrate.yml` executa migrações de schema do Prisma ORM no Supabase PostgreSQL automaticamente sempre que houver alterações na pasta `api/prisma/`.

### 4. Aplicativo Android na Play Store (TWA via Bubblewrap)
Temos uma automação dedicada (`build-android.yml`) para compilar o arquivo `.aab` / `.apk` (Android App Bundle).
Como as telas e regras de negócio refletem a aplicação web instantaneamente via TWA (Trusted Web Activity), **não é necessário re-enviar o app para a Google Play Store a cada atualização de código.**


---
*Documentação mantida e atualizada pela equipe da MWTech.*
