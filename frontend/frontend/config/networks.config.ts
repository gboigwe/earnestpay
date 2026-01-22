/**
 * Base Network Configuration
 * Comprehensive network settings for Base mainnet and testnet
 */

import { type Chain } from 'viem';
import { base, baseSepolia } from 'viem/chains';

export interface NetworkConfig {
  chain: Chain;
  rpcUrls: string[];
  blockExplorerUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isTestnet: boolean;
  features: {
    eip1559: boolean;
    gasEstimation: boolean;
    multicall: boolean;
  };
}

/**
 * Base Mainnet Configuration
 */
export const BASE_MAINNET_CONFIG: NetworkConfig = {
  chain: base,
  rpcUrls: [
    'https://mainnet.base.org',
    'https://base.llamarpc.com',
    'https://base.blockpi.network/v1/rpc/public',
    'https://base-rpc.publicnode.com',
    'https://1rpc.io/base',
  ],
  blockExplorerUrls: [
    'https://basescan.org',
    'https://base.blockscout.com',
  ],
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  isTestnet: false,
  features: {
    eip1559: true,
    gasEstimation: true,
    multicall: true,
  },
};

/**
 * Base Sepolia Testnet Configuration
 */
export const BASE_SEPOLIA_CONFIG: NetworkConfig = {
  chain: baseSepolia,
  rpcUrls: [
    'https://sepolia.base.org',
    'https://base-sepolia.blockpi.network/v1/rpc/public',
    'https://base-sepolia-rpc.publicnode.com',
  ],
  blockExplorerUrls: [
    'https://sepolia.basescan.org',
    'https://base-sepolia.blockscout.com',
  ],
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  isTestnet: true,
  features: {
    eip1559: true,
    gasEstimation: true,
    multicall: true,
  },
};

/**
 * Network configurations map
 */
export const NETWORKS: Record<number, NetworkConfig> = {
  [base.id]: BASE_MAINNET_CONFIG,
  [baseSepolia.id]: BASE_SEPOLIA_CONFIG,
};

/**
 * Supported chain IDs
 */
export const SUPPORTED_CHAIN_IDS = [base.id, baseSepolia.id] as const;

export type SupportedChainId = typeof SUPPORTED_CHAIN_IDS[number];

/**
 * Default network (Base Mainnet)
 */
export const DEFAULT_CHAIN_ID = base.id;

/**
 * Check if chain ID is supported
 */
export function isSupportedChain(chainId: number): chainId is SupportedChainId {
  return SUPPORTED_CHAIN_IDS.includes(chainId as SupportedChainId);
}

/**
 * Get network configuration by chain ID
 */
export function getNetworkConfig(chainId: number): NetworkConfig | undefined {
  return NETWORKS[chainId];
}

/**
 * Get network name by chain ID
 */
export function getNetworkName(chainId: number): string {
  const config = getNetworkConfig(chainId);
  return config?.chain.name || 'Unknown Network';
}

/**
 * Check if network is testnet
 */
export function isTestnet(chainId: number): boolean {
  const config = getNetworkConfig(chainId);
  return config?.isTestnet || false;
}

/**
 * Get block explorer URL for address
 */
export function getAddressExplorerUrl(chainId: number, address: string): string {
  const config = getNetworkConfig(chainId);
  if (!config) return '';
  return `${config.blockExplorerUrls[0]}/address/${address}`;
}

/**
 * Get block explorer URL for transaction
 */
export function getTransactionExplorerUrl(chainId: number, txHash: string): string {
  const config = getNetworkConfig(chainId);
  if (!config) return '';
  return `${config.blockExplorerUrls[0]}/tx/${txHash}`;
}

/**
 * Get block explorer URL for block
 */
export function getBlockExplorerUrl(chainId: number, blockNumber: number): string {
  const config = getNetworkConfig(chainId);
  if (!config) return '';
  return `${config.blockExplorerUrls[0]}/block/${blockNumber}`;
}

/**
 * Network display colors
 */
export const NETWORK_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  [base.id]: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  [baseSepolia.id]: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
  },
};

/**
 * Get network color classes
 */
export function getNetworkColors(chainId: number) {
  return NETWORK_COLORS[chainId] || {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
  };
}
