# Roadmap Estratégico de Produto & Funcionalidades Competitivas - AgendaMed

Este documento consolida a visão estratégica e o backlog de novas funcionalidades para posicionar o **AgendaMed** como uma plataforma líder e altamente competitiva no mercado de gestão de saúde familiar, cuidados com idosos e apoio a cuidadores profissionais.

---

## 1. 💊 Gestão Inteligente de Medicamentos & Estoque

### 1.1 Controle Automático de Estoque com Alerta de Reposição 🌟 (Alta Prioridade)
* **Objetivo:** Evitar que tratamentos contínuos sejam interrompidos por falta de remédio.
* **Funcionamento:** 
  * Ao cadastrar um medicamento, o usuário define a quantidade na embalagem (ex: 30 comprimidos / 100 ml).
  * A cada confirmação de dose ministrada no diário, o sistema debita automaticamente a quantidade correspondente.
  * **Notificação Preditiva:** Quando o estoque atingir menos de 5 dias de tratamento, o app envia alertas automáticos: *"O estoque de Losartana está acabando (restam 4 doses). Lembre-se de repor!"*.

### 1.2 Leitor de Código de Barras / OCR de Caixa de Medicamentos
* **Objetivo:** Cadastro rápido sem digitação.
* **Funcionamento:** O usuário aponta a câmera para o código de barras ou a frente da caixa do remédio; o sistema consulta uma base farmacêutica e preenche automaticamente nome comercial, princípio ativo, laboratório e foto.

### 1.3 Alerta de Interações Medicamentosas
* **Objetivo:** Segurança clínica e prevenção de acidentes.
* **Funcionamento:** Algoritmo que cruza os medicamentos ativos do paciente e emite alertas visuais caso haja incompatibilidade química ou contraindicações graves conhecidas.

---

## 2. 📊 Sinais Vitais & Prontuário Clínico Familiar

### 2.1 Registro e Gráficos de Sinais Vitais Diários 🌟 (Alta Prioridade)
* **Métricas Suportadas:**
  * **Pressão Arterial:** Sistólica / Diastólica (ex: 120/80 mmHg) + Frequência Cardíaca.
  * **Glicemia Capilar:** Em jejum e pós-prandial (mg/dL).
  * **Temperatura Corporal:** Monitoramento de febre (°C).
  * **Oximetria:** Saturação de Oxigênio (SpO2 %).
  * **Peso Corporal:** Evolução de ganho/perda de peso (kg).
* **Visualização:** Gráficos interativos com linhas de tendência semanal, mensal e alertas para valores fora da faixa segura.

### 2.2 Relatório Médico Completo em PDF (1 Clique)
* **Objetivo:** Facilitar consultas médicas com dados concretos de adesão.
* **Conteúdo do Relatório:**
  * Taxa percentual de adesão aos medicamentos (ex: 96% de pontualidade).
  * Registro de doses esquecidas ou atrasadas.
  * Gráficos e tabelas com a evolução da pressão arterial e glicemia do período.
  * Lista atualizada de remédios em uso com dosagens e recomendações.

---

## 3. 🚨 Segurança, Emergência & Comunicação da Família

### 3.1 Botão de Pânico / SOS Familiar
* **Objetivo:** Resposta rápida a emergências médicas.
* **Funcionamento:** Botão de destaque na tela inicial. Ao ser acionado, dispara notificações sonoras de prioridade máxima no celular de todos os familiares e cuidadores cadastrados, além de mensagem direta com localização.

### 3.2 Passagem de Plantão Digital (Diário de Ocorrências)
* **Objetivo:** Sincronização entre múltiplos cuidadores e familiares.
* **Checklist Diário:**
  * Alimentação e refeições do dia.
  * Hidratação (meta de copos d'água ingeridos).
  * Higiene e banho.
  * Humor / disposição do paciente.
  * Anotações e recados importantes para o próximo plantonista.

### 3.3 Log de Auditoria e Transparência Familiar
* Registro histórico inviolável de quem ministrou o medicamento, com carimbo de data, hora e responsável, evitando conflitos familiares e duplicidade de doses.

---

## 4. 👵 Acessibilidade & Modo Sênior

### 4.1 Modo Idoso (Interface Simplificada)
* Layout dedicado com botões extragrandes, fontes ampliadas e alto contraste.
* Foco na ação única: botão grande *"Tomei meu remédio de agora"*, ideal para idosos que moram sozinhos e possuem baixa familiaridade com tecnologia.

### 4.2 Confirmação por Comando de Voz
* Integração com reconhecimento de fala para que o paciente confirme a administração apenas dizendo: *"Remédio tomado"*.

---

## 5. 💰 Monetização & Modelos de Negócio (B2B & Parcerias)

### 5.1 Integração com Farmácias (Reposição com 1 Toque)
* Botão *"Comprar Reposição"* integrado ao alerta de estoque baixo, comparando preços ou direcionando para entrega rápida em farmácias parceiras (gerando receita de afiliado/comissão).

### 5.2 Plano B2B para Clínicas, ILPIs e Cuidadores Profissionais
* Painel multi-paciente permitindo que profissionais de saúde e lares de idosos gerenciem de 5 a 50+ pacientes sob uma única assinatura corporativa recorrente.

---

*Documento mantido pela equipe de Produto e Engenharia da MW Technology para guiar as próximas sprints.*
