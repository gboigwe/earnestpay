import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { usePublicClient, useAccount } from 'wagmi';
import { useChain } from '@/contexts/ChainContext';
import { UnifiedTransaction, formatAptosTransaction, formatEVMTransaction } from '@/types/transactions';
import { getPaymentProcessedEvents } from '@/utils/payroll';

export const useTransactionHistory = (limit = 20) => {
  const { account } = useWallet();
  const { address: evmAddress } = useAccount();
  const { selectedChain } = useChain();
  const publicClient = usePublicClient()!;

  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Refresh function that can be called from the UI
  const refresh = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    isLoading,
    error,
    refresh,
  };
};

export default useTransactionHistory;
