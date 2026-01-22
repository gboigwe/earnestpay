/**
 * RPC Provider Configuration
 * Manages Base network RPC endpoints with fallback support
 */

export interface RpcProvider {
  url: string;
  priority: number;
  maxRetries: number;
}

export interface NetworkRpcConfig {
  chainId: number;
  providers: RpcProvider[];
  healthCheckInterval: number;
}

export const BASE_RPC_CONFIG: NetworkRpcConfig = {
  chainId: 8453,
  healthCheckInterval: 60000, // 1 minute
  providers: [
    {
      url: 'https://mainnet.base.org',
      priority: 1,
      maxRetries: 3,
    },
    {
      url: 'https://base.llamarpc.com',
      priority: 2,
      maxRetries: 3,
    },
    {
      url: 'https://base.blockpi.network/v1/rpc/public',
      priority: 3,
      maxRetries: 2,
    },
    {
      url: 'https://base-rpc.publicnode.com',
      priority: 4,
      maxRetries: 2,
    },
    {
      url: 'https://1rpc.io/base',
      priority: 5,
      maxRetries: 2,
    },
  ],
};

export const BASE_SEPOLIA_RPC_CONFIG: NetworkRpcConfig = {
  chainId: 84532,
  healthCheckInterval: 60000,
  providers: [
    {
      url: 'https://sepolia.base.org',
      priority: 1,
      maxRetries: 3,
    },
    {
      url: 'https://base-sepolia.blockpi.network/v1/rpc/public',
      priority: 2,
      maxRetries: 2,
    },
    {
      url: 'https://base-sepolia-rpc.publicnode.com',
      priority: 3,
      maxRetries: 2,
    },
  ],
};

/**
 * Get RPC configuration by chain ID
 */
export function getRpcConfig(chainId: number): NetworkRpcConfig | undefined {
  switch (chainId) {
    case 8453:
      return BASE_RPC_CONFIG;
    case 84532:
      return BASE_SEPOLIA_RPC_CONFIG;
    default:
      return undefined;
  }
}

/**
 * Get primary RPC URL for a chain
 */
export function getPrimaryRpcUrl(chainId: number): string {
  const config = getRpcConfig(chainId);
  return config?.providers[0]?.url || '';
}

/**
 * Get all RPC URLs for a chain
 */
export function getAllRpcUrls(chainId: number): string[] {
  const config = getRpcConfig(chainId);
  return config?.providers.map(p => p.url) || [];
}
