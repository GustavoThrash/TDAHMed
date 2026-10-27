# TDAHMED — publicação como site pelo GitHub Pages

O TDAHMED pode ser usado pelo navegador como um site. **Você não precisa instalar Node.js, executar comandos ou instalar o projeto nos aparelhos onde vai usar o site.** O GitHub Actions compila e publica o aplicativo automaticamente.

## Publicar pela primeira vez

1. Crie um repositório no GitHub para o TDAHMED.
2. Envie **todo o conteúdo desta pasta diretamente para a raiz do repositório**. O arquivo `package.json`, `index.html` e a pasta `.github` precisam ficar na raiz; não deixe tudo dentro de uma subpasta `tdahmed`.
3. No GitHub, abra **Settings → Pages**.
4. Em **Build and deployment**, escolha **GitHub Actions** como Source.
5. Abra a aba **Actions** e aguarde o workflow **Publicar no GitHub Pages** terminar com um sinal verde. O workflow executa a compilação e publica a pasta `dist`.
6. Volte a **Settings → Pages** para encontrar o endereço publicado. Normalmente será `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`. Use esse endereço, não o endereço da página de arquivos do repositório (`github.com/...`).

O workflow executa automaticamente quando você envia alterações para a branch `main` ou `master`. Depois da primeira configuração, para atualizar o site basta enviar os novos arquivos ao GitHub e aguardar a publicação.

## Se o site não abrir

- Abra a aba **Actions** e veja se **Publicar no GitHub Pages** terminou com sucesso.
- Se a execução falhar, abra a execução para ver a etapa e a mensagem que falharam.
- Confirme que `package.json` e `.github/workflows/deploy.yml` estão na raiz do repositório e que **Settings → Pages → Source** está definido como **GitHub Actions**.
- Após uma publicação recente, atualize o site; se necessário, faça uma recarga completa no navegador.

## O que esta versão já contém

- Painel “Meu dia”.
- Captura rápida e lista de tarefas com prazo, prioridade, conclusão e adiamento.
- Backup e restauração em arquivo JSON.
- Interface adaptável a computadores, tablets e celulares.
- Armazenamento local pelo IndexedDB do navegador.

## Recursos que ainda faltam

Esta é a primeira etapa da aplicação. Ela **ainda não inclui** gerenciamento de PDFs, grade horária, agenda/calendário ou cadastro de provas. Esses módulos precisam ser construídos.

## Importante: dados em vários aparelhos

O site pode ser aberto em vários aparelhos, mas nesta versão os dados são guardados localmente em cada navegador. **As tarefas não se sincronizam automaticamente entre o celular, tablet e computador.** Para isso, será preciso adicionar um banco de dados na nuvem e autenticação ou outro mecanismo de sincronização. Até lá, use o recurso de backup para transferir dados manualmente.

O GitHub Pages hospeda a interface do site, mas não oferece por si só um banco de dados privado para salvar e sincronizar os dados do usuário.

## Desenvolvimento local (opcional)

Só é necessário se você quiser modificar e testar o código no seu computador. Com Node.js instalado, execute na pasta do projeto:

```bash
npm install
npm run dev
```

Para o uso normal do site publicado, esses passos não são necessários.
