import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk';
import { useBalance } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { useChain, ChainType } from '@/contexts/ChainContext';
import { formatUnits } from 'viem';
import { RefreshCw } from 'lucide-react';
import { toast } from './ui/use-toast';

interface BalanceItemProps {
  chain: string;
  symbol: string;
  balance: string | null;
  usdValue?: number;
  loading: boolean;
}

const BalanceItem: React.FC<BalanceItemProps> = ({ chain, symbol, balance, usdValue, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {chain} {symbol}
        </span>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          {balance} {symbol}
        </div>
        {usdValue !== undefined && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            ${usdValue.toFixed(2)} USD
          </div>
        )}
      </div>
    </div>
  );
};

export const WalletBalanceWidget: React.FC = () => {
  const { account } = useWallet();
  const { selectedChain } = useChain();
  const chainIdMap: Record<ChainType, number> = {
    ethereum: 1,
    arbitrum: 42161,
    base: 8453,
    polygon: 137,
    aptos: 0, // Not used for EVM
  };
  const [aptBalance, setAptBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState({
    aptos: true,
    evm: true
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Aptos balance - memoized for manual refresh
  const fetchAptosBalance = useCallback(async () => {
    if (!account?.address) {
      setAptBalance(null);
      setIsLoading(prev => ({ ...prev, aptos: false }));
      return;
    }

    try {
      setIsLoading(prev => ({ ...prev, aptos: true }));
      // @ts-ignore - The type definition seems to be incorrect
      const aptos = new Aptos(new AptosConfig({ network: 'mainnet' }));
      const balance = await aptos.getAccountAPTAmount({ accountAddress: account.address });
      // Convert from octas to APT (1 APT = 10^8 octas)
      const aptBalance = (parseInt(balance.toString()) / 10**8).toFixed(2);
      setAptBalance(aptBalance);
    } catch (error) {
      console.error('Error fetching Aptos balance:', error);
      setAptBalance('0.00');
    } finally {
      setIsLoading(prev => ({ ...prev, aptos: false }));
    }
  }, [account?.address]);

  // Fetch Aptos balance on mount and when account changes
  useEffect(() => {
    fetchAptosBalance();
  }, [fetchAptosBalance]);

  // Fetch EVM balance based on selected chain with watch mode
  const isEVMChain = selectedChain !== 'aptos';
  const {
    data: evmBalance,
    isLoading: isEvmLoading,
    refetch: refetchEvmBalance
  } = useBalance({
    address: account?.address as `0x${string}` | undefined,
    chainId: chainIdMap[selectedChain],
    // @ts-ignore - These are valid properties in newer versions
    enabled: !!account?.address && isEVMChain,
    // Enable watch mode for real-time updates
    watch: true,
    // Refetch every 30 seconds
    refetchInterval: 30000,
  });

  // Update loading state for EVM
  useEffect(() => {
    setIsLoading(prev => ({
      ...prev,
      evm: isEvmLoading && !!account?.address && isEVMChain
    }));
  }, [isEvmLoading, account?.address, isEVMChain]);

  // Manual refresh function for both chains
  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Refresh Aptos balance
      await fetchAptosBalance();

      // Refresh EVM balance if on EVM chain
      if (isEVMChain && account?.address) {
        await refetchEvmBalance();
      }

      toast({
        title: "Balance Refreshed",
        description: "Wallet balances have been updated",
      });
    } catch (error) {
      console.error('Error refreshing balances:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh balances. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchAptosBalance, refetchEvmBalance, isEVMChain, account?.address]);

  // Auto-refresh every 30 seconds for Aptos (EVM has its own refetchInterval)
  useEffect(() => {
    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Set up new interval only if account exists
    if (account?.address) {
      refreshIntervalRef.current = setInterval(() => {
        fetchAptosBalance();
      }, 30000); // 30 seconds
    }

    // Cleanup on unmount or when account changes
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [account?.address, fetchAptosBalance]);

  // Refresh balances when network changes
  useEffect(() => {
    if (account?.address) {
      fetchAptosBalance();
      if (isEVMChain) {
        refetchEvmBalance();
      }
    }
  }, [selectedChain, account?.address, fetchAptosBalance, refetchEvmBalance, isEVMChain]);

  // Format EVM balance
  const formatEvmBalance = () => {
    if (!evmBalance || !evmBalance.value) return null;
    return parseFloat(formatUnits(evmBalance.value, evmBalance.decimals)).toFixed(4);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Wallet Balances
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing || (!account?.address)}
            className="h-8 w-8 p-0"
            title="Refresh balances"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Aptos Balance */}
          <BalanceItem
            chain="Aptos"
            symbol="APT"
            balance={aptBalance}
            loading={isLoading.aptos}
          />

          {/* EVM Balance - Only show if EVM chain is selected */}
          {isEVMChain && (
            <BalanceItem
              chain={selectedChain.charAt(0).toUpperCase() + selectedChain.slice(1)}
              symbol={evmBalance?.symbol || (selectedChain === 'polygon' ? 'MATIC' : 'ETH')}
              balance={formatEvmBalance()}
              loading={isLoading.evm}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletBalanceWidget;
