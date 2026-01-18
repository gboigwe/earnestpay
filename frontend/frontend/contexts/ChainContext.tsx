import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount, useDisconnect } from 'wagmi';

export type ChainType = 'base' | 'base-sepolia';

interface WalletConnectionState {
  isConnected: boolean;
  address?: string;
}

interface ChainContextType {
  selectedChain: ChainType;
  setSelectedChain: (chain: ChainType) => void;
  walletConnection: WalletConnectionState;
  switchChain: (chain: ChainType) => Promise<void>;
}

const ChainContext = createContext<ChainContextType | undefined>(undefined);

const STORAGE_KEY = 'earnestpay_selected_chain';

export const ChainProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load persisted chain from localStorage
  const [selectedChain, setSelectedChainState] = useState<ChainType>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && ['base', 'base-sepolia'].includes(stored)) {
        return stored as ChainType;
      }
    }
    return 'base';
  });

  // Track wallet connection with safe defaults
  const account = useAccount();
  const { disconnect } = useDisconnect();

  const walletConnection: WalletConnectionState = {
    isConnected: account.isConnected ?? false,
    address: account.address,
  };

  // Persist selected chain to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, selectedChain);
    }
  }, [selectedChain]);

  const setSelectedChain = (chain: ChainType) => {
    setSelectedChainState(chain);
  };

  const switchChain = async (chain: ChainType): Promise<void> => {
    setSelectedChain(chain);

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
        walletConnection,
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
