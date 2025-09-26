import React, { createContext, useContext, useState } from 'react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

interface WalletContextType {
  account: { address: string } | null;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  aptosClient: Aptos;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<{ address: string } | null>(null);
  const [connected, setConnected] = useState(false);

  const aptosConfig = new AptosConfig({ network: Network.DEVNET });
  const aptosClient = new Aptos(aptosConfig);

  const connect = async () => {
    // Mock connection - in real implementation, this would integrate with actual wallet
    const mockAddress = "0x2951351876ea0fc5a1392b673210df9a0019a18b92bcfb0f3b73fa90f52b0bd1";
    setAccount({ address: mockAddress });
    setConnected(true);
  };

  const disconnect = () => {
    setAccount(null);
    setConnected(false);
  };

  return (
    <WalletContext.Provider value={{ account, connected, connect, disconnect, aptosClient }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};