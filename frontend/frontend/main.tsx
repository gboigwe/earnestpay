import "../vite.polyfills";
import "./index.css";

import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit";
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

import App from "@/App.tsx";
// Internal components
import { Toaster } from "@/components/ui/toaster.tsx";
import { MultiChainWalletProvider } from "@/components/MultiChainWalletProvider.tsx";
import { WrongNetworkAlert } from "@/components/WrongNetworkAlert";
import { ChainProvider } from "@/contexts/ChainContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
// Centralized Reown configuration
import {
  REOWN_PROJECT_ID,
  REOWN_METADATA,
  SUPPORTED_NETWORKS,
  APPKIT_FEATURES,
  isReownConfigured
} from "@/config/reown.config";

const queryClient = new QueryClient();

/**
 * ReownInitializer Component
 *
 * Initializes Reown AppKit once and handles cleanup.
 * Does NOT use AppKitProvider wrapper since createAppKit handles this internally.
 *
 * Features:
 * - Prevents double initialization in React.StrictMode
 * - Proper cleanup on unmount
 * - Graceful handling when Reown not configured
 */
function ReownInitializer({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  const appKitRef = useRef<any>(null);

  useEffect(() => {
    // Prevent double initialization in development with React.StrictMode
    if (initialized.current) return;

    // Skip initialization if Reown not configured
    if (!isReownConfigured()) {
      console.warn('[Reown] Project ID not configured. EVM wallet connections will be disabled.');
      console.warn('[Reown] Get your project ID from https://cloud.reown.com');
      return;
    }

    try {
      // Create Wagmi adapter for EVM chains with Reown
      const wagmiAdapter = new WagmiAdapter({
        networks: SUPPORTED_NETWORKS,
        projectId: REOWN_PROJECT_ID,
        ssr: false
      });

      // Initialize AppKit with configuration
      // Note: createAppKit automatically handles provider setup internally
      const appKitInstance = createAppKit({
        adapters: [wagmiAdapter],
        networks: SUPPORTED_NETWORKS,
        projectId: REOWN_PROJECT_ID,
        metadata: REOWN_METADATA,
        features: APPKIT_FEATURES
      });

      appKitRef.current = appKitInstance;
      initialized.current = true;

      console.log('[Reown] AppKit initialized successfully');
    } catch (err) {
      console.error('[Reown] Failed to initialize AppKit:', err);
      // Don't block app rendering on Reown failure
      // User can still use Aptos wallet
    }

    // Cleanup function
    return () => {
      if (appKitRef.current) {
        try {
          // Close any open modals
          appKitRef.current.close?.();
          console.log('[Reown] AppKit cleaned up');
        } catch (err) {
          console.error('[Reown] Cleanup error:', err);
        }
      }
    };
  }, []);

  // Always render children - don't block on AppKit initialization
  return <>{children}</>;
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
        <ReownInitializer>
          <MultiChainWalletProvider>
            <ChainProvider>
              <App />
              <WrongNetworkAlert />
              <Toaster />
            </ChainProvider>
          </MultiChainWalletProvider>
        </ReownInitializer>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
