# Relatório de revisão — TDAHMED para GitHub Pages

## Causa da página vazia ao abrir o arquivo localmente

O `index.html` é a entrada de um projeto React + TypeScript + Vite, não um arquivo HTML autônomo. O navegador não compila o código TSX ao abrir o arquivo com `file://`. Para uso normal, este projeto deve ser compilado e publicado como site no GitHub Pages. A pessoa que usa o site não precisa instalar nada nos dispositivos.

## Alterações feitas para publicação

- `index.html`: mensagem visível caso a aplicação não carregue e caminho relativo para o ponto de entrada do Vite.
- `src/main.tsx`: fronteira de erro do React para apresentar mensagem em vez de deixar a interface sem explicação após uma falha de renderização.
- `src/db.ts`: recuperação da conexão IndexedDB após erro temporário e fechamento da conexão quando o navegador pede mudança de versão.
- `.github/workflows/deploy.yml`: publicação automatizada pelo GitHub Actions quando houver envio para a branch `main` ou `master`.
- `.nojekyll`: evita processamento desnecessário do site pelo Jekyll do GitHub Pages.
- `README.md`: instruções focadas no uso como site hospedado, configuração do Pages e limites funcionais.

## Verificações

- JSON de `package.json` e `tsconfig.json`: válido.
- Configuração do Vite: usa caminho relativo adequado para repositórios do GitHub Pages.
- Workflow: compila com `npm run build` e publica o diretório `dist`.
- **Build executável completo:** não foi possível concluir nesta sessão porque a instalação das dependências via npm expirou sem terminar. O próprio GitHub Actions tentará instalar as dependências ao publicar; verifique a aba **Actions** após enviar os arquivos.

## Funções existentes e pendentes

O código fornecido contém painel do dia, captura e gestão de tarefas e exportação/restauração de backup JSON. Ainda não contém organizador de PDFs, grade horária, agenda/calendário nem cadastro de provas. Também usa IndexedDB local: os dados não se sincronizam automaticamente entre aparelhos. Esses recursos precisam de desenvolvimento adicional e, para sincronização, de armazenamento em nuvem.
