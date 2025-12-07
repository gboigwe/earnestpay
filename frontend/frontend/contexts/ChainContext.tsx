import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';
import { useAccount as useEVMAccount, useDisconnect as useEVMDisconnect } from 'wagmi';

export type ChainType = 'aptos' | 'ethereum' | 'arbitrum' | 'base' | 'polygon';

interface WalletConnectionState {
  aptos: {
    isConnected: boolean;
    address?: string;
  };
  evm: {
    isConnected: boolean;
    address?: string;
  };
}

interface ChainContextType {
  selectedChain: ChainType;
  setSelectedChain: (chain: ChainType, options?: { disconnectOthers?: boolean }) => void;
  isAptosChain: boolean;
  isEVMChain: boolean;
  walletConnections: WalletConnectionState;
  switchChain: (chain: ChainType, disconnectOthers?: boolean) => Promise<void>;
}

const ChainContext = createContext<ChainContextType | undefined>(undefined);

const STORAGE_KEY = 'earnestpay_selected_chain';

export const ChainProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load persisted chain from localStorage
  const [selectedChain, setSelectedChainState] = useState<ChainType>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && ['aptos', 'ethereum', 'arbitrum', 'base', 'polygon'].includes(stored)) {
        return stored as ChainType;
      }
    }
    return 'aptos';
  });

  // Track wallet connections with safe defaults
  const aptosWallet = useAptosWallet();
  const evmAccount = useEVMAccount();
  const evmDisconnectHook = useEVMDisconnect();

  // Use nullish coalescing to provide safe defaults
  const aptosConnected = aptosWallet.connected ?? false;
  const aptosAccount = aptosWallet.account ?? undefined;
  const aptosDisconnect = aptosWallet.disconnect ?? (() => {});

  const evmConnected = evmAccount.isConnected ?? false;
  const evmAddress = evmAccount.address ?? undefined;
  const evmDisconnect = evmDisconnectHook.disconnect ?? (() => {});

  const walletConnections: WalletConnectionState = {
    aptos: {
      isConnected: aptosConnected,
      address: aptosAccount?.address?.toString(),
    },
    evm: {
      isConnected: evmConnected,
      address: evmAddress,
    },
  };

  const isAptosChain = selectedChain === 'aptos';
  const isEVMChain = ['ethereum', 'arbitrum', 'base', 'polygon'].includes(selectedChain);

  // Persist selected chain to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, selectedChain);
    }
  }, [selectedChain]);

  const setSelectedChain = (chain: ChainType, options?: { disconnectOthers?: boolean }) => {
    setSelectedChainState(chain);

    // Optional: disconnect wallets when switching chains
    if (options?.disconnectOthers) {
      const newIsAptos = chain === 'aptos';
      const newIsEVM = ['ethereum', 'arbitrum', 'base', 'polygon'].includes(chain);

      if (newIsAptos && evmConnected && evmDisconnect) {
        evmDisconnect();
      } else if (newIsEVM && aptosConnected && aptosDisconnect) {
        aptosDisconnect();
      }
    }
  };

  const switchChain = async (chain: ChainType, disconnectOthers = false): Promise<void> => {
    setSelectedChain(chain, { disconnectOthers });
    
    // Emit custom event for network switch
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('chainSwitched', { 
        detail: { chain, timestamp: Date.now() } 
      }));
    }
  };

  return (
    <ChainContext.Provider
      value={{
        selectedChain,
        setSelectedChain,
        isAptosChain,
        isEVMChain,
        walletConnections,
        switchChain,
      }}
    >
      {children}
    </ChainContext.Provider>
  );
};

export const useChain = (): ChainContextType => {
  const context = useContext(ChainContext);
  if (!context) {
    throw new Error('useChain must be used within a ChainProvider');
  }
  return context;
};
