import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChainSelector } from '../../frontend/components/ChainSelector';
import { ChainProvider } from '../../frontend/contexts/ChainContext';
import { createMockWagmiSwitchChain, createMockAptosWalletAdapter, createMockWagmiAccount } from '../mocks/wallets';

// Mock dependencies
vi.mock('wagmi', () => ({
  useSwitchChain: () => createMockWagmiSwitchChain(),
  useChainId: () => 1,
  useAccount: () => createMockWagmiAccount(true),
}));

vi.mock('@aptos-labs/wallet-adapter-react', () => ({
  useWallet: () => createMockAptosWalletAdapter(),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(<ChainProvider>{component}</ChainProvider>);
};

describe('ChainSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render chain selector button', () => {
      renderWithProviders(<ChainSelector />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should display current chain', () => {
      renderWithProviders(<ChainSelector />);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Aptos');
    });

    it('should show dropdown when clicked', async () => {
      renderWithProviders(<ChainSelector />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Select Network')).toBeInTheDocument();
      });
    });
  });

  describe('Chain Options', () => {
    it('should display all available chains', async () => {
      renderWithProviders(<ChainSelector />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Aptos')).toBeInTheDocument();
        expect(screen.getByText('Ethereum')).toBeInTheDocument();
        expect(screen.getByText('Arbitrum')).toBeInTheDocument();
        expect(screen.getByText('Base')).toBeInTheDocument();
        expect(screen.getByText('Polygon')).toBeInTheDocument();
      });
    });

    it('should highlight active chain', async () => {
      renderWithProviders(<ChainSelector />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        const aptosOption = screen.getByText('Aptos').closest('button');
        expect(aptosOption).toHaveClass('bg-blue-500');
      });
    });
  });

  describe('Chain Switching', () => {
    it('should switch to Aptos chain', async () => {
      renderWithProviders(<ChainSelector />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        const aptosButton = screen.getByText('Aptos').closest('button');
        fireEvent.click(aptosButton!);
      });

      await waitFor(() => {
        expect(screen.getByRole('button')).toHaveTextContent('Aptos');
      });
    });

    it('should switch to EVM chain', async () => {
      const mockSwitchChain = vi.fn().mockResolvedValue(undefined);
      vi.mocked('wagmi').useSwitchChain = () => ({
        ...createMockWagmiSwitchChain(),
        switchChain: mockSwitchChain,
      }) as any;

      renderWithProviders(<ChainSelector />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        const ethButton = screen.getByText('Ethereum').closest('button');
        fireEvent.click(ethButton!);
      });

      await waitFor(() => {
        expect(mockSwitchChain).toHaveBeenCalledWith({ chainId: 1 });
      });
    });

    it('should handle network switch errors', async () => {
      const mockSwitchChain = vi.fn().mockRejectedValue(new Error('User rejected'));
      const mockToast = vi.fn();

      vi.mocked('wagmi').useSwitchChain = () => ({
        ...createMockWagmiSwitchChain(),
        switchChain: mockSwitchChain,
      }) as any;

      vi.mocked('@/components/ui/use-toast').useToast = () => ({
        toast: mockToast,
      }) as any;

      renderWithProviders(<ChainSelector />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        const ethButton = screen.getByText('Ethereum').closest('button');
        fireEvent.click(ethButton!);
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Network Switch Failed',
            variant: 'destructive',
          })
        );
      });
    });

    it('should handle network not added error (4902)', async () => {
      const mockSwitchChain = vi.fn().mockRejectedValue({ code: 4902 });
      const mockToast = vi.fn();

      vi.mocked('wagmi').useSwitchChain = () => ({
        ...createMockWagmiSwitchChain(),
        switchChain: mockSwitchChain,
      }) as any;

      vi.mocked('@/components/ui/use-toast').useToast = () => ({
        toast: mockToast,
      }) as any;

      renderWithProviders(<ChainSelector />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        const baseButton = screen.getByText('Base').closest('button');
        fireEvent.click(baseButton!);
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: expect.stringContaining('add'),
          })
        );
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during chain switch', async () => {
      const mockSwitchChain = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));

      vi.mocked('wagmi').useSwitchChain = () => ({
        ...createMockWagmiSwitchChain(),
        switchChain: mockSwitchChain,
      }) as any;

      renderWithProviders(<ChainSelector />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        const ethButton = screen.getByText('Ethereum').closest('button');
        fireEvent.click(ethButton!);
      });

      // Check for loading indicator
      expect(screen.getByRole('button')).toHaveAttribute('disabled');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button', () => {
      renderWithProviders(<ChainSelector />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-haspopup');
    });

    it('should be keyboard navigable', async () => {
      renderWithProviders(<ChainSelector />);
      const button = screen.getByRole('button');

      // Open with Enter
      fireEvent.keyDown(button, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Select Network')).toBeInTheDocument();
      });
    });
  });
});
