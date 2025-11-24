import { PropsWithChildren, useMemo } from "react";
import { mainnet, arbitrum, base, polygon } from '@reown/appkit/networks';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider } from '@/contexts/NotificationContext';

// Create the query client instance with persistence
let browserQueryClient: QueryClient | undefined;

const getQueryClient = () => {
  if (typeof window === 'undefined') {
    return new QueryClient();
  }
  
  if (!browserQueryClient) {
    browserQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          gcTime: 1000 * 60 * 60 * 24, // 24 hours
          staleTime: 1000 * 60 * 5, // 5 minutes
          refetchOnWindowFocus: false,
          retry: 2,
        },
      },
    });
  }
  
  return browserQueryClient;
};

// Create Wagmi config with proper typing and session persistence
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

// Component to handle session restoration
const SessionManager = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
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
        <SessionManager>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </SessionManager>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
