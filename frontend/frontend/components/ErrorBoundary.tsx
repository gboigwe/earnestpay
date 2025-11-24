import React, { Component, ReactNode } from 'react';
import { parseErrorMessage, logError, MultiChainError } from '@/errors/MultiChainErrors';
import { AlertCircle, RefreshCw, Home, ExternalLink } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /**
   * Optional callback when error is recovered
   */
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * Enhanced ErrorBoundary with multi-chain error support
 *
 * Features:
 * - User-friendly error messages using parseErrorMessage
 * - Recovery actions based on error type
 * - Better error UI with helpful suggestions
 * - Error logging for debugging
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error using multi-chain error logger
    logError(error, 'ErrorBoundary');

    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    this.props.onReset?.();
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const error = this.state.error;

      // Parse error message for user-friendly display
      const { title, message, recoveryAction } = parseErrorMessage(error);

      // Check if this is a multi-chain error with specific recovery actions
      const isMultiChainError = error instanceof MultiChainError;
      const showInstallWallet = recoveryAction === 'Install Wallet';
      const showAddFunds = recoveryAction === 'Add Funds';

      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-lg w-full shadow-2xl">
            {/* Error Icon and Title */}
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
                <p className="text-gray-300 text-base leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Technical Details (collapsed by default) */}
            {process.env.NODE_ENV === 'development' && error && (
              <details className="mb-6 bg-gray-900/50 rounded-lg p-4">
                <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                  Technical Details
                </summary>
                <div className="mt-3 space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 font-mono">Error Type</p>
                    <p className="text-sm text-gray-300 font-mono">{error.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-mono">Message</p>
                    <p className="text-sm text-gray-300 font-mono break-words">
                      {error.message}
                    </p>
                  </div>
                  {error.stack && (
                    <div>
                      <p className="text-xs text-gray-500 font-mono">Stack Trace</p>
                      <pre className="text-xs text-gray-400 font-mono overflow-auto max-h-32 mt-1">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Recovery Actions */}
            <div className="flex flex-col gap-3">
              {/* Install Wallet Action */}
              {showInstallWallet && (
                <a
                  href="https://petra.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold"
                >
                  <ExternalLink size={18} />
                  Install Petra Wallet
                </a>
              )}

              {/* Add Funds Action */}
              {showAddFunds && (
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
                >
                  <Home size={18} />
                  Go to Home
                </button>
              )}

              {/* Try Again / Retry Actions */}
              {(recoveryAction === 'Try Again' || recoveryAction === 'Retry') && (
                <button
                  onClick={this.handleReset}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
                >
                  <RefreshCw size={18} />
                  Try Again
                </button>
              )}

              {/* Default Actions */}
              {!showInstallWallet && !showAddFunds && recoveryAction !== 'Try Again' && recoveryAction !== 'Retry' && (
                <>
                  <button
                    onClick={this.handleReload}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
                  >
                    <RefreshCw size={18} />
                    Reload Page
                  </button>
                  <button
                    onClick={this.handleGoHome}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-semibold"
                  >
                    <Home size={18} />
                    Go to Home
                  </button>
                </>
              )}
            </div>

            {/* Help Text */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-400 text-center">
                If this issue persists, try{' '}
                {isMultiChainError ? 'checking your wallet connection' : 'refreshing the page'}.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
