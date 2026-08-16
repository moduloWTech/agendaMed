# Constituição do Projeto: AgendaMed

> **Aviso ao Agente de IA Local:** Este é o Documento Mestre de Cultura e Arquitetura do projeto. Ao ler este manifesto, você adquire o contexto completo de como operar.

## 1. Visão Geral do Produto
O **AgendaMed** é uma aplicação voltada para a gestão de medicamentos e da rotina de saúde de idosos que dependem de múltiplos cuidadores familiares. A aplicação centraliza a gestão para evitar riscos de superdosagem, esquecimentos e perda de informações médicas, garantindo segurança ao paciente e tranquilidade aos familiares com uma interface rigorosamente adaptada para usuários com baixa fluência tecnológica.

## 2. Diretrizes Arquiteturais e Tech Stack
- **Frontend:** PWA (Progressive Web App) desenvolvido com **React** e **Vite** (foco em alta performance e carregamento instantâneo).
- **Estilização e UI:** **Tailwind CSS** (para criação ágil de interfaces acessíveis, responsivas e consistentes).
- **Notificações:** Service Workers integrados ao Firebase Cloud Messaging (FCM) e API do WhatsApp.
- **Backend/Banco de Dados:** Node.js/TypeScript.

## 3. Diretrizes de UI/UX e Design (Multi-Dispositivo)
- **Regra de Ouro do Modo Mobile:** O layout mobile está 100% homologado e finalizado. NUNCA alterar, quebrar ou regredir o layout mobile existente a menos que expressamente solicitado pelo usuário.
- **Modo Desktop & Tablet Dedicado:**
  - Criar interfaces ricas e pensadas para telas médias e grandes (`md:`, `lg:`, `xl:`), aproveitando todo o espaço horizontal da tela (Sidebar/Header superior, Hero, cards em grid, efeitos suaves de scroll e micro-animações).
  - Remover elementos exclusivos de mobile (como a Bottom Navigation Bar fixa no rodapé) na visualização desktop/tablet.
  - Manter 100% da lógica de negócio e regras já existentes, focando as melhorias puramente no design e apresentação visual desktop.
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

## 5. Padrão Organizacional do Backend (Layered R-U-R)
Todo microsserviço Node.js/TypeScript deve ser estruturado em 3 camadas (Router, UseCase, Repositorie):
- **`*.router.ts`:** Expõe rotas, aplica middlewares, valida dados imediatamente com Zod (fail-fast) e NÃO possui regras de negócio.
- **`*.usecase.ts`:** Lógica de negócio pura, orquestrando repositórios e serviços (agnóstico ao framework web). **Proibido o uso de `prisma` ou conexões diretas ao DB nesta camada.**
- **`*.repositorie.ts`:** Acesso direto ao banco de dados, isolando a dependência do ORM (Prisma/TypeORM).

## 5.1. Diretrizes de Tipagem (TypeScript)
- **Tipagem Estrita:** É terminantemente proibido o uso da tipagem `any`. Todas as variáveis, parâmetros e retornos devem ter tipagem explícita ou inferida corretamente.
- **Pasta `types`:** Caso seja necessário criar tipos globais para o sistema API, eles devem ser armazenados em uma pasta `types` (ex: `api/src/types`).

## 6. Arquitetura Stateless e Otimização
- O backend deve ser cego quanto à infraestrutura e totalmente configurável via `.env` para evitar Vendor Lock-in.
- **Prevenção OOM (Out Of Memory):** Não processar uploads e compressão de grandes buffers de imagens na RAM do backend. A compressão deve ser feita estritamente no cliente (browser/app) antes do envio, enquanto o backend funciona apenas como repassador (para o S3/CDN).

## 7. Fluxo de Deploy e CI/CD
- Todo push na branch `main` ativa o pipeline do GitHub Actions, que levanta um banco efêmero e roda obrigatoriamente testes automatizados.
- O build gera uma imagem Docker que é enviada ao GHCR (GitHub Container Registry).
- O deploy ocorre automaticamente via conexão SSH na máquina virtual (GCP), puxando a nova imagem Docker, injetando as variáveis via `--env-file` e limpando os resíduos (prune).

## 8. Diretrizes Rigorosas de Testes de Software (Filosofia da Fonte da Verdade)
- **O Teste é o Contrato Inviolável:** Na MW Technology, os testes automatizados representam a especificação e as regras de negócio escritas em pedra.
- **NUNCA alterar o teste para mascarar falhas de código:** Se um teste que antes passava começar a falhar após uma alteração no código, NUNCA altere o teste para se adequar ao erro ou enfraquecer asserções. O erro está no código da aplicação e é a aplicação que deve ser corrigida para atender ao teste.
- **Evolução de Requisitos (TDD):** Caso uma regra de negócio mude intencionalmente por decisão de produto, o teste deve ser atualizado primeiro para refletir o novo contrato e o código implementado em seguida.
- **Proteção Anti-Regressão:** Toda funcionalidade crítica (cálculo de doses, rotas de cron, autenticação, permissões, multi-tenant) deve possuir cobertura de testes automatizados isolados e passar 100% no CI antes de qualquer deploy.
- **Barreira de Qualidade em CI/CD:** O pipeline do GitHub Actions roda obrigatoriamente os testes do frontend e da API a cada push/PR. Se qualquer teste falhar (`exit code 1`), o deploy é abortado imediatamente.

## 9. Regras Comportamentais Estritas para Agente de IA
- **Controle de Versão (Git & Deploy):** O assistente NUNCA deve criar commits ou realizar `git push` automaticamente sem antes perguntar e receber autorização explícita do usuário.
- **Padrões de UI/UX:** Proibido o uso de `alert()` nativo. Sempre utilizar componentes de modais do design system e exibir mensagens de erro amigáveis em português (`error.message`).
- **Segurança e Permissões:** Ações administrativas visíveis e permitidas exclusivamente para usuários com cargo `role === 'ADMIN'`.
- **Regra de Ouro do Modo Mobile:** O layout mobile é 100% homologado e finalizado. NUNCA alterar, quebrar ou regredir o layout mobile existente a menos que expressamente solicitado.
- **Modo Somente Leitura Inicial:** Responda as perguntas que o usuário fizer sem alterar o código. Modifique o código somente quando autorizado.
- **Registro de Progresso Obrigatório:** Antes de subir uma nova versão para o repositório, atualizar a documentação de progresso detalhando as alterações.
