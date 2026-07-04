# Guia de Instalação e Inicialização do GitHub Spec Kit (`specify-cli`)

Este documento descreve o passo a passo necessário para instalar, inicializar e replicar o setup do **GitHub Spec Kit** em outros projetos. Com este guia, você ou qualquer outro agente de IA poderá configurar a estrutura de desenvolvimento orientada a especificações (Spec-Driven Development - SDD).

---

## 1. O que é o GitHub Spec Kit?

O **GitHub Spec Kit** é uma ferramenta projetada para implementar o fluxo de **Spec-Driven Development (SDD)**. Ele ajuda a guiar o ciclo de desenvolvimento de agentes de IA e humanos através de um processo estruturado de quatro etapas:
1. **Spec (Especificação):** Definição clara dos requisitos de negócio ("O Quê").
2. **Plan (Planejamento):** Desenho técnico e arquitetural ("O Como").
3. **Tasks (Tarefa):** Divisão de atividades em passos atômicos.
4. **Implement (Implementação):** Codificação propriamente dita orientada às tarefas aprovadas.

O CLI oficial do Spec Kit é o `specify`.

---

## 2. Pré-requisitos

Para instalar e utilizar o `specify-cli`, é altamente recomendável ter o **`uv`** instalado em sua máquina. O `uv` é um gerenciador de pacotes e instalador de ferramentas Python extremamente rápido desenvolvido pela Astral.

### Instalação do `uv` (se ainda não possuir)
No Linux/macOS:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

No Windows (PowerShell):
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

---

## 3. Instalação do `specify-cli`

Existem duas formas principais de utilizar o CLI:

### Opção A: Instalação Global Reutilizável (Recomendado)
Para instalar o comando `specify` permanentemente na sua máquina usando o `uv`:
```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```

### Opção B: Execução Sem Instalação (On-the-fly)
Caso prefira rodar o comando diretamente sem fazer uma instalação global, você pode usar o prefixo `uvx`:
```bash
uvx --from git+https://github.com/github/spec-kit.git specify <comando>
```

---

## 4. Inicializando o Spec Kit no Novo Projeto

Navegue até a raiz do novo projeto no terminal e execute o comando de inicialização.

```bash
# Se instalou globalmente:
specify init <nome_do_projeto> --integration <agent_name>

# Se preferir rodar sem instalar globalmente (via uvx):
uvx --from git+https://github.com/github/spec-kit.git specify init <nome_do_projeto> --integration <agent_name>
```

> [!NOTE]
> O parâmetro `--integration` serve para definir com qual agente de IA ou IDE você integrará o fluxo (ex: `copilot`, `claude`, `gemini`, etc.).

---

## 5. Estruturando a Memória do Projeto (`constitution.md`)

A inicialização criará uma pasta chamada `.specify/` na raiz do seu projeto. Dentro dela, a prática padrão da **MW Technology** envolve a criação de um documento de constituição do projeto para guiar os agentes.

### Passo 1: Criar a pasta de memória (caso não seja criada automaticamente)
```bash
mkdir -p .specify/memory
```

### Passo 2: Criar o arquivo `constitution.md`
Crie o arquivo `.specify/memory/constitution.md` e preencha com as regras mestras de arquitetura, segurança, estilo de código e tomada de decisão do seu projeto.

#### Exemplo de Estrutura Recomendada para o `constitution.md`:
```markdown
# Constituição do Projeto: [Nome do Projeto]

> **Aviso ao Agente de IA Local:** Este é o Documento Mestre de Cultura e Arquitetura do projeto. Ao ler este manifesto, você adquire o contexto completo de como operar. 

## 1. Visão Geral do Produto
- [Descreva a proposta de valor do projeto]

## 2. Metodologia: Spec-Driven Development (SDD)
Nenhum Agente de IA pode escrever ou modificar código-fonte de produção sem passar pelas fases:
1. **A Especificação (`spec.md`)**
2. **O Planejamento Técnico (`plan.md`)**
3. **A Linha de Montagem (`tasks.md`)**

## 3. Diretrizes Arquiteturais e Tech Stack
- **Frontend:** [Ex: React + Vite + Tailwind]
- **Backend:** [Ex: Node.js + Fastify + Prisma]
- **Limitações:** [Ex: Máximo de 100 linhas por componente atômico]

## 4. Diretrizes Estritas de Segurança
- Validação de payload obrigatória via esquemas (ex: Zod).
- CORS configurado restritamente.
- Prevenção ativa de regressões e testes obrigatórios antes de commits.

## 5. Regras de Comunicação e IA
- Comunicação sempre em `pt-br` (Português do Brasil).
- Código-fonte, commits e variáveis sempre em `en` (Inglês).
```

---

## 6. Comandos Úteis do CLI `specify`

Uma vez instalado o CLI, você pode usar os seguintes comandos utilitários:

* **Verificar atualizações do CLI:**
  ```bash
  specify self check
  ```
* **Atualizar o CLI para a versão mais recente:**
  ```bash
  specify self upgrade
  ```
* **Gerenciar extensões e plugins do Spec Kit:**
  ```bash
  specify extension list
  specify extension add <nome_da_extensao>
  ```

---

## 7. Como o Agente de IA utiliza este setup?

Ao iniciar qualquer tarefa no novo repositório, o agente de IA irá automaticamente ler o diretório `.specify/` e absorver o arquivo [.specify/memory/constitution.md](file:///.specify/memory/constitution.md) como seu contexto inicial de regras de desenvolvimento.

A partir daí, para qualquer alteração complexa de código, o agente seguirá o pipeline de SDD criando os planos e tarefas correspondentes.
