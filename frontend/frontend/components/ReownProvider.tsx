import { PropsWithChildren, useMemo, useEffect } from "react";
import { mainnet, arbitrum, base, polygon } from '@reown/appkit/networks';
import { WagmiProvider, createConfig, http, useConnect, useAccount, useDisconnect } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persist';
import { reconnect } from '@wagmi/core';

type WalletConnectSession = {
  name: string;
  accounts: string[];
  chainId: number;
  bridge: string;
  signerConnection: boolean;
  signerNetwork: number;
  handshakeId: number;
  handshakeTopic: string;
  peerId: string;
  peerMeta: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
};

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

// Create the query client instance with persistence
let browserQueryClient: QueryClient | undefined;

const getQueryClient = () => {
  if (typeof window === 'undefined') {
    return createQueryClient();
  }
  
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
    
    // Set up session persistence
    const sessionPersister = createSyncStoragePersister({
      storage: window.localStorage,
      key: 'earnestpay-wagmi-cache',
    });
    
    // Hydrate query cache from localStorage
    sessionPersister.restoreClient({
      queryClient: browserQueryClient,
      buster: 'v1', // Change this to invalidate all cached data
    });
  }
  
  return browserQueryClient;
};

// Create Wagmi config with proper typing and session persistence
const createWagmiConfig = () => {
  // Get stored session from localStorage
  const getStoredSession = (): WalletConnectSession | null => {
    if (typeof window === 'undefined') return null;
    const session = localStorage.getItem('walletconnect');
    return session ? JSON.parse(session) : null;
  };

  return createConfig({
    chains: [mainnet, arbitrum, base, polygon],
    transports: {
      [mainnet.id]: http(),
      [arbitrum.id]: http(),
      [base.id]: http(),
      [polygon.id]: http(),
    },
    // Enable WalletConnect v2
    enableWebSocketPublicClient: false,
    // Enable session persistence
    storage: {
      getItem: (key: string) => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      },
      setItem: (key: string, value: any) => {
        localStorage.setItem(key, JSON.stringify(value));
      },
      removeItem: (key: string) => {
        localStorage.removeItem(key);
      },
    },
  });
};

// Component to handle session restoration
const SessionManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedSession = localStorage.getItem('walletconnect');
        if (storedSession && !isConnected) {
          const session = JSON.parse(storedSession);
          const walletConnectConnector = connectors.find(
            (c) => c.id === 'walletConnect' || c.name === 'WalletConnect'
          );
          
          if (walletConnectConnector) {
            await reconnect();
          } else {
            // Clear invalid session if connector not found
            localStorage.removeItem('walletconnect');
          }
        }
      } catch (error) {
        console.error('Failed to restore WalletConnect session:', error);
        // Clear corrupted session
        localStorage.removeItem('walletconnect');
      }
    };

    restoreSession();
  }, [connect, isConnected, connectors]);

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
          {children}
        </SessionManager>
      </WagmiProvider>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  );
}
