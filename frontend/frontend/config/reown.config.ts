import { mainnet, arbitrum, base, polygon } from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';

/**
 * Centralized Reown/WalletConnect Configuration
 *
 * Single source of truth for all Reown AppKit settings.
 * Used across the application for consistent metadata and network configuration.
 */

/**
 * Reown Project ID from environment
 * Get your project ID from https://cloud.reown.com
 */
export const REOWN_PROJECT_ID = import.meta.env.VITE_REOWN_PROJECT_ID || '';

/**
 * Application metadata displayed in wallet connection modals
 */
export const REOWN_METADATA = {
  name: 'EarnestPay',
  description: 'Blockchain payroll and payouts platform - Multi-chain support',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://earnestpay.com',
  icons: [
    typeof window !== 'undefined'
      ? `${window.location.origin}/earnestpay-icon.svg`
      : 'https://earnestpay.com/earnestpay-icon.svg'
  ]
};

/**
 * Supported EVM networks
 * Configured for multi-chain payroll operations
 */
export const SUPPORTED_NETWORKS: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet,    // Ethereum Mainnet
  arbitrum,   // Arbitrum One
  base,       // Base
  polygon     // Polygon
];

/**
 * AppKit feature configuration
 */
export const APPKIT_FEATURES = {
  analytics: true,  // Enable analytics for usage tracking
  email: false,     // Disable email login (wallet-only)
  socials: [],      // No social login providers
  swaps: false,     // Disable built-in swap feature
  onramp: false,    // Disable built-in onramp feature
};

/**
 * Check if Reown is properly configured
 */
export const isReownConfigured = () => {
  return !!REOWN_PROJECT_ID && REOWN_PROJECT_ID.length > 0;
};

/**
 * Network configuration for Wagmi
 * Maps network IDs to HTTP transport configurations
 * Base uses primary RPC with fallback support
 */
export const NETWORK_TRANSPORTS = {
  [mainnet.id]: 'https://eth.llamarpc.com',
  [arbitrum.id]: 'https://arbitrum.llamarpc.com',
  [base.id]: 'https://mainnet.base.org', // Primary Base RPC
  [polygon.id]: 'https://polygon.llamarpc.com',
} as const;

/**
 * Base RPC endpoints with fallback support
 */
export const BASE_RPC_ENDPOINTS = [
  'https://mainnet.base.org',
  'https://base.llamarpc.com',
  'https://base.blockpi.network/v1/rpc/public',
] as const;
