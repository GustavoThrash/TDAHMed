# Relatório de revisão — TDAHMED

## Causa mais provável da página vazia

O `index.html` é a entrada de um projeto React + TypeScript + Vite, não um arquivo HTML autônomo. O navegador não compila o código TSX ao abrir o arquivo diretamente com `file://`. O projeto deve ser iniciado pelo Vite (`npm run dev`) ou publicado após uma compilação (`npm run build`).

## Alterações feitas

- `index.html`: adicionado conteúdo de orientação visível caso a inicialização do React não ocorra; incluídos descrição, título e aviso sobre JavaScript.
- `INICIAR-TDAHMED.bat`: iniciador para Windows que verifica Node.js/npm, instala as dependências quando necessário, inicia o Vite e abre o navegador.
- `INICIAR-TDAHMED.sh`: iniciador equivalente para macOS/Linux via terminal.
- `src/main.tsx`: adicionada uma fronteira de erro do React para mostrar uma mensagem útil em vez de deixar a interface sem explicação quando ocorrer uma falha de renderização.
- `src/db.ts`: melhorada a recuperação da conexão IndexedDB após erro temporário e o fechamento da conexão quando o navegador pede uma mudança de versão.
- `README.md`: reescritas as instruções de execução, publicação e limites funcionais da versão atual.
- `.gitignore`: adicionados arquivos de log e `.DS_Store`.

## Verificações realizadas

- Sintaxe TypeScript/TSX e dos arquivos de configuração: aprovada por transpilações estáticas.
- Sintaxe do script shell: aprovada.
- JSON do `package.json` e `tsconfig.json`: válido.
- Parsing do `index.html`: aprovado.
- **Build/teste executável completo:** não foi possível concluir neste ambiente porque o acesso ao registro npm falhou com `EAI_AGAIN`; as dependências React/Vite não puderam ser instaladas nesta sessão. Execute `npm install` e `npm run build` num computador com conexão à internet para validar a compilação final.

## Funções existentes e pendentes

O código fornecido contém painel do dia, captura e gestão de tarefas e exportação/restauração de backup JSON. Não contém ainda organizador de PDFs, grade horária, agenda/calendário nem cadastro de provas. Também usa IndexedDB local, portanto os dados não se sincronizam automaticamente entre dispositivos. Essas funções exigem desenvolvimento adicional; não foram apresentadas como implementadas nesta correção.
