# Relatório de Progresso: AgendaMed

Este documento registra o histórico de desenvolvimento, a situação atual da aplicação (em qual "pé" estamos) e os próximos passos para a conclusão do Produto Mínimo Viável (MVP).

---

## 1. O que já foi feito (Concluído) ✅

### 🏗️ Infraestrutura e Backend
- **Configuração Inicial:** Configuração do ecossistema Monorepo (Frontend em Vite/React e Backend em Node.js/Fastify).
- **Banco de Dados Real:** Modelagem e implantação do banco de dados relacional (PostgreSQL) usando Prisma ORM (Tabelas: `User`, `Patient`, `Medication`, `Document`).
- **Arquitetura Escalável:** Padrão rigoroso `Layered R-U-R` implementado (Router > UseCase > Repository), garantindo um código limpo e fácil de testar.
- **Segurança de APIs:** Zod para validação de dados de entrada e Middlewares de JWT para bloqueio de rotas protegidas.
- **CRUDS Completos:** Rotas de Criação, Leitura, Atualização e Deleção (CRUD) prontas para todas as entidades.

### 🔐 Autenticação (A "Mágica")
- **Integração WhatsApp:** Bot construído com a biblioteca `@whiskeysockets/baileys`.
- **Fluxo "Magic Link":** O usuário envia mensagem no WhatsApp, o sistema detecta/cadastra, gera um Token JWT seguro e envia um link clicável (Magic Link) que autentica o usuário diretamente no celular sem necessidade de senhas.

### 📱 Frontend (Interface e Integração)
- **Design System:** Telas construídas com TailwindCSS seguindo o conceito focado em usabilidade para idosos/cuidadores.
- **AuthContext (Coração do App):** Estado global que armazena os dados do Cuidador logado e do Paciente Ativo de forma segura usando `localStorage`.
- **Lógica de Paciente Único:** O sistema auto-cria um paciente nos bastidores quando o Administrador se loga pela primeira vez, mantendo a regra de que o app serve para "Um paciente / Vários cuidadores".
- **Tela de Perfil:** Exibe os dados reais do usuário logado e permite renomear amigavelmente o familiar que está sendo cuidado através de um Modal nativo.
- **Tela de Agenda:** Busca de medicamentos de forma real da API. O *Wizard* (Passo a Passo) agora envia novos medicamentos diretamente para o banco de dados. Ajustes de UI garantem alinhamento correto do botão flutuante em telas largas.
- **Tela do Cofre:** Busca de documentos (laudos, receitas) da API e integração parcial da modal de Adicionar Documento. Ajustes de UI no botão flutuante para telas largas.

---

## 2. Em que "pé" estamos (Situação Atual) 📍
Neste exato momento, o esqueleto central do projeto (Frontend ↔ Backend ↔ Banco de Dados) está **100% conectado**. O fluxo crítico (entrar pelo WhatsApp, ver a tela, cadastrar um remédio e ver ele na tela) funciona com dados reais. Saímos da fase de "Mocks" (dados de mentira) e agora temos um sistema *Full-Stack* operante.

---

## 3. O que ainda precisamos fazer (Próximos Passos) 🚀

Para o MVP atingir a sua plenitude, as seguintes funcionalidades críticas estão na fila:

- [ ] **Baixa de Medicamentos (Histórico):** Criar a lógica para quando a pessoa clicar na bolinha do remédio na Agenda, o sistema gravar que a dose daquele horário específico foi "Tomada" por fulano.
- [ ] **Avisos pelo WhatsApp (Cron Jobs):** Implementar um motor no backend que roda a cada minuto (ou usa agenda) para ler os horários e disparar mensagens automáticas de alerta ("Hora do remédio X!") no WhatsApp.
- [ ] **Upload Real de Arquivos:** No cofre, substituir a "URL Falsa" da foto por um upload real de imagem (para o servidor, AWS S3, Firebase ou Supabase Storage).
- [ ] **Gestão de Cuidadores (Convites):** Criar a funcionalidade para o Administrador adicionar outros números de WhatsApp na família para que eles também possam pedir o "Magic Link".
- [ ] **Desconexão por Inatividade/Segurança:** Tratar com mais robustez a queda do bot do WhatsApp ou quando o número admin for removido.
- [ ] **Testes em Dispositivo Real:** Fazer deploy do Frontend e Backend em uma infraestrutura (ex: Render, Vercel) para testes pesados simulando o dia a dia.
