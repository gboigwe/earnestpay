import { useState, useCallback } from 'react';
import { TransactionState } from '@/components/TransactionModal';

interface UseTransactionModalOptions {
  onSuccess?: (hash: string) => void;
  onError?: (error: Error) => void;
}

export function useTransactionModal(options: UseTransactionModalOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<TransactionState>('idle');
  const [transactionHash, setTransactionHash] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const open = useCallback(() => {
    setIsOpen(true);
    setState('idle');
    setTransactionHash(undefined);
    setError(undefined);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Reset state after a small delay to allow closing animation
    setTimeout(() => {
      setState('idle');
      setTransactionHash(undefined);
      setError(undefined);
    }, 200);
  }, []);

  const setSigning = useCallback(() => {
    setState('signing');
  }, []);

  const setPending = useCallback((hash?: string) => {
    setState('pending');
    if (hash) setTransactionHash(hash);
  }, []);

  const setSuccess = useCallback((hash: string) => {
    setState('success');
    setTransactionHash(hash);
    options.onSuccess?.(hash);
  }, [options]);

  const setFailed = useCallback((errorMessage: string | Error) => {
    setState('error');
    const message = errorMessage instanceof Error ? errorMessage.message : errorMessage;
    setError(message);
    options.onError?.(errorMessage instanceof Error ? errorMessage : new Error(message));
  }, [options]);

  /**
   * Execute a transaction with automatic state management
   *
   * @param txFunction - Async function that submits the transaction and returns the hash
   * @returns Promise that resolves when transaction is complete
   *
   * @example
   * ```tsx
   * const modal = useTransactionModal();
   *
   * const handleSend = async () => {
   *   await modal.execute(async () => {
   *     const response = await signAndSubmitTransaction({ ... });
   *     return response.hash;
   *   });
   * };
   * ```
   */
  const execute = useCallback(async (txFunction: () => Promise<string>) => {
    try {
      // Set signing state
      setSigning();

      // Execute transaction
      const hash = await txFunction();

      // Set pending state with hash
      setPending(hash);

      // Wait a bit to show pending state, then set success
      // In a real app, you'd wait for blockchain confirmation here
      setTimeout(() => {
        setSuccess(hash);
      }, 1500);

      return hash;
    } catch (err: any) {
      // Handle errors
      if (err.message?.includes('User rejected') || err.code === 4001) {
        // User rejected the transaction
        setFailed('Transaction was cancelled');
      } else {
        setFailed(err.message || 'Transaction failed');
      }
      throw err;
    }
  }, [setSigning, setPending, setSuccess, setFailed]);

  return {
    isOpen,
    state,
    transactionHash,
    error,
    open,
    close,
    setSigning,
    setPending,
    setSuccess,
    setFailed,
    execute,
  };
}
