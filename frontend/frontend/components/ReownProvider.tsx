import { PropsWithChildren } from "react";
import { mainnet, arbitrum, base, polygon } from '@reown/appkit/networks';
import { WagmiProvider, createConfig, http, type Config } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create QueryClient for Wagmi
const queryClient = new QueryClient();

// Get Reown project ID from environment
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || '';

// Create minimal wagmi config for hooks to work
const wagmiConfig = createConfig({
  chains: [mainnet, arbitrum, base, polygon],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [polygon.id]: http(),
  },
});

/**
 * ReownProvider Component
 * 
 * Provides Wagmi context for EVM chain support.
 * AppKit initialization has been moved to main.tsx to prevent duplicate initialization.
 * 
 * This component only provides the Wagmi provider context for EVM wallet connections.
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
