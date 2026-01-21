/**
 * Test utilities and helpers
 * Provides custom render functions and mocks for testing
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { mock } from '@wagmi/connectors';
import type { Address, Hash } from 'viem';

/**
 * Create mock wagmi config for testing
 */
export function createMockWagmiConfig() {
  return createConfig({
    chains: [base, baseSepolia],
    connectors: [
      mock({
        accounts: [
          '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        ],
      }),
    ],
    transports: {
      [base.id]: http(),
      [baseSepolia.id]: http(),
    },
  });
}

/**
 * Test wrapper with providers
 */
interface TestProvidersProps {
  children: React.ReactNode;
  wagmiConfig?: ReturnType<typeof createMockWagmiConfig>;
  queryClient?: QueryClient;
}

export function TestProviders({
  children,
  wagmiConfig,
  queryClient,
}: TestProvidersProps) {
  const defaultWagmiConfig = wagmiConfig || createMockWagmiConfig();
  const defaultQueryClient =
    queryClient ||
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

  return (
    <WagmiProvider config={defaultWagmiConfig}>
      <QueryClientProvider client={defaultQueryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

/**
 * Custom render with providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  wagmiConfig?: ReturnType<typeof createMockWagmiConfig>;
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const { wagmiConfig, queryClient, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders wagmiConfig={wagmiConfig} queryClient={queryClient}>
        {children}
      </TestProviders>
    ),
    ...renderOptions,
  });
}

/**
 * Mock addresses for testing
 */
export const MOCK_ADDRESSES = {
  user1: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as Address,
  user2: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as Address,
  contract: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address,
  zero: '0x0000000000000000000000000000000000000000' as Address,
};

/**
 * Mock transaction hashes
 */
export const MOCK_TX_HASHES = {
  pending: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' as Hash,
  confirmed: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890' as Hash,
  failed: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba' as Hash,
};

/**
 * Mock transaction receipt
 */
export function createMockTxReceipt(overrides = {}) {
  return {
    blockHash: '0xblock123' as Hash,
    blockNumber: BigInt(12345),
    contractAddress: null,
    cumulativeGasUsed: BigInt(100000),
    effectiveGasPrice: BigInt(1000000000),
    from: MOCK_ADDRESSES.user1,
    gasUsed: BigInt(50000),
    logs: [],
    logsBloom: '0x00' as `0x${string}`,
    status: 'success' as const,
    to: MOCK_ADDRESSES.contract,
    transactionHash: MOCK_TX_HASHES.confirmed,
    transactionIndex: 0,
    type: 'eip1559' as const,
    ...overrides,
  };
}

/**
 * Wait for async updates
 */
export const waitForAsync = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Mock localStorage
 */
export function mockLocalStorage() {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
}

/**
 * Mock window dimensions
 */
export function mockWindowSize(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });

  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });

  window.dispatchEvent(new Event('resize'));
}

/**
 * Mock successful wallet connection
 */
export function mockConnectedWallet(address: Address = MOCK_ADDRESSES.user1) {
  return {
    address,
    isConnected: true,
    isConnecting: false,
    isDisconnected: false,
    isReconnecting: false,
    connector: {
      id: 'mock',
      name: 'Mock Wallet',
      type: 'injected' as const,
    },
    chain: base,
    chainId: base.id,
  };
}

/**
 * Create mock employee data
 */
export function createMockEmployee(overrides = {}) {
  return {
    employeeAddress: MOCK_ADDRESSES.user2,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 1,
    department: 'Engineering',
    monthlySalary: BigInt(5000000000000000000), // 5 ETH
    managerAddress: MOCK_ADDRESSES.user1,
    taxJurisdiction: 'US_FED',
    paymentAddress: MOCK_ADDRESSES.user2,
    isActive: true,
    createdAt: Date.now(),
    ...overrides,
  };
}

/**
 * Create mock transaction record
 */
export function createMockTransaction(overrides = {}) {
  return {
    hash: MOCK_TX_HASHES.confirmed,
    status: 'confirmed' as const,
    metadata: {
      type: 'create_employee' as const,
      description: 'Creating new employee',
      fromAddress: MOCK_ADDRESSES.user1,
      timestamp: Date.now(),
    },
    confirmations: 1,
    blockNumber: BigInt(12345),
    gasUsed: BigInt(50000),
    effectiveGasPrice: BigInt(1000000000),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

/**
 * Assert error is thrown
 */
export async function expectToThrow(fn: () => any, errorMessage?: string) {
  try {
    await fn();
    throw new Error('Expected function to throw');
  } catch (error) {
    if (errorMessage && error instanceof Error) {
      expect(error.message).toContain(errorMessage);
    }
  }
}

/**
 * Mock console methods
 */
export function mockConsole() {
  const originalConsole = { ...console };

  return {
    mock: () => {
      console.log = vi.fn();
      console.warn = vi.fn();
      console.error = vi.fn();
      console.info = vi.fn();
    },
    restore: () => {
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.info = originalConsole.info;
    },
  };
}

// Re-export testing library utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
