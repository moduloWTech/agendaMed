# Constituição do Projeto: AgendaMed

> **Aviso ao Agente de IA Local:** Este é o Documento Mestre de Cultura e Arquitetura do projeto. Ao ler este manifesto, você adquire o contexto completo de como operar.

## 1. Visão Geral do Produto
O **AgendaMed** é uma aplicação voltada para a gestão de medicamentos e da rotina de saúde de idosos que dependem de múltiplos cuidadores familiares. A aplicação centraliza a gestão para evitar riscos de superdosagem, esquecimentos e perda de informações médicas, garantindo segurança ao paciente e tranquilidade aos familiares com uma interface rigorosamente adaptada para usuários com baixa fluência tecnológica.

## 2. Diretrizes Arquiteturais e Tech Stack
- **Frontend:** PWA (Progressive Web App) desenvolvido com **React** e **Vite** (foco em alta performance e carregamento instantâneo).
- **Estilização e UI:** **Tailwind CSS** (para criação ágil de interfaces acessíveis, responsivas e consistentes).
- **Notificações:** Service Workers integrados ao Firebase Cloud Messaging (FCM) e API do WhatsApp.
- **Backend/Banco de Dados:** Node.js/TypeScript.

## 3. Diretrizes de UI/UX e Design
- **Padrões Mobile Nativos:** Layout focado em uso mobile (Bottom Navigation Bar, Splash Screen, Bottom Sheets, etc).
- **Acessibilidade e Usabilidade:** Elementos grandes (áreas de toque generosas de 48px+), botões largos, e fontes legíveis (tamanho mínimo do corpo de texto de 18px).
- **Paleta de Cores de Saúde e Calma:** Foco na clareza (fundo branco/off-white) e cores para reduzir carga cognitiva: Azul suave para botões principais, Verde esmeralda para sucesso/check e vermelho estritamente para atrasos ou falhas.

## 4. Diretrizes Estritas de Segurança para APIs (Node.js/TypeScript)
Você deve proativamente evitar falhas comuns e implementar padrões robustos de segurança:
1. **Headers de Segurança (Helmet):** Utilizar `helmet` ou `@fastify/helmet` como o primeiro middleware para proteger contra vulnerabilidades web.
2. **Rate Limiting:** Limitação global por IP (ex: 1000 req/min) e limites rígidos em rotas sensíveis como login.
3. **Validação de Input:** Validar 100% dos dados de entrada (Body, Query, Params) utilizando **Zod** antes que atinjam as regras de negócio.
4. **CORS Restrito:** Implementar uma Whitelist estrita, nunca usando `Access-Control-Allow-Origin: *` em produção.
5. **Logs de Auditoria:** Registrar ações críticas com informações sobre quem, quando, de onde e o que foi feito.
6. **Gestão de Segredos Estrita:** Nenhum segredo ou chave hardcoded no código. Usar `.env` para dev e variáveis injetadas em produção.
7. **Tokens JWT com Expiração Curta:** Usar tokens com vida útil de, no máximo, 15 minutos e implementar Refresh Tokens rotativos (evitar validade longa).
8. **Insecure Direct Object Reference (IDOR):** Evitar endpoints que executam ações baseadas unicamente em parâmetros de URL sem verificar as permissões. Sempre cruzar ID requisitado com permissão do usuário autenticado.

## 5. Regras Comportamentais Estritas para Agente de IA
- **Idioma:** Sempre se comunicar em `pt-br`.
- **Componentização Estrita:** Sempre componentizar a estrutura para evitar ter arquivos com mais de 150 linhas de código.
- **Verificação de Regressão Obrigatória:** Sempre que for fazer uma alteração, o agente deve se perguntar ativamente: *"Essa alteração vai modificar o que já está funcionando na aplicação?"* e mitigar riscos.
- **Prevenção e Permissão:** Sempre explique a alteração que vai fazer *antes* e pergunte se deve fazer essa alteração.
- **Modo Somente Leitura Inicial:** Sempre responda as perguntas que o usuário fizer *sem* mudar o código. Modifique o código *somente* se o usuário autorizar explicitamente.
