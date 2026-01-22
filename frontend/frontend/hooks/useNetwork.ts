/**
 * useNetwork Hook
 * React hook for network management and switching
 */

import { useState, useEffect, useCallback } from 'react';
import { useChainId, useSwitchChain, useAccount } from 'wagmi';
import {
  getNetworkConfig,
  getNetworkName,
  isTestnet,
  isSupportedChain,
  getNetworkColors,
  getAddressExplorerUrl,
  getTransactionExplorerUrl,
} from '@/config/networks.config';
import { getTokensByChainId } from '@/config/tokens.config';
import type { Token } from '@/config/tokens.config';
import type { NetworkConfig } from '@/config/networks.config';

export interface UseNetworkReturn {
  // Current network info
  chainId: number;
  networkName: string;
  networkConfig: NetworkConfig | undefined;
  isSupported: boolean;
  isTestnet: boolean;
  colors: {
    bg: string;
    text: string;
    border: string;
  };

  // Switching
  switchNetwork: (chainId: number) => void;
  isSwitching: boolean;
  switchError: Error | null;

  // Tokens
  tokens: Token[];

  // URLs
  getAddressUrl: (address: string) => string;
  getTransactionUrl: (txHash: string) => string;

  // Status
  isConnected: boolean;
  address: string | undefined;
}

/**
 * Hook for network management
 */
export function useNetwork(): UseNetworkReturn {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const { switchChain, isPending, error } = useSwitchChain();

  const [switchError, setSwitchError] = useState<Error | null>(null);

  // Clear error when chain changes
  useEffect(() => {
    setSwitchError(null);
  }, [chainId]);

  // Handle errors from useSwitchChain
  useEffect(() => {
    if (error) {
      setSwitchError(error);
    }
  }, [error]);

  const networkConfig = getNetworkConfig(chainId);
  const networkName = getNetworkName(chainId);
  const isSupported = isSupportedChain(chainId);
  const isTest = isTestnet(chainId);
  const colors = getNetworkColors(chainId);
  const tokens = getTokensByChainId(chainId);

  const switchNetwork = useCallback(
    (targetChainId: number) => {
      setSwitchError(null);
      switchChain({ chainId: targetChainId });
    },
    [switchChain]
  );

  const getAddressUrl = useCallback(
    (addr: string) => {
      return getAddressExplorerUrl(chainId, addr);
    },
    [chainId]
  );

  const getTransactionUrl = useCallback(
    (txHash: string) => {
      return getTransactionExplorerUrl(chainId, txHash);
    },
    [chainId]
  );

  return {
    chainId,
    networkName,
    networkConfig,
    isSupported,
    isTestnet: isTest,
    colors,
    switchNetwork,
    isSwitching: isPending,
    switchError,
    tokens,
    getAddressUrl,
    getTransactionUrl,
    isConnected,
    address,
  };
}

/**
 * Hook to watch for network changes
 */
export function useNetworkChange(
  callback: (chainId: number) => void
): void {
  const chainId = useChainId();

  useEffect(() => {
    callback(chainId);
  }, [chainId, callback]);
}

/**
 * Hook to enforce required network
 */
export function useRequireNetwork(requiredChainId: number): {
  isCorrectNetwork: boolean;
  switchToRequired: () => void;
  isSwitching: boolean;
} {
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  const isCorrectNetwork = chainId === requiredChainId;

  const switchToRequired = useCallback(() => {
    if (!isCorrectNetwork) {
      switchChain({ chainId: requiredChainId });
    }
  }, [isCorrectNetwork, switchChain, requiredChainId]);

  return {
    isCorrectNetwork,
    switchToRequired,
    isSwitching: isPending,
  };
}

/**
 * Hook to check if network supports a feature
 */
export function useNetworkFeature(feature: keyof NetworkConfig['features']): boolean {
  const chainId = useChainId();
  const networkConfig = getNetworkConfig(chainId);

  return networkConfig?.features[feature] || false;
}

/**
 * Hook to get network status
 */
export function useNetworkStatus(): {
  isOnline: boolean;
  latency: number | null;
  blockNumber: number | null;
} {
  const chainId = useChainId();
  const [status, setStatus] = useState<{
    isOnline: boolean;
    latency: number | null;
    blockNumber: number | null;
  }>({
    isOnline: true,
    latency: null,
    blockNumber: null,
  });

  useEffect(() => {
    const checkStatus = async () => {
      const networkConfig = getNetworkConfig(chainId);
      if (!networkConfig) return;

      const startTime = Date.now();

      try {
        const response = await fetch(networkConfig.rpcUrls[0], {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 1,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const latency = Date.now() - startTime;
          const blockNumber = parseInt(data.result, 16);

          setStatus({
            isOnline: true,
            latency,
            blockNumber,
          });
        } else {
          setStatus({
            isOnline: false,
            latency: null,
            blockNumber: null,
          });
        }
      } catch (error) {
        setStatus({
          isOnline: false,
          latency: null,
          blockNumber: null,
        });
      }
    };

    checkStatus();

    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, [chainId]);

  return status;
}
