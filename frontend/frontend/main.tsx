import "../vite.polyfills";
import "./index.css";

import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppKitProvider } from "@reown/appkit/react";
import { createAppKit } from "@reown/appkit";
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, arbitrum, base, polygon } from '@reown/appkit/networks';

import App from "@/App.tsx";
// Internal components
import { Toaster } from "@/components/ui/toaster.tsx";
import { MultiChainWalletProvider } from "@/components/MultiChainWalletProvider.tsx";
import { WrongNetworkAlert } from "@/components/WrongNetworkAlert";
import { ChainProvider } from "@/contexts/ChainContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const queryClient = new QueryClient();

// Get Reown project ID from environment
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || '';

// Configure metadata for your dApp
const metadata = {
  name: 'EarnestPay',
  description: 'Blockchain payroll and payouts platform',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://earnestpay.com',
  icons: ['/logo192.png']
};

// Configure supported EVM networks
// Type assertion to satisfy the tuple type requirement
const networks = [mainnet, arbitrum, base, polygon] as unknown as [any, ...any[]];

// Create a wrapper component that initializes AppKit
function AppKitWrapper({ children }: { children: React.ReactNode }) {
  const [appKit, setAppKit] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization in development with React.StrictMode
    if (initialized.current) return;
    
    try {
      if (!projectId) {
        console.warn('Reown Project ID not found. EVM wallet connections will be disabled.');
        return;
      }

      // Create Wagmi adapter for EVM chains with Reown
      const wagmiAdapter = new WagmiAdapter({
        networks,
        projectId,
        ssr: false
      });

      // Initialize AppKit with configuration
      const appKitInstance = createAppKit({
        adapters: [wagmiAdapter],
        networks,
        projectId,
        metadata,
        features: {
          analytics: true
        }
      });
      
      setAppKit(appKitInstance);
      initialized.current = true;
      
      // Cleanup function
      return () => {
        // Add any cleanup code here if needed
      };
    } catch (err) {
      console.error('Failed to initialize AppKit:', err);
      setError(err instanceof Error ? err : new Error('Failed to initialize AppKit'));
    }
  }, []);

  if (error) {
    return <div>Error initializing AppKit: {error.message}</div>;
  }

  if (!appKit) {
    return <div>Loading AppKit...</div>;
  }

  return (
    <AppKitProvider {...appKit}>
      {children}
    </AppKitProvider>
  );
}

// Get the root element
const rootElement = document.getElementById("root");

if (!rootElement) throw new Error('Failed to find the root element');

// Create root only once
const root = ReactDOM.createRoot(rootElement);

// Render the app
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppKitWrapper>
          <MultiChainWalletProvider>
            <ChainProvider>
              <App />
              <WrongNetworkAlert />
              <Toaster />
            </ChainProvider>
          </MultiChainWalletProvider>
        </AppKitWrapper>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
