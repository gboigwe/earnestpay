/**
 * Token Balance Hook
 * React hook for fetching and displaying token balances
 */

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { tokenBalanceService } from '../services/tokenBalance';
import { BASE_TOKENS, Token } from '../config/tokens.config';

export const useTokenBalance = (tokenAddress?: string, decimals: number = 18) => {
  const [balance, setBalance] = useState<{ raw: bigint; formatted: string }>({
    raw: BigInt(0),
    formatted: '0',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const chainId = useChainId();

  const fetchBalance = useCallback(async () => {
    if (!address || !tokenAddress) return;

    setIsLoading(true);
    try {
      const rpcUrl = 'https://mainnet.base.org';
      const result = await tokenBalanceService.getBalance(
        tokenAddress,
        address,
        rpcUrl,
        decimals
      );
      setBalance(result);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address, tokenAddress, decimals]);

  useEffect(() => {
    if (chainId === 8453) {
      fetchBalance();
    }
  }, [chainId, fetchBalance]);

  return {
    balance,
    isLoading,
    refetch: fetchBalance,
  };
};

export const useMultiTokenBalances = () => {
  const [balances, setBalances] = useState<Map<string, { raw: bigint; formatted: string }>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const chainId = useChainId();

  const fetchBalances = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const rpcUrl = 'https://mainnet.base.org';
      const result = await tokenBalanceService.getMultipleBalances(
        BASE_TOKENS,
        address,
        rpcUrl
      );
      setBalances(result);
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (chainId === 8453) {
      fetchBalances();
    }
  }, [chainId, fetchBalances]);

  return {
    balances,
    isLoading,
    refetch: fetchBalances,
  };
};
