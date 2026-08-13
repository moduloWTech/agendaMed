# DESIGN.md

## 1. Conceito e Público-Alvo
Este é um Progressive Web App (PWA) construído com React e Tailwind CSS, mas com **comportamento, layout e UX estritamente de aplicativo nativo (iOS/Android)**. 
O aplicativo é voltado para a gestão familiar de cuidados e medicamentos para idosos. Como será utilizado por pessoas com diferentes níveis de familiaridade com tecnologia (incluindo usuários mais velhos), a interface deve ser extremamente intuitiva, limpa e altamente acessível (Padrões WCAG), sem abrir mão de uma estética moderna e polida.

## 2. Padrões Nativos Mobile e Navegação
- **Bottom Navigation Bar:** Menu fixo na parte inferior da tela, garantindo navegação fácil com uma mão. Ícones grandes e rótulos curtos ("Hoje", "Agenda", "Cofre").
- **Safe Areas:** O layout deve respeitar o *notch* (entalhe) no topo e a barra de gestos na base dos smartphones modernos.
- **Splash Screen:** Tela de abertura nativa cobrindo 100% da viewport, exibida enquanto o app carrega.
- **Modais e Bottom Sheets:** Formulários (como adicionar um remédio) devem subir da parte inferior da tela (estilo *bottom sheet*), mantendo o padrão de UX mobile contemporâneo.

## 3. Diretrizes Visuais e Modernidade
A interface deve equilibrar acessibilidade extrema com um toque de modernidade (clean UI):
- **Tipografia:** Uso da fonte **Inter** ou **Roboto**. O tamanho base (body) deve ser de no mínimo `18px` para facilitar a leitura. Títulos devem variar entre `24px` e `32px`. Textos de apoio não podem ser menores que `14px`.
- **Áreas de Toque (Touch Targets):** Todos os botões, links e cards clicáveis devem ter um tamanho mínimo de `48x48px`.
- **Espaçamento e Respiro:** Telas limpas, utilizando margins e paddings generosos (ex: `p-4`, `p-6`, `gap-4`).
- **Sombras e Bordas (Modernidade):** Utilizar bordas bem arredondadas nos cards (`rounded-2xl` ou `rounded-3xl`) e sombras suaves (`shadow-sm` ou `shadow-md`) para destacar os elementos do fundo sem poluir a tela. Efeitos sutis de *glassmorphism* (fundo levemente translúcido com blur) podem ser usados no header ou na bottom bar.

## 4. Paleta de Cores (Saúde e Calma)
- **Background Principal:** Branco off-white (`#F9FAFB` ou `bg-gray-50`) para reduzir o cansaço visual.
- **Superfícies (Cards):** Branco puro (`#FFFFFF`) para criar contraste claro com o fundo.
- **Cor Primária:** Azul suave e confiável (Tailwind `blue-600` ou `#2563EB`). Usado em botões principais e elementos ativos.
- **Cor de Sucesso:** Verde Esmeralda (Tailwind `emerald-500` ou `#10B981`). Focado exclusivamente para botões de "Check" e status positivo.
- **Cor de Alerta:** Vermelho/Laranja (Tailwind `red-500`), usado apenas para destacar medicações atrasadas.
- **Texto:** `gray-900` para títulos e `gray-700` para corpo de texto, garantindo alto contraste.

## 5. Bibliotecas de Ícones e Assets Visuais
- **Ícones (Lucide React ou Phosphor Icons):** Utilize uma dessas bibliotecas para garantir ícones modernos, consistentes e com traços mais grossos (peso *Regular* ou *Medium*), que facilitam a visualização. Os ícones devem ser grandes (mínimo `24px` a `32px`).
- **Imagens Geradas por IA (Apoio Visual):** O aplicativo deve incorporar ilustrações e imagens geradas por IA (estilo 3D suave, claymorphism ou ilustrações vetorizadas limpas e acolhedoras) em momentos estratégicos para embelezar a interface sem sobrecarregá-la. 
  - *Casos de uso sugeridos:* Tela de *Splash Screen* (um coração ou elemento de saúde estilizado), *Empty States* (ex: "Nenhum remédio pendente hoje!" acompanhado de uma ilustração relaxante) e *Onboarding* de boas-vindas.

## 6. Estrutura das Telas Principais

### 6.1. Splash Screen
- Fundo na cor primária (`blue-600`).
- Elemento central: Imagem/Logo moderno gerado por IA representando cuidado/família, seguido do nome do aplicativo em branco e peso bold.

### 6.2. Tela Inicial (Timeline / Home)
- **Header:** Fixo no topo, contendo a "Barra Semanal Deslizante". Carrossel horizontal com botões grandes para os dias da semana. O dia selecionado fica em destaque.
- **Corpo:** Lista vertical de cards de medicamentos.
  - *Card Pendente:* Mostra foto do remédio, nome, horário e um botão largo (full-width) verde esmeralda: "Dar Check".
  - *Card Concluído:* Opacidade reduzida, ícone de check e registro textual (ex: "Dado às 14h05 por João").
- **Empty State:** Se todos os remédios do dia foram dados, exibir uma ilustração (IA) de tranquilidade e dever cumprido.

### 6.3. Tela de Adicionar Remédio (Bottom Sheet)
- Formulário simples que sobe da base da tela.
- Campos de input grandes (`h-12` ou `h-14`).
- Botão de upload de foto em grande destaque, com ícone de câmera e feedback visual claro de que a foto foi anexada.

### 6.4. Tela de Agenda Médica
- Lista vertical de cards de consultas.
- Cada card exibe ícone de calendário, Nome do Médico, Especialidade, Data, Horário e tags de alerta (ex: "Jejum 12h" com fundo amarelo suave).

### 6.5. Tela de Cofre de Saúde (Documentos)
- Grid de 2 colunas com miniaturas das fotos (receitas/exames).
- Cada item possui uma etiqueta inferior simples (ex: "Cardiologista - Jul/26").
- Floating Action Button (FAB) redondo e fixo no canto inferior direito para adicionar novos documentos.
