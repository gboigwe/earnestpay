import { PropsWithChildren, lazy, Suspense } from "react";
import { WalletProvider } from "@/components/WalletProvider";

/**
 * Lazy load ReownProvider to reduce initial bundle size
 * Only loads ~2.2MB of EVM wallet dependencies when needed
 */
const ReownProvider = lazy(() =>
  import("@/components/ReownProvider").then(module => ({
    default: module.ReownProvider
  }))
);

/**
 * Loading fallback for ReownProvider
 * Minimal UI to show while EVM dependencies load
 */
const ReownLoadingFallback = () => (
  <div className="fixed top-4 right-4 bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2 text-sm text-blue-400 animate-pulse">
    Loading EVM wallet support...
  </div>
);

/**
 * MultiChainWalletProvider Component
 *
 * Provides dual-chain wallet support with optimized bundle loading:
 * 1. Aptos wallets (Petra, Martian, Pontem, etc.) - ALWAYS LOADED
 * 2. EVM wallets via Reown (MetaMask, WalletConnect, etc.) - LAZY LOADED
 *
 * Performance Optimization:
 * - ReownProvider is lazy loaded to reduce initial bundle by ~2.2MB
 * - Only loads when VITE_REOWN_PROJECT_ID is configured
 * - Uses React Suspense for smooth loading experience
 *
 * Architecture:
 * - WalletProvider: Handles Aptos blockchain connections (immediate load)
 * - ReownProvider: Handles EVM blockchain connections (lazy load)
 *
 * Both providers are independent and non-conflicting:
 * - Users can connect Aptos wallet for payroll operations
 * - Users can optionally connect EVM wallet for cross-chain features
 * - No interference between the two provider systems
 *
 * Bundle Impact:
 * - Before: ~7.4MB initial bundle
 * - After: ~3MB initial bundle (Aptos only)
 * - EVM: ~2.2MB (loads on-demand)
 *
 * Future Use Cases:
 * - Cross-chain payroll (pay employees on Ethereum, Arbitrum, etc.)
 * - Multi-chain treasury management
 * - Bridge assets between Aptos and EVM chains
 * - Accept payments in ERC-20 tokens
 */
export function MultiChainWalletProvider({ children }: PropsWithChildren) {
  // Check if Reown/EVM is enabled
  const reownEnabled = !!import.meta.env.VITE_REOWN_PROJECT_ID;

  return (
    <WalletProvider>
      {reownEnabled ? (
        <Suspense fallback={<ReownLoadingFallback />}>
          <ReownProvider>{children}</ReownProvider>
        </Suspense>
      ) : (
        children
      )}
    </WalletProvider>
  );
}
