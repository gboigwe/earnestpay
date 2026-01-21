/**
 * Hook for gas estimation and optimization
 * Provides real-time gas price data and estimation for transactions
 */

import { useState, useEffect, useCallback } from 'react';
import { usePublicClient, useChainId } from 'wagmi';
import {
  getCurrentGasPrices,
  estimateGasWithTiers,
  type GasPrices,
  type GasPriceTier,
  getGasOptimizationTips,
} from '@/utils/gas';

export interface UseGasEstimationOptions {
  enabled?: boolean;
  refreshInterval?: number; // in milliseconds
}

export interface UseGasEstimationReturn {
  gasPrices: GasPrices | null;
  isLoading: boolean;
  error: Error | null;
  selectedTier: GasPriceTier;
  setSelectedTier: (tier: GasPriceTier) => void;
  estimateGas: (gasLimit: bigint) => Promise<GasPrices | null>;
  refresh: () => Promise<void>;
  optimizationTips: string[];
}

/**
 * Hook to estimate gas prices and provide optimization suggestions
 */
export function useGasEstimation(
  gasLimit?: bigint,
  options: UseGasEstimationOptions = {}
): UseGasEstimationReturn {
  const { enabled = true, refreshInterval = 30000 } = options; // Refresh every 30s by default

  const publicClient = usePublicClient();
  const chainId = useChainId();

  const [gasPrices, setGasPrices] = useState<GasPrices | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedTier, setSelectedTier] = useState<GasPriceTier>('standard');

  // Get chain-specific optimization tips
  const optimizationTips = getGasOptimizationTips(chainId);

  /**
   * Estimate gas for a given gas limit
   */
  const estimateGas = useCallback(
    async (estimatedGasLimit: bigint): Promise<GasPrices | null> => {
      if (!publicClient) {
        setError(new Error('Public client not available'));
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const prices = await estimateGasWithTiers(publicClient, estimatedGasLimit);
        setGasPrices(prices);
        return prices;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to estimate gas');
        setError(error);
        console.error('Gas estimation error:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [publicClient]
  );

  /**
   * Refresh gas prices
   */
  const refresh = useCallback(async () => {
    if (gasLimit) {
      await estimateGas(gasLimit);
    }
  }, [gasLimit, estimateGas]);

  /**
   * Initial load and periodic refresh
   */
  useEffect(() => {
    if (!enabled || !gasLimit || !publicClient) return;

    // Initial load
    estimateGas(gasLimit);

    // Set up refresh interval
    const interval = setInterval(() => {
      estimateGas(gasLimit);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [enabled, gasLimit, publicClient, refreshInterval, estimateGas]);

  return {
    gasPrices,
    isLoading,
    error,
    selectedTier,
    setSelectedTier,
    estimateGas,
    refresh,
    optimizationTips,
  };
}

/**
 * Hook to get current base fee and priority fee
 */
export function useCurrentGasPrices() {
  const publicClient = usePublicClient();
  const [baseFee, setBaseFee] = useState<bigint | null>(null);
  const [priorityFee, setPriorityFee] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchPrices = useCallback(async () => {
    if (!publicClient) return;

    setIsLoading(true);
    try {
      const { baseFee: bf, priorityFee: pf } = await getCurrentGasPrices(publicClient);
      setBaseFee(bf);
      setPriorityFee(pf);
    } catch (error) {
      console.error('Error fetching gas prices:', error);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient]);

  useEffect(() => {
    fetchPrices();

    // Refresh every 12 seconds (Base block time is ~2 seconds)
    const interval = setInterval(fetchPrices, 12000);

    return () => clearInterval(interval);
  }, [fetchPrices]);

  return {
    baseFee,
    priorityFee,
    isLoading,
    refresh: fetchPrices,
  };
}
