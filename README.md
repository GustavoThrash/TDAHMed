# TDAHMED

Organizador acadêmico pessoal. App web estático (React + TypeScript + Vite + Tailwind), sem backend: os dados ficam no IndexedDB do navegador.

## Rodar localmente
```
npm install
npm run dev
```

## Publicar no GitHub Pages
1. Envie o conteúdo desta pasta para um repositório no GitHub (branch `main`).
2. Em **Settings > Pages**, escolha **Source: GitHub Actions**.
3. Cada push em `main` executa `.github/workflows/deploy.yml` (build + publicação).
4. O endereço fica em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

## Etapa 1 (atual)
Painel "Meu dia", captura rápida, tarefas com prazo/prioridades/adiar, IndexedDB com pedido de armazenamento persistente, backup e restauração em JSON versionado (mesclar ou substituir).

## Dados
Ficam só no aparelho/navegador. Sem sincronização, sem nuvem, sem criptografia. Faça backups.
