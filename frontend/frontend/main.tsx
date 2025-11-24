import "../vite.polyfills";
import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppKitProvider } from "@reown/appkit/react";

import App from "@/App.tsx";
// Internal components
import { Toaster } from "@/components/ui/toaster.tsx";
import { MultiChainWalletProvider } from "@/components/MultiChainWalletProvider.tsx";
import { WrongNetworkAlert } from "@/components/WrongNetworkAlert";
import { ChainProvider } from "@/contexts/ChainContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const queryClient = new QueryClient();

// Initialize AppKit with minimal configuration
const appKitConfig = {
  // Required: App metadata
  appMetadata: {
    name: 'EarnestPay',
    description: 'Payroll management on blockchain',
    url: window.location.origin,
    icons: ['/logo192.png'],
  },
  // Optional: Enable debug mode
  debug: true,
  // Optional: Configure default chain
  defaultChain: 'eip155:1',
  // Optional: Configure chains
  chains: [
    {
      id: 'eip155:1',
      name: 'Ethereum',
      rpcUrl: 'https://eth.llamarpc.com',
    },
    {
      id: 'eip155:137',
      name: 'Polygon',
      rpcUrl: 'https://polygon-rpc.com',
    },
  ],
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppKitProvider config={appKitConfig}>
        <MultiChainWalletProvider>
          <ChainProvider>
            <QueryClientProvider client={queryClient}>
              <App />
              <WrongNetworkAlert />
              <Toaster />
            </QueryClientProvider>
          </ChainProvider>
        </MultiChainWalletProvider>
      </AppKitProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
