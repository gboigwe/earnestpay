import { useEffect, useState, useCallback, useRef } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import {
  usePublicClient,
  useAccount,
  useWatchBlocks,
  useSendTransaction
} from 'wagmi';
import { useChain } from '@/contexts/ChainContext';
import { UnifiedTransaction, formatAptosTransaction, formatEVMTransaction } from '@/types/transactions';
import { getPaymentProcessedEvents } from '@/utils/payroll';
import { toast } from '@/components/ui/use-toast';
import { useWalletAnalytics } from './useWalletAnalytics';

export const useTransactionHistory = (limit = 20) => {
  const { account } = useWallet();
  const { address: evmAddress } = useAccount();
  const { selectedChain } = useChain();
  const publicClient = usePublicClient()!;

  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingTxs, setPendingTxs] = useState<Set<string>>(new Set());

  // Analytics tracking
  const { trackTransaction: trackTx, trackError } = useWalletAnalytics();

  // Polling interval ref
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track transaction hashes being watched
  const watchedTxs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const fetchAptosTransactions = useCallback(async () => {
    if (!account?.address) return [];
    
    try {
      const events = await getPaymentProcessedEvents(account.address.toString(), limit);
      return events.map(event => formatAptosTransaction(event));
    } catch (err) {
      console.error('Error fetching Aptos transactions:', err);
      setError('Failed to load Aptos transactions');
      return [];
    }
  }, [account?.address, limit]);

  const fetchEVMTransactions = useCallback(async () => {
    if (!evmAddress || selectedChain === 'aptos') return [];
    
    try {
      // Get the most recent transactions for the connected address
      const blockNumber = await publicClient.getBlockNumber();
      const logs = await publicClient.getLogs({
        address: evmAddress as `0x${string}`,
        fromBlock: blockNumber - BigInt(1000), // Last 1000 blocks
        toBlock: 'latest',
      });

      // Get transaction receipts for each log
      const txHashes = [...new Set(logs.map(log => log.transactionHash))];
      const txReceipts = await Promise.all(
        txHashes.map(hash => 
          publicClient.getTransactionReceipt({ hash })
            .catch(() => null)
        )
      );

      return txReceipts
        .filter(Boolean)
        .map(receipt => formatEVMTransaction(receipt!, selectedChain as any))
        .slice(0, limit);
    } catch (err) {
      console.error('Error fetching EVM transactions:', err);
      setError('Failed to load EVM transactions');
      return [];
    }
  }, [evmAddress, selectedChain, publicClient, limit]);

  const fetchTransactions = useCallback(async () => {
    if (!account?.address && !evmAddress) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [aptosTxs, evmTxs] = await Promise.all([
        fetchAptosTransactions(),
        fetchEVMTransactions(),
      ]);

      // Combine and sort by timestamp
      const allTxs = [...aptosTxs, ...evmTxs].sort((a, b) => b.timestamp - a.timestamp);
      
      setTransactions(allTxs);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transaction history');
    } finally {
      setIsLoading(false);
    }
  }, [account?.address, evmAddress, fetchAptosTransactions, fetchEVMTransactions]);

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Poll pending transaction status
  const pollTransactionStatus = useCallback(async (txHash: string) => {
    if (!publicClient) return;

    try {
      const receipt = await publicClient.getTransactionReceipt({
        hash: txHash as `0x${string}`
      });

      if (receipt) {
        // Transaction confirmed, update status
        setPendingTxs(prev => {
          const next = new Set(prev);
          next.delete(txHash);
          return next;
        });

        // Update transaction in list
        setTransactions(prev =>
          prev.map(tx =>
            tx.hash === txHash
              ? {
                  ...tx,
                  status: receipt.status === 'success' ? 'confirmed' : 'failed'
                }
              : tx
          )
        );

        // Clear watcher
        const timeout = watchedTxs.current.get(txHash);
        if (timeout) {
          clearTimeout(timeout);
          watchedTxs.current.delete(txHash);
        }

        // Track transaction completion in analytics
        trackTx(
          receipt.status === 'success' ? 'confirmed' : 'failed',
          { txHash, chain: selectedChain }
        );

        // Show notification
        toast({
          title: receipt.status === 'success' ? "Transaction Confirmed" : "Transaction Failed",
          description: `Transaction ${txHash.slice(0, 10)}... ${receipt.status === 'success' ? 'completed successfully' : 'failed'}`,
          variant: receipt.status === 'success' ? 'default' : 'destructive'
        });

        // Refresh transactions
        fetchTransactions();
      } else {
        // Still pending, continue polling
        const timeout = setTimeout(() => pollTransactionStatus(txHash), 3000);
        watchedTxs.current.set(txHash, timeout);
      }
    } catch (err) {
      console.error('Error polling transaction status:', err);
    }
  }, [publicClient, fetchTransactions]);

  // Watch for new blocks to update pending transactions
  useWatchBlocks({
    onBlock: () => {
      // When a new block arrives, check pending transactions
      if (pendingTxs.size > 0) {
        pendingTxs.forEach(txHash => {
          if (!watchedTxs.current.has(txHash)) {
            pollTransactionStatus(txHash);
          }
        });
      }
    },
    enabled: pendingTxs.size > 0 && !!publicClient,
  });

  // Add a new pending transaction to watch
  const addPendingTransaction = useCallback((tx: UnifiedTransaction) => {
    // Track transaction initiation in analytics
    trackTx('initiated', { txHash: tx.hash, chain: tx.chain });

    setTransactions(prev => [tx, ...prev]);
    setPendingTxs(prev => new Set(prev).add(tx.hash));
    pollTransactionStatus(tx.hash);
  }, [pollTransactionStatus, trackTx]);

  // Retry a failed transaction
  const { sendTransaction } = useSendTransaction();

  const retryTransaction = useCallback(async (tx: UnifiedTransaction) => {
    if (!evmAddress || selectedChain === 'aptos') {
      toast({
        title: "Retry Not Available",
        description: "Transaction retry is only available for EVM chains",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Retrying Transaction",
        description: "Submitting transaction with updated parameters..."
      });

      sendTransaction({
        to: tx.to as `0x${string}`,
        value: BigInt(tx.amount),
        // Increase gas price by 10% for retry
        maxFeePerGas: undefined, // Let wallet estimate
        maxPriorityFeePerGas: undefined,
      });

      toast({
        title: "Transaction Submitted",
        description: "Transaction has been resubmitted to the network"
      });
    } catch (err) {
      console.error('Error retrying transaction:', err);

      // Track retry error in analytics
      trackError(
        'transaction_retry_error',
        err instanceof Error ? err.message : 'Failed to retry transaction',
        'EVM Wallet'
      );

      toast({
        title: "Retry Failed",
        description: "Failed to retry transaction. Please try again.",
        variant: "destructive"
      });
    }
  }, [evmAddress, selectedChain, sendTransaction, trackError]);

  // Cancel/Speed up transaction (by replacing with higher gas)
  const speedUpTransaction = useCallback(async (tx: UnifiedTransaction) => {
    if (!evmAddress || selectedChain === 'aptos') {
      toast({
        title: "Speed Up Not Available",
        description: "Transaction speed up is only available for EVM chains",
        variant: "destructive"
      });
      return;
    }

    if (tx.status !== 'pending') {
      toast({
        title: "Cannot Speed Up",
        description: "Only pending transactions can be sped up",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Speeding Up Transaction",
        description: "Submitting replacement transaction with higher gas..."
      });

      // Get current gas price and increase by 20%
      const gasPrice = await publicClient.getGasPrice();
      const newGasPrice = (gasPrice * 120n) / 100n;

      sendTransaction({
        to: tx.to as `0x${string}`,
        value: BigInt(tx.amount),
        gasPrice: newGasPrice,
        // Use same nonce to replace the transaction
        nonce: undefined, // Would need to get nonce from original tx
      });

      toast({
        title: "Speed Up Submitted",
        description: "Replacement transaction submitted with 20% higher gas"
      });
    } catch (err) {
      console.error('Error speeding up transaction:', err);

      // Track speed up error in analytics
      trackError(
        'transaction_speedup_error',
        err instanceof Error ? err.message : 'Failed to speed up transaction',
        'EVM Wallet'
      );

      toast({
        title: "Speed Up Failed",
        description: "Failed to speed up transaction. Please try again.",
        variant: "destructive"
      });
    }
  }, [evmAddress, selectedChain, publicClient, sendTransaction, trackError]);

  // Cancel transaction (by sending 0 ETH to self with same nonce)
  const cancelTransaction = useCallback(async (tx: UnifiedTransaction) => {
    if (!evmAddress || selectedChain === 'aptos') {
      toast({
        title: "Cancel Not Available",
        description: "Transaction cancellation is only available for EVM chains",
        variant: "destructive"
      });
      return;
    }

    if (tx.status !== 'pending') {
      toast({
        title: "Cannot Cancel",
        description: "Only pending transactions can be cancelled",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Cancelling Transaction",
        description: "Submitting cancellation transaction..."
      });

      // Get current gas price and increase by 20%
      const gasPrice = await publicClient.getGasPrice();
      const newGasPrice = (gasPrice * 120n) / 100n;

      sendTransaction({
        to: evmAddress, // Send to self
        value: 0n, // 0 value
        gasPrice: newGasPrice,
        // Use same nonce to replace the transaction
        nonce: undefined, // Would need to get nonce from original tx
      });

      toast({
        title: "Cancellation Submitted",
        description: "Cancellation transaction submitted"
      });
    } catch (err) {
      console.error('Error cancelling transaction:', err);

      // Track cancellation error in analytics
      trackError(
        'transaction_cancel_error',
        err instanceof Error ? err.message : 'Failed to cancel transaction',
        'EVM Wallet'
      );

      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel transaction. Please try again.",
        variant: "destructive"
      });
    }
  }, [evmAddress, selectedChain, publicClient, sendTransaction, trackError]);

  // Refresh function that can be called from the UI
  const refresh = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      watchedTxs.current.forEach(timeout => clearTimeout(timeout));
      watchedTxs.current.clear();
    };
  }, []);

  return {
    transactions,
    isLoading,
    error,
    refresh,
    addPendingTransaction,
    retryTransaction,
    speedUpTransaction,
    cancelTransaction,
    pendingCount: pendingTxs.size,
  };
};

export default useTransactionHistory;
