# CONTEXTAPPLICATION.md

## 1. Motivação e Contexto do Projeto
O projeto visa resolver um problema real e crítico: a gestão de medicamentos e da rotina de saúde de idosos que dependem de múltiplos cuidadores (familiares). Atualmente, a comunicação familiar ocorre de forma descentralizada via grupos de WhatsApp, o que gera riscos de superdosagem, esquecimentos e perda de informações médicas. A aplicação centralizará essa gestão, oferecendo uma interface rigorosamente adaptada para usuários com baixa fluência tecnológica, garantindo segurança ao paciente e tranquilidade aos familiares.

## 2. Tecnologias Definidas
* **Frontend:** PWA (Progressive Web App) desenvolvido com **React** e **Vite** (foco em alta performance e carregamento instantâneo sem necessidade de instalação via app stores).
* **Estilização e UI:** **Tailwind CSS** (para criação ágil de interfaces acessíveis, responsivas e consistentes).
* **Notificações Push:** Service Workers integrados ao Firebase Cloud Messaging (FCM).
* **Integração de Mensageria:** API do WhatsApp (como Evolution API ou Meta Oficial) para disparos automatizados no grupo da família.
* **Armazenamento de Arquivos:** AWS S3 ou Firebase Storage (com rotinas de compressão de imagens para fotos de remédios e receitas).
* **Backend/Banco de Dados:** Arquitetura capaz de suportar relacionamentos de múltiplos cuidadores por paciente, com indexação otimizada por data e rotinas em background (CRON jobs) para alertas de agenda.

## 3. Escopo de Funcionalidades (Features)

### 3.1. Gestão de Medicamentos e "Checks"
* **Cadastro Visual:** Registro de medicamentos com dosagem, horários e upload obrigatório/opcional de foto (caixa ou comprimido) para evitar confusão visual.
* **Sistema de Check Inteligente:** Interface de um clique para confirmar a administração do remédio.
* **Edição de Horário:** Possibilidade de ajustar a hora exata do check (caso o cuidador registre no app minutos após ter dado o remédio).
* **Auditoria de Cuidado:** Exibição clara de quem deu o remédio e a que horas.

### 3.2. Sistema de Alertas Omnichannel
* **Push Notifications (PWA):** Lembretes disparados diretamente no celular do cuidador responsável nos horários programados.
* **Alertas no WhatsApp:** Disparo automático de uma mensagem de confirmação no grupo da família logo após um check ser realizado (ex: "✅ A medicação [Nome] foi dada às [Horário] por [Nome do Cuidador]").

### 3.3. Histórico e Calendário Acessível
* **Barra de Navegação Semanal:** Em vez de calendários mensais complexos, um carrossel deslizante com os dias da semana atual em botões grandes.
* **Linha do Tempo Diária:** Visualização vertical limpa contendo o status de cada medicamento do dia (concluído, pendente, atrasado).
* **Seletor de Data Opcional:** Botão dedicado para buscar dados de meses anteriores, usado principalmente em consultas médicas.

### 3.4. Prontuário Digital da Família (Agendamentos e Cofre)
* **Agenda Médica:** Inclusão de consultas e exames na mesma linha do tempo do calendário, contendo detalhes como especialidade, local e orientações (ex: jejum).
* **Lembretes Automáticos:** O sistema notifica a família (Push/WhatsApp) na véspera do compromisso médico para organização logística.
* **Cofre de Saúde:** Área para upload seguro, armazenamento e categorização (tags) de fotos de receitas médicas, laudos e pedidos de exames.

## 4. Diretrizes de UI/UX e Acessibilidade
* **Foco no Público-Alvo:** Design minimalista e à prova de erros, pensado para pessoas de mais idade ou com pouca afinidade tecnológica.
* **Paleta de Cores:** Tons de saúde e tranquilidade (azuis suaves e verdes menta para feedbacks de sucesso), com branco predominante para reduzir carga cognitiva. Cores de alerta apenas para falhas/atrasos.
* **Usabilidade:** Botões largos (áreas de toque generosas, mínimo de 48px), tipografia em alto contraste (seguindo diretrizes WCAG) e primeira tela focada estritamente nas ações do dia.
