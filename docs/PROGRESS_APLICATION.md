# Relatório de Progresso: AgendaMed

Este documento registra o histórico de desenvolvimento, a situação atual da aplicação (em qual "pé" estamos) e os próximos passos para a conclusão do Produto Mínimo Viável (MVP).

---

## 1. O que já foi feito (Concluído) ✅

### 🏗️ Infraestrutura e Backend
- **Configuração Inicial:** Configuração do ecossistema Monorepo (Frontend em Vite/React e Backend em Node.js/Fastify).
- **Banco de Dados Real:** Modelagem e implantação do banco de dados relacional (PostgreSQL) usando Prisma ORM (Tabelas: `User`, `Patient`, `Medication`, `Document`, `PushSubscription`).
- **Arquitetura Escalável:** Padrão rigoroso `Layered R-U-R` implementado (Router > UseCase > Repository), garantindo um código limpo e fácil de testar.
- **Segurança de APIs:** Zod para validação de dados de entrada e Middlewares de JWT para bloqueio de rotas protegidas.
- **CRUDS Completos:** Rotas de Criação, Leitura, Atualização e Deleção (CRUD) prontas para todas as entidades.
- **Cron Job & Timezone:** Motor interno agendado (`cron.service.ts`) operando a cada minuto. Cálculo de fuso horário blindado para `America/Fortaleza` (Brasília) garantindo precisão nos alertas, independentemente do local físico do servidor em nuvem.

### 🚀 Deploy e Infraestrutura
- **Servidor Backend (Vercel Serverless):** API migrada com sucesso da VM antiga da GCP para a arquitetura Serverless na Vercel no endereço `api-agenda-med-mwt.vercel.app`.
- **Persistência de Sessão WhatsApp (Supabase Storage):** Criação e sincronização do bucket privado `whatsapp-auth` no Supabase Storage para armazenamento persistente de sessão do Baileys sem perdas em deploys stateless.
- **Segurança de Autenticação:** Validação com suporte a popups do Google OAuth (COOP) e sanitização automática de segredos JWT e Client IDs.
- **Frontend Vercel:** Hospedado no domínio `agendamed.moduloweb.com.br` apontando para a API Vercel Serverless.

### 📱 Experiência de App (PWA & Notificações Push)
- [x] **4. Notificações e Atualizações PWA**
  - Integração com Service Worker e detecção de updates via contexto (`PwaUpdateContext`).
  - Badge visual (bolinha vermelha) alertando novas versões de forma silenciosa e elegante.
  - Separação explícita entre "Câmera" e "Galeria" no fluxo de fotos.
- **Transformação para App Nativo:** Implementação do `vite-plugin-pwa`. Geração de manifest e ícones nativos.
- **Fluxo de Instalação (Install App):** Lógica inteligente de detecção do iOS (Safari) guiando o usuário a instalar manualmente, enquanto exibe o prompt nativo no Android.
- **Notificações Push (Substituindo o WhatsApp):** Estratégia modernizada. O usuário se loga e o Service Worker gera uma inscrição (Subscription) no servidor. O servidor envia o Push via internet direto para a tela de bloqueio do celular, tornando o app autossuficiente e economizando custos com APIs do WhatsApp.
- **Feedback UI (Zero Alerts):** Criação de um `FeedbackContext` global. Todos os `alert()` nativos do navegador foram extirpados e substituídos por modais elegantes que seguem o Design System.

### 🔐 Autenticação (A "Mágica")
- **Fluxo "Magic Link":** Geração de Token JWT que envia um link seguro (Magic Link), autenticando o usuário no celular sem necessidade de senhas. 
- **Gestão de Sessão (LocalStorage):** Frontend mantém de forma segura as credenciais e força redirecionamentos quando o token expira.

### 🖼️ Frontend (Interface)
- **Tela de Perfil:** Atualização de dados, deleção de conta e botão principal de "Instalar Aplicativo".
- **Tela de Agenda:** Wizard avançado de medicação enviando dados diretamente para o Supabase. 
- **Tela do Cofre:** Upload real de imagens (`Multipart`) para o Storage do Supabase (bucket `agendamed`). Frontend recebe URL final segura.

---

## 2. Em que "pé" estamos (Situação Atual) 📍
Estamos em fase de **Homologação/Testes**. O MVP principal está de pé. 
Temos um PWA funcional que envia Notificações Push na tela de bloqueio com sincronia de Fuso Horário, e com uma jornada de usuário que já flui sem engasgos de interface (sem *alerts* intrusivos). A estrutura está pronta para uso diário.

---

## 3. O que ainda precisamos fazer (Próximos Passos) 🚀

- [x] **2. Agenda Central (Visualização Diária)**
  - Lista de remédios filtrada pela data e paciente selecionado.
  - Cartão de medicamento com miniatura da foto, horário, status, cor de status (Tomado, Atrasado, Pendente).
  - Modal de Foto Expandida.
  - Edição de medicamentos pelo modal, incluindo capacidade de **Adicionar/Alterar Foto** do medicamento cadastrado.
- [x] **Gestão de Cargos e Permissões:** 
  - Funcionalidade implementada permitindo que Administradores promovam cuidadores a moderadores/administradores ou os rebaixem, estabelecendo um controle de acesso seguro entre os perfis familiares.
