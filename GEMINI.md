# Diretrizes do Projeto AgendaMed

## 1. Controle de Versão (Git & Deploy)
- **NÃO realizar `git commit` ou `git push` automaticamente:**
  - O assistente NUNCA deve criar commits ou enviar alterações para o repositório remoto (`git push`) sem antes perguntar e receber autorização explícita do usuário.
  - O fluxo padrão deve ser:
    1. Implementar as alterações de código solicitadas.
    2. Validar a qualidade (testes unitários com `npm test`, build e tipagem).
    3. Apresentar o resumo das alterações e os arquivos modificados para o usuário.
    4. Perguntar se o usuário aprova o commit e o push antes de executar comandos do Git.

## 2. Padrões de Interface e Experiência do Usuário (UI/UX)
- **Proibido o uso de `alert()` nativo:** Sempre utilizar componentes de modais do design system para confirmações, avisos e mensagens de erro.
- **Mensagens de Erro Claras:** Sempre extrair e exibir mensagens de erro amigáveis em português (`error.message`) em vez de códigos HTTP ou mensagens técnicas brutas como `"Bad Request"`.

## 3. Segurança e Permissões
- Ações administrativas (como remover membros da equipe ou alterar cargos) devem ser visíveis e permitidas exclusivamente para usuários com cargo `role === 'ADMIN'`.

## 4. Arquitetura Multi-Dispositivo (Mobile vs. Desktop/Tablet)
- **Regra de Ouro do Modo Mobile:** O layout mobile está 100% homologado e finalizado. NUNCA alterar, quebrar ou regredir o layout mobile existente a menos que expressamente solicitado pelo usuário.
- **Modo Desktop & Tablet Dedicado:**
  - Criar interfaces ricas e pensadas para telas médias e grandes (`md:`, `lg:`, `xl:`), aproveitando todo o espaço horizontal da tela (Sidebar/Header superior, Hero, cards em grid, efeitos suaves de scroll e micro-animações).
  - Remover elementos exclusivos de mobile (como a Bottom Navigation Bar fixa no rodapé) na visualização desktop/tablet.
  - Manter 100% da lógica de negócio e regras já existentes, focando as melhorias puramente no design e apresentação visual desktop.
