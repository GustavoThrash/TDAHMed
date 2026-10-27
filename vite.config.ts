import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' faz o app funcionar em qualquer caminho, inclusive usuario.github.io/nome-do-repositorio/
export default defineConfig({ base: './', plugins: [react()] })
