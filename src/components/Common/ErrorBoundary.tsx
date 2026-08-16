import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown } from 'lucide-react';
import { translate } from '../../utils/i18n';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('[QuizCraft ErrorBoundary] Uncaught React exception:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans select-none"
        >
          <div className="bg-slate-900 border border-rose-900/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-2xl shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">{translate('common.error')}</h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Произошла непредвиденная ошибка в интерфейсе приложения.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{translate('common.reset')}</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[var(--accent-500)] hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[var(--accent-glow)]"
              >
                <Home className="w-4 h-4" />
                <span>{translate('host.returnHome')}</span>
              </button>
            </div>

            {/* Collapsible Error Info for debugging */}
            <div className="pt-2 border-t border-slate-800/80 text-left">
              <button
                onClick={this.toggleDetails}
                className="text-[11px] text-slate-500 hover:text-slate-400 flex items-center gap-1 mx-auto cursor-pointer focus:outline-none"
              >
                <span>{this.state.showDetails ? 'Hide details' : 'Show details'}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${this.state.showDetails ? 'rotate-180' : ''}`}
                />
              </button>

              {this.state.showDetails && (
                <pre className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-mono text-rose-300 overflow-x-auto whitespace-pre-wrap max-h-40 leading-normal">
                  {this.state.error?.toString()}
                  {'\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
