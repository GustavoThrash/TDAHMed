# TDAHMED

Organizador acadêmico pessoal desenvolvido com React, TypeScript e Vite.

## Como iniciar no Windows

1. Extraia a pasta do projeto inteira para um local do computador.
2. Instale uma versão LTS do [Node.js](https://nodejs.org/) caso ainda não tenha instalado. O instalador inclui o npm.
3. Dê duplo clique em `INICIAR-TDAHMED.bat`.
4. Na primeira execução, o script instalará as dependências. Depois abrirá o navegador em `http://localhost:5173`.
5. Para fechar o aplicativo local, feche a janela do terminal que está executando o Vite.

**Não abra `index.html` diretamente com duplo clique.** Esse arquivo é a entrada do projeto para o Vite e contém TypeScript/React que o navegador não executa diretamente como um site pronto.

## Iniciar manualmente (Windows, macOS ou Linux)

Na pasta do projeto, abra um terminal e execute:

```bash
npm install
npm run dev
```

Acesse o endereço mostrado no terminal (normalmente `http://localhost:5173`). Para testar os arquivos de produção antes de publicar:

```bash
npm run build
npm run preview
```

## Publicar no GitHub Pages

1. Envie o conteúdo desta pasta para um repositório do GitHub, na branch `main`.
2. Em **Settings > Pages**, selecione **Source: GitHub Actions**.
3. Cada push em `main` executará `.github/workflows/deploy.yml` e publicará a pasta gerada em `dist`.
4. Depois da publicação, o endereço ficará no formato `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

A publicação permite abrir a interface por navegador em computadores, tablets e celulares, sem iniciar o Vite em cada dispositivo.

## O que esta versão contém

- Painel “Meu dia”.
- Captura rápida e lista de tarefas com prazo, prioridades, conclusão e adiamento.
- Backup e restauração em JSON versionado.
- Armazenamento local pelo IndexedDB do navegador.

## Limitações importantes desta versão

Esta pasta contém uma primeira etapa do aplicativo. **Ainda não há módulos para organizar PDFs, montar grade horária, agenda/calendário ou cadastrar provas.** Esses recursos precisam ser implementados separadamente.

Os dados ficam apenas no navegador e dispositivo em que foram cadastrados. **Não existe sincronização automática entre celular, tablet e computador**, mesmo que todos abram o site publicado. Para compartilhar os mesmos dados entre dispositivos, será necessário adicionar uma camada de sincronização/armazenamento em nuvem. Use os arquivos de backup para transferir tarefas manualmente entre aparelhos por enquanto.

Os dados locais não são criptografados. Limpar os dados do navegador ou desinstalar o navegador pode apagá-los. Faça backups regularmente.
