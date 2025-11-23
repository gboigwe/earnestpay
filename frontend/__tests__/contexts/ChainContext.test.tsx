import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { ChainProvider, useChain } from '../../frontend/contexts/ChainContext';
import { createMockAptosWalletAdapter, createMockWagmiAccount, createMockWagmiDisconnect } from '../mocks/wallets';

// Mock the wallet hooks
vi.mock('@aptos-labs/wallet-adapter-react', () => ({
  useWallet: () => createMockAptosWalletAdapter(),
}));

vi.mock('wagmi', () => ({
  useAccount: () => createMockWagmiAccount(false),
  useDisconnect: () => createMockWagmiDisconnect(),
}));

describe('ChainContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Provider Initialization', () => {
    it('should provide default chain as aptos', () => {
      const TestComponent = () => {
        const { selectedChain } = useChain();
        return <div data-testid="chain">{selectedChain}</div>;
      };

      render(
        <ChainProvider>
          <TestComponent />
        </ChainProvider>
      );

      expect(screen.getByTestId('chain')).toHaveTextContent('aptos');
    });

    it('should load persisted chain from localStorage', () => {
      localStorage.setItem('earnestpay_selected_chain', 'ethereum');

      const TestComponent = () => {
        const { selectedChain } = useChain();
        return <div data-testid="chain">{selectedChain}</div>;
      };

      render(
        <ChainProvider>
          <TestComponent />
        </ChainProvider>
      );

      expect(screen.getByTestId('chain')).toHaveTextContent('ethereum');
    });

    it('should fallback to aptos for invalid stored chain', () => {
      localStorage.setItem('earnestpay_selected_chain', 'invalid-chain');

      const TestComponent = () => {
        const { selectedChain } = useChain();
        return <div data-testid="chain">{selectedChain}</div>;
      };

      render(
        <ChainProvider>
          <TestComponent />
        </ChainProvider>
      );

      expect(screen.getByTestId('chain')).toHaveTextContent('aptos');
    });
  });

  describe('Chain Selection', () => {
    it('should update selected chain', () => {
      const { result } = renderHook(() => useChain(), {
        wrapper: ChainProvider,
      });

      expect(result.current.selectedChain).toBe('aptos');

      act(() => {
        result.current.setSelectedChain('ethereum');
      });

      expect(result.current.selectedChain).toBe('ethereum');
    });

    it('should persist chain selection to localStorage', async () => {
      const { result } = renderHook(() => useChain(), {
        wrapper: ChainProvider,
      });

      act(() => {
        result.current.setSelectedChain('arbitrum');
      });

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'earnestpay_selected_chain',
          'arbitrum'
        );
      });
    });

    it('should correctly identify Aptos chain', () => {
      const { result } = renderHook(() => useChain(), {
        wrapper: ChainProvider,
      });

      expect(result.current.isAptosChain).toBe(true);
      expect(result.current.isEVMChain).toBe(false);

      act(() => {
        result.current.setSelectedChain('ethereum');
      });

      expect(result.current.isAptosChain).toBe(false);
      expect(result.current.isEVMChain).toBe(true);
    });

    it('should correctly identify EVM chains', () => {
      const { result } = renderHook(() => useChain(), {
        wrapper: ChainProvider,
      });

      const evmChains = ['ethereum', 'arbitrum', 'base', 'polygon'];

      evmChains.forEach((chain) => {
        act(() => {
          result.current.setSelectedChain(chain as any);
        });

        expect(result.current.isEVMChain).toBe(true);
        expect(result.current.isAptosChain).toBe(false);
      });
    });
  });

  describe('Wallet Connection State', () => {
    it('should track Aptos wallet connection', () => {
      const { result } = renderHook(() => useChain(), {
        wrapper: ChainProvider,
      });

      expect(result.current.walletConnections.aptos.isConnected).toBe(true);
      expect(result.current.walletConnections.aptos.address).toBeDefined();
    });

    it('should track EVM wallet connection', () => {
      const { result } = renderHook(() => useChain(), {
        wrapper: ChainProvider,
      });

      expect(result.current.walletConnections.evm.isConnected).toBe(false);
      expect(result.current.walletConnections.evm.address).toBeUndefined();
    });

    it('should handle missing wallet data gracefully', () => {
      vi.mocked('@aptos-labs/wallet-adapter-react').useWallet = () => ({
        ...createMockAptosWalletAdapter(),
        connected: false,
        account: undefined,
      }) as any;

      const { result } = renderHook(() => useChain(), {
        wrapper: ChainProvider,
      });

      expect(result.current.walletConnections.aptos.isConnected).toBe(false);
      expect(result.current.walletConnections.aptos.address).toBeUndefined();
    });
  });

  describe('Chain Switching', () => {
    it('should switch chain without disconnecting wallets by default', async () => {
      const { result } = renderHook(() => useChain(), {
        wrapper: ChainProvider,
      });

      await act(async () => {
        await result.current.switchChain('ethereum');
      });

      expect(result.current.selectedChain).toBe('ethereum');
    });

    it('should optionally disconnect wallets when switching', async () => {
      const mockAptosDisconnect = vi.fn();
      const mockEvmDisconnect = vi.fn();

      vi.mocked('@aptos-labs/wallet-adapter-react').useWallet = () => ({
        ...createMockAptosWalletAdapter(),
        disconnect: mockAptosDisconnect,
      }) as any;

      vi.mocked('wagmi').useDisconnect = () => ({
        ...createMockWagmiDisconnect(),
        disconnect: mockEvmDisconnect,
      }) as any;

      const { result } = renderHook(() => useChain(), {
        wrapper: ChainProvider,
      });

      await act(async () => {
        await result.current.switchChain('ethereum', true);
      });

      expect(mockAptosDisconnect).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle context usage outside provider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useChain());
      }).toThrow('useChain must be used within a ChainProvider');

      consoleError.mockRestore();
    });

    it('should handle localStorage errors gracefully', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { result } = renderHook(() => useChain(), {
        wrapper: ChainProvider,
      });

      // Should not throw
      expect(() => {
        act(() => {
          result.current.setSelectedChain('ethereum');
        });
      }).not.toThrow();

      setItemSpy.mockRestore();
    });
  });
});
