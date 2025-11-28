/**
 * Network Configuration
 *
 * Centralized configuration for blockchain networks including:
 * - Network identifiers
 * - Block explorer URLs
 * - Native currency information
 * - RPC endpoints (if needed)
 */

export type NetworkType = 'aptos' | 'ethereum' | 'arbitrum' | 'base' | 'polygon';

export interface NetworkConfig {
  id: NetworkType;
  name: string;
  displayName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  explorer: {
    name: string;
    url: string;
    accountPath: string; // Path template for account URLs: {address}
    txPath: string;      // Path template for transaction URLs: {hash}
  };
  chainId?: number; // EVM chain ID (not applicable to Aptos)
  testnet?: boolean;
}

/**
 * Network configurations for all supported chains
 */
export const NETWORK_CONFIGS: Record<NetworkType, NetworkConfig> = {
  aptos: {
    id: 'aptos',
    name: 'Aptos',
    displayName: 'Aptos Network',
    nativeCurrency: {
      name: 'Aptos Coin',
      symbol: 'APT',
      decimals: 8,
    },
    explorer: {
      name: 'Aptos Explorer',
      url: 'https://explorer.aptoslabs.com',
      accountPath: '/account/{address}?network=testnet',
      txPath: '/txn/{hash}?network=testnet',
    },
    testnet: true,
  },

  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    displayName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    explorer: {
      name: 'Etherscan',
      url: 'https://etherscan.io',
      accountPath: '/address/{address}',
      txPath: '/tx/{hash}',
    },
    chainId: 1,
  },

  arbitrum: {
    id: 'arbitrum',
    name: 'Arbitrum',
    displayName: 'Arbitrum One',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    explorer: {
      name: 'Arbiscan',
      url: 'https://arbiscan.io',
      accountPath: '/address/{address}',
      txPath: '/tx/{hash}',
    },
    chainId: 42161,
  },

  base: {
    id: 'base',
    name: 'Base',
    displayName: 'Base',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    explorer: {
      name: 'BaseScan',
      url: 'https://basescan.org',
      accountPath: '/address/{address}',
      txPath: '/tx/{hash}',
    },
    chainId: 8453,
  },

  polygon: {
    id: 'polygon',
    name: 'Polygon',
    displayName: 'Polygon PoS',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    explorer: {
      name: 'PolygonScan',
      url: 'https://polygonscan.com',
      accountPath: '/address/{address}',
      txPath: '/tx/{hash}',
    },
    chainId: 137,
  },
};

/**
 * Get explorer URL for an account/address
 */
export function getExplorerAccountUrl(network: NetworkType, address: string): string {
  const config = NETWORK_CONFIGS[network];
  return `${config.explorer.url}${config.explorer.accountPath.replace('{address}', address)}`;
}

/**
 * Get explorer URL for a transaction
 */
export function getExplorerTxUrl(network: NetworkType, txHash: string): string {
  const config = NETWORK_CONFIGS[network];
  return `${config.explorer.url}${config.explorer.txPath.replace('{hash}', txHash)}`;
}

/**
 * Get network configuration
 */
export function getNetworkConfig(network: NetworkType): NetworkConfig {
  return NETWORK_CONFIGS[network];
}

/**
 * Get native currency symbol for a network
 */
export function getNativeCurrencySymbol(network: NetworkType): string {
  return NETWORK_CONFIGS[network].nativeCurrency.symbol;
}

/**
 * Get network display name
 */
export function getNetworkDisplayName(network: NetworkType): string {
  return NETWORK_CONFIGS[network].displayName;
}

/**
 * Get all network types
 */
export function getAllNetworks(): NetworkType[] {
  return Object.keys(NETWORK_CONFIGS) as NetworkType[];
}

/**
 * Check if a network is a testnet
 */
export function isTestnet(network: NetworkType): boolean {
  return NETWORK_CONFIGS[network].testnet ?? false;
}
