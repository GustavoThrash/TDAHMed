import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

interface ErrorBoundaryState {
  message: string | null
}

class AppErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { message: null }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      message: error instanceof Error ? error.message : 'Ocorreu um erro inesperado ao exibir a página.',
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Erro ao renderizar o TDAHMED:', error, info.componentStack)
  }

  render() {
    if (this.state.message) {
      return (
        <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 680, margin: '10vh auto', padding: 24, color: '#2b2b2b', lineHeight: 1.55 }}>
          <h1 style={{ color: '#1f3a5f' }}>O TDAHMED encontrou um erro</h1>
          <p>A página não pôde ser exibida. A mensagem abaixo pode ajudar a identificar o problema:</p>
          <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', background: '#f5eee7', padding: 16, borderRadius: 12 }}>{this.state.message}</pre>
          <p>Recarregue a página. Se o erro continuar, abra o terminal em que o aplicativo foi iniciado e verifique as mensagens apresentadas.</p>
        </main>
      )
    }
    return this.props.children
  }
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Não foi encontrado o elemento #root no index.html.')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>,
)
