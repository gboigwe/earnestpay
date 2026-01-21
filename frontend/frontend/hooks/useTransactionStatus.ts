/**
 * Transaction status tracking hook
 * Monitors transaction status and provides real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { usePublicClient, useChainId } from 'wagmi';
import { type Hash, type TransactionReceipt } from 'viem';
import {
  type TransactionStatus,
  type TransactionRecord,
  updateTransactionStatus,
  getTransactionByHash,
  isTransactionFinalized,
} from '@/utils/transactions';

export interface UseTransactionStatusOptions {
  hash?: Hash;
  onSuccess?: (receipt: TransactionReceipt) => void;
  onError?: (error: Error) => void;
  onConfirmation?: (confirmations: number) => void;
  enabled?: boolean;
}

export interface UseTransactionStatusReturn {
  status: TransactionStatus | null;
  receipt: TransactionReceipt | null;
  confirmations: number;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  transaction: TransactionRecord | null;
}

/**
 * Hook to track transaction status
 */
export function useTransactionStatus(
  options: UseTransactionStatusOptions = {}
): UseTransactionStatusReturn {
  const { hash, onSuccess, onError, onConfirmation, enabled = true } = options;

  const publicClient = usePublicClient();
  const chainId = useChainId();

  const [status, setStatus] = useState<TransactionStatus | null>(null);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);
  const [confirmations, setConfirmations] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [transaction, setTransaction] = useState<TransactionRecord | null>(null);

  const checkTransaction = useCallback(async () => {
    if (!hash || !publicClient || !enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get transaction from storage
      const storedTx = getTransactionByHash(hash);
      setTransaction(storedTx);

      // Get transaction receipt
      const txReceipt = await publicClient.getTransactionReceipt({ hash });

      if (txReceipt) {
        setReceipt(txReceipt);

        // Determine status
        let txStatus: TransactionStatus;
        if (txReceipt.status === 'success') {
          // Check confirmations
          const latestBlock = await publicClient.getBlockNumber();
          const txConfirmations = Number(latestBlock - txReceipt.blockNumber) + 1;
          setConfirmations(txConfirmations);

          if (isTransactionFinalized(txConfirmations, chainId)) {
            txStatus = 'confirmed';
          } else {
            txStatus = 'confirming';
          }

          // Call confirmation callback
          if (onConfirmation) {
            onConfirmation(txConfirmations);
          }

          // Call success callback on first confirmation
          if (txConfirmations === 1 && onSuccess) {
            onSuccess(txReceipt);
          }
        } else if (txReceipt.status === 'reverted') {
          txStatus = 'reverted';
          const err = new Error('Transaction reverted');
          setError(err);
          if (onError) onError(err);
        } else {
          txStatus = 'failed';
          const err = new Error('Transaction failed');
          setError(err);
          if (onError) onError(err);
        }

        setStatus(txStatus);

        // Update storage
        updateTransactionStatus(hash, txStatus, txReceipt);
      } else {
        // Transaction not mined yet
        setStatus('pending');
      }
    } catch (err) {
      console.error('Error checking transaction status:', err);
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setStatus('failed');

      if (onError) {
        onError(error);
      }

      // Update storage with error
      updateTransactionStatus(hash, 'failed', undefined, error.message);
    } finally {
      setIsLoading(false);
    }
  }, [hash, publicClient, enabled, chainId, onSuccess, onError, onConfirmation]);

  // Initial check and periodic updates
  useEffect(() => {
    if (!hash || !enabled) return;

    // Initial check
    checkTransaction();

    // Poll for updates if transaction is pending or confirming
    const interval = setInterval(() => {
      if (status === 'pending' || status === 'confirming') {
        checkTransaction();
      }
    }, 3000); // Check every 3 seconds (Base block time is ~2s)

    return () => clearInterval(interval);
  }, [hash, enabled, status, checkTransaction]);

  return {
    status,
    receipt,
    confirmations,
    isLoading,
    isSuccess: status === 'confirmed',
    isError: status === 'failed' || status === 'reverted',
    error,
    transaction,
  };
}

/**
 * Hook to track multiple transactions
 */
export function useMultipleTransactionStatus(hashes: Hash[]) {
  const [statuses, setStatuses] = useState<Map<Hash, UseTransactionStatusReturn>>(
    new Map()
  );

  const publicClient = usePublicClient();
  const chainId = useChainId();

  const checkTransactions = useCallback(async () => {
    if (!publicClient || hashes.length === 0) return;

    const newStatuses = new Map<Hash, UseTransactionStatusReturn>();

    for (const hash of hashes) {
      try {
        const storedTx = getTransactionByHash(hash);
        const txReceipt = await publicClient.getTransactionReceipt({ hash });

        let txStatus: TransactionStatus = 'pending';
        let txConfirmations = 0;

        if (txReceipt) {
          const latestBlock = await publicClient.getBlockNumber();
          txConfirmations = Number(latestBlock - txReceipt.blockNumber) + 1;

          if (txReceipt.status === 'success') {
            txStatus = isTransactionFinalized(txConfirmations, chainId)
              ? 'confirmed'
              : 'confirming';
          } else if (txReceipt.status === 'reverted') {
            txStatus = 'reverted';
          } else {
            txStatus = 'failed';
          }
        }

        newStatuses.set(hash, {
          status: txStatus,
          receipt: txReceipt || null,
          confirmations: txConfirmations,
          isLoading: false,
          isSuccess: txStatus === 'confirmed',
          isError: txStatus === 'failed' || txStatus === 'reverted',
          error: null,
          transaction: storedTx,
        });
      } catch (error) {
        console.error(`Error checking transaction ${hash}:`, error);
        newStatuses.set(hash, {
          status: 'failed',
          receipt: null,
          confirmations: 0,
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: error instanceof Error ? error : new Error('Unknown error'),
          transaction: null,
        });
      }
    }

    setStatuses(newStatuses);
  }, [publicClient, chainId, hashes]);

  useEffect(() => {
    checkTransactions();

    // Poll for updates
    const interval = setInterval(checkTransactions, 3000);

    return () => clearInterval(interval);
  }, [checkTransactions]);

  return {
    statuses,
    refresh: checkTransactions,
  };
}
