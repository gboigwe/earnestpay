/**
 * Error State Components
 * Consistent error displays with helpful messaging
 */

import { motion } from 'framer-motion';
import {
  AlertCircle,
  XCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { Button } from './ui/button';

export type ErrorSeverity = 'error' | 'warning' | 'info';

interface ErrorMessageProps {
  title: string;
  message: string;
  severity?: ErrorSeverity;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Inline error message
 */
export const ErrorMessage = ({
  title,
  message,
  severity = 'error',
  onRetry,
  onDismiss,
  className = '',
}: ErrorMessageProps) => {
  const severityStyles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: XCircle,
      iconColor: 'text-red-600',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: Info,
      iconColor: 'text-blue-600',
    },
  };

  const style = severityStyles[severity];
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${style.bg} ${style.border} ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${style.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold ${style.text} mb-1`}>{title}</h4>
          <p className={`text-sm ${style.text}`}>{message}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              className={`p-1 hover:bg-white rounded transition-colors ${style.text}`}
              aria-label="Retry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className={`p-1 hover:bg-white rounded transition-colors ${style.text}`}
              aria-label="Dismiss"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Full page error state
 */
export const ErrorPage = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  showHomeButton = true,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <motion.div
        className="max-w-md w-full text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="bg-green-600 hover:bg-green-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          {showHomeButton && (
            <Button
              onClick={() => (window.location.href = '/')}
              variant="outline"
              className="border-green-200 hover:bg-green-50"
            >
              Go Home
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Empty state component
 */
export const EmptyState = ({
  icon: Icon = AlertCircle,
  title,
  message,
  actionLabel,
  onAction,
  className = '',
}: {
  icon?: React.ElementType;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) => {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {message && <p className="text-gray-600 mb-6 max-w-sm mx-auto">{message}</p>}
      {onAction && actionLabel && (
        <Button
          onClick={onAction}
          className="bg-green-600 hover:bg-green-700"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

/**
 * Network error with suggestions
 */
export const NetworkError = ({ onRetry }: { onRetry?: () => void }) => {
  return (
    <ErrorMessage
      title="Network Connection Error"
      message="Unable to connect to the network. Please check your internet connection and try again."
      severity="error"
      onRetry={onRetry}
    />
  );
};

/**
 * Wallet connection error
 */
export const WalletError = ({
  message = 'Please connect your wallet to continue',
  onConnect,
}: {
  message?: string;
  onConnect?: () => void;
}) => {
  return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-yellow-700 mb-1">
            Wallet Not Connected
          </h4>
          <p className="text-sm text-yellow-700 mb-3">{message}</p>
          {onConnect && (
            <Button
              onClick={onConnect}
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Transaction error with details
 */
export const TransactionError = ({
  error,
  onRetry,
  onViewDetails,
}: {
  error: string;
  onRetry?: () => void;
  onViewDetails?: () => void;
}) => {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-red-700 mb-1">
            Transaction Failed
          </h4>
          <p className="text-sm text-red-700 break-words">{error}</p>
          <div className="flex items-center gap-2 mt-3">
            {onRetry && (
              <Button
                onClick={onRetry}
                size="sm"
                variant="outline"
                className="border-red-300 hover:bg-red-100 text-red-700"
              >
                <RefreshCw className="w-3 h-3 mr-2" />
                Try Again
              </Button>
            )}
            {onViewDetails && (
              <button
                onClick={onViewDetails}
                className="text-sm text-red-700 hover:underline flex items-center gap-1"
              >
                View Details
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Form validation error
 */
export const ValidationError = ({ errors }: { errors: string[] }) => {
  if (errors.length === 0) return null;

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-red-700 mb-2">
            Please fix the following errors:
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-700">
                {error}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

/**
 * Timeout error
 */
export const TimeoutError = ({ onRetry }: { onRetry?: () => void }) => {
  return (
    <ErrorMessage
      title="Request Timeout"
      message="The request took too long to complete. Please try again."
      severity="warning"
      onRetry={onRetry}
    />
  );
};

/**
 * Permission denied error
 */
export const PermissionError = ({
  message = 'You do not have permission to perform this action',
}: {
  message?: string;
}) => {
  return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-semibold text-yellow-700 mb-1">
            Permission Denied
          </h4>
          <p className="text-sm text-yellow-700">{message}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Generic error boundary fallback
 */
export const ErrorBoundaryFallback = ({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-md w-full">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-700 mb-2">
                Application Error
              </h3>
              <p className="text-sm text-red-700 mb-3">
                An unexpected error occurred. We apologize for the inconvenience.
              </p>
              <details className="mb-4">
                <summary className="text-sm text-red-700 cursor-pointer hover:underline">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto max-h-40">
                  {error.message}
                </pre>
              </details>
              <div className="flex gap-2">
                <Button
                  onClick={resetError}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => (window.location.href = '/')}
                  variant="outline"
                  size="sm"
                  className="border-red-300"
                >
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
