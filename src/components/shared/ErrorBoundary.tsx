import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[hlynk ErrorBoundary caught error]:', error, errorInfo)
  }

  private handleReload = () => {
    // Clear potentially corrupted transient session caches and reload
    try {
      sessionStorage.clear()
    } catch (_) {}
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5">
              <AlertTriangle size={32} />
            </div>

            <h2 className="text-xl font-black text-white tracking-tight mb-2">
              Something went wrong
            </h2>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              A temporary issue occurred while loading this view (often due to an updated app version or network interruption).
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 px-5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95"
              >
                <RefreshCw size={14} /> Reload App
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full py-3 px-5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Home size={14} /> Back to Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
