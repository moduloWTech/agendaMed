# Histórico e Contexto Atual do Projeto (AgendaMed)

Este documento guarda a "memória" da nossa sessão de desenvolvimento para que o contexto não se perca ao iniciar um novo chat.

---

## 1. Estado Atual do Código (Checkpoint)
- **Commit Atual:** O sistema foi forçado e congelado no commit `b768fde` (que inclui todas as features validadas hoje, como correção de escopo PWA, modais de fotos e layout refinado).
- **Branch:** `main` (Totalmente sincronizado com o GitHub e Vercel).

## 2. Últimas Funcionalidades Implementadas
- **Foto no Modal de Edição:** O administrador agora pode clicar na miniatura dentro do modal de "Editar Medicamento" para adicionar ou substituir a foto de um remédio usando a câmera ou galeria do celular.
- **Botões de Câmera e Galeria Explícitos:** No fluxo de Novo Medicamento, há dois botões visíveis ("Tirar Foto" e "Galeria") facilitando o entendimento em dispositivos Android.
- **Correção da Notificação "WebAPK Out-of-Scope":** Adicionamos `start_url: '/'` e `scope: '/'` no `vite.config.ts`. Isso impede que o Google Chrome exiba a notificação persistente perguntando se deseja "Compartilhar o URL do app".

## 3. Bugs Investigados e Conclusões
- **O Falso Bug de "Gerar Cards Automaticamente":**
  - **Sintoma:** O usuário achou que a Agenda estava criando clones do medicamento ao avançar e voltar os dias.
  - **Causa Real:** Foram criados manualmente múltiplos cadastros de medicamentos com o mesmo nome (ex: "Cerveja preta") com datas de início diferentes. O sistema estava operando 100% corretamente (ocultando os do futuro no dia anterior e exibindo a soma de todos no dia atual).
  - **Solução:** Basta que o usuário apague os medicamentos "clones" excedentes na interface do app usando o botão "Excluir". Nenhuma alteração no código foi necessária.
- **O Bug da Notificação que não chega (Paradoxo do Minuto):**
  - **Sintoma:** Remédio cadastrado para 05:41 não disparou notificação sendo que já eram 05:44.
  - **Causa Real:** O cronjob do backend roda exatos no segundo 00 de cada minuto (ex: 05:41:00). Se o cadastro for finalizado alguns segundos atrasado (05:41:15), a janela do cronjob daquele minuto já passou, e a notificação é perdida. Para testar com sucesso, é preciso agendar para alguns minutos no futuro.

## 4. Definições Técnicas e Limitações (PWA vs Nativo)
- **Como as Notificações são Disparadas (`push.service.ts`):** 
  - O método `saveSubscription` apenas guarda a "senha e endereço postal" (chaves de criptografia e endpoint) do navegador do usuário no banco.
  - O método `sendNotificationToUsers` é invocado pelo Cronjob. Ele notifica **todos os cuidadores (users)** vinculados àquele paciente, e não apenas o usuário que criou o medicamento.
- **O Limite do "Despertador" no Celular:**
  - O objetivo de ter um alarme tocando infinitamente em alto volume (mesmo com a tela bloqueada) até que alguém o desligue **não é possível através da Web (PWA)** devido a bloqueios de segurança do Google Chrome e da Apple.
  - A notificação PWA atual consegue enviar a mensagem (com um som de 'ding' curto) e pode se manter fixada na tela usando `requireInteraction: true`, mas não toca sons em loop.
  - **Próximo Passo Decidido:** Para ter um despertador real, o app precisará obrigatoriamente ser empacotado para a Play Store (via Bubblewrap ou ferramenta similar) no futuro, integrando plugins de Alarmes Nativos do Android (`AlarmManager`).

---
**Instrução para a IA ao ler este arquivo:** Continue o trabalho a partir deste exato ponto, sabendo que as funções de PWA e Foto de Medicamento já estão implementadas e estabilizadas, e que as discussões arquiteturais sobre o alarme nativo já foram alinhadas com o usuário.
