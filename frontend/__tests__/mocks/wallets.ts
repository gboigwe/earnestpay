import { vi } from 'vitest';

/**
 * Mock Petra Wallet (Aptos)
 */
export const createMockPetraWallet = () => ({
  connect: vi.fn().mockResolvedValue({
    address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    publicKey: '0xabcdef1234567890',
  }),
  disconnect: vi.fn().mockResolvedValue(undefined),
  account: {
    address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    publicKey: '0xabcdef1234567890',
  },
  network: {
    name: 'testnet',
    chainId: '2',
    url: 'https://fullnode.testnet.aptoslabs.com',
  },
  connected: true,
  signAndSubmitTransaction: vi.fn().mockResolvedValue({
    hash: '0xtxhash123',
  }),
  signMessage: vi.fn().mockResolvedValue({
    signature: '0xsignature',
  }),
});

/**
 * Mock MetaMask Wallet (EVM)
 */
export const createMockMetaMaskWallet = () => ({
  request: vi.fn().mockImplementation(({ method }: { method: string }) => {
    switch (method) {
      case 'eth_requestAccounts':
        return Promise.resolve(['0xabcdefABCDEF1234567890abcdefABCDEF123456']);
      case 'eth_chainId':
        return Promise.resolve('0x1'); // Ethereum mainnet
      case 'wallet_switchEthereumChain':
        return Promise.resolve(null);
      case 'eth_accounts':
        return Promise.resolve(['0xabcdefABCDEF1234567890abcdefABCDEF123456']);
      default:
        return Promise.reject(new Error('Method not supported'));
    }
  }),
  selectedAddress: '0xabcdefABCDEF1234567890abcdefABCDEF123456',
  chainId: '0x1',
  isMetaMask: true,
  on: vi.fn(),
  removeListener: vi.fn(),
});

/**
 * Mock Aptos Wallet Adapter
 */
export const createMockAptosWalletAdapter = () => ({
  connected: true,
  connecting: false,
  disconnecting: false,
  account: {
    address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    publicKey: '0xabcdef1234567890',
  },
  network: {
    name: 'testnet',
    chainId: '2',
  },
  wallet: {
    name: 'Petra',
    icon: 'petra-icon',
    url: 'https://petra.app',
  },
  connect: vi.fn().mockResolvedValue(undefined),
  disconnect: vi.fn().mockResolvedValue(undefined),
  signAndSubmitTransaction: vi.fn().mockResolvedValue({
    hash: '0xtxhash123',
  }),
  signMessage: vi.fn().mockResolvedValue({
    signature: '0xsignature',
  }),
});

/**
 * Mock Wagmi useAccount hook
 */
export const createMockWagmiAccount = (isConnected = false) => ({
  address: isConnected ? '0xabcdefABCDEF1234567890abcdefABCDEF123456' : undefined,
  isConnected,
  isConnecting: false,
  isDisconnected: !isConnected,
  isReconnecting: false,
  status: isConnected ? 'connected' : 'disconnected',
  connector: isConnected
    ? {
        id: 'metaMask',
        name: 'MetaMask',
        type: 'injected',
      }
    : undefined,
  chain: isConnected
    ? {
        id: 1,
        name: 'Ethereum',
        network: 'homestead',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: { default: { http: ['https://eth.llamarpc.com'] } },
      }
    : undefined,
});

/**
 * Mock Wagmi useDisconnect hook
 */
export const createMockWagmiDisconnect = () => ({
  disconnect: vi.fn(),
  disconnectAsync: vi.fn().mockResolvedValue(undefined),
  isIdle: true,
  isPending: false,
  isSuccess: false,
  isError: false,
  error: null,
  status: 'idle',
  reset: vi.fn(),
});

/**
 * Mock Wagmi useSwitchChain hook
 */
export const createMockWagmiSwitchChain = () => ({
  switchChain: vi.fn().mockResolvedValue(undefined),
  switchChainAsync: vi.fn().mockResolvedValue(undefined),
  chains: [
    { id: 1, name: 'Ethereum' },
    { id: 42161, name: 'Arbitrum' },
    { id: 8453, name: 'Base' },
    { id: 137, name: 'Polygon' },
  ],
  isPending: false,
  isError: false,
  error: null,
  status: 'idle',
  reset: vi.fn(),
});

/**
 * Mock Reown AppKit
 */
export const createMockAppKit = () => ({
  open: vi.fn().mockResolvedValue(undefined),
  close: vi.fn(),
  getState: vi.fn().mockReturnValue({
    open: false,
    selectedNetworkId: 1,
  }),
  subscribeState: vi.fn(),
});
