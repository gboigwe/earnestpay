import { useState, useCallback, useRef } from 'react';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { useChain } from '@/contexts/ChainContext';
import { toast } from '@/components/ui/use-toast';

export type QueuedTransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface QueuedTransaction {
  id: string;
  to: string;
  value: bigint;
  data?: `0x${string}`;
  description: string;
  status: QueuedTransactionStatus;
  hash?: string;
  error?: string;
  timestamp: number;
  retryCount: number;
}

interface QueueState {
  isProcessing: boolean;
  isPaused: boolean;
  currentIndex: number;
  completed: number;
  failed: number;
}

const MAX_RETRY_ATTEMPTS = 2;

/**
 * useTransactionQueue Hook
 *
 * Manages a queue of transactions for sequential processing
 *
 * Features:
 * - Add/remove transactions from queue
 * - Sequential transaction processing
 * - Progress tracking
 * - Pause/resume queue processing
 * - Retry failed transactions
 * - Cancel pending transactions
 */
export const useTransactionQueue = () => {
  const [queue, setQueue] = useState<QueuedTransaction[]>([]);
  const [queueState, setQueueState] = useState<QueueState>({
    isProcessing: false,
    isPaused: false,
    currentIndex: -1,
    completed: 0,
    failed: 0,
  });

  const { sendTransaction } = useSendTransaction();
  const processingRef = useRef(false);
  const pausedRef = useRef(false);

  // Add transaction to queue
  const addToQueue = useCallback((
    to: string,
    value: bigint,
    description: string,
    data?: `0x${string}`
  ) => {
    const transaction: QueuedTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      to,
      value,
      data,
      description,
      status: 'pending',
      timestamp: Date.now(),
      retryCount: 0,
    };

    setQueue((prev) => [...prev, transaction]);

    toast({
      title: 'Added to Queue',
      description: `${description} added to transaction queue`,
    });

    return transaction.id;
  }, []);

  // Remove transaction from queue
  const removeFromQueue = useCallback((id: string) => {
    setQueue((prev) => {
      const transaction = prev.find((tx) => tx.id === id);
      if (transaction && (transaction.status === 'processing' || queueState.isProcessing)) {
        toast({
          title: 'Cannot Remove',
          description: 'Cannot remove transaction while processing',
          variant: 'destructive',
        });
        return prev;
      }
      return prev.filter((tx) => tx.id !== id);
    });
  }, [queueState.isProcessing]);

  // Update transaction status
  const updateTransaction = useCallback((id: string, updates: Partial<QueuedTransaction>) => {
    setQueue((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
    );
  }, []);

  // Process single transaction
  const processTransaction = async (transaction: QueuedTransaction): Promise<boolean> => {
    try {
      updateTransaction(transaction.id, { status: 'processing' });

      const hash = await sendTransaction({
        to: transaction.to as `0x${string}`,
        value: transaction.value,
        data: transaction.data,
      });

      if (!hash) {
        throw new Error('Transaction failed to send');
      }

      updateTransaction(transaction.id, {
        status: 'completed',
        hash,
      });

      toast({
        title: 'Transaction Successful',
        description: transaction.description,
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      updateTransaction(transaction.id, {
        status: 'failed',
        error: errorMessage,
      });

      toast({
        title: 'Transaction Failed',
        description: `${transaction.description}: ${errorMessage}`,
        variant: 'destructive',
      });

      return false;
    }
  };

  // Process queue sequentially
  const processQueue = useCallback(async () => {
    if (processingRef.current || queue.length === 0) return;

    processingRef.current = true;
    pausedRef.current = false;

    setQueueState((prev) => ({
      ...prev,
      isProcessing: true,
      isPaused: false,
      currentIndex: 0,
      completed: 0,
      failed: 0,
    }));

    const pendingTransactions = queue.filter((tx) => tx.status === 'pending');

    for (let i = 0; i < pendingTransactions.length; i++) {
      if (pausedRef.current) {
        setQueueState((prev) => ({ ...prev, isPaused: true, currentIndex: i }));
        break;
      }

      const transaction = pendingTransactions[i];
      setQueueState((prev) => ({ ...prev, currentIndex: i }));

      const success = await processTransaction(transaction);

      if (success) {
        setQueueState((prev) => ({ ...prev, completed: prev.completed + 1 }));
      } else {
        setQueueState((prev) => ({ ...prev, failed: prev.failed + 1 }));
      }

      // Small delay between transactions
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    processingRef.current = false;

    if (!pausedRef.current) {
      setQueueState((prev) => ({
        ...prev,
        isProcessing: false,
        currentIndex: -1,
      }));

      toast({
        title: 'Queue Complete',
        description: `Processed ${queueState.completed + 1} transactions`,
      });
    }
  }, [queue, processTransaction]);

  // Pause queue processing
  const pauseQueue = useCallback(() => {
    pausedRef.current = true;
    setQueueState((prev) => ({ ...prev, isPaused: true }));

    toast({
      title: 'Queue Paused',
      description: 'Transaction processing paused',
    });
  }, []);

  // Resume queue processing
  const resumeQueue = useCallback(() => {
    if (!queueState.isPaused) return;

    pausedRef.current = false;
    setQueueState((prev) => ({ ...prev, isPaused: false }));

    toast({
      title: 'Queue Resumed',
      description: 'Resuming transaction processing',
    });

    processQueue();
  }, [queueState.isPaused, processQueue]);

  // Retry failed transaction
  const retryTransaction = useCallback(async (id: string) => {
    const transaction = queue.find((tx) => tx.id === id);

    if (!transaction || transaction.status !== 'failed') return;

    if (transaction.retryCount >= MAX_RETRY_ATTEMPTS) {
      toast({
        title: 'Max Retries Reached',
        description: `Cannot retry ${transaction.description} anymore`,
        variant: 'destructive',
      });
      return;
    }

    updateTransaction(id, {
      status: 'pending',
      retryCount: transaction.retryCount + 1,
      error: undefined,
    });

    toast({
      title: 'Retrying Transaction',
      description: transaction.description,
    });
  }, [queue, updateTransaction]);

  // Cancel transaction
  const cancelTransaction = useCallback((id: string) => {
    const transaction = queue.find((tx) => tx.id === id);

    if (!transaction || transaction.status !== 'pending') {
      toast({
        title: 'Cannot Cancel',
        description: 'Only pending transactions can be cancelled',
        variant: 'destructive',
      });
      return;
    }

    updateTransaction(id, { status: 'cancelled' });

    toast({
      title: 'Transaction Cancelled',
      description: transaction.description,
    });
  }, [queue, updateTransaction]);

  // Clear completed/failed/cancelled transactions
  const clearCompleted = useCallback(() => {
    setQueue((prev) =>
      prev.filter((tx) =>
        tx.status !== 'completed' && tx.status !== 'cancelled' && tx.status !== 'failed'
      )
    );
  }, []);

  // Clear all transactions
  const clearAll = useCallback(() => {
    if (queueState.isProcessing) {
      toast({
        title: 'Cannot Clear',
        description: 'Cannot clear queue while processing',
        variant: 'destructive',
      });
      return;
    }

    setQueue([]);
    setQueueState({
      isProcessing: false,
      isPaused: false,
      currentIndex: -1,
      completed: 0,
      failed: 0,
    });
  }, [queueState.isProcessing]);

  return {
    queue,
    queueState,
    addToQueue,
    removeFromQueue,
    processQueue,
    pauseQueue,
    resumeQueue,
    retryTransaction,
    cancelTransaction,
    clearCompleted,
    clearAll,
  };
};

export default useTransactionQueue;
