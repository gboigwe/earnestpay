import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  parseErrorMessage,
  logError,
} from '@/errors/MultiChainErrors';
import { ChainType } from '@/contexts/ChainContext';

export interface ErrorHandlerOptions {
  /**
   * Context for error logging (e.g., 'ChainSelector', 'WalletModal')
   */
  context?: string;

  /**
   * Chain where error occurred
   */
  chain?: ChainType;

  /**
   * Custom retry action
   */
  onRetry?: () => void;

  /**
   * Custom recovery action
   */
  onRecover?: () => void;

  /**
   * Whether to show toast notification (default: true)
   */
  showToast?: boolean;

  /**
   * Toast duration in milliseconds (default: 5000)
   */
  toastDuration?: number;
}

/**
 * Hook for handling multi-chain errors with user-friendly feedback
 *
 * @example
 * const { handleError } = useMultiChainErrorHandler();
 *
 * try {
 *   await connectWallet();
 * } catch (error) {
 *   handleError(error, {
 *     context: 'WalletConnection',
 *     chain: 'aptos',
 *     onRetry: () => connectWallet()
 *   });
 * }
 */
export function useMultiChainErrorHandler() {
  const { toast } = useToast();

  const handleError = useCallback(
    (error: unknown, options: ErrorHandlerOptions = {}) => {
      const {
        context,
        chain,
        onRetry,
        onRecover,
        showToast = true,
        toastDuration = 5000,
      } = options;

      // Log error for debugging
      logError(error, context);

      // Parse error message
      const { title, message, recoveryAction } = parseErrorMessage(error, chain);

      // Show toast notification
      if (showToast) {
        // Determine action button based on error type and provided callbacks
        let action;

        if (onRetry && (recoveryAction === 'Try Again' || recoveryAction === 'Retry')) {
          action = (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                try {
                  onRetry();
                } catch (retryError) {
                  console.error('Retry failed:', retryError);
                }
              }}
            >
              Try Again
            </Button>
          );
        } else if (onRecover && recoveryAction) {
          action = (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                try {
                  onRecover();
                } catch (recoverError) {
                  console.error('Recovery failed:', recoverError);
                }
              }}
            >
              {recoveryAction}
            </Button>
          );
        } else if (recoveryAction === 'Install Wallet') {
          const installUrl = getWalletInstallUrl(chain);
          if (installUrl) {
            action = (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(installUrl, '_blank')}
              >
                Install
              </Button>
            );
          }
        } else if (recoveryAction === 'Add Funds') {
          // Could open a link to buy crypto or show funding instructions
          action = undefined; // For now, just show the message
        }

        toast({
          variant: 'destructive',
          title,
          description: message,
          action,
          duration: toastDuration,
        });
      }

      // Return parsed error info for additional handling
      return {
        title,
        message,
        recoveryAction,
        originalError: error,
      };
    },
    [toast]
  );

  /**
   * Handle wallet connection errors
   */
  const handleWalletError = useCallback(
    (error: unknown, chain: ChainType, onRetry?: () => void) => {
      return handleError(error, {
        context: 'WalletConnection',
        chain,
        onRetry,
      });
    },
    [handleError]
  );

  /**
   * Handle network switching errors
   */
  const handleNetworkError = useCallback(
    (
      error: unknown,
      _fromChain: ChainType,
      toChain: ChainType,
      onRetry?: () => void
    ) => {
      return handleError(error, {
        context: 'NetworkSwitch',
        chain: toChain,
        onRetry,
      });
    },
    [handleError]
  );

  /**
   * Handle transaction errors
   */
  const handleTransactionError = useCallback(
    (error: unknown, chain: ChainType, onRetry?: () => void) => {
      return handleError(error, {
        context: 'Transaction',
        chain,
        onRetry,
      });
    },
    [handleError]
  );

  return {
    handleError,
    handleWalletError,
    handleNetworkError,
    handleTransactionError,
  };
}

/**
 * Get wallet installation URL based on chain
 */
function getWalletInstallUrl(chain?: ChainType): string | null {
  if (chain === 'aptos') {
    return 'https://petra.app/';
  }

  // For EVM chains, default to MetaMask
  if (chain && ['ethereum', 'arbitrum', 'base', 'polygon'].includes(chain)) {
    return 'https://metamask.io/download/';
  }

  return null;
}

/**
 * Hook for loading states during async operations
 */
export function useAsyncOperation<T = void>() {
  const { handleError } = useMultiChainErrorHandler();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const execute = useCallback(
    async (
      operation: () => Promise<T>,
      errorOptions?: ErrorHandlerOptions
    ): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await operation();
        return result;
      } catch (err) {
        setError(err as Error);
        handleError(err, errorOptions);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    execute,
    isLoading,
    error,
    reset,
  };
}

// Import React for useAsyncOperation
import * as React from 'react';
