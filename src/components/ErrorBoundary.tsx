import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertIcon } from './icons'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message?: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surfaced to the console for diagnostics; no PII or secrets are logged.
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="panel max-w-md p-8 text-center">
          <span className="mx-auto mb-4 inline-flex rounded-full bg-rose-100 p-3 text-rose-600">
            <AlertIcon className="h-7 w-7" />
          </span>
          <h1 className="text-xl font-extrabold text-slate-900">Something went wrong</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            The app hit an unexpected error. Your saved design is stored in this browser, so
            reloading should bring it back.
          </p>
          {this.state.message ? (
            <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-left font-mono text-xs text-slate-500">
              {this.state.message}
            </p>
          ) : null}
          <button type="button" onClick={this.handleReload} className="btn-primary mt-6">
            Reload app
          </button>
        </div>
      </div>
    )
  }
}
