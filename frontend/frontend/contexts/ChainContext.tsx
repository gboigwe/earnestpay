import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ChainType = 'aptos' | 'ethereum' | 'arbitrum' | 'base' | 'polygon';

interface ChainContextType {
  selectedChain: ChainType;
  setSelectedChain: (chain: ChainType) => void;
  isAptosChain: boolean;
  isEVMChain: boolean;
}

const ChainContext = createContext<ChainContextType | undefined>(undefined);

export const ChainProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedChain, setSelectedChain] = useState<ChainType>('aptos');

  const isAptosChain = selectedChain === 'aptos';
  const isEVMChain = ['ethereum', 'arbitrum', 'base', 'polygon'].includes(selectedChain);

  return (
    <ChainContext.Provider
      value={{
        selectedChain,
        setSelectedChain,
        isAptosChain,
        isEVMChain,
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
