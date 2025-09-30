import React, { createContext, useContext } from 'react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { AptosWalletAdapterProvider, useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';
import { PetraWallet } from 'petra-plugin-wallet-adapter';
import { MartianWallet } from '@martianwallet/aptos-wallet-adapter';
import { PontemWallet } from '@pontem/wallet-adapter-plugin';

interface WalletContextType {
  account: { address: string } | null;
  connected: boolean;
  connect: () => Promise<void>;
  connectWith: (walletName: string) => Promise<void>;
  disconnect: () => void;
  aptosClient: Aptos;
  signAndSubmit: (payload: any) => Promise<{ hash: string }>;
  wallets: { name: string }[];
}

const WalletContext = createContext<WalletContextType | null>(null);

// Bridge component to normalize adapter API to our app's context
const WalletBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const adapter = useAptosWallet();
  // Align network with wallet when possible; fallback to env
  const envNet = (process.env.REACT_APP_APTOS_NETWORK || process.env.VITE_APTOS_NETWORK || 'devnet').toLowerCase();
  const walletNetRaw = (adapter as any)?.network?.name || (adapter as any)?.network?.network || (adapter as any)?.network;
  const walletNet = typeof walletNetRaw === 'string' ? walletNetRaw.toLowerCase() : undefined;
  const resolvedNet = (walletNet === 'mainnet' || walletNet === 'testnet' || walletNet === 'devnet') ? walletNet : envNet;
  if (walletNet && walletNet !== envNet) {
    console.warn(`[WalletProvider] Wallet network (${walletNet}) differs from env (${envNet}). Using wallet network for Aptos client.`);
  }
  const network = resolvedNet === 'mainnet' ? Network.MAINNET : resolvedNet === 'testnet' ? Network.TESTNET : Network.DEVNET;
  const aptosConfig = new AptosConfig({ network });
  const aptosClient = new Aptos(aptosConfig);

  const value: WalletContextType = {
    account: adapter.account ? { address: String(adapter.account.address) } : null,
    connected: adapter.connected,
    connect: async () => {
      // pick the first available wallet by default if none selected
      const defaultWallet = adapter.wallets?.[0]?.name || 'Petra';
      await adapter.connect(defaultWallet as any);
    },
    connectWith: async (walletName: string) => {
      await adapter.connect(walletName as any);
    },
    disconnect: async () => {
      await adapter.disconnect();
    },
    aptosClient,
    signAndSubmit: async (payload: any) => {
      // Normalize to adapter's expected shape(s)
      const sender = adapter.account?.address as string | undefined;
      if (!sender) {
        throw new Error('Wallet not connected');
      }

      // Extract function and args from various payload shapes
      const extract = (pl: any) => {
        if (!pl) return null;
        if (pl.type === 'entry_function_payload') {
          return {
            func: pl.function,
            tyArgs: pl.type_arguments || [],
            fnArgs: pl.arguments || []
          };
        }
        if (pl.data && pl.data.function) {
          return {
            func: pl.data.function,
            tyArgs: pl.data.typeArguments || [],
            fnArgs: pl.data.functionArguments || []
          };
        }
        if (pl.function) {
          return {
            func: pl.function,
            tyArgs: pl.type_arguments || pl.typeArguments || [],
            fnArgs: pl.arguments || pl.functionArguments || []
          };
        }
        return null;
      };

      const base = extract(payload) || extract(payload?.payload);
      if (!base || !base.func) {
        console.error('signAndSubmit: malformed payload', payload);
        throw new Error('Malformed transaction payload: missing entry function');
      }

      // Candidate 1: ts-sdk style InputTransactionData
      const inputV2 = {
        sender,
        data: {
          function: base.func,
          typeArguments: base.tyArgs,
          functionArguments: base.fnArgs
        }
      };

      // Candidate 2: legacy entry_function_payload
      const inputLegacy = {
        type: 'entry_function_payload',
        function: base.func,
        type_arguments: base.tyArgs,
        arguments: base.fnArgs
      } as const;

      // Try V2 first, then legacy
      try {
        const res = await adapter.signAndSubmitTransaction(inputV2 as any);
        try {
          await aptosClient.waitForTransaction({ transactionHash: res.hash });
        } catch (waitErr) {
          // Some public endpoints may briefly return 404; don't fail UX on wait errors
          console.warn('waitForTransaction (v2) warning:', waitErr);
        }
        return { hash: res.hash };
      } catch (e1) {
        try {
          const res = await adapter.signAndSubmitTransaction(inputLegacy as any);
          try {
            await aptosClient.waitForTransaction({ transactionHash: res.hash });
          } catch (waitErr2) {
            console.warn('waitForTransaction (legacy) warning:', waitErr2);
          }
          return { hash: res.hash };
        } catch (e2) {
          // Surface the original error but include context
          console.error('signAndSubmit failed (v2 and legacy):', { inputV2, inputLegacy, e1, e2 });
          throw e2 || e1;
        }
      }
    },
    wallets: (adapter.wallets || []).map((w) => ({ name: String(w.name) }))
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wallets = [new PetraWallet(), new MartianWallet(), new PontemWallet()];

  return (
    // cast to any to be compatible across adapter versions
    <AptosWalletAdapterProvider {...({ plugins: wallets, autoConnect: true, onError: (e: any) => console.error('Wallet error:', e) } as any)}>
      <WalletBridge>{children}</WalletBridge>
    </AptosWalletAdapterProvider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};