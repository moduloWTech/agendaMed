# 🚀 Guia de Handoff & Inicialização Rápida (5 Minutos) – AgendaMed

**Projeto:** AgendaMed v1.0 (PWA + API Serverless + PostgreSQL Prisma)  
**Mantenedor:** MW Technology  
**Última Atualização:** Agosto 2026  

Este documento foi elaborado para que qualquer equipe de desenvolvimento ou comprador consiga rodar, testar e publicar o sistema **AgendaMed em menos de 5 minutos**.

---

## ⚡ 1. Como Rodar o Projeto em 5 Minutos (Localmente)

### Pré-requisitos
- Node.js `v20.x` ou superior
- NPM `v10.x` ou superior
- Docker & Docker Compose (opcional, para rodar via contêineres)

### Passo a Passo

```bash
# 1. Clonar o repositório
git clone https://github.com/moduloWTech/agendaMed.git
cd agendaMed

# 2. Inicializar o Backend (API)
cd api
npm install
cp .env.example .env # Configurar a DATABASE_URL do PostgreSQL
npx prisma db push
npm run dev

# 3. Inicializar o Frontend (PWA) em outro terminal
cd ../frontend
npm install
npm run dev
```

Acesse o aplicativo no navegador em `http://localhost:5173`.

---

## 🐳 2. Execução via Docker (Contêineres)

Para rodar a API Backend em contêiner Docker de forma rápida:

```bash
cd api
docker-compose up -d --build
```

---

## 🏗️ 3. Estrutura do Monorepo

```
agendaMed/
├── api/                    # Backend (Node.js + Fastify + Prisma ORM)
│   ├── src/                # Padrão R-U-R (Router, UseCase, Repository)
│   ├── prisma/             # Schema do Banco de Dados PostgreSQL
│   ├── Dockerfile          # Contêiner Docker para deploy
│   └── vercel.json         # Configuração de Deploy Serverless na Vercel
├── frontend/               # Frontend PWA (Vite + React + Tailwind CSS)
│   ├── src/
│   │   ├── components/     # Componentes UI reutilizáveis (Modais, Cards, Wizards)
│   │   ├── screens/        # Telas da Aplicação (Agenda, Cofre, Perfil, Consultas)
│   │   └── services/       # Conexão de API e Push Notifications
│   └── vite.config.ts      # Configuração PWA (vite-plugin-pwa)
├── docs/                   # Documentação do Projeto
└── .github/workflows/      # Esteiras de CI/CD (GitHub Actions)
    ├── ci.yml              # Testes automatizados, lint e TypeScript validation
    └── prisma-migrate.yml  # Migrações automáticas de banco no Supabase
```

---

## 🔐 4. Variáveis de Ambiente (.env)

### Backend (`api/.env`)
```env
DATABASE_URL="postgresql://usuario:senha@host:5432/banco"
JWT_SECRET="seu-secret-jwt-super-seguro"
SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role"
PORT=3000
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL="http://localhost:3000"
VITE_VAPID_PUBLIC_KEY="sua-chave-publica-push"
VITE_GOOGLE_CLIENT_ID="seu-google-client-id"
```

> 💡 **Nota sobre as Chaves VAPID (Web Push):**  
> As chaves `VAPID_PUBLIC_KEY` (pública) e `VAPID_PRIVATE_KEY` (privada) são o par de chaves criptográficas do padrão W3C Web Push. A chave pública autoriza a permissão de notificação no celular (iOS/Android) e a chave privada permite que o backend envie alertas no horário exato do remédio com custo zero de mensagem.

---


## ⚙️ 5. Esteira de CI/CD & Deploy

1. **Deploy Frontend & Backend Serverless:** Integrado via **Vercel** conectado à branch `main`. Qualquer `git push` atualiza o ambiente de produção automaticamente.
2. **Quality Gate (GitHub Actions):** O workflow [`.github/workflows/ci.yml`](file:///home/beth/Documentos/MWT/agendaMed/.github/workflows/ci.yml) executa typecheck (`tsc`), linting (`oxlint`), testes unitários (`vitest`) e teste de build a cada commit.
3. **Migrações de Banco (Supabase):** O workflow [`.github/workflows/prisma-migrate.yml`](file:///home/beth/Documentos/MWT/agendaMed/.github/workflows/prisma-migrate.yml) roda as migrações do Prisma ORM automaticamente no banco de produção.
