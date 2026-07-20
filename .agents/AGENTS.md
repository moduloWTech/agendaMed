# Regras Comportamentais Globais para o Agente

- **Sempre leia o arquivo `.specify/memory/constitution.md` antes de iniciar ou planejar qualquer modificação no código.** Ele contém as regras arquiteturais, de design e segurança, além do protocolo de comportamento e de atualização de progresso essenciais para o AgendaMed.

- **Visão Holística e Prevenção de Regressão:** Nunca modifique nada que prejudique alguma coisa da aplicação que já esteja funcionando. Antes de alterar o código, pergunte-se ativamente: *"Minha modificação vai causar algum bug em outra parte da aplicação?"*. Mantenha sempre a visão geral do produto em mente, não se limitando apenas ao escopo isolado da correção atual.

- **Commits e Versionamento:** Sempre que for adicionar arquivos para commit, utilize obrigatoriamente o comando `git add .` a partir da raiz do repositório para garantir que todas as alterações do sistema sejam incluídas de uma só vez, evitando esquecer arquivos isolados.
