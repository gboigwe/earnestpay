/**
 * Network switching and management utilities
 * Helpers for network operations and chain management
 */

import { type Chain } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import {
  getNetworkConfig,
  isSupportedChain,
  DEFAULT_CHAIN_ID,
  type SupportedChainId,
} from '@/config/networks.config';

/**
 * Switch network in user's wallet
 */
export async function switchNetwork(chainId: number): Promise<boolean> {
  if (!window.ethereum) {
    throw new Error('No wallet detected');
  }

  if (!isSupportedChain(chainId)) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  try {
    // Try to switch to the network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });

    return true;
  } catch (error: any) {
    // This error code indicates that the chain has not been added to the wallet
    if (error.code === 4902) {
      try {
        await addNetwork(chainId);
        return true;
      } catch (addError) {
        console.error('Failed to add network:', addError);
        throw addError;
      }
    }

    console.error('Failed to switch network:', error);
    throw error;
  }
}

/**
 * Add network to user's wallet
 */
export async function addNetwork(chainId: number): Promise<void> {
  if (!window.ethereum) {
    throw new Error('No wallet detected');
  }

  const networkConfig = getNetworkConfig(chainId);
  if (!networkConfig) {
    throw new Error(`Network configuration not found for chain ID: ${chainId}`);
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: `0x${chainId.toString(16)}`,
          chainName: networkConfig.chain.name,
          nativeCurrency: {
            name: networkConfig.nativeCurrency.name,
            symbol: networkConfig.nativeCurrency.symbol,
            decimals: networkConfig.nativeCurrency.decimals,
          },
          rpcUrls: networkConfig.rpcUrls,
          blockExplorerUrls: networkConfig.blockExplorerUrls,
        },
      ],
    });
  } catch (error) {
    console.error('Failed to add network:', error);
    throw error;
  }
}

/**
 * Check if wallet is connected to correct network
 */
export async function checkNetwork(expectedChainId: number): Promise<boolean> {
  if (!window.ethereum) {
    return false;
  }

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const currentChainId = parseInt(chainId as string, 16);
    return currentChainId === expectedChainId;
  } catch (error) {
    console.error('Failed to check network:', error);
    return false;
  }
}

/**
 * Get current network from wallet
 */
export async function getCurrentNetwork(): Promise<number | null> {
  if (!window.ethereum) {
    return null;
  }

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return parseInt(chainId as string, 16);
  } catch (error) {
    console.error('Failed to get current network:', error);
    return null;
  }
}

/**
 * Prompt user to switch to correct network if needed
 */
export async function ensureCorrectNetwork(
  requiredChainId: number
): Promise<boolean> {
  const currentChainId = await getCurrentNetwork();

  if (currentChainId === requiredChainId) {
    return true;
  }

  // If on wrong network, try to switch
  try {
    await switchNetwork(requiredChainId);
    return true;
  } catch (error) {
    console.error('Failed to switch to correct network:', error);
    return false;
  }
}

/**
 * Get chain object by chain ID
 */
export function getChainById(chainId: number): Chain | undefined {
  switch (chainId) {
    case base.id:
      return base;
    case baseSepolia.id:
      return baseSepolia;
    default:
      return undefined;
  }
}

/**
 * Format chain ID as hex string
 */
export function chainIdToHex(chainId: number): string {
  return `0x${chainId.toString(16)}`;
}

/**
 * Parse hex chain ID to number
 */
export function hexToChainId(hex: string): number {
  return parseInt(hex, 16);
}

/**
 * Check if network is available
 */
export async function isNetworkAvailable(chainId: number): Promise<boolean> {
  const networkConfig = getNetworkConfig(chainId);
  if (!networkConfig) return false;

  try {
    // Try to fetch from primary RPC
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

    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Get network status
 */
export async function getNetworkStatus(chainId: number): Promise<{
  available: boolean;
  latency?: number;
  blockNumber?: number;
}> {
  const networkConfig = getNetworkConfig(chainId);
  if (!networkConfig) {
    return { available: false };
  }

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

    if (!response.ok) {
      return { available: false };
    }

    const data = await response.json();
    const latency = Date.now() - startTime;
    const blockNumber = parseInt(data.result, 16);

    return {
      available: true,
      latency,
      blockNumber,
    };
  } catch (error) {
    return { available: false };
  }
}

/**
 * Watch for network changes
 */
export function watchNetwork(
  callback: (chainId: number) => void
): () => void {
  if (!window.ethereum) {
    return () => {};
  }

  const handler = (chainId: string) => {
    callback(hexToChainId(chainId));
  };

  window.ethereum.on('chainChanged', handler);

  return () => {
    window.ethereum?.removeListener('chainChanged', handler);
  };
}

/**
 * Get default network for environment
 */
export function getDefaultNetwork(): SupportedChainId {
  // Check environment variable
  const envNetwork = import.meta.env.VITE_DEFAULT_NETWORK;

  if (envNetwork === 'testnet') {
    return baseSepolia.id as SupportedChainId;
  }

  return DEFAULT_CHAIN_ID as SupportedChainId;
}

/**
 * Validate network configuration
 */
export function validateNetworkConfig(chainId: number): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!isSupportedChain(chainId)) {
    errors.push(`Chain ID ${chainId} is not supported`);
  }

  const config = getNetworkConfig(chainId);
  if (!config) {
    errors.push(`No configuration found for chain ID ${chainId}`);
  } else {
    if (!config.rpcUrls || config.rpcUrls.length === 0) {
      errors.push('No RPC URLs configured');
    }

    if (!config.blockExplorerUrls || config.blockExplorerUrls.length === 0) {
      errors.push('No block explorer URLs configured');
    }

    if (!config.nativeCurrency) {
      errors.push('Native currency not configured');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
