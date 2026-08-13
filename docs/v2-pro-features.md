# Planejamento de Funcionalidades - AgendaMed V2.0 (Modelo PRO)

Este documento guarda as ideias estruturadas para a futura versão 2.0 do AgendaMed, que incluirá monetização e planos pagos (Modelo Pro), após a validação de mercado da versão 1.0 (totalmente gratuita).

## Estratégia de Monetização

A versão 1.0 será 100% gratuita para atrair base de usuários, testar o mercado e gerar engajamento. 
Na versão 2.0, manteremos o **Modelo Free** para retenção, mas introduziremos o **Modelo Pro** focando em comodidade, segurança extrema e automação para as famílias, justificando a assinatura.

---

## 🟢 Modelo Free (V2.0)
Focado na retenção e no uso básico do cuidado familiar.
- **Pacientes/Familiares:** Limite de 1 ou 2 pacientes por conta.
- **Cuidadores na Família:** Limite de 2 a 3 pessoas compartilhando a gestão.
- **Alertas e Lembretes:** Notificações Push padrão (no celular/navegador) para medicamentos e consultas.
- **Cofre de Documentos:** Armazenamento básico (ex: limite de até 5 documentos ou 10MB).
- **Histórico Médico:** Acesso limitado (ex: últimos 30 dias de uso e checagens).

---

## 👑 Modelo PRO (V2.0)
Focado na tranquilidade, automação avançada e remoção de restrições.

### 1. Alertas via WhatsApp (A "Killer Feature") 🚀
O envio de lembretes de remédios e consultas diretamente no WhatsApp dos cuidadores e do idoso. Essa é a funcionalidade de maior valor percebido e conversão, já que o WhatsApp é a plataforma de maior atenção. Requer infraestrutura paga (ex: Twilio / WABA / Baileys dedicado).

### 2. Pacientes e Cuidadores Ilimitados
Remoção dos limites para famílias maiores ou para Cuidadores Profissionais, que utilizam o app como ferramenta de trabalho para gerenciar vários idosos simultaneamente.

### 3. Alertas Intensivos (Escalonamento de Emergência)
Sistema de segurança avançado: se o cuidador principal (ou o paciente) não confirmar no aplicativo que o remédio foi tomado após X minutos, o sistema dispara ligações automáticas ou "Alertas de Emergência" no WhatsApp para os demais familiares do grupo.

### 4. Cofre de Documentos Ilimitado
Armazenamento na nuvem irrestrito para arquivar todos os exames de sangue, laudos, raios-x e prontuários de forma segura e organizada, criando um "dossiê" completo da saúde do paciente.

### 5. Relatórios Médicos Inteligentes (Exportação) ✅ [IMPLEMENTADO]
Geração de relatórios PDF com 1 clique diretamente da API via jsPDF, resumindo o histórico de medicamentos tomados, taxa de adesão (%), doses previstas vs. confirmadas e lista de remédios, preparado especificamente para o usuário imprimir ou baixar antes de uma consulta.
