import { useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { toast } from '@/components/ui/use-toast';

/**
 * Hook to handle wallet disconnection events
 * Provides cleanup and user notifications
 */
export function useWalletDisconnect() {
  const { isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (!connector) return;

    // Listen for wallet disconnect events
    const handleDisconnect = () => {
      toast({
        title: 'Wallet Disconnected',
        description: 'Your wallet has been disconnected.',
        variant: 'default',
      });
    };

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // Wallet locked or all accounts disconnected
        disconnect();
        toast({
          title: 'Wallet Locked',
          description: 'Please unlock your wallet to continue.',
          variant: 'destructive',
        });
      } else {
        // Account switched
        toast({
          title: 'Account Switched',
          description: `Switched to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        });
      }
    };

    // Listen for chain changes
    const handleChainChanged = (chainId: string) => {
      const chainIdNum = parseInt(chainId, 16);
      const isBase = chainIdNum === 8453; // Base mainnet
      const isBaseSepolia = chainIdNum === 84532; // Base Sepolia

      if (!isBase && !isBaseSepolia) {
        toast({
          title: 'Unsupported Network',
          description: 'Please switch to Base or Base Sepolia network.',
          variant: 'destructive',
        });
      } else {
        const networkName = isBase ? 'Base' : 'Base Sepolia';
        toast({
          title: 'Network Switched',
          description: `Connected to ${networkName}`,
        });
      }
    };

    // Subscribe to events if available (for MetaMask and similar)
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on?.('disconnect', handleDisconnect);
      window.ethereum.on?.('accountsChanged', handleAccountsChanged);
      window.ethereum.on?.('chainChanged', handleChainChanged);
    }

    // Cleanup
    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener?.('disconnect', handleDisconnect);
        window.ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener?.('chainChanged', handleChainChanged);
      }
    };
  }, [connector, disconnect]);

  return {
    disconnect,
    isConnected,
  };
}

// Type declaration for ethereum provider
declare global {
  interface Window {
    ethereum?: {
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;
      request?: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}
