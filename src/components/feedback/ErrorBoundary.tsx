import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCw } from 'lucide-react'

interface Props {
  children: ReactNode
  /** Rendu de secours personnalisé (sinon écran d'erreur par défaut). */
  fallback?: ReactNode
  /** Libellé du périmètre, pour le message (« cette section »). */
  scope?: string
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Trace technique en console pour le diagnostic (pas d'écran blanc côté UI).
    console.error('ErrorBoundary a intercepté une erreur :', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (!this.state.hasError) return this.props.children
    if (this.props.fallback) return this.props.fallback

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-vital/10 text-vital">
          <AlertTriangle className="h-7 w-7" aria-hidden />
        </div>
        <h2 className="mt-5 font-display text-xl font-semibold text-slate-900 dark:text-slate-100">
          Une erreur est survenue
        </h2>
        <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {this.props.scope ?? 'Cette section'} n'a pas pu s'afficher correctement. Vous pouvez
          réessayer sans perdre votre session.
        </p>
        <button
          type="button"
          onClick={this.handleReset}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-bloc px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-bloc-fonce focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bloc-clair"
        >
          <RotateCw className="h-4 w-4" aria-hidden />
          Réessayer
        </button>
      </div>
    )
  }
}
