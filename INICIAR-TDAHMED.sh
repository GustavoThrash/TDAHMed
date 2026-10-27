#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Instale o Node.js LTS (que inclui o npm) em https://nodejs.org/ e execute novamente."
  exit 1
fi
if [ ! -f node_modules/vite/bin/vite.js ]; then
  npm install
fi
npm run dev -- --host 0.0.0.0
