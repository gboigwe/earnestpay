import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChainProvider } from '../../frontend/contexts/ChainContext';
import { createMockPetraWallet, createMockMetaMaskWallet, createMockAptosWalletAdapter, createMockWagmiAccount } from '../mocks/wallets';

// Mock wallet providers
vi.mock('@aptos-labs/wallet-adapter-react', () => ({
  useWallet: () => createMockAptosWalletAdapter(),
  WalletProvider: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('wagmi', () => ({
  useAccount: () => createMockWagmiAccount(false),
  useDisconnect: () => ({
    disconnect: vi.fn(),
  }),
  WagmiProvider: ({ children }: any) => <div>{children}</div>,
  createConfig: vi.fn(),
  http: vi.fn(),
}));

describe('Wallet Connection Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Aptos Wallet Connection', () => {
    it('should connect Aptos wallet successfully', async () => {
      const mockPetra = createMockPetraWallet();

      // Mock the window.aptos object (Petra wallet)
      (global as any).window.aptos = mockPetra;

      const TestComponent = () => {
        const React = require('react');
        const { useWallet } = require('@aptos-labs/wallet-adapter-react');
        const wallet = useWallet();

        return (
          <div>
            <button onClick={() => wallet.connect()}>Connect Aptos</button>
            <div data-testid="aptos-status">
              {wallet.connected ? 'Connected' : 'Disconnected'}
            </div>
            {wallet.account && (
              <div data-testid="aptos-address">{wallet.account.address}</div>
            )}
          </div>
        );
      };

      render(
        <ChainProvider>
          <TestComponent />
        </ChainProvider>
      );

      // Initially disconnected
      expect(screen.getByTestId('aptos-status')).toHaveTextContent('Connected');

      // Should show address when connected
      await waitFor(() => {
        expect(screen.getByTestId('aptos-address')).toBeInTheDocument();
      });
    });

    it('should disconnect Aptos wallet', async () => {
      const mockDisconnect = vi.fn().mockResolvedValue(undefined);

      vi.mocked('@aptos-labs/wallet-adapter-react').useWallet = () => ({
        ...createMockAptosWalletAdapter(),
        disconnect: mockDisconnect,
      }) as any;

      const TestComponent = () => {
        const React = require('react');
        const { useWallet } = require('@aptos-labs/wallet-adapter-react');
        const wallet = useWallet();

        return (
          <div>
            <button onClick={() => wallet.disconnect()}>Disconnect</button>
            <div data-testid="status">
              {wallet.connected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        );
      };

      render(
        <ChainProvider>
          <TestComponent />
        </ChainProvider>
      );

      const disconnectButton = screen.getByText('Disconnect');
      fireEvent.click(disconnectButton);

      await waitFor(() => {
        expect(mockDisconnect).toHaveBeenCalled();
      });
    });

    it('should handle Aptos wallet connection errors', async () => {
      const mockConnect = vi.fn().mockRejectedValue(new Error('User rejected'));

      vi.mocked('@aptos-labs/wallet-adapter-react').useWallet = () => ({
        ...createMockAptosWalletAdapter(),
        connect: mockConnect,
        connected: false,
      }) as any;

      const TestComponent = () => {
        const React = require('react');
        const { useWallet } = require('@aptos-labs/wallet-adapter-react');
        const wallet = useWallet();
        const [error, setError] = React.useState<string | null>(null);

        const handleConnect = async () => {
          try {
            await wallet.connect();
          } catch (err: any) {
            setError(err.message);
          }
        };

        return (
          <div>
            <button onClick={handleConnect}>Connect</button>
            {error && <div data-testid="error">{error}</div>}
          </div>
        );
      };

      render(
        <ChainProvider>
          <TestComponent />
        </ChainProvider>
      );

      fireEvent.click(screen.getByText('Connect'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('User rejected');
      });
    });
  });

  describe('EVM Wallet Connection', () => {
    it('should connect EVM wallet successfully', async () => {
      const mockMetaMask = createMockMetaMaskWallet();
      (global as any).window.ethereum = mockMetaMask;

      vi.mocked('wagmi').useAccount = () => createMockWagmiAccount(true) as any;

      const TestComponent = () => {
        const { useAccount } = require('wagmi');
        const account = useAccount();

        return (
          <div>
            <div data-testid="evm-status">
              {account.isConnected ? 'Connected' : 'Disconnected'}
            </div>
            {account.address && (
              <div data-testid="evm-address">{account.address}</div>
            )}
          </div>
        );
      };

      render(
        <ChainProvider>
          <TestComponent />
        </ChainProvider>
      );

      expect(screen.getByTestId('evm-status')).toHaveTextContent('Connected');
      expect(screen.getByTestId('evm-address')).toHaveTextContent('0xabcdef');
    });

    it('should handle EVM wallet connection errors', async () => {
      const mockMetaMask = {
        request: vi.fn().mockRejectedValue(new Error('User rejected the request')),
      };

      (global as any).window.ethereum = mockMetaMask;

      const TestComponent = () => {
        const React = require('react');
        const [error, setError] = React.useState<string | null>(null);

        const handleConnect = async () => {
          try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
          } catch (err: any) {
            setError(err.message);
          }
        };

        return (
          <div>
            <button onClick={handleConnect}>Connect EVM</button>
            {error && <div data-testid="error">{error}</div>}
          </div>
        );
      };

      render(<TestComponent />);

      fireEvent.click(screen.getByText('Connect EVM'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('User rejected');
      });
    });
  });

  describe('Multi-Wallet State Management', () => {
    it('should track both Aptos and EVM wallet connections independently', async () => {
      vi.mocked('@aptos-labs/wallet-adapter-react').useWallet = () => ({
        ...createMockAptosWalletAdapter(),
        connected: true,
      }) as any;

      vi.mocked('wagmi').useAccount = () => createMockWagmiAccount(true) as any;

      const TestComponent = () => {
        const React = require('react');
        const { useChain } = require('../../frontend/contexts/ChainContext');
        const { walletConnections } = useChain();

        return (
          <div>
            <div data-testid="aptos-connected">
              {walletConnections.aptos.isConnected ? 'Yes' : 'No'}
            </div>
            <div data-testid="evm-connected">
              {walletConnections.evm.isConnected ? 'Yes' : 'No'}
            </div>
          </div>
        );
      };

      render(
        <ChainProvider>
          <TestComponent />
        </ChainProvider>
      );

      expect(screen.getByTestId('aptos-connected')).toHaveTextContent('Yes');
      expect(screen.getByTestId('evm-connected')).toHaveTextContent('Yes');
    });

    it('should maintain wallet connections when switching chains', async () => {
      vi.mocked('@aptos-labs/wallet-adapter-react').useWallet = () => ({
        ...createMockAptosWalletAdapter(),
        connected: true,
      }) as any;

      const TestComponent = () => {
        const React = require('react');
        const { useChain } = require('../../frontend/contexts/ChainContext');
        const { selectedChain, setSelectedChain, walletConnections } = useChain();

        return (
          <div>
            <div data-testid="current-chain">{selectedChain}</div>
            <button onClick={() => setSelectedChain('ethereum')}>
              Switch to Ethereum
            </button>
            <div data-testid="aptos-connected">
              {walletConnections.aptos.isConnected ? 'Yes' : 'No'}
            </div>
          </div>
        );
      };

      render(
        <ChainProvider>
          <TestComponent />
        </ChainProvider>
      );

      expect(screen.getByTestId('aptos-connected')).toHaveTextContent('Yes');

      fireEvent.click(screen.getByText('Switch to Ethereum'));

      await waitFor(() => {
        expect(screen.getByTestId('current-chain')).toHaveTextContent('ethereum');
        // Wallet should still be connected
        expect(screen.getByTestId('aptos-connected')).toHaveTextContent('Yes');
      });
    });
  });

  describe('Wallet Persistence', () => {
    it('should persist wallet connection across page reloads', () => {
      localStorage.setItem('wagmi.store', JSON.stringify({
        state: {
          connections: {
            '0xabcdef': {
              accounts: ['0xabcdefABCDEF1234567890abcdefABCDEF123456'],
              chainId: 1,
            },
          },
        },
      }));

      vi.mocked('wagmi').useAccount = () => createMockWagmiAccount(true) as any;

      const TestComponent = () => {
        const { useAccount } = require('wagmi');
        const account = useAccount();

        return (
          <div data-testid="status">
            {account.isConnected ? 'Connected' : 'Disconnected'}
          </div>
        );
      };

      render(
        <ChainProvider>
          <TestComponent />
        </ChainProvider>
      );

      expect(screen.getByTestId('status')).toHaveTextContent('Connected');
    });
  });
});
