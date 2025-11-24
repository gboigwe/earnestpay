import { PropsWithChildren, useMemo } from "react";
import { mainnet, arbitrum, base, polygon } from '@reown/appkit/networks';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type State, createSyncStoragePersister } from '@tanstack/query-sync-storage-persist';

// Create a new QueryClient instance with default options
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 2,
      },
    },
  });
};

// Create the query client instance
let browserQueryClient: QueryClient | undefined;

const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: always create a new QueryClient
    return createQueryClient();
  }
  // Browser: create the singleton instance
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }
  return browserQueryClient;
};

// Create Wagmi config with proper typing
const createWagmiConfig = () => {
  return createConfig({
    chains: [mainnet, arbitrum, base, polygon],
    transports: {
      [mainnet.id]: http(),
      [arbitrum.id]: http(),
      [base.id]: http(),
      [polygon.id]: http(),
    },
  });
};

/**
 * ReownProvider Component
 * 
 * Provides Wagmi and React Query context for the application.
 * Uses proper typing and handles client-side state persistence.
 */
export function ReownProvider({ children }: PropsWithChildren) {
  const queryClient = useMemo(() => getQueryClient(), []);
  const config = useMemo(() => createWagmiConfig(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        {children}
      </WagmiProvider>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  );
}
