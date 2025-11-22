import { PropsWithChildren } from "react";
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, arbitrum, base, polygon } from '@reown/appkit/networks';
import { WagmiProvider, createConfig, http, type Config } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppKitNetwork } from '@reown/appkit/networks';

// Create QueryClient for Wagmi
const queryClient = new QueryClient();

// Get Reown project ID from environment
// Sign up at https://cloud.reown.com to get your project ID
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || '';

// Configure metadata for your dApp
const metadata = {
  name: 'EarnestPay',
  description: 'Blockchain payroll and payouts platform - Multi-chain support',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://earnestpay.com',
  icons: [typeof window !== 'undefined' ? `${window.location.origin}/earnestpay-icon.svg` : 'https://earnestpay.com/earnestpay-icon.svg']
};

// Configure supported EVM networks for future cross-chain features
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, arbitrum, base, polygon];

// Create Wagmi config (either with WagmiAdapter or minimal fallback)
let wagmiConfig: Config;

if (projectId) {
  // Create Wagmi adapter for EVM chains with Reown
  const wagmiAdapter = new WagmiAdapter({
    networks,
    projectId,
    ssr: false
  });

  wagmiConfig = wagmiAdapter.wagmiConfig;

  // Create AppKit
  createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    metadata,
    features: {
      analytics: true // Enable analytics for usage tracking
    }
  });
} else {
  // Minimal wagmi config without Reown for hooks to work
  wagmiConfig = createConfig({
    chains: [mainnet, arbitrum, base, polygon],
    transports: {
      [mainnet.id]: http(),
      [arbitrum.id]: http(),
      [base.id]: http(),
      [polygon.id]: http(),
    },
  });
}

/**
 * ReownProvider Component
 *
 * Provides WalletConnect/Reown functionality for future EVM chain support.
 * This provider is OPTIONAL and won't interfere with Aptos wallet functionality.
 *
 * Usage:
 * - Currently inactive unless VITE_REOWN_PROJECT_ID is set in .env
 * - When implementing cross-chain features, this will enable EVM wallet connections
 * - Supports Ethereum, Arbitrum, Base, Polygon, and other EVM chains
 *
 * Setup:
 * 1. Sign up at https://cloud.reown.com
 * 2. Create a project and get your project ID
 * 3. Add VITE_REOWN_PROJECT_ID=your_project_id to .env file
 * 4. The provider will automatically activate
 */
export function ReownProvider({ children }: PropsWithChildren) {
  // Always provide Wagmi context for EVM chain interactions
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        {children}
      </WagmiProvider>
    </QueryClientProvider>
  );
}
