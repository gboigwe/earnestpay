import { PropsWithChildren } from "react";
import { WalletProvider } from "@/components/WalletProvider";
import { ReownProvider } from "@/components/ReownProvider";

/**
 * MultiChainWalletProvider Component
 *
 * Provides dual-chain wallet support:
 * 1. Aptos wallets (Petra, Martian, Pontem, etc.) - ACTIVE
 * 2. EVM wallets via Reown (MetaMask, WalletConnect, etc.) - FUTURE
 *
 * Architecture:
 * - WalletProvider: Handles Aptos blockchain connections (current production use)
 * - ReownProvider: Handles EVM blockchain connections (future cross-chain features)
 *
 * Both providers are independent and non-conflicting:
 * - Users can connect Aptos wallet for payroll operations
 * - Users can optionally connect EVM wallet for cross-chain features
 * - No interference between the two provider systems
 *
 * Safety:
 * - ReownProvider is OPTIONAL (only active if VITE_REOWN_PROJECT_ID is set)
 * - WalletProvider maintains all existing Aptos functionality
 * - Zero breaking changes to current live platform
 *
 * Future Use Cases:
 * - Cross-chain payroll (pay employees on Ethereum, Arbitrum, etc.)
 * - Multi-chain treasury management
 * - Bridge assets between Aptos and EVM chains
 * - Accept payments in ERC-20 tokens
 */
export function MultiChainWalletProvider({ children }: PropsWithChildren) {
  return (
    <WalletProvider>
      <ReownProvider>
        {children}
      </ReownProvider>
    </WalletProvider>
  );
}
