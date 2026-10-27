# TDAHMED · Academic Studio

**Seu organizador acadêmico de Medicina, acessível por um link.** O site foi preparado para publicação no GitHub Pages; para usar a versão publicada, não é necessário instalar nada no celular, tablet ou computador.

## Funcionalidades

### 1. Banco de questões
- Cadastre questões de múltipla escolha com quatro alternativas, resposta correta e explicação.
- Organize por disciplina, dificuldade, tags e favoritas.
- Busque questões por texto, disciplina ou tag.
- Pratique em modo quiz, veja feedback e registre acertos/tentativas.
- Reúna questões erradas em uma lista de revisão.

### 2. Calendário acadêmico
- Visualização mensal interativa com filtros por tipo de compromisso.
- Cadastre provas, trabalhos/entregas, apresentações, aulas e datas importantes.
- Defina disciplina, data, horário, local, observações e status de conclusão.
- Veja o resumo do dia e os próximos compromissos no painel inicial.

### 3. Painel de disciplinas
- Já vem com Anatomia, Biologia, Histologia, Psicologia Médica, Primeiros Auxílios, Língua Castelhana e Biofísica.
- Personalize nome, emoji/ícone, cor, professor, sala e descrição de cada disciplina.
- Registre tópicos e aulas, escreva notas e acompanhe o progresso.
- Monte a grade semanal por dia, horário e sala.
- Anexe PDFs de até 10 MB por arquivo ou salve links para materiais online.

### Também incluído
- Painel de início com próximos compromissos, progresso e atalhos.
- Backup completo em JSON com registros e PDFs anexados (até 25 MB de arquivos PDF por exportação).
- Restauração de backup para transferência manual entre dispositivos.
- Layout responsivo para celular, tablet e computador.
- Manifesto de PWA e cache de recursos já visitados, para permitir a opção “Adicionar à tela inicial” quando o navegador oferecer essa opção.

## Publicar como site no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie **todo o conteúdo desta pasta para a raiz do repositório**. O arquivo `package.json`, `index.html`, a pasta `src`, a pasta `public` e a pasta `.github` precisam ficar na raiz.
3. No repositório, abra **Settings → Pages**.
4. Em **Build and deployment**, escolha **GitHub Actions** como origem.
5. Abra a aba **Actions** e confira a execução **Publicar no GitHub Pages**. O fluxo instala as dependências, valida os tipos, compila o site e publica a pasta `dist`.
6. Quando a execução terminar com sucesso, abra **Settings → Pages** para acessar o endereço publicado. Em geral, ele será `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

Depois da configuração inicial, envie atualizações ao repositório e o GitHub Actions publicará a nova versão automaticamente. Para instruções oficiais, consulte [GitHub Pages com GitHub Actions](https://docs.github.com/pt/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Usar pelo celular ou tablet

Abra o endereço do GitHub Pages no navegador. Não abra a página de arquivos `github.com/...` como se fosse o aplicativo; use o endereço publicado `github.io/...`.

Se o navegador oferecer **Adicionar à tela inicial**, você pode criar um atalho com aparência de aplicativo. Isso não é obrigatório. O TDAHMED continua funcionando como site.

## Dados, privacidade e sincronização

O GitHub Pages hospeda os arquivos do site; ele não é o banco de dados pessoal do usuário. Nesta versão, os registros acadêmicos ficam no armazenamento local do navegador e os PDFs ficam no IndexedDB local. Isso significa:

- O que você cria no celular não aparece automaticamente no tablet ou computador.
- Limpar os dados do site/navegador pode apagar registros e PDFs locais.
- Use **Backup e preferências → Baixar backup completo** com frequência e guarde o JSON fora do repositório público.
- Para levar os dados a outro dispositivo, abra o site nele e restaure o JSON. Para sincronização automática será necessário integrar uma base de dados em nuvem e autenticação.
- Não coloque backups, PDFs pessoais ou outros dados privados no repositório GitHub.

Os primeiros tópicos das disciplinas, a questão inicial e os eventos que contêm “Exemplo” são **conteúdo demonstrativo editável**. Substitua pelas informações reais do seu curso ou exclua-os. As matérias e sugestões não representam um programa oficial da sua faculdade.

## Desenvolvimento local (opcional)

Apenas para quem deseja modificar o código. É necessário Node.js e npm:

```bash
npm install
npm run dev
```

Para uso normal da versão publicada, não é necessário instalar Node.js ou executar comandos nos dispositivos.
